#!/usr/bin/env node
/* Stamps sw.js automatically: VERSION = hash of every shipped file, PRECACHE = list of those files.
   Run after every build or deploy (Astro does it for you via the integration in ASTRO-MIGRATION.md):
     node tools/build-sw.mjs            (static site; tools/stamp.mjs runs this for you)
     node tools/build-sw.mjs dist       (Astro output folder)
   No dependencies. Same files = same version, so visitors only re-download when something really changed. */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, sep, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKIP_DIRS = new Set(['_source', 'tools', 'node_modules', '.git', '.astro', '.vscode', 'src', 'public', 'analytics', '.well-known']);
const SKIP_FILES = /(^|\/)(sw\.js|.*\.md|.*\.map|robots\.txt|og-image[\w-]*\.\w+|stealth-tech-og[\w-]*\.\w+|sitemap.*\.xml|package(-lock)?\.json|astro\.config\.\w+|\..*)$/;
// big optional files are cached on first use instead of up front (keeps the first visit light)
const LAZY_FILES = /(-1280|-1500|-1672|-1800|-2000)\.webp$|chain-1100\.webp$|forms-data\.js$|chain-\d+\.js$|(^|\/)(_headers|_redirects|vercel\.json|netlify\.toml)$|^analytics\//;

export default function buildSW(dir = '.') {
  const root = resolve(dir), files = [];
  (function walk(d) {
    for (const n of readdirSync(d)) {
      const p = join(d, n), s = statSync(p);
      if (s.isDirectory()) { if (!SKIP_DIRS.has(n)) walk(p); continue; }
      const rel = relative(root, p).split(sep).join('/');
      if (!SKIP_FILES.test(rel) && !LAZY_FILES.test(rel)) files.push(rel);
    }
  })(root);
  files.sort();
  const h = createHash('sha256');
  for (const f of files) { h.update(f); h.update(readFileSync(join(root, f))); }
  const version = 'st-' + h.digest('hex').slice(0, 12);
  const swPath = join(root, 'sw.js');
  const sw = readFileSync(swPath, 'utf8');
  const block = '/* @build:start (written by tools/build-sw.mjs, do not edit by hand) */\n' +
    "var VERSION = '" + version + "';\nvar PRECACHE = " + JSON.stringify(['./'].concat(files), null, 1) + ';\n/* @build:end */';
  const out = sw.replace(/\/\* @build:start[\s\S]*?@build:end \*\//, block);
  if (out === sw && !sw.includes(version)) throw new Error('sw.js has no @build:start / @build:end markers');
  writeFileSync(swPath, out);
  console.log('[sw] ' + version + ' · ' + files.length + ' files precached');
  return version;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildSW(process.argv[2] || '.');
