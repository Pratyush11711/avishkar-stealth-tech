/* Stealth Tech — track.js: our own lightweight visitor analytics (about 3 KB, no libraries, no cookies).
   What it measures on every page: time on page (total and active), how far people scroll, how long each
   section is on screen, what gets clicked (with position, for a click map), where visitors came from,
   and the booking funnel (opened > step 1 > 2 > details sent > call booked).
   Data goes to YOUR endpoint (a free Google Apps Script web app, see analytics/README.md) in one small
   request when the visitor leaves the page. Nothing is sent while TRACK_ENDPOINT is empty.
   Privacy: no cookies. Visitors who click "Accept" get an anonymous visitor id (to count returning visitors)
   and, if CLARITY_ID is set, Microsoft Clarity heatmaps and session recordings. Everyone else is counted
   anonymously, page by page. */
(function () {
  'use strict';

  /* ---------- fill these in ---------- */
  var TRACK_ENDPOINT = '';   // Google Apps Script web-app URL, e.g. https://script.google.com/macros/s/AKfy.../exec
  var CLARITY_ID = '';       // optional: Microsoft Clarity project id (free heatmaps + recordings), loads only after Accept

  var doc = document, w = window, root = doc.documentElement;
  if (!w.JSON || !doc.addEventListener) return;
  var now = function () { return Date.now(); };
  var rid = function () { return (now().toString(36) + Math.random().toString(36).slice(2, 10)).slice(-14); };
  var store = function (k, v) { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (e) { return null; } };
  var sstore = function (k, v) { try { return v === undefined ? sessionStorage.getItem(k) : sessionStorage.setItem(k, v); } catch (e) { return null; } };
  var consent = function () { return store('st-cookie') === 'yes'; };

  // ids only exist for visitors who accepted; everyone else is one anonymous page view at a time
  var sid = '', vid = '';
  function ids() {
    if (!consent()) return;
    sid = sstore('st-sid') || ''; if (!sid) { sid = rid(); sstore('st-sid', sid); }
    vid = store('st-vid') || ''; if (!vid) { vid = rid(); store('st-vid', vid); }
  }
  ids();

  var q = {}; try { (location.search.slice(1) || '').split('&').forEach(function (p) { var kv = p.split('='); if (/^utm_|^gclid$|^fbclid$|^ref$/.test(kv[0])) q[kv[0]] = decodeURIComponent(kv[1] || '').slice(0, 80); }); } catch (e) {}
  var refHost = ''; try { refHost = doc.referrer ? new URL(doc.referrer).host : ''; } catch (e) {}
  if (refHost === location.host) refHost = '(internal)';
  var mob = w.matchMedia && w.matchMedia('(max-width: 900px)').matches;
  var P = {
    v: 1, id: rid(), sid: sid, vid: vid, t0: now(),
    page: location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '') || '/', title: doc.title.slice(0, 90),
    ref: refHost, utm: q, dev: mob ? 'mobile' : 'desktop', vw: w.innerWidth, vh: w.innerHeight, lang: (navigator.language || '').slice(0, 8),
    dur: 0, act: 0, scroll: 0, secs: {}, clicks: [], funnel: [], lite: false
  };

  /* ---------- time on page: total visible time, and "active" time (moved, scrolled or typed in the last 15 s) ---------- */
  var visSince = doc.hidden ? 0 : now(), lastAct = now(), actSince = now();
  function tickTime() {
    var t = now();
    if (visSince) { P.dur += t - visSince; visSince = doc.hidden ? 0 : t; }
    if (!doc.hidden && t - lastAct < 15000) P.act += Math.min(t - actSince, 15000);
    actSince = t;
  }
  ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart', 'wheel'].forEach(function (ev) {
    w.addEventListener(ev, function () { var t = now(); if (t - lastAct >= 15000) actSince = t; lastAct = t; }, { passive: true, capture: true });
  });
  setInterval(tickTime, 5000);

  /* ---------- scroll depth ---------- */
  var sTick = 0, docH = 0;
  w.addEventListener('resize', function () { docH = 0; });
  if (w.ResizeObserver) try { new ResizeObserver(function () { docH = 0; }).observe(doc.body || root); } catch (e) {}
  w.addEventListener('scroll', function () {
    if (sTick) return;
    sTick = setTimeout(function () {
      sTick = 0;
      if (!docH) docH = root.scrollHeight;   // cached: reading layout inside scroll can force a re-layout
      var H = docH - w.innerHeight, p = H > 0 ? Math.round((w.pageYOffset || root.scrollTop) / H * 100) : 100;
      if (p > P.scroll) P.scroll = Math.min(100, p);
    }, 250);
  }, { passive: true });

  /* ---------- time per section: a section counts while it fills at least 40% of the screen ---------- */
  var live = {}, names = {};
  function secName(el) {
    var lb = el.getAttribute('aria-labelledby'), h = lb && doc.getElementById(lb);
    return el.getAttribute('data-track') || el.id || (h ? h.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) : '') || el.getAttribute('aria-label') || el.className.split(' ')[0];
  }
  function secTick() {
    var t = now();
    for (var k in live) if (live[k]) { P.secs[k] = (P.secs[k] || 0) + (doc.hidden ? 0 : t - live[k]); live[k] = doc.hidden ? 0 : t; }
  }
  function watchSections() {
    if (!w.IntersectionObserver) return;
    var th = []; for (var i = 0; i <= 20; i++) th.push(i / 20);
    var io = new IntersectionObserver(function (es) {
      secTick();
      es.forEach(function (e) {
        var k = names[e.target._tk], on = e.isIntersecting && e.intersectionRect.height >= w.innerHeight * 0.4;
        if (on && !live[k]) live[k] = doc.hidden ? 0 : now();
        else if (!on && live[k] !== undefined) { secTick(); delete live[k]; }
      });
    }, { threshold: th });
    var list = doc.querySelectorAll('main > section, main > div > section, .ip-sec, .ip-hero, .foot, .nf, [data-track]');
    Array.prototype.forEach.call(list, function (el, i) { el._tk = i; names[i] = secName(el); io.observe(el); });
  }

  /* ---------- clicks: what was clicked, in which section, and where on the page (for a click map) ---------- */
  function label(el) {
    // animated button labels repeat every letter in the DOM, so read their aria-label instead of the text
    var inner = el.querySelector && el.querySelector('[aria-label]');
    var t = (el.getAttribute('aria-label') || (inner && inner.getAttribute('aria-label')) || el.getAttribute('data-txt') || el.textContent || el.getAttribute('title') || el.tagName).replace(/\s+/g, ' ').trim();
    return t.slice(0, 60);
  }
  doc.addEventListener('click', function (e) {
    if (P.clicks.length >= 150) return;
    var el = e.target && e.target.closest ? e.target.closest('a,button,label,summary,input,[role="tab"],.mol-stage,.cmp,[data-track-click]') : null;
    var sec = e.target && e.target.closest ? e.target.closest('main > section, .ip-sec, .ip-hero, .foot, .dock, .top, .modal, .cookie, .nf') : null;
    var docH = Math.max(1, root.scrollHeight), docW = Math.max(1, root.clientWidth);
    P.clicks.push({
      t: Math.round((now() - P.t0) / 1000),
      el: el ? label(el) : '(' + (e.target.tagName || '').toLowerCase() + ')',
      href: el && el.getAttribute('href') ? el.getAttribute('href').slice(0, 80) : '',
      sec: sec ? (sec.id || sec.className.split(' ')[0]) : '',
      x: Math.round(e.pageX / docW * 1000) / 10, y: Math.round(e.pageY / docH * 1000) / 10, sy: Math.round(e.clientY / Math.max(1, w.innerHeight) * 100)
    });
  }, true);

  /* ---------- booking funnel (events come from main.js) ---------- */
  ['book-open', 'book-step', 'book-close', 'lead', 'booked'].forEach(function (n) {
    doc.addEventListener('st:' + n, function (e) {
      var d = e.detail || {}; P.funnel.push({ e: n, t: Math.round((now() - P.t0) / 1000), d: d });
      if (n === 'lead' || n === 'booked') send(false); // the important ones go out straight away
    });
  });

  /* ---------- consent ---------- */
  function clarity() {
    if (!CLARITY_ID || w.clarity || !consent()) return;
    (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(w, doc, 'clarity', 'script', CLARITY_ID);
  }
  doc.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-ck]') : null;
    if (b) setTimeout(function () { ids(); if (!P.sid) { P.sid = sid; P.vid = vid; } clarity(); }, 0);
  });

  /* ---------- sending: one beacon when the visitor leaves (plus right away for leads) ---------- */
  var sentLen = -1;
  function send(final) {
    if (!TRACK_ENDPOINT) return;
    tickTime(); secTick();
    P.lite = root.classList.contains('lite'); P.theme = root.getAttribute('data-theme');
    var out = {}; for (var k in P) out[k] = P[k];
    out.dur = Math.round(P.dur / 1000); out.act = Math.round(P.act / 1000);
    out.secs = {}; for (var s in P.secs) { var v = Math.round(P.secs[s] / 1000); if (v > 0) out.secs[s] = v; }
    out.final = !!final;
    var body = JSON.stringify(out);
    if (body.length === sentLen && final) return; sentLen = body.length;
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(TRACK_ENDPOINT, body)) return;
    } catch (e) {}
    try { fetch(TRACK_ENDPOINT, { method: 'POST', body: body, keepalive: true, mode: 'no-cors', headers: { 'Content-Type': 'text/plain' } }); } catch (e) {}
  }
  var sentFinal = false;
  function bye() { if (sentFinal) return; sentFinal = true; send(true); }
  doc.addEventListener('visibilitychange', function () {
    if (sentFinal) return;
    tickTime(); secTick();
    if (doc.hidden) { visSince = 0; send(false); } else { visSince = now(); }
  });
  w.addEventListener('pagehide', bye);

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', watchSections); else watchSections();
  clarity();
  w.STTrack = { data: function () { tickTime(); secTick(); return P; }, send: send };
})();
