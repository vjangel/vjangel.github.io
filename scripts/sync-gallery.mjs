import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const settingsPath = path.join(root, 'gallery.local.json');
const saved = await fs.readFile(settingsPath, 'utf8').then(JSON.parse).catch(() => ({}));
const sourcePath = path.resolve(process.argv[2] || saved.sourcePath || '');
if (!process.argv[2] && !saved.sourcePath) throw new Error('Pass the source cursor-gallery directory.');
const destination = path.join(root, 'public/cursor-gallery');
if (sourcePath === destination) throw new Error('Source must be outside the publication copy.');
const sourceCatalog = await fs.readFile(path.join(sourcePath, 'catalog.js'), 'utf8');
if (!sourceCatalog.startsWith('window.CURSOR_CATALOG=')) throw new Error('Unexpected gallery catalog format.');
const catalog = JSON.parse(sourceCatalog.slice(sourceCatalog.indexOf('=') + 1).trim().replace(/;$/, ''));
const assets = new Set();
function collect(value) {
  if (typeof value === 'string' && value.startsWith('assets/')) assets.add(value);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}
collect(catalog);
const files = ['gallery.css', 'gallery.js', 'gallery-core.js', 'gallery-i18n.js', ...assets];
let bytes = 0;
for (const relative of files) {
  if (relative.includes('..') || relative.includes('\\') || path.isAbsolute(relative)) throw new Error('Unexpected resource path.');
  const source = path.join(sourcePath, relative);
  const stat = await fs.stat(source);
  if (!stat.isFile()) throw new Error('Missing gallery resource: ' + relative);
  bytes += stat.size;
}
await fs.mkdir(destination, { recursive: true });
for (const relative of files) {
  const target = path.join(destination, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(path.join(sourcePath, relative), target);
}
// The publication copy never points to an archive that has not been published.
for (const theme of catalog.themes) if (theme.download) theme.download.zip = '';
await fs.writeFile(path.join(destination, 'catalog.js'), 'window.CURSOR_CATALOG=' + JSON.stringify(catalog) + ';\n');

let html = await fs.readFile(path.join(sourcePath, 'index.html'), 'utf8');
function replaceOnce(text, before, after) {
  if (!text.includes(before)) throw new Error('Gallery integration anchor changed: ' + before);
  return text.replace(before, after);
}
html = replaceOnce(html, '<link rel="stylesheet" href="./gallery.css">', '<link rel="stylesheet" href="./gallery.css">\n  <link rel="stylesheet" href="./site-bridge.css">');
html = replaceOnce(html, '<script src="./gallery.js" defer></script>', '<script src="./download-links.js" defer></script>\n  <script src="./site-bridge.js" defer></script>\n  <script src="./gallery.js" defer></script>');
html = replaceOnce(html, '<div class="site-settings">', '<div class="site-settings">\n        <a class="veijay-back" href="/" data-site-back aria-label="返回 VeiJay" title="返回 VeiJay"><span aria-hidden="true">←</span></a>');
html = replaceOnce(html, '<footer class="site-footer">', '<footer class="site-footer">\n      <a href="/" data-site-back>← VeiJay</a>\n      <p class="download-notice" data-download-notice hidden></p>');
html = html.replace('An offline gallery of Windows cursor themes. Explore, preview, and download complete sets.', 'VeiJay cursor gallery. Explore animated Windows cursor themes and try every pointer role.');
await fs.writeFile(path.join(destination, 'index.html'), html.trimEnd() + '\n');
let app = await fs.readFile(path.join(destination, 'gallery.js'), 'utf8');
app = replaceOnce(app, 'let languagePreference=languageChoice(stored);', "function entryLanguage(settings){const requested=new URLSearchParams(location.search).get('lang');return requested==='system'||languages.includes(requested)?requested:languageChoice(settings);}\n  let languagePreference=entryLanguage(stored);");
app = replaceOnce(app, "languagePreference=$('language').value=languageChoice(shared);", "languagePreference=$('language').value=entryLanguage(shared);");
await fs.writeFile(path.join(destination, 'gallery.js'), app);
await fs.writeFile(settingsPath, JSON.stringify({ sourcePath }, null, 2) + '\n');
console.log(`Synced ${catalog.themes.length} themes, ${assets.size} preview assets (${(bytes / 1024 / 1024).toFixed(1)} MiB). ZIPs stay in the source directory.`);
