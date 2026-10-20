/* Stealth Tech service worker: repeat visits open instantly and the site keeps working offline.
   VERSION and PRECACHE below are written automatically by tools/build-sw.mjs on every build.
   Pages: network first (always fresh), but if the network is slow (over 2.5 s) the saved copy is shown at once.
   Assets: answered from the cache instantly and refreshed in the background (stale-while-revalidate).
   Big optional files (large retina images, the 3D data) are not downloaded up front; they are cached the first
   time a visitor actually needs them, so the first visit never competes with this worker for bandwidth. */
/* @build:start (written by tools/build-sw.mjs, do not edit by hand) */
var VERSION = 'st-5a76bfd37e86';
var PRECACHE = [
 "./",
 "404.html",
 "apple-touch-icon.png",
 "assets/css/cursor.css",
 "assets/css/fonts.css",
 "assets/css/main.css",
 "assets/css/molecule.css",
 "assets/css/page.css",
 "assets/icons/icon-192.png",
 "assets/icons/icon-512.png",
 "assets/img/chain-760.webp",
 "assets/img/ind-botanicals-900.webp",
 "assets/img/ind-kanna-900.webp",
 "assets/img/ind-peptides-900.webp",
 "assets/img/problem-vials-1100.webp",
 "assets/img/problem-vials-700.webp",
 "assets/js/forms.js",
 "assets/js/main.js",
 "assets/js/molecule.js",
 "assets/js/track.js",
 "assets/logos/frontier-biomed.webp",
 "assets/logos/hols.webp",
 "assets/logos/medivance.webp",
 "assets/logos/pba-mark.webp",
 "assets/vendor/ScrollTrigger.min.js",
 "assets/vendor/gsap.min.js",
 "assets/vendor/lenis.min.js",
 "cookies.html",
 "favicon-32.png",
 "favicon-48.png",
 "favicon.ico",
 "favicon.svg",
 "hemp-marketing.html",
 "high-risk-payments.html",
 "index.html",
 "kanna-marketing.html",
 "peptide-ads.html",
 "peptide-brand-launch.html",
 "peptide-marketing-agency.html",
 "peptide-marketing.html",
 "peptide-platforms.html",
 "peptide-seo.html",
 "peptide-websites.html",
 "privacy.html"
];
/* @build:end */
var NAV_TIMEOUT = 2500;
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    // cache: 'reload' skips the browser's HTTP cache, so a new deploy never re-saves yesterday's scripts
    return c.addAll(PRECACHE.map(function (u) { return new Request(u, { cache: 'reload' }); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  var updated = false;
  e.waitUntil(Promise.all([
    caches.keys().then(function (keys) { var old = keys.filter(function (k) { return k !== VERSION; }); updated = old.length > 0; return Promise.all(old.map(function (k) { return caches.delete(k); })); }),
    self.registration.navigationPreload ? self.registration.navigationPreload.enable().catch(function () {}) : null
  ]).then(function () { return self.clients.claim(); }).then(function () {
    // a new deploy replaced an older one: reload open tabs once so nobody keeps running the previous version
    if (!updated) return;
    return self.clients.matchAll({ type: 'window' }).then(function (list) { list.forEach(function (c) { if (c.navigate) c.navigate(c.url).catch(function () {}); }); });
  }));
});
function put(req, res) { if (res && res.ok && res.type === 'basic') { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); } return res; }
function fromCache(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (r) {
    if (r) return r;
    // /peptide-seo, /peptide-seo.html and /peptide-seo/index.html are the same page
    var u = new URL(req.url);
    if (/\.html$/.test(u.pathname) || u.pathname === '/') return caches.match('index.html');
    var path = u.pathname.replace(/\/$/, '');
    return caches.match(path + '/index.html').then(function (idx) {
      return idx || caches.match(path + '.html');
    });
  });
}
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(new Promise(function (resolve) {
      var settled = false, done = function (r) { if (!settled && r) { settled = true; resolve(r); } };
      var net = Promise.resolve(e.preloadResponse).then(function (pr) { return pr || fetch(req); }).then(function (res) { put(req, res); return res; });
      // slow network: show the saved copy after NAV_TIMEOUT, the fresh one is still saved for next time
      var t = setTimeout(function () { fromCache(req).then(done); }, NAV_TIMEOUT);
      net.then(function (res) { clearTimeout(t); done(res); }).catch(function () {
        clearTimeout(t);
        fromCache(req).then(function (r) { done(r || caches.match('404.html')); }).then(function () { if (!settled) caches.match('index.html').then(function (r) { done(r || new Response('Offline', { status: 503 })); }); });
      });
    }));
    return;
  }
  // assets: answer instantly from cache, refresh the cache in the background
  // (files carry ?v=<hash> on the live site; one cache per deploy, so matching without it is safe)
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(req).then(function (res) { return put(req, res); }).catch(function () { return hit; });
    if (hit) { e.waitUntil(net); return hit; }
    return net;
  }));
});
