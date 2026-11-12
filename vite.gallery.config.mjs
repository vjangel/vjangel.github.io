import { defineConfig } from 'vite';
import localGallery from './scripts/local-gallery.mjs';

export default defineConfig({
  appType: 'mpa',
  build: { outDir: 'dist' },
  plugins: [localGallery()],
  preview: { host: '127.0.0.1', port: 4322, strictPort: true },
});
