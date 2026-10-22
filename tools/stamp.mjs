#!/usr/bin/env node
/* Makes this folder ready to drag and drop onto Netlify, in place. Run it after ANY change:
     node tools/stamp.mjs
   (build_pages.py runs it for you at the end.) Safe to run again and again; no dependencies.
   1. adds ?v=<content hash> to every script and stylesheet link (and the molecule picture), so browsers
      and the offline worker can never keep running an older main.js / molecule.js after a deploy
   2. makes the OG / Twitter image and URL tags absolute (SITE below), so link previews work
   3. stamps sw.js (new VERSION, offline file list)
   Internal folders and notes (_source, tools, analytics, *.md) are hidden on Netlify by _redirects. */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import buildSW from './build-sw.mjs';

const SITE = 'https://stealthtech.agency';
const root = resolve(process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..'));
const hash = b => createHash('sha256').update(b).digest('hex').slice(0, 10);
const read = f => readFileSync(join(root, f), 'utf8');
const stamp = (text, ver) => text.replace(/((?:src|href)=["']|['"])(assets\/(?:css|js|vendor)\/[\w.-]+\.(?:css|js))(?:\?v=\w+)?(?=["'])/g, (m, pre, path) => ver[path] ? pre + path + '?v=' + ver[path] : m);

const ver = {};
for (const d of ['assets/vendor', 'assets/css', 'assets/js']) for (const n of readdirSync(join(root, d))) if (/\.(js|css)$/.test(n)) ver[d + '/' + n] = hash(readFileSync(join(root, d, n)));
const imgV = hash(Buffer.concat(['chain-760.webp', 'chain-1100.webp', 'chain-1800.webp'].map(n => readFileSync(join(root, 'assets/img', n)))));
for (let pass = 0; pass < 2; pass++) for (const n of readdirSync(join(root, 'assets/js'))) {
  if (!/\.js$/.test(n) || /^chain-\d+\.js$/.test(n)) continue;
  const f = 'assets/js/' + n, t0 = read(f);
  let t = n === 'molecule.js' ? t0.replace(/(fromUrl\('assets\/img\/' \+ name \+ '\.webp)(?:\?v=\w+)?'/, "$1?v=" + imgV + "'") : t0;
  t = stamp(t, ver); if (t !== t0) writeFileSync(join(root, f), t); ver[f] = hash(t);
}
if (!/\.webp\?v=/.test(read('assets/js/molecule.js'))) throw new Error('molecule picture not versioned: check fromUrl() in molecule.js');

let pages = 0;
for (const f of readdirSync(root).filter(n => n.endsWith('.html'))) {
  const s0 = read(f);
  let s = s0.replace(/(<meta (?:property|name)="(?:og:url|og:image|og:image:secure_url|twitter:image)" content=")\/(?!\/)([^"]*)"/g, (m, a, b) => a + SITE + '/' + b + '"');
  s = stamp(s, ver).replace(/(assets\/img\/chain-\d+\.webp)(?:\?v=\w+)?(?=["'\s,])/g, '$1?v=' + imgV);   // same URL as molecule.js asks for (preload is used, not fetched twice)
  if (!/main\.js\?v=/.test(s)) throw new Error(f + ': main.js not versioned');
  if (s !== s0) writeFileSync(join(root, f), s); pages++;
}
buildSW(root);
console.log('[stamp] ' + pages + ' pages ready · main.js?v=' + ver['assets/js/main.js'] + ' · molecule.js?v=' + ver['assets/js/molecule.js']);
