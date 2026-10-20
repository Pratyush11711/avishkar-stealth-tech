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
    // directory layout so /peptide-brand-launch is a real folder with index.html.
    // format: 'file' emitted peptide-brand-launch.html, which the dev server
    // opens but a static host answers with 404.
    format: 'directory',
    inlineStylesheets: 'never',
    assets: '_astro',
  },
  trailingSlash: 'never',
  compressHTML: false,
  integrations: [swStamp],
});
