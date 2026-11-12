import { defineConfig } from 'astro/config';
import localGallery from './scripts/local-gallery.mjs';

export default defineConfig({
  site: 'https://vjangel.github.io',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  vite: { plugins: [localGallery()] },
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
