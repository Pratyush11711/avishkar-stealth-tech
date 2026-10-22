// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import buildSW from './tools/build-sw.mjs';

const swStamp = {
  name: 'st-sw-stamp',
  hooks: {
    'astro:build:done': ({ dir }) => { buildSW(fileURLToPath(dir)); },
  },
};

export default defineConfig({
  site: 'https://stealthtech.agency',
  output: 'static',
  build: {
    // Each route is route/index.html. Vercel clean URLs serve that file at /route.
    format: 'directory',
    inlineStylesheets: 'never',
    assets: '_astro',
  },
  // Matches vercel.json trailingSlash: false. The real page must be written into
  // route/index.html; see src/middleware.ts for why a slash redirect cannot run at build time.
  trailingSlash: 'never',
  redirects: {
    '/peptide-store-build/thank-you': '/thank-you',
  },
  compressHTML: false,
  integrations: [swStamp],
  vite: {
    preview: {
      allowedHosts: ['stealthtech.agency', 'www.stealthtech.agency'],
    },
  },
});
