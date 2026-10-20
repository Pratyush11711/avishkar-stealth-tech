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
    format: 'file',
    inlineStylesheets: 'never',
    assets: '_astro',
  },
  trailingSlash: 'never',
  compressHTML: false,
  integrations: [swStamp],
});
