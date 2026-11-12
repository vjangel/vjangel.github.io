import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { open } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { pipeline } from 'node:stream/promises';

const galleryRoot = '/cursor-gallery/';
const downloadsRoot = `${galleryRoot}downloads/`;
const linksPath = `${galleryRoot}download-links.js`;
const loopbackHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/i;
const loopbackPeers = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const zipName = /^[a-z0-9][a-z0-9._-]*\.zip$/i;

function readLocalConfig(root) {
  try {
    return JSON.parse(readFileSync(join(root, 'gallery.local.json'), 'utf8').trim());
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function collectDownloads(sourcePath) {
  if (typeof sourcePath !== 'string' || !isAbsolute(sourcePath)) {
    throw new Error('gallery.local.json must specify an absolute sourcePath.');
  }

  const source = readFileSync(join(sourcePath, 'catalog.js'), 'utf8').trim();
  const payload = /^window\.CURSOR_CATALOG\s*=\s*([\s\S]+);$/.exec(source);
  if (!payload) throw new Error('catalog.js must assign JSON to window.CURSOR_CATALOG.');
  const { themes } = JSON.parse(payload[1]);
  if (!Array.isArray(themes)) throw new Error('catalog.js must contain a themes array.');

  const directory = realpathSync(join(sourcePath, 'downloads'));
  const files = new Map();
  const links = Object.create(null);
  for (const theme of themes) {
    const id = theme?.id;
    if (typeof id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(id)) continue;

    const download = theme.download;
    const relativeZip = typeof download?.zip === 'string'
      ? /^\.\/downloads\/([^/]+)$/.exec(download.zip)?.[1]
      : undefined;
    const filename = download?.filename ?? relativeZip;
    if (typeof filename !== 'string' || !zipName.test(filename)) continue;

    const filePath = join(directory, filename);
    if (!lstatSync(filePath, { throwIfNoEntry: false })?.isFile()) continue;

    files.set(`${downloadsRoot}${filename}`, { filename, filePath });
    links[id] = `./downloads/${filename}`;
  }

  return { files, links };
}

function finish(response, statusCode) {
  response.statusCode = statusCode;
  response.end();
}

async function serveZip(request, response, { filename, filePath }) {
  let file;
  try {
    file = await open(filePath, 'r');
    const stat = await file.stat();
    if (!stat.isFile()) return finish(response, 404);

    response.setHeader('Content-Type', 'application/zip');
    response.setHeader('Content-Length', stat.size);
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    if (request.method === 'HEAD') return response.end();
    await pipeline(file.createReadStream(), response);
  } catch (error) {
    if (response.destroyed) return;
    if (response.headersSent) response.destroy();
    else finish(response, error.code === 'ENOENT' ? 404 : 500);
  } finally {
    await file?.close().catch(() => {});
  }
}

export default function localGallery() {
  function configure(server) {
    let local;
    try {
      const config = readLocalConfig(server.config.root);
      if (config === undefined) return;
      local = collectDownloads(config?.sourcePath);
    } catch (error) {
      server.config.logger.warn(`[local-gallery] ${error.message}`);
      return;
    }

    const script = `window.CURSOR_DOWNLOADS=${JSON.stringify(local.links)};\nwindow.CURSOR_DOWNLOAD_MODE='local';\n`;
    server.middlewares.use((request, response, next) => {
      const rawPath = (request.url ?? '').split('?', 1)[0];
      if (!rawPath.startsWith(galleryRoot)) return next();

      let pathname;
      try {
        pathname = decodeURIComponent(rawPath);
      } catch {
        response.setHeader('Cache-Control', 'no-store');
        return finish(response, 400);
      }
      if (pathname !== linksPath && !pathname.startsWith(downloadsRoot)) return next();

      response.setHeader('Cache-Control', 'no-store');
      response.setHeader('X-Content-Type-Options', 'nosniff');
      if (!loopbackHost.test(request.headers.host ?? '') || !loopbackPeers.has(request.socket?.remoteAddress)) return finish(response, 403);
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.setHeader('Allow', 'GET, HEAD');
        return finish(response, 405);
      }

      if (pathname === linksPath) {
        response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        response.setHeader('Content-Length', Buffer.byteLength(script));
        return response.end(request.method === 'HEAD' ? undefined : script);
      }

      const download = local.files.get(pathname);
      if (!download) return finish(response, 404);
      void serveZip(request, response, download);
    });
  }

  return {
    name: 'veijay-local-gallery',
    enforce: 'pre',
    configureServer: configure,
    configurePreviewServer: configure,
  };
}
