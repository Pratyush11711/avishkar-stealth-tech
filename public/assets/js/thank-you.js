(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function splitBricks(el) {
    var t = el.textContent.replace(/\s+/g, ' ').trim();
    el.textContent = '';
    var host = el.closest('a, button');
    if (host) host.setAttribute('aria-label', t);
    t.split('').forEach(function (c, i) {
      var s = doc.createElement('span');
      s.className = 'bk';
      s.style.setProperty('--i', String(i));
      s.setAttribute('aria-hidden', 'true');
      var a = doc.createElement('span'), b = doc.createElement('span'), ch = c === ' ' ? '\u00a0' : c;
      a.textContent = ch;
      b.setAttribute('data-c', ch);
      s.appendChild(a);
      s.appendChild(b);
      el.appendChild(s);
    });
  }
  $$('[data-brick], .btn-t').forEach(splitBricks);
  $$('.btn, .lk').forEach(function (h) {
    var off = 0;
    var on = function () { clearTimeout(off); h.classList.add('is-3d'); };
    var later = function () {
      clearTimeout(off);
      off = setTimeout(function () {
        if (!h.matches(':hover') && doc.activeElement !== h && !h.classList.contains('is-flow')) h.classList.remove('is-3d');
      }, 900);
    };
    ['pointerenter', 'focus', 'touchstart'].forEach(function (ev) { h.addEventListener(ev, on, { passive: true }); });
    ['pointerleave', 'blur', 'touchend'].forEach(function (ev) { h.addEventListener(ev, later, { passive: true }); });
    h.addEventListener('pointerleave', function () { h.classList.remove('is-flow'); });
  });
  if (!RM) setInterval(function () {
    if (doc.hidden) return;
    $$('.btn[data-pulse]').forEach(function (b) {
      var r = b.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || b.matches(':hover')) return;
      b.classList.add('is-3d', 'is-flow');
      setTimeout(function () {
        b.classList.remove('is-flow');
        setTimeout(function () { if (!b.matches(':hover')) b.classList.remove('is-3d'); }, 900);
      }, 1000);
    });
  }, 6500);

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('st-theme-v2', t); } catch (e) {}
    $$('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#060807' : '#F2F3EE');
  }
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  var themeBusy = false;
  $$('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (themeBusy) return;
      themeBusy = true;
      setTimeout(function () { themeBusy = false; }, 900);
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (RM || !doc.startViewTransition) { applyTheme(next); return; }
      var vt = doc.startViewTransition(function () { applyTheme(next); });
      vt.ready.then(function () {
        root.animate(
          { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] },
          { duration: 800, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {});
    });
  });

  var lead = null;
  try {
    lead = JSON.parse(sessionStorage.getItem('st-lead') || 'null');
    sessionStorage.removeItem('st-lead');
  } catch (e) {}
  var hi = $('#tyHi');
  if (hi && lead && lead.name) hi.textContent = 'Great move, ' + String(lead.name).replace(/[<>]/g, '').slice(0, 40) + '.';
  if (lead && lead.t && Date.now() - lead.t < 30 * 60 * 1000) {
    try { if (window.gtag) gtag('event', 'generate_lead', { form: 'store-plan' }); } catch (e) {}
    try { if (window.fbq) fbq('track', 'Lead'); } catch (e) {}
    try { if (window.ttq) ttq.track('SubmitForm'); } catch (e) {}
  }

  $$('[data-back]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var same = false;
      try { same = !!doc.referrer && new URL(doc.referrer).host === location.host; } catch (x) {}
      if (same && history.length > 1) { e.preventDefault(); history.back(); }
    });
  });

  body.classList.add('is-ready');

  var pl = $('#pl');
  if (pl && root.classList.contains('pl-in')) {
    var since = window.__plAt ? Date.now() - window.__plAt : 9999;
    setTimeout(function () {
      pl.classList.add('is-out');
      root.classList.remove('pl-in');
      setTimeout(function () { pl.classList.remove('is-out'); }, 800);
    }, RM ? 0 : Math.max(0, 750 - since));
  }
})();
