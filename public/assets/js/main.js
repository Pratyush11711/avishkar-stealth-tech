/* Stealth Tech: main.js
   GSAP 3 + ScrollTrigger and Lenis (self-hosted). Works from https:// and from file://. */
(function () {
  'use strict';

  /* ---------- settings ---------- */
  var CAL_ORIGIN = 'https://cal.id';                                       // Cal.id (Cal.com compatible embed)
  var CAL_LINK = 'arpitsharmawritingsessions/peptide-brand-discovery-call'; // booking page shown in the last step
  var LEAD_EMAIL = 'wassamrehman@gmail.com';    // every brief is emailed here (FormSubmit) ...
  var LEAD_CC = 'arpitsharmawriting@gmail.com'; // ... with a copy here
  var FORM_ENDPOINT = '';                        // optional extra webhook (POST JSON): Zapier, Make, a CRM

  var doc = document, root = doc.documentElement, body = doc.body;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MQ = window.matchMedia('(max-width: 900px)');
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // phones and tablets: the finger scrolls natively. A script must not steer the page while it is moving.
  var TOUCH = !FINE || MQ.matches;
  var SCRUB = TOUCH ? true : 0.6;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var cssVar = function (n) { return getComputedStyle(root).getPropertyValue(n).trim(); };
  var esc = function (c) { return c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c; };

  if (!gsap || !ST) { root.classList.remove('js', 'sp-on', 'pl-in'); body.classList.add('is-ready'); var s0 = $('#splash'); if (s0) s0.remove(); return; }
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });
  // a hard flick fires many scroll events per frame. Catch-up ticks after a missed frame would stack on top of that.
  if (TOUCH) gsap.ticker.lagSmoothing(1000, 16);

  /* =====================================================
     PERFORMANCE MODE
     html.lite = the same site with the expensive extras switched off (native scrolling, CSS honeycomb,
     paused molecule icons, lighter canvases). It starts on very weak devices (set in the <head> script)
     and switches on by itself if this device keeps dropping frames. The choice is remembered for 7 days.
     Force it with ?perf=lite or ?perf=full, reset with ?perf=auto.
     ===================================================== */
  var LITE = root.classList.contains('lite'), liteFns = [];
  var PERF_FORCED = ''; try { PERF_FORCED = localStorage.getItem('st-perf') || ''; } catch (e) {}
  function onLite(fn) { if (LITE) fn(); else liteFns.push(fn); }
  function goLite() {
    if (LITE) return; LITE = true; root.classList.add('lite');
    try { localStorage.setItem('st-lite', String(Date.now())); } catch (e) {}
    liteFns.splice(0).forEach(function (fn) { try { fn(); } catch (e) {} });
  }
  // frame-rate governor: three bad 60-frame windows in a row (median under ~38 fps, or 1 in 5 frames under 25 fps) = lite.
  // It starts listening only after the intro (splash + hero) has settled, so a busy first load never counts.
  if (!LITE && PERF_FORCED !== 'full' && !RM) (function () {
    var buf = [], last = 0, bad = 0, span = 0;
    doc.addEventListener('visibilitychange', function () { last = 0; buf = []; span = 0; });
    function f(t) {
      if (LITE) return;
      if (last && !doc.hidden) { var dt = t - last; if (dt > 0 && dt < 400) { buf.push(dt); span += dt; } }
      last = t;
      // a window is 60 frames, or 1.5 s of slow frames (so a really slow device is caught within a few seconds)
      if (buf.length >= 60 || (span >= 1500 && buf.length >= 20)) {
        buf.sort(function (a, b) { return a - b; });
        var L = buf.length;
        if (buf[Math.floor(L * 0.5)] > 26 || buf[Math.floor(L * 0.8)] > 40) bad++; else bad = Math.max(0, bad - 1);
        buf = []; span = 0;
        if (bad >= 3) { goLite(); return; }
      }
      requestAnimationFrame(f);
    }
    setTimeout(function () { requestAnimationFrame(f); }, root.classList.contains('sp-on') ? 5500 : 2500);
  })();
  // no real graphics chip (GPU blocklisted, switched off, or a software renderer): the 3D section shows its still
  // version and the rest runs lite from the first frame. Checked once per session (cheap: one tiny context).
  var NOGPU = false;
  if (PERF_FORCED !== 'full') {
    var g = null; try { g = sessionStorage.getItem('st-gpu'); } catch (e) {}
    if (g == null) {
      g = '1';
      try {
        var tc = doc.createElement('canvas'), ctx = tc.getContext('webgl', { failIfMajorPerformanceCaveat: true });
        if (!ctx) g = '0';
        else {
          var dbg = ctx.getExtension('WEBGL_debug_renderer_info'), rn = dbg ? String(ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
          if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(rn)) g = '0';
          var lc = ctx.getExtension('WEBGL_lose_context'); if (lc) lc.loseContext();
        }
      } catch (e) { g = '0'; }
      try { sessionStorage.setItem('st-gpu', g); } catch (e) {}
    }
    if (g === '0') { NOGPU = true; root.classList.add('no-gpu'); goLite(); }
  }
  window.STPerf = { lite: function () { return LITE; }, goLite: goLite, onLite: onLite, noGpu: function () { return NOGPU; } };
  // lite mode: a flag other scripts can read while the page is being scrolled (so every frame goes to the scroll itself)
  // (a plain flag, not a class: toggling a class on <html> would restyle the whole page twice per scroll)
  onLite(function () {
    var sT = 0;
    window.addEventListener('scroll', function () {
      window.__stScrolling = true; clearTimeout(sT); sT = setTimeout(function () { window.__stScrolling = false; }, 160);
    }, { passive: true });
  });
  // touch: mark a hard flick (well over one screen a second) so WebGL and text effects yield those frames to the scroll
  if (TOUCH) {
    var flingY = window.pageYOffset, flingT = 0, flingIdle = 0, flingTracks = $$('.marquee-track');
    var flingPause = function (on) { for (var i = 0; i < flingTracks.length; i++) flingTracks[i].style.animationPlayState = on ? 'paused' : ''; };
    window.addEventListener('scroll', function () {
      var now = performance.now(), y = window.pageYOffset, dt = flingT ? now - flingT : 16, dy = Math.abs(y - flingY);
      flingY = y; flingT = now;
      window.__stScrolling = true;
      if (dy / dt * 1000 > 1200 || dy > 64) { if (!window.__stFast) { window.__stFast = true; flingPause(true); } }
      clearTimeout(flingIdle);
      flingIdle = setTimeout(function () { window.__stScrolling = false; window.__stFast = false; flingT = 0; flingPause(false); }, 140);
    }, { passive: true });
    // Chrome's reload arrow is a downward tug at the top. Block only that tug, and only while the page is still there,
    // so the rest of the scroll never waits on this listener.
    var pullY = 0, pullOn = false;
    function pullStart(e) { if (e.touches.length === 1) pullY = e.touches[0].clientY; }
    function pullMove(e) {
      if (e.touches.length !== 1) return;
      if (window.pageYOffset <= 0 && e.touches[0].clientY - pullY > 10) e.preventDefault();
    }
    function pullArm() {
      var top = window.pageYOffset <= 0;
      if (top === pullOn) return;
      pullOn = top;
      if (top) {
        doc.addEventListener('touchstart', pullStart, { passive: true, capture: true });
        doc.addEventListener('touchmove', pullMove, { passive: false, capture: true });
      } else {
        doc.removeEventListener('touchstart', pullStart, true);
        doc.removeEventListener('touchmove', pullMove, true);
      }
    }
    window.addEventListener('scroll', pullArm, { passive: true });
    pullArm();
  }

  /* =====================================================
     SMOOTH SCROLL (native scrolling in lite mode: the compositor scrolls, so it never stutters)
     ===================================================== */
  var lenis = null, lenisRaf = function (t) { if (lenis) lenis.raf(t * 1000); };
  // Opera GX can cap CPU/RAM per tab (GX Control); script-driven smooth scrolling stutters under that cap,
  // so GX always gets the browser's own (compositor) scrolling
  var GX = false; try { GX = (navigator.userAgentData && navigator.userAgentData.brands || []).some(function (b) { return /Opera GX/i.test(b.brand); }); } catch (e) {}
  if (!RM && !LITE && !GX && !TOUCH && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false, wheelMultiplier: 0.95 });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);
  }
  onLite(function () {
    if (!lenis) return;
    var stopped = body.classList.contains('is-locked');
    gsap.ticker.remove(lenisRaf); try { lenis.destroy(); } catch (e) {} lenis = null;
    root.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
    if (stopped) { body.classList.add('is-locked'); root.classList.add('is-locked'); }
    ST.refresh();
  });
  function lock(v) { body.classList.toggle('is-locked', v); root.classList.toggle('is-locked', v); if (lenis) { v ? lenis.stop() : lenis.start(); } }
  function scrollToY(y, dur, done, hold) {
    // a jump the visitor asked for (a link, the dock, the slider arrows) must not be caught by a scene magnet on the way
    if (!hold) { magnetBusy = true; var d0 = done; done = function () { magnetBusy = false; if (d0) d0(); }; }
    if (lenis) lenis.scrollTo(y, { duration: dur || 1.4, force: true, lock: !!hold, onComplete: done });
    else { window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' }); setTimeout(done || function () {}, RM ? 0 : (dur || 1.4) * 1000 + 300); }
  }
  function scrollToEl(el, off) { if (!el) return; var y = el.getBoundingClientRect().top + window.pageYOffset + (off || 0); scrollToY(y); }
  $$('a[href^="#"]').forEach(function (a) {
    var h = a.getAttribute('href');
    if (h === '#book' || a.hasAttribute('data-book') || h === '#') return;
    a.addEventListener('click', function (e) {
      var t = h === '#main' ? null : $(h);
      e.preventDefault();
      if (h === '#main') scrollToY(0, 1.8); else if (t) scrollToEl(t, 0);
    });
  });

  /* =====================================================
     TEXT FX: scramble + letter bricks
     ===================================================== */
  var GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=/<>';
  // decrypt effect. Kept cheap on purpose so it never costs a scroll frame: the text is rebuilt about 30 times a second
  // (not every frame) and as at most three pieces (revealed text + near glyphs + far glyphs), not one element per letter.
  function scramble(el, dur, set) {
    if (!el) return;
    if (set != null) { el.setAttribute('data-txt', set); el.setAttribute('aria-label', set); if (RM || LITE) { el.textContent = set; return; } }
    if (set == null && el._done) return;
    el._done = true;
    var txt = el.getAttribute('data-txt');
    if (!txt) { txt = el.textContent; el.setAttribute('data-txt', txt); el.setAttribute('aria-label', txt); }
    if (RM || LITE) { el.textContent = txt; return; }
    if (el._scr) cancelAnimationFrame(el._scr);
    var len = txt.length, d = dur || clamp(380 + len * 9, 450, 900), t0 = performance.now(), lastT = 0;
    /* lock the box: random glyphs are wider than the real line, and on a phone that was pushing the headline around */
    el.style.width = el.offsetWidth + 'px';
    el.style.height = el.offsetHeight + 'px';
    el.style.overflow = 'hidden';
    var tick = function (now) {
      if (now - lastT < 32 && now - t0 < d) { el._scr = requestAnimationFrame(tick); return; }
      lastT = now;
      var p = clamp((now - t0) / d, 0, 1), a = '', near = '', far = '';
      for (var i = 0; i < len; i++) {
        var ch = txt[i], reveal = (i / len) * 0.75 + 0.2;
        if (ch === ' ' || p >= reveal) { if (near || far) { if (p > reveal - 0.32) near += ch; else far += ch; } else a += ch; }
        else { var g = GLYPHS[(Math.random() * GLYPHS.length) | 0]; if (p > reveal - 0.32 && !far) near += g; else far += g; }
      }
      el.innerHTML = esc2(a) + (near ? '<span class="scr-c">' + esc2(near) + '</span>' : '') + (far ? '<span class="scr-c" style="opacity:.25">' + esc2(far) + '</span>' : '');
      if (p < 1) el._scr = requestAnimationFrame(tick); else { el.textContent = txt; el.style.width = ''; el.style.height = ''; el.style.overflow = ''; el._scr = 0; }
    };
    el._scr = requestAnimationFrame(tick);
  }
  function esc2(t) { return t.replace(/[<>&]/g, esc); }
  function watchScramble() {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { scramble(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    $$('[data-scramble]').forEach(function (el) { if (!el.closest('.hero')) io.observe(el); });
  }
  // every letter becomes a tiny cube; the second face is drawn by CSS (content: attr(data-c)), so the page text
  // that search engines and screen readers see is the label once, not every letter twice
  function splitBricks(el) {
    var t = el.textContent.replace(/\s+/g, ' ').trim(); el.setAttribute('aria-label', t); el.textContent = '';
    var frag = doc.createDocumentFragment();
    t.split('').forEach(function (c, i) {
      var s = doc.createElement('span'); s.className = 'bk'; s.style.setProperty('--i', i); s.setAttribute('aria-hidden', 'true');
      var a = doc.createElement('span'), b = doc.createElement('span'), ch = c === ' ' ? '\u00a0' : c;
      a.textContent = ch; b.setAttribute('data-c', ch);
      s.appendChild(a); s.appendChild(b); frag.appendChild(s);
    });
    el.appendChild(frag);
    // the letters are aria-hidden, so the link/button itself carries the readable name
    var host = el.closest && el.closest('a, button');
    if (host && (!host.getAttribute('aria-label') || host.hasAttribute('data-al'))) { host.setAttribute('aria-label', t); host.setAttribute('data-al', ''); }
  }
  // text links everywhere get the same hover as "See how we build": underline sweep + letter flip
  var LINKS = '.foot-cols a, .foot-b a, .svc-more, .cookie p a, .m-cal-alt a, .ip-legal a, .nf-foot a';
  $$(LINKS).forEach(function (a) {
    if (a.querySelector('[data-brick]') || a.classList.contains('btn') || a.classList.contains('btn2')) return;
    var label = a.textContent.replace(/\s+/g, ' ').trim(); if (!label) return;
    a.classList.add('lk'); if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', label);
    Array.prototype.slice.call(a.childNodes).forEach(function (n) {
      if (n.nodeType === 3 && n.textContent.trim()) { var s = doc.createElement('span'); s.setAttribute('data-brick', ''); s.textContent = n.textContent.trim(); a.replaceChild(s, n); }
    });
  });
  $$('.btn2').forEach(function (a) { var t = a.textContent.replace(/\s+/g, ' ').trim(); if (t && !a.getAttribute('aria-label')) a.setAttribute('aria-label', t); });
  $$('[data-brick], .btn-t').forEach(splitBricks);
  // turn 3D on just before a label flips and off once it has flipped back
  $$('.btn, .btn2, .lk').forEach(function (h) {
    if (!h.querySelector('.bk')) return;
    var off = 0;
    function on() { clearTimeout(off); h.classList.add('is-3d'); }
    function later() { clearTimeout(off); off = setTimeout(function () { if (!h.matches(':hover') && doc.activeElement !== h && !h.classList.contains('is-flow')) h.classList.remove('is-3d'); }, 900); }
    ['pointerenter', 'focus', 'touchstart'].forEach(function (ev) { h.addEventListener(ev, on, { passive: true }); });
    ['pointerleave', 'blur', 'touchend'].forEach(function (ev) { h.addEventListener(ev, later, { passive: true }); });
    h._3d = { on: on, later: later };
  });

  /* =====================================================
     BUTTONS: the fill slides up while the letters twist
     ===================================================== */
  $$('.btn').forEach(function (b) {
    b.addEventListener('pointerleave', function () { b.classList.remove('is-flow'); });
    b.addEventListener('blur', function () { b.classList.remove('is-flow'); });
  });
  // a short haptic tick on touch devices that support it (Android Chrome; iOS Safari has no vibration API)
  $$('.btn, .btn2, [data-book]').forEach(function (b) {
    b.addEventListener('pointerup', function (e) { if (e.pointerType === 'touch' && navigator.vibrate) try { navigator.vibrate(14); } catch (x) {} });
  });
  if (!RM) setInterval(function () {
    var vh = innerHeight, n = 0;
    $$('.btn[data-pulse]').forEach(function (b) {
      var r = b.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh || !r.width || b.matches(':hover')) return;
      setTimeout(function () {
        if (b.matches(':hover') || doc.activeElement === b) return;
        b.classList.add('is-3d', 'is-flow');
        setTimeout(function () {
          b.classList.remove('is-flow');
          setTimeout(function () { if (!b.matches(':hover') && doc.activeElement !== b) b.classList.remove('is-3d'); }, 900);
        }, 1000);
      }, n++ * 220);
    });
  }, 6500);

  /* ---------- reveal ---------- */
  var rvIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rvIO.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(function (el) { rvIO.observe(el); });

  /* =====================================================
     THEME (left-to-right sweep)
     ===================================================== */
  var forms = null, hex = null;
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('st-theme-v2', t); } catch (e) {}
    $$('[data-theme-toggle]').forEach(function (b) { b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); });
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#060807' : '#F2F3EE');
    if (forms) forms.setTheme(t); if (hex) hex.theme();
  }
  var themeBusy = false;
  $$('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (themeBusy) return;
      themeBusy = true; setTimeout(function () { themeBusy = false; }, 900);
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (RM) { applyTheme(next); return; }
      if (doc.startViewTransition) {
        var vt = doc.startViewTransition(function () { applyTheme(next); });
        vt.ready.then(function () {
          root.animate({ clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { duration: 850, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' });
        }).catch(function () {});
      } else {
        var sw = doc.createElement('div'); sw.className = 'sweep'; body.appendChild(sw);
        sw.style.background = next === 'dark' ? '#060807' : '#F2F3EE';
        gsap.timeline({ onComplete: function () { sw.remove(); } })
          .to(sw, { xPercent: 101, x: 0, duration: 0.5, ease: 'power2.in', startAt: { xPercent: -101 } })
          .add(function () { applyTheme(next); })
          .to(sw, { xPercent: 202, duration: 0.5, ease: 'power2.out' });
      }
    });
  });

  /* =====================================================
     CURSOR + SCROLLBAR (desktop only)
     ===================================================== */
  if (FINE && !RM) {
    // the arrow cursor is now an OS cursor image (assets/css/cursor.css): it moves with the hardware pointer,
    // so it can never lag behind the mouse, however busy the page is. Loaded without blocking the first paint.
    (function () {
      var l = doc.createElement('link'); l.rel = 'stylesheet'; l.href = 'assets/css/cursor.css?v=3611cb482b';
      l.onload = function () { root.classList.add('has-cur'); };
      doc.head.appendChild(l);
    })();
    // scrollbar (page height is cached and only re-read when the layout changes, never inside a scroll frame)
    var bar = $('#sbar'), th = $('#sthumb'), idle = 0, drag = false, dy = 0, PH = 0, TR = 0, TH = 40;
    if (bar && th) {
      root.classList.add('has-sbar');
      var measureBar = function () { PH = doc.documentElement.scrollHeight; TR = bar.clientHeight; TH = Math.max(40, TR * innerHeight / Math.max(1, PH)); th.style.height = TH + 'px'; };
      var upd = function () {
        if (!PH) measureBar();
        var y = (window.pageYOffset / Math.max(1, PH - innerHeight)) * (TR - TH);
        th.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
        if (!bar._on) { bar._on = true; bar.classList.add('is-on'); }
        clearTimeout(idle); idle = setTimeout(function () { if (!drag) { bar._on = false; bar.classList.remove('is-on'); } }, 1000);
      };
      window.addEventListener('scroll', upd, { passive: true });
      window.addEventListener('resize', function () { PH = 0; });
      if (window.ResizeObserver) new ResizeObserver(function () { PH = 0; }).observe(body);
      ST.addEventListener('refresh', function () { PH = 0; });
      var toY = function (clientY) { var r = bar.getBoundingClientRect(), H = doc.documentElement.scrollHeight, h = th.offsetHeight; var p = clamp((clientY - r.top - dy) / (r.height - h), 0, 1); if (lenis) lenis.scrollTo(p * (H - innerHeight), { immediate: true }); else window.scrollTo(0, p * (H - innerHeight)); };
      th.addEventListener('pointerdown', function (e) { drag = true; bar.classList.add('is-drag'); dy = e.clientY - th.getBoundingClientRect().top; e.preventDefault(); });
      bar.addEventListener('pointerdown', function (e) { if (e.target === th) return; dy = th.offsetHeight / 2; toY(e.clientY); });
      window.addEventListener('pointermove', function (e) { if (drag) toY(e.clientY); }, { passive: true });
      window.addEventListener('pointerup', function () { drag = false; bar.classList.remove('is-drag'); });
      setTimeout(upd, 400);
    }
  }

  /* =====================================================
     BACKGROUND: dot field with a soft liquid ripple (WebGL, desktop)
     ===================================================== */
  function Hex() {
    var cv = $('#hexbg'); if (!cv || !FINE || MQ.matches || RM || LITE) return null;
    // preserveDrawingBuffer lets us redraw only the patch around the cursor instead of the whole screen
    // premultiplied alpha (the browser default): the safest path for every compositor
    var gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true }); if (!gl) return null;
    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    // honeycomb web: thin hexagon lines, very faint; near the cursor they brighten and ripple
    var fs = [
      'precision mediump float;uniform vec2 uR;uniform vec2 uM;uniform float uI;uniform float uS;uniform vec3 uC;uniform vec3 uA;uniform float uB;uniform float uT;uniform float uK;',
      'void main(){',
      ' float S=34.;vec2 f=gl_FragCoord.xy;vec2 m=uM;',
      ' vec2 r=vec2(1.,1.7320508);vec2 hh=r*.5;vec2 p=f/S;',
      ' vec2 a=mod(p,r)-hh;vec2 b=mod(p-hh,r)-hh;vec2 gv=dot(a,a)<dot(b,b)?a:b;',
      ' vec2 q=abs(gv);float hd=max(dot(q,vec2(.5,.8660254)),q.x);',
      ' float edge=(.5-hd)*S;',
      ' float d=length(f-m);',
      // the ripple fades to exactly zero at the edge of the redraw patch, so a smaller patch leaves no seams
      ' float fo=uI*(1.-smoothstep(uS*.55,uS,d));',
      ' float wave=sin(d*.045-uT*4.)*exp(-d/260.)*fo;',
      ' float near=exp(-d*d/(190.*190.))*fo;',
      ' float lw=.55+max(0.,wave)*.9+near*.5;',
      ' float line=1.-smoothstep(lw-.45,lw+.65,edge);',
      ' float vg=smoothstep(0.,.85,1.-length((gl_FragCoord.xy/uR-vec2(.5,.62))*vec2(.9,1.25)));',
      ' float al=line*(uB*vg+near*.3+max(0.,wave)*.16);',
      // written already premultiplied, with the exact faint look the honeycomb was tuned to (colour x A^3 over A^2 coverage),
      // so every browser composites it the same way (some recent Chromium builds, e.g. Opera GX, showed it far too strong before)
      ' float A=clamp(al*uK,0.,1.);gl_FragColor=vec4(mix(uC,uA,clamp(near*1.4,0.,1.))*A*A*A,A*A);',
      '}'].join('\n');
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['uR', 'uM', 'uI', 'uS', 'uC', 'uA', 'uB', 'uT', 'uK'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var W = 0, H = 0, mx = -999, my = -999, tmx = -999, tmy = -999, I = 0, tI = 0, raf = 0, colC = [1, 1, 1], colA = [0.24, 0.96, 0.56], base = 0.1, kmul = 1, t0 = performance.now(), idle = 0;
    function size() { W = innerWidth; H = innerHeight; cv.width = W; cv.height = H; gl.viewport(0, 0, W, H); }
    function theme() {
      var d = root.getAttribute('data-theme') === 'dark';
      colC = d ? [0.93, 0.95, 0.94] : [0.04, 0.1, 0.07]; colA = d ? [0.3, 0.9, 0.58] : [0.04, 0.42, 0.27]; base = d ? 0.21 : 0.12; kmul = d ? 1 : 0.42; kick();
    }
    var RAD = 400, box = null, dead = false;
    function draw(full) {
      mx = lerp(mx, tmx, 0.12); my = lerp(my, tmy, 0.12); I = lerp(I, tI, 0.05);
      // only the patch the ripple can reach (plus last frame's patch) is cleared and redrawn
      var nb = [mx - RAD, H - my - RAD, mx + RAD, H - my + RAD], u = box ? [Math.min(nb[0], box[0]), Math.min(nb[1], box[1]), Math.max(nb[2], box[2]), Math.max(nb[3], box[3])] : nb;
      box = nb;
      if (full || mx < -900) gl.disable(gl.SCISSOR_TEST);
      else { gl.enable(gl.SCISSOR_TEST); var x0 = Math.max(0, Math.floor(u[0])), y0 = Math.max(0, Math.floor(u[1])); gl.scissor(x0, y0, Math.max(0, Math.min(W, Math.ceil(u[2])) - x0), Math.max(0, Math.min(H, Math.ceil(u[3])) - y0)); }
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.uR, W, H); gl.uniform2f(U.uM, mx, H - my); gl.uniform1f(U.uI, I); gl.uniform1f(U.uS, RAD);
      gl.uniform3fv(U.uC, colC); gl.uniform3fv(U.uA, colA); gl.uniform1f(U.uB, base); gl.uniform1f(U.uT, (performance.now() - t0) / 1000); gl.uniform1f(U.uK, kmul);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function loop() { if (dead) { raf = 0; return; } draw(false); if (I > 0.004 || tI > 0 || Math.abs(mx - tmx) > 0.5) raf = requestAnimationFrame(loop); else { raf = 0; I = 0; draw(true); } }
    function kick() { if (!raf && !dead) raf = requestAnimationFrame(loop); }
    // lite mode: hand the background back to the CSS honeycomb and free the GPU context
    onLite(function () { dead = true; cancelAnimationFrame(raf); raf = 0; root.classList.remove('has-hex'); setTimeout(function () { var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); cv.width = cv.height = 1; }, 1300); });
    window.addEventListener('pointermove', function (e) {
      if (dead) return;
      if (mx < -900) { mx = e.clientX; my = e.clientY; }
      tmx = e.clientX; tmy = e.clientY;
      tI = 1; kick();
      clearTimeout(idle); idle = setTimeout(function () { tI = 0; }, 1400);
    }, { passive: true });
    doc.addEventListener('mouseleave', function () { tI = 0; });
    // the honeycomb is fixed to the screen, so scrolling never redraws it (keeps scroll smooth on every device)
    window.addEventListener('resize', function () { if (dead) return; size(); draw(true); });
    size(); theme(); draw(true); root.classList.add('has-hex');
    return { theme: theme };
  }

  /* =====================================================
     SPLASH
     ===================================================== */
  // The intro (logo draws, molecule glows, counter) is pure CSS, so it starts with the very first paint,
  // even before any script has downloaded. This only adds the decrypting word and the glass shatter on top.
  // It plays on every load and reload; arriving from an inner page through the page loader skips it.
  function splash() {
    var sp = $('#splash');
    return new Promise(function (resolve) {
      if (!sp || RM || !root.classList.contains('sp-on')) { if (sp) sp.remove(); root.classList.remove('sp-on'); resolve(); return; }
      lock(true);
      var word = $('.sp-word', sp), cnt = $('#spCount'), clockEl = $('.sp-stage', sp), WORD = 1600, END = 2900;
      var anims = sp.getAnimations ? sp.getAnimations({ subtree: true }) : [];
      var clock = null; anims.forEach(function (a) { if (a.effect && a.effect.target === clockEl) clock = a; });
      // browsers without @property cannot count in CSS: count with script instead
      var jsCount = !(window.CSS && CSS.registerProperty); if (jsCount) cnt.classList.add('sp-js');
      var rate = 1, t0 = performance.now(), wordOn = false, done = false, loaded = doc.readyState === 'complete', fontsOk = !doc.fonts;
      if (!loaded) window.addEventListener('load', function () { loaded = true; });
      if (doc.fonts) doc.fonts.ready.then(function () { fontsOk = true; });
      function now() { return clock && clock.currentTime != null ? clock.currentTime : (performance.now() - t0) * rate; }
      (function poll() {
        if (done) return;
        var t = now();
        if (jsCount) { var p = clamp(t / 2300, 0, 1), e = 0.5 - Math.cos(Math.PI * p) / 2; cnt.firstChild.textContent = String(Math.round(e * 100)).padStart(3, '0'); }
        if (!wordOn && t >= WORD) { wordOn = true; word.style.opacity = 1; scramble(word, 650 / rate); }
        if ((t >= END || (clock && clock.playState === 'finished')) && ((loaded && fontsOk) || performance.now() - t0 > 6500)) {
          done = true;
          if (!wordOn) { word.style.opacity = 1; }
          shatter(sp).then(resolve); return;
        }
        requestAnimationFrame(poll);
      })();
      // a click or tap fast-forwards the intro
      sp.addEventListener('click', function () { rate = 3.5; anims.forEach(function (a) { try { a.playbackRate = 3.5; } catch (e) {} }); });
    });
  }
  function shatter(sp) {
    return new Promise(function (resolve) {
      var cv = $('#spShards', sp), W = innerWidth, H = innerHeight, dpr = Math.min(window.devicePixelRatio || 1, LITE ? 1 : 1.5);
      var off = doc.createElement('canvas'); off.width = Math.round(W * dpr); off.height = Math.round(H * dpr);
      var o = off.getContext('2d'); o.scale(dpr, dpr);
      o.fillStyle = cssVar('--bg'); o.fillRect(0, 0, W, H);
      var svg = $('.sp-logo', sp), r = svg.getBoundingClientRect(), k = r.width / 489;
      o.save(); o.translate(r.left + 6 * k, r.top + 6 * k); o.scale(k, k);
      $$('.sp-p', sp).forEach(function (p) {
        var isMol = p.classList.contains('sp-mol'), p2 = new Path2D(p.getAttribute('d'));
        o.fillStyle = isMol ? cssVar('--acc') : cssVar('--ink');
        if (isMol && root.getAttribute('data-theme') !== 'light') { o.shadowColor = cssVar('--acc'); o.shadowBlur = 24 * k * dpr; }
        o.fill(p2); o.shadowBlur = 0;
      });
      o.restore();
      var w = $('.sp-word', sp), wr = w.getBoundingClientRect(), fs = parseFloat(getComputedStyle(w).fontSize), ls = fs * 0.6, txt = w.getAttribute('data-txt') || w.textContent;
      o.font = '500 ' + fs + 'px Poppins, sans-serif'; o.fillStyle = cssVar('--ink'); o.textBaseline = 'middle';
      var x = wr.left + ls, y = wr.top + wr.height / 2;
      for (var i = 0; i < txt.length; i++) { o.fillText(txt[i], x, y); x += o.measureText(txt[i]).width + ls; }
      cv.width = off.width; cv.height = off.height;
      var ctx = cv.getContext('2d'), ts = Math.round(LITE ? clamp(W / 14, 44, 96) : clamp(W / 24, 28, 64)), cols = Math.ceil(W / ts), rows = Math.ceil(H / ts), tiles = [], cx = W / 2, cy = H / 2, maxD = Math.hypot(cx, cy);
      for (var yy = 0; yy < rows; yy++) for (var xx = 0; xx < cols; xx++) {
        var tx = xx * ts, ty = yy * ts, dx = tx + ts / 2 - cx, dy = ty + ts / 2 - cy, d = Math.hypot(dx, dy) / maxD;
        var ang = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.9, sp2 = 120 + Math.random() * 380;
        tiles.push({ x: tx, y: ty, de: d * 0.42 + Math.random() * 0.18, vx: Math.cos(ang) * sp2, vy: Math.sin(ang) * sp2 * 0.7 + 60, rot: (Math.random() - 0.5) * 3.4, du: 0.62 + Math.random() * 0.3 });
      }
      sp.classList.add('is-shatter');
      heroIn();
      var t0 = performance.now(), sd = ts * dpr;
      (function loop(now) {
        var t = (now - t0) / 1000, alive = 0;
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
        for (var i = 0; i < tiles.length; i++) {
          var tl = tiles[i], q = (t - tl.de) / tl.du;
          if (q >= 1) continue; alive++;
          var sx = tl.x * dpr, sy = tl.y * dpr;
          if (q <= 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(off, sx, sy, sd, sd, sx, sy, sd + 1, sd + 1); continue; }
          var e = q * q * (3 - 2 * q), e2 = q * q, px = (tl.x + ts / 2 + tl.vx * e) * dpr, py = (tl.y + ts / 2 + tl.vy * e + 260 * e2) * dpr, s = 1 - e * 0.65;
          ctx.globalAlpha = 1 - e2; ctx.setTransform(s, 0, 0, s, px, py); ctx.rotate(tl.rot * e);
          ctx.drawImage(off, sx, sy, sd, sd, -sd / 2, -sd / 2, sd, sd);
        }
        ctx.globalAlpha = 1;
        if (alive) requestAnimationFrame(loop); else { sp.remove(); root.classList.remove('sp-on'); lock(false); resolve(); }
      })(t0);
    });
  }

  /* ---------- hero in ---------- */
  var heroDone = false;
  function heroIn() {
    if (heroDone) return; heroDone = true;
    body.classList.add('is-ready');
    if (!RM && $('.hl-i')) gsap.fromTo('.hl-i', { yPercent: 108 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.05 });
    var eb = $('.hero [data-scramble]'); setTimeout(function () { scramble(eb, 700); }, 150);
    setTimeout(cookie, 2600);
  }

  /* =====================================================
     DOCK
     ===================================================== */
  var dock = $('#dock');
  // the dock rises from the bottom the moment the top bar scrolls out of view (every page), and leaves when it comes back
  var topBar = $('#top');
  if (dock && topBar) ST.create({ trigger: topBar, start: 'bottom top', onEnter: function () { dock.classList.add('is-on'); }, onLeaveBack: function () { dock.classList.remove('is-on'); } });
  var hl = $('.dock-hl'), links = $$('.dock-links a'), curL = null;
  function moveHl(a) { if (!a || !hl) { if (hl) hl.style.opacity = 0; return; } hl.style.opacity = 1; hl.style.width = a.offsetWidth + 'px'; hl.style.transform = 'translateX(' + a.offsetLeft + 'px)'; }
  links.forEach(function (a) {
    a.addEventListener('mouseenter', function () { moveHl(a); });
    var sec = $('#' + a.getAttribute('data-sec'));
    if (sec) ST.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: function (s) {
      if (s.isActive) { links.forEach(function (l) { l.classList.remove('is-cur'); }); a.classList.add('is-cur'); curL = a; moveHl(a); }
      else if (curL === a) { a.classList.remove('is-cur'); curL = null; moveHl(null); }
    } });
  });
  var dl = $('#dockLinks'); if (dl) dl.addEventListener('mouseleave', function () { moveHl(curL); });

  /* =====================================================
     PROBLEM (fades in from the page, then text, then a smooth zoom)
     ===================================================== */
  // full-screen scenes (Problem, Industries): the scene spreads from a rounded panel to the full screen as it arrives
  // (and folds back on the way up), and a magnet glides the page the rest of the way, so no half-shown edge ever sits on screen
  // touch scenes follow the finger, but the paint happens once per frame (a flick was redrawing the same scene several times before the next paint)
  function driveScroll(tl, opts, each) {
    var job = 0, prog = 0;
    opts.onUpdate = function (s) {
      if (each) each(s);
      prog = s.progress;
      if (job) return;
      job = requestAnimationFrame(function () { job = 0; tl.progress(prog); });
    };
    opts.onRefresh = function (s) { tl.invalidate(); prog = s.progress; tl.progress(prog); };
    return ST.create(opts);
  }
  function sceneEntry(sec, stage) {
    if (!sec || !stage) return;
    // both clip-path spellings for WebKit; once fully open the clip is removed so nothing extra is painted
    var cp = { k: 1 };
    var setClip = function () {
      var k = cp.k, v = k > 0.001 ? 'inset(' + (6 * k).toFixed(2) + '% ' + (4 * k).toFixed(2) + '% 0% ' + (4 * k).toFixed(2) + '% round ' + (40 * k).toFixed(1) + 'px)' : 'none';
      if (stage._clip === v) return;
      stage._clip = v; stage.style.webkitClipPath = v; stage.style.clipPath = v;
    };
    if (TOUCH) {
      var job = 0, k = 1, apply = function () { cp.k = k; setClip(); };
      apply();
      ST.create({ trigger: sec, start: 'top 94%', end: 'top top', onUpdate: function (s) {
        k = 1 - s.progress;
        if (job) return;
        job = requestAnimationFrame(function () { job = 0; apply(); });
      }});
    } else {
      gsap.fromTo(cp, { k: 1 }, { k: 0, ease: 'none', onUpdate: setClip, scrollTrigger: { trigger: sec, start: 'top 94%', end: 'top top', scrub: true } });
      setClip();
    }
    // the magnet finishes a half-shown scene on a mouse wheel. On a touch screen it fights the finger
    // and the momentum, so the page jumps between sections. Touch scrolling stays with the finger.
    if (TOUCH) return;
    var lastY = window.pageYOffset, dir = 0, busy = false, idle = 0;
    function check() {
      if (busy || body.classList.contains('is-locked') || magnetBusy) return;
      var top = sec.getBoundingClientRect().top, vh = innerHeight, y = window.pageYOffset, target = null;
      if (dir > 0 && top > vh * 0.03 && top < vh * 0.9) target = y + top;
      else if (dir < 0 && top > vh * 0.1 && top < vh * 0.97) target = y + top - vh;
      if (target == null) return;
      busy = magnetBusy = true;
      scrollToY(Math.max(0, target), 0.9, function () { busy = magnetBusy = false; lastY = window.pageYOffset; dir = 0; }, true);
    }
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset; if (y !== lastY) dir = y > lastY ? 1 : -1; lastY = y;
      if (busy) return;
      if (lenis) check(); else { clearTimeout(idle); idle = setTimeout(check, 90); }
    }, { passive: true });
  }
  var magnetBusy = false;
  function problem() {
    var sec = $('#problem'); if (!sec) return;
    sceneEntry(sec, $('.pb-stage', sec));
    $$('.pb-bubbles i', sec).forEach(function (b) {
      b.style.setProperty('--x', (Math.random() * 100).toFixed(1)); b.style.setProperty('--s', (4 + Math.random() * 18) + 'px');
      b.style.setProperty('--d', (9 + Math.random() * 12).toFixed(1) + 's'); b.style.setProperty('--dl', (-Math.random() * 20).toFixed(1) + 's'); b.style.setProperty('--dx', ((Math.random() - 0.5) * 80).toFixed(0) + 'px');
    });
    var intro = $('#pbIntro'), words = [];
    Array.prototype.slice.call(intro.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { intro.insertBefore(doc.createTextNode(w), n); return; }
          var s = doc.createElement('span'); s.className = 'pw'; s.textContent = w; intro.insertBefore(s, n); words.push(s);
        });
        intro.removeChild(n);
      } else { n.classList.add('pw'); words.push(n); }
    });
    var track = $('.pb-track', sec), panel = $('.pb-panel', sec), img = $('.pb-img', sec), end = $('.pb-end', sec);
    var tl = gsap.timeline(TOUCH
      ? { paused: true, defaults: { ease: 'none' } }
      : { defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top 85%', end: 'bottom bottom', scrub: SCRUB, invalidateOnRefresh: true } });
    gsap.set('.pb-bg', { opacity: 1 });
    tl.fromTo('.pb-bubbles', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.5)
      .set(intro, { opacity: 1 }, 1.95)
      .to(intro, TOUCH ? { yPercent: -50, opacity: 0, duration: 0.7, ease: 'power1.in' } : { yPercent: -50, opacity: 0, filter: 'blur(8px)', duration: 0.7, ease: 'power1.in' }, 3.7)
      // the moving line gets more scroll distance (and the section is taller) so it can be read while it passes
      .fromTo(track, { x: function () { return root.clientWidth; } }, { x: function () { return -track.scrollWidth - root.clientWidth * 0.05; }, duration: 5.6 }, 3.9)
      .fromTo(panel, { clipPath: 'inset(50% 50% 50% 50% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 3, ease: 'power2.inOut' }, 6.3)
      .fromTo(img, { opacity: 0, scale: 0.82, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 1.4, ease: 'power2.out' }, 9.3)
      .fromTo(end, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, 9.7)
      .to({}, { duration: 1.4 }, 10.9);
    if (TOUCH) driveScroll(tl, { trigger: sec, start: 'top 85%', end: 'bottom bottom' });
    // the opening line plays by itself the moment the scene has filled the screen (no extra scrolling needed to read it)
    gsap.set(words, TOUCH ? { opacity: 0, y: 18 } : { opacity: 0, y: 18, filter: 'blur(6px)' });
    ST.create({ trigger: sec, start: 'top 6%', onEnter: function () { gsap.to(words, TOUCH ? { opacity: 1, y: 0, stagger: 0.06, duration: 0.6, ease: 'power2.out', overwrite: true } : { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.06, duration: 0.6, ease: 'power2.out', overwrite: true }); },
      onLeaveBack: function () { gsap.to(words, TOUCH ? { opacity: 0, y: 18, duration: 0.3, overwrite: true } : { opacity: 0, y: 18, filter: 'blur(6px)', duration: 0.3, overwrite: true }); } });
  }

  /* =====================================================
     INDUSTRIES (scroll-driven ring masks)
     ===================================================== */
  function industries() {
    var sec = $('#industries'); if (!sec) return;
    var stage = $('.ind-stage', sec), num = $('#indNum'), bar = $('.ind-bar i', sec);
    sceneEntry(sec, stage);
    if (!TOUCH) $$('.ind-name', sec).forEach(function (n) {
      var t = n.textContent; n.textContent = '';
      t.split('').forEach(function (c) { var s = doc.createElement('span'); s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true'); n.appendChild(s); });
    });
    var vmin = function () { return Math.min(stage.clientWidth, stage.clientHeight); };
    var full = function () { return Math.hypot(stage.clientWidth, stage.clientHeight) / 2 + 10; };
    var circ = function (r) { return 'circle(' + r + 'px at 50% 50%)'; };
    var cur = -1;
    var indStep = function (s) { var i = s.progress < 0.36 ? 0 : s.progress < 0.71 ? 1 : 2; if (i !== cur) { cur = i; num.textContent = '0' + (i + 1); } };
    var tl = gsap.timeline(TOUCH
      ? { paused: true, defaults: { ease: 'none' } }
      : { defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: SCRUB, invalidateOnRefresh: true, onUpdate: indStep } });
    tl.to({}, { duration: 1 }, 0);
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 7 }, 0);
    [1, 2].forEach(function (s, idx) {
      var T = 1 + idx * 3, sl = $('.ind-slide[data-s="' + s + '"]', sec), c1 = $('.ind-c1', sl), c2 = $('.ind-c2', sl), c3 = $('.ind-c3', sl);
      var prevT = $('.ind-t[data-t="' + (s - 1) + '"]', sec), nextT = $('.ind-t[data-t="' + s + '"]', sec);
      tl.fromTo(c1, { clipPath: circ(0) }, { clipPath: function () { return circ(vmin() * 0.46); }, duration: 1, ease: 'power2.out' }, T)
        .to(c1, { clipPath: function () { return circ(full()); }, duration: 1, ease: 'power2.in' }, T + 1)
        .fromTo(c2, { clipPath: circ(0) }, { clipPath: function () { return circ(vmin() * 0.28); }, duration: 0.95, ease: 'power2.out' }, T + 0.15)
        .fromTo(c3, { clipPath: circ(0) }, { clipPath: function () { return circ(vmin() * 0.13); }, duration: 0.9, ease: 'power2.out' }, T + 0.3)
        .fromTo($('img', c1), { rotation: 80, scale: 1.45 }, { rotation: 0, scale: 1, duration: 2, ease: 'power2.inOut' }, T)
        .fromTo($('img', c2), { rotation: -120, scale: 1.45 }, { rotation: 0, scale: 1, duration: 2, ease: 'power2.inOut' }, T)
        .fromTo($('img', c3), { rotation: 160, scale: 1.45 }, { rotation: 0, scale: 1, duration: 2, ease: 'power2.inOut' }, T)
        .to(TOUCH ? $('.ind-name', prevT) : $$('.ch', prevT), TOUCH ? { yPercent: -30, opacity: 0, duration: 0.45, ease: 'power2.in' } : { yPercent: -60, opacity: 0, duration: 0.5, stagger: 0.03, ease: 'power2.in' }, T + 0.1)
        .to($('.ind-sub', prevT), { opacity: 0, y: -10, duration: 0.4 }, T + 0.1)
        .to($('.ind-desc [data-d="' + (s - 1) + '"]', sec), { opacity: 0, y: -10, duration: 0.4 }, T + 0.1)
        .set(nextT, { opacity: 1 }, T + 1)
        .fromTo(TOUCH ? $('.ind-name', nextT) : $$('.ch', nextT), TOUCH ? { yPercent: 40, opacity: 0 } : { yPercent: 70, opacity: 0 }, TOUCH ? { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power2.out' } : { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.035, ease: 'power3.out' }, T + 1.1)
        .fromTo($('.ind-sub', nextT), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, T + 1.4)
        .fromTo($('.ind-desc [data-d="' + s + '"]', sec), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, T + 1.4)
        .fromTo('.ind-rings .r2', { scale: 1 }, { scale: 1.12, duration: 1, ease: 'sine.inOut', yoyo: true, repeat: 1 }, T)
        .to({}, { duration: 1 }, T + 2);
    });
    var indST = TOUCH ? driveScroll(tl, { trigger: sec, start: 'top top', end: 'bottom bottom' }, indStep) : null;
    var POS = [0.07, 0.5, 0.93];
    $$('.ind-arr', sec).forEach(function (b) {
      b.addEventListener('click', function () {
        var st = tl.scrollTrigger || indST, t = clamp(Math.max(0, cur) + (+b.getAttribute('data-dir')), 0, 2);
        scrollToY(st.start + (st.end - st.start) * POS[t], 1.2);
      });
    });
  }

  /* =====================================================
     SERVICES (C-shaped deck: previous and next card peek, active card in the middle)
     ===================================================== */
  function services() {
    var pin = $('#svcPin'); if (!pin) return;
    var cards = $$('.sc', pin), nums = $$('.svc-nums button', pin), txs = $$('.svc-tx', pin), prog = $$('#svcProg i'), deck = $('.svc-deck', pin), N = cards.length, cur = -1, p = 0, pT = 0, trig;
    function setActive(i) {
      if (i === cur) return; cur = i;
      cards.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
      nums.forEach(function (b, k) { b.classList.toggle('is-on', k === i); b.setAttribute('aria-selected', String(k === i)); });
      txs.forEach(function (t, k) { t.classList.toggle('is-on', k === i); });
      prog.forEach(function (b, k) { b.classList.toggle('is-on', k <= i); b.classList.toggle('is-cur', k === i); });
      var h = $('h3', txs[i]);
      if (h && !window.__stFast) scramble(h, 420);
    }
    var deckH = 0, deckW = 0;
    function place() {
      if (!deckH) { deckH = deck.clientHeight; deckW = deck.clientWidth; }
      var mob = MQ.matches, H = deckH, R = H * (mob ? 0.95 : 0.98), step = (mob ? 30 : 32) * Math.PI / 180;
      cards.forEach(function (c, i) {
        var o = i - p, a = Math.abs(o), th = o * step;
        var x = mob ? Math.sin(th) * deckW * 1.05 : R * (1 - Math.cos(th)), y = mob ? (1 - Math.cos(th)) * H * 0.55 : R * Math.sin(th);
        var sc = 1 - Math.min(a, 2) * 0.12, op = a <= 1 ? 1 - a * 0.45 : Math.max(0, 0.55 - (a - 1) * 0.9);
        var tr = 'translate3d(' + x.toFixed(1) + 'px,calc(-50% + ' + y.toFixed(1) + 'px),0) rotate(' + (th * 180 / Math.PI * 0.42).toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        var opS = op.toFixed(3), zi = String(20 - Math.round(a * 4)), pe = a < 0.5 ? 'auto' : 'none';
        if (c._tr !== tr) { c._tr = tr; c.style.transform = tr; }
        if (c._op !== opS) { c._op = opS; c.style.opacity = opS; }
        if (c._zi !== zi) { c._zi = zi; c.style.zIndex = zi; }
        if (c._pe !== pe) { c._pe = pe; c.style.pointerEvents = pe; }
      });
    }
    function target(prog) {
      var u = prog * (N - 1), b = Math.floor(u), f = u - b, k = clamp((f - 0.22) / 0.56, 0, 1);
      return Math.min(N - 1, b + k * k * (3 - 2 * k));
    }
    trig = ST.create({ trigger: pin, start: 'top top', end: 'bottom bottom', onUpdate: function (s) { pT = target(s.progress); } });
    gsap.ticker.add(function () {
      if (Math.abs(pT - p) < 0.0005) return;
      p += (pT - p) * (RM || TOUCH ? 1 : 0.1); place(); setActive(Math.round(p));
    });
    window.addEventListener('resize', function () { deckH = 0; place(); });
    place(); setActive(0);
    nums.forEach(function (b, i) { b.addEventListener('click', function () { scrollToY(trig.start + (trig.end - trig.start) * (i / (N - 1)), 1.2); }); });
  }

  /* =====================================================
     3D FORMS (lazy: injects forms-data.js, works from file://)
     ===================================================== */
  function formsScene() {
    var sec = $('#forms'), cv = $('#formsGl'); if (!sec || !cv) return;
    var steps = $$('.fs', sec), dots = $$('.forms-dots i', sec), curStep = -1, started = false, visible = false;
    function setStep(i) {
      if (i === curStep) return; curStep = i;
      steps.forEach(function (s, k) {
        if (k === i) { gsap.to(s, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', overwrite: true }); scramble($('h3', s), 520); }
        else gsap.to(s, { opacity: 0, y: k < i ? -24 : 24, duration: 0.35, ease: 'power2.in', overwrite: true });
      });
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
    }
    setStep(0);
    function fail() { root.classList.add('no-gl'); forms = null; }
    function boot() {
      if (started) return; started = true;
      if (!window.StForms || NOGPU) { fail(); return; }
      var go = function () {
        try {
          var f = new window.StForms(cv, { mobile: MQ.matches, lite: LITE });
          f.setTheme(root.getAttribute('data-theme'));
          f.init(function () {
            forms = f; forms.setTheme(root.getAttribute('data-theme'));
            onLite(function () { if (forms && forms.lite) forms.lite(); });
            if (curP != null) forms.setProgress(curP);
            if (visible) forms.start();
          }, fail);
        } catch (e) { fail(); }
      };
      if (window.ST_FORMS_DATA) go();
      else { var s = doc.createElement('script'); s.src = 'assets/js/forms-data.js?v=e8a6561975'; s.onload = go; s.onerror = fail; body.appendChild(s); }
    }
    ST.create({ trigger: sec, start: 'top 300%', onEnter: boot, onEnterBack: boot });
    // on a good connection the 3D models are prepared quietly a few seconds after load, long before anyone scrolls there
    window.addEventListener('load', function () { if (!slowNet()) setTimeout(function () { (window.requestIdleCallback || setTimeout)(boot, { timeout: 3000 }); }, 3500); });
    ST.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: function (s) { visible = s.isActive; if (forms) { s.isActive ? forms.start() : forms.stop(); } } });
    var curP = null, stepJob = 0, stepWant = 0;
    ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: function (s) {
      curP = clamp((s.progress - 0.05) / 0.9, 0, 1); if (forms) forms.setProgress(curP);
      stepWant = Math.min(3, Math.floor(s.progress * 3 + 0.5));
      if (!TOUCH) { setStep(stepWant); return; }
      if (stepJob) return;
      stepJob = requestAnimationFrame(function () { stepJob = 0; setStep(stepWant); });
    } });
    sec.addEventListener('pointermove', function (e) { if (forms) forms.pointer((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2); });
    window.addEventListener('resize', function () { if (forms) forms.resize(); });
  }

  /* =====================================================
     PROCESS
     ===================================================== */
  function process() {
    var sec = $('#process'); if (!sec) return;
    var ruler = $('#procRuler'), odo = $('#odo'), steps = $$('.ps', sec), DAYS = [0, 2, 14, 42, 90], NAMES = ['Strategy call', 'Plan', 'Build', 'Launch', 'Scale'], cols = [];
    for (var c = 0; c < 2; c++) { var col = doc.createElement('span'); col.className = 'odo-col'; for (var d = 0; d <= 9; d++) { var s = doc.createElement('span'); s.textContent = d; col.appendChild(s); } odo.appendChild(col); cols.push(col); }
    function setOdo(v) { var str = String(v).padStart(2, '0'); cols.forEach(function (col, i) { col.style.transform = 'translateY(' + (-parseInt(str[i], 10)) + 'em)'; }); }
    var ticks = [], MIN = 4;
    for (var i = 0; i < DAYS.length; i++) for (var m = 0; m <= (i < DAYS.length - 1 ? MIN : 0); m++) {
      var tk = doc.createElement('span'); tk.className = 'tk' + (m === 0 ? ' is-major' : ''); tk.textContent = m === 0 ? NAMES[i] : '';
      tk._pos = i + m / (MIN + 1); tk._step = m === 0 ? i : -1; ruler.appendChild(tk); ticks.push(tk);
    }
    var cur = -1, rulerH = 0;
    function render(p) {
      if (!rulerH) rulerH = ruler.clientHeight || 1;
      var H = rulerH, gap = H * (MQ.matches ? 0.2 : 0.22), center = H / 2, pos = p * (DAYS.length - 1), depth = MQ.matches ? 22 : 30;
      for (var k = 0; k < ticks.length; k++) {
        var tk = ticks[k], y = center + (tk._pos - pos) * gap, dd = (y - center) / (H * 0.09), dx = -depth * Math.exp(-dd * dd);
        var tr = 'translate(' + dx.toFixed(1) + 'px,' + (y - 10).toFixed(1) + 'px)', op = clamp(1.25 - Math.abs(y - center) / (H * 0.32), 0, 1).toFixed(2);
        if (tk._tr !== tr) { tk._tr = tr; tk.style.transform = tr; }
        if (tk._op !== op) { tk._op = op; tk.style.opacity = op; }
      }
      var a = clamp(Math.round(pos), 0, DAYS.length - 1);
      if (a !== cur) { cur = a; setOdo(DAYS[a]); steps.forEach(function (s, k) { s.classList.toggle('is-on', k === a); }); ticks.forEach(function (t) { t.classList.toggle('is-cur', t._step === a); }); }
    }
    render(0);
    var procJob = 0, procP = 0;
    ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: function (s) {
      if (!TOUCH) { render(s.progress); return; }
      procP = s.progress;
      if (procJob) return;
      procJob = requestAnimationFrame(function () { procJob = 0; render(procP); });
    }, onRefresh: function (s) { rulerH = 0; render(s.progress); } });
  }

  /* =====================================================
     FLUENCY
     ===================================================== */
  function fluency() {
    var cmp = $('#cmp'); if (!cmp) return;
    var EX = [
      { b: 'Heal faster and recover like an athlete with our BPC-157.', bw: 'Health claims on an RUO product page are the fastest way to lose a processor.', g: 'BPC-157, lyophilized, for research use only. Third-party tested, COA for this lot linked below.', gw: 'Verifiable, specific and written for the buyer who actually purchases RUO.' },
      { b: 'One-click express checkout. Pay and go.', bw: 'Express buttons skip the research-use confirmation processors require.', g: 'Confirm research use to continue. Required on every order.', gw: 'Gives underwriters the control they ask for without slowing down a real buyer.' },
      { b: 'Lose 20 lbs in 30 days with our miracle peptide stack.', bw: 'Health claims and before-and-after promises get stores flagged and shut down.', g: 'Research-grade peptides, third-party tested. COA published for every batch.', gw: 'Leads with proof, which is what a wary buyer looks for first.' }
    ];
    var handle = $('.cmp-handle', cmp), drag = false, pv = { v: 50 };
    function setP(v) { v = clamp(v, 6, 94); cmp.style.setProperty('--p', v + '%'); handle.setAttribute('aria-valuenow', Math.round(v)); }
    function fromX(x) { var r = cmp.getBoundingClientRect(); setP((x - r.left) / r.width * 100); }
    cmp.addEventListener('pointerdown', function (e) { drag = true; if (cmp.setPointerCapture) cmp.setPointerCapture(e.pointerId); fromX(e.clientX); gsap.killTweensOf(pv); });
    cmp.addEventListener('pointermove', function (e) { if (drag) fromX(e.clientX); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { cmp.addEventListener(ev, function () { drag = false; }); });
    handle.addEventListener('keydown', function (e) { var v = parseFloat(handle.getAttribute('aria-valuenow')); if (e.key === 'ArrowLeft') { setP(v - 5); e.preventDefault(); } if (e.key === 'ArrowRight') { setP(v + 5); e.preventDefault(); } });
    ST.create({ trigger: cmp, start: 'top 70%', once: true, onEnter: function () {
      if (RM) return;
      gsap.timeline().to(pv, { v: 80, duration: 0.9, ease: 'power2.inOut', onUpdate: function () { setP(pv.v); } })
        .to(pv, { v: 24, duration: 1.1, ease: 'power2.inOut', onUpdate: function () { setP(pv.v); } })
        .to(pv, { v: 50, duration: 0.8, ease: 'power2.inOut', onUpdate: function () { setP(pv.v); } });
    } });
    var tabs = $$('.flu-tabs button');
    tabs.forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.getAttribute('data-ex');
        tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
        cmp.classList.add('is-swap');
        setTimeout(function () {
          $('[data-bad]', cmp).textContent = EX[i].b; $('[data-badwhy]', cmp).textContent = EX[i].bw;
          $('[data-good]', cmp).textContent = EX[i].g; $('[data-goodwhy]', cmp).textContent = EX[i].gw;
          cmp.classList.remove('is-swap');
        }, 300);
      });
    });
  }

  /* =====================================================
     CLIENT VOICES (a liquid drop carries each review into the card)
     ===================================================== */
  function testimonials() {
    var grid = $('#tmGrid'); if (!grid) return;
    var goo = $('.tm-goo', grid), shape = $('.tm-shape', grid), ball = $('.tm-ball', grid), card = $('#tmCard'), rows = $$('.tm-row', grid), cur = 0, busy = false, paused = false;
    var F = { k: $('#tmK'), u: $('#tmU'), l: $('#tmL'), q: $('#tmQ'), a: $('#tmA'), r: $('#tmR') };
    var parts = [$('.tm-k', card), F.l, F.q, $('.tm-a', card)];
    function fitShape() { gsap.set(shape, { left: card.offsetLeft + 40, top: card.offsetTop + 40, width: card.offsetWidth, height: card.offsetHeight }); }
    function fill(b) {
      F.k.textContent = b.getAttribute('data-k'); F.u.textContent = b.getAttribute('data-u'); F.l.textContent = b.getAttribute('data-l');
      F.q.textContent = '“' + b.getAttribute('data-q') + '”'; F.a.textContent = b.getAttribute('data-a'); F.r.textContent = b.getAttribute('data-r');
    }
    function setRow(i) { rows.forEach(function (r, k) { r.classList.remove('is-on'); if (k === i) { void r.offsetWidth; r.classList.add('is-on'); } }); }
    function go(i) {
      if (busy || i === cur) return; busy = true;
      var row = rows[i], mob = MQ.matches;
      var sx = row.offsetLeft + $('.tm-side', grid).offsetLeft + 30 + 40, sy = row.offsetTop + $('.tm-side', grid).offsetTop + row.offsetHeight / 2 + 40;
      if (mob) { sx = card.offsetLeft + card.offsetWidth / 2 + 40; sy = $('.tm-side', grid).offsetTop + row.offsetTop + 40; }
      var ex = mob ? sx : card.offsetLeft + card.offsetWidth - 20 + 40, ey = mob ? card.offsetTop + card.offsetHeight - 20 + 40 : card.offsetTop + card.offsetHeight * 0.55 + 40;
      setRow(i); fitShape();
      if (RM) { fill(row); cur = i; busy = false; return; }
      // the liquid (SVG goo) filter is only switched on while the ball is moving: SVG filters are expensive, especially in Safari
      if (!LITE) goo.classList.add('is-goo');
      gsap.timeline({ onComplete: function () { cur = i; busy = false; goo.classList.remove('is-goo'); } })
        .set(ball, { x: sx, y: sy, scale: 0.3, opacity: 1 })
        .to(ball, { scale: 1, duration: 0.14, ease: 'back.out(2.2)' })
        .to(ball, { x: ex, duration: 0.36, ease: 'power2.inOut' }, 0.08)
        .to(ball, { y: ey, duration: 0.36, ease: 'sine.inOut' }, 0.08)
        .to(parts, { opacity: 0, y: -8, duration: 0.16, stagger: 0.02, ease: 'power2.in' }, 0.12)
        .add(function () { fill(row); fitShape(); }, 0.42)
        .to(ball, { scale: 2.6, opacity: 0, duration: 0.34, ease: 'power2.out' }, 0.43)
        .to(shape, { keyframes: [{ scaleX: 1.025, scaleY: 0.98, duration: 0.14 }, { scaleX: 0.996, scaleY: 1.006, duration: 0.16 }, { scaleX: 1, scaleY: 1, duration: 0.22 }], ease: 'sine.inOut' }, 0.42)
        .fromTo(parts, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.42, stagger: 0.04, ease: 'power3.out' }, 0.46);
    }
    var arrBusy = 0;
    function armReview(fn) { return function () { if (arrBusy) return; arrBusy = setTimeout(function () { arrBusy = 0; }, 700); fn(); }; }
    rows.forEach(function (r, i) {
      r.addEventListener('click', armReview(function () { go(i); }));
      $('.tm-bar', r).addEventListener('animationend', function () { if (!paused && r.classList.contains('is-on')) go((cur + 1) % rows.length); });
    });
    $$('.tm-arr', grid).forEach(function (b) { b.addEventListener('click', armReview(function () { go((cur + (+b.getAttribute('data-d')) + rows.length) % rows.length); })); });
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { setRow(cur); io.disconnect(); } }, { threshold: 0.3 });
    rows.forEach(function (r) { r.classList.remove('is-on'); });
    io.observe(grid);
    fitShape(); window.addEventListener('resize', fitShape);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fitShape);
  }

  /* =====================================================
     FAQ CHAT
     ===================================================== */
  function faq() {
    var bodyEl = $('#chatBody'); if (!bodyEl) return;
    // answers live in the page (visually hidden) so search engines and screen readers can read them
    var answers = $$('#faqQ .faq-a'), busy = false;
    function down() { bodyEl.scrollTo({ top: bodyEl.scrollHeight, behavior: RM ? 'auto' : 'smooth' }); }
    function ask(i, btn) {
      if (busy) return; busy = true;
      if (btn) btn.classList.add('is-asked');
      var q = doc.createElement('p'); q.className = 'msg msg--out'; q.textContent = (btn || $$('#faqQ button')[i]).textContent; bodyEl.appendChild(q);
      var ty = doc.createElement('p'); ty.className = 'msg msg--in'; ty.innerHTML = '<span class="typing" aria-label="Typing"><i></i><i></i><i></i></span>';
      setTimeout(function () { bodyEl.appendChild(ty); down(); }, 100); down();
      setTimeout(function () {
        ty.remove();
        var a = doc.createElement('p'), words = answers[i].textContent.split(' '); a.className = 'msg msg--in';
        a.innerHTML = words.map(function (w, k) { return '<span class="w" style="animation-delay:' + (k * 14) + 'ms">' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>'; }).join(' ');
        bodyEl.appendChild(a); down();
        setTimeout(function () { busy = false; down(); }, Math.min(800, words.length * 14));
      }, RM ? 0 : 480);
    }
    $$('#faqQ button').forEach(function (b) {
      b.addEventListener('click', function () {
        ask(+b.getAttribute('data-q'), b);
        if (MQ.matches) { var ch = $('.chat'), r = ch.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) scrollToEl(ch, -80); }
      });
    });
    ST.create({ trigger: '.chat', start: 'top 75%', once: true, onEnter: function () { setTimeout(function () { ask(0, $('#faqQ button')); }, 300); } });
  }

  /* =====================================================
     MODAL + BOOKING
     ===================================================== */
  function emit(name, detail) { try { doc.dispatchEvent(new CustomEvent('st:' + name, { detail: detail || {} })); } catch (e) {} }
  function modal() {
    var m = $('#modal'), form = $('#mForm'); if (!m) return;
    var steps = $$('.m-step', m), prog = $$('.m-prog i', m), back = $('[data-back]', m), next = $('.m-next', m), lbl = $('.btn-t', next), cur = 0, lastFocus = null, sent = false;
    var LAST = steps.length - 1, DETAILS = LAST - 1, E = form.elements;
    function setLbl(t) { if (lbl.getAttribute('aria-label') === t) return; lbl.textContent = t; splitBricks(lbl); }
    function show(i) {
      cur = i; emit('book-step', { step: i });
      steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
      prog.forEach(function (p, k) { p.classList.toggle('is-on', k <= i); });
      back.hidden = i === 0; setLbl(i === DETAILS ? 'Send and pick a time' : 'Continue');
      m.classList.toggle('is-cal', i === LAST);
      if (typeof closeDD === 'function') closeDD();
      if (i === LAST) loadCal();
      var card = $('.modal-card', m); if (card) card.scrollTop = 0;
    }
    function val(n) { var f = E[n]; if (!f) return ''; if (f.length && !f.tagName) { var out = []; Array.prototype.forEach.call(f, function (x) { if (x.checked) out.push(x.value); }); return out.join(', '); } return (f.value || '').trim(); }
    function data() {
      var d = {}; ['cat', 'stage', 'stuck', 'help', 'budget_min', 'budget_max', 'country', 'region', 'timeline', 'name', 'email', 'phone', 'site', 'notes'].forEach(function (k) { d[k] = val(k); });
      if (d.budget_min) d.budget_min = '$' + d.budget_min.replace(/^\$/, '');
      if (d.budget_max) d.budget_max = '$' + d.budget_max.replace(/^\$/, '');
      d.page = location.pathname; return d;
    }
    function brief(d) {
      return 'Building: ' + d.cat + ' | Stage: ' + d.stage + ' | Stuck: ' + d.stuck + ' | Needs: ' + d.help + ' | Budget: ' + d.budget_min + ' to ' + d.budget_max +
        ' | Location: ' + d.country + (d.region ? ', ' + d.region : '') + ' | Launch: ' + d.timeline + (d.phone ? ' | Phone: ' + d.phone : '') + (d.site ? ' | Site: ' + d.site : '') + (d.notes ? ' | Notes: ' + d.notes : '');
    }
    /* ---- the lead goes out the moment the details step is sent, before the calendar (nobody is lost if they never book) ---- */
    var lastSent = '';
    function sendLead(d) {
      // sent once per set of answers (going back from the calendar and changing details sends the update)
      var key = JSON.stringify(d); if (key === lastSent) return; lastSent = key; sent = true;
      if (!/^https?:$/.test(location.protocol)) return;
      // 1) Netlify Forms (stored under Site > Forms; works on any Netlify deploy, including drag and drop)
      try {
        var body = new URLSearchParams(); body.append('form-name', 'discovery'); body.append('bot-field', val('bot-field'));
        for (var k in d) body.append(k, d[k]);
        fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() }).catch(function () {});
      } catch (x) {}
      // 2) email straight to the team (FormSubmit). The first ever submission sends a one-time activation email to LEAD_EMAIL.
      if (LEAD_EMAIL) {
        var mail = { _subject: 'New discovery call lead: ' + d.name + ' (' + d.cat + ', ' + d.budget_min + ' to ' + d.budget_max + ')', _template: 'table', _captcha: 'false', _replyto: d.email, _honey: val('bot-field') };
        if (LEAD_CC) mail._cc = LEAD_CC;
        var labels = { cat: 'Building', stage: 'Brand stage', stuck: 'Stuck on', help: 'Needs help with', budget_min: 'Minimum budget', budget_max: 'Maximum budget', country: 'Country', region: 'State / region', timeline: 'Launch', name: 'Name', email: 'Email', phone: 'Phone / WhatsApp', site: 'Website', notes: 'Notes', page: 'Sent from page' };
        for (var j in d) mail[labels[j] || j] = d[j] || '-';
        fetch('https://formsubmit.co/ajax/' + LEAD_EMAIL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(mail) }).catch(function () {});
      }
      // 3) optional extra webhook (Zapier, Make, a CRM…)
      if (FORM_ENDPOINT) fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).catch(function () {});
    }
    /* ---- Cal.id inline calendar, prefilled with the brief ---- */
    var calReady = false, calTimer = 0;
    function calScript() {
      if (window.Cal && window.Cal.loaded) return;
      (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, CAL_ORIGIN + '/embed-link/embed.js', 'init');
      window.Cal('init', 'st', { origin: CAL_ORIGIN });
      window.Cal.ns.st('ui', { cssVarsPerTheme: { light: { 'cal-brand': '#0B5B3A' }, dark: { 'cal-brand': '#3DF58F' } }, hideEventTypeDetails: false, layout: 'month_view', theme: root.getAttribute('data-theme') });
      window.Cal.ns.st('on', { action: 'bookingSuccessful', callback: function () { emit('booked', {}); } });
      window.Cal.ns.st('on', { action: 'linkReady', callback: function () { calReady = true; clearTimeout(calTimer); var ph = $('.m-cal-ph', m); if (ph) ph.remove(); } });
    }
    function calUrl(d, embed) {
      var q = new URLSearchParams({ name: d.name, email: d.email, notes: brief(d), layout: 'month_view', theme: root.getAttribute('data-theme') }); if (embed) q.set('embed', 'true');
      return CAL_ORIGIN + '/' + CAL_LINK + '?' + q.toString();
    }
    function loadCal() {
      var box = $('#calBox'), d = data(), key = brief(d) + d.name + d.email;
      if (box.getAttribute('data-on') === key) return; box.setAttribute('data-on', key); calReady = false; clearTimeout(calTimer);
      if (box.getAttribute('data-was')) box.innerHTML = '<p class="m-cal-ph">Loading calendar…</p>'; box.setAttribute('data-was', '1');
      var a = $('#calLink'); if (a) a.href = calUrl(d, false);
      if (!/^https?:$/.test(location.protocol)) { iframeCal(box, d); return; }
      try {
        calScript();
        window.Cal.ns.st('inline', { elementOrSelector: '#calBox', calLink: CAL_LINK, config: { layout: 'month_view', name: d.name, email: d.email, notes: brief(d), theme: root.getAttribute('data-theme') } });
      } catch (x) { iframeCal(box, d); return; }
      // if the embed script is blocked or slow, fall back to the plain booking page in a frame
      calTimer = setTimeout(function () { if (!calReady && !box.querySelector('iframe')) iframeCal(box, d); }, 9000);
    }
    function iframeCal(box, d) {
      var f = doc.createElement('iframe'); f.title = 'Book your discovery call'; f.src = calUrl(d, true); f.setAttribute('allow', 'payment');
      box.innerHTML = ''; box.appendChild(f);
    }
    function open(src) {
      lastFocus = doc.activeElement; m.hidden = false; lock(true);
      var lb = src && src.querySelector ? src.querySelector('[aria-label]') : null;
      emit('book-open', { from: src ? ((lb && lb.getAttribute('aria-label')) || src.getAttribute('aria-label') || src.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) : 'link #book' });
      requestAnimationFrame(function () { m.classList.add('is-open'); });
      show(sent ? LAST : 0);
      setTimeout(function () { var f = $('.m-step.is-on input:not([type=hidden])', m); (f || $('.modal-x', m)).focus({ preventScroll: true }); }, 350);
    }
    function close() {
      emit('book-close', { step: cur });
      closeDD();
      m.classList.remove('is-open'); lock(false);
      setTimeout(function () { m.hidden = true; }, 450);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    // warm the calendar up the moment someone shows intent: open the connection and fetch the small embed script
    var warmed = false;
    function warm() {
      if (warmed || !/^https?:$/.test(location.protocol) || !navigator.onLine || slowNet()) return;
      warmed = true;
      var l = doc.createElement('link'); l.rel = 'preconnect'; l.href = CAL_ORIGIN; l.crossOrigin = ''; doc.head.appendChild(l);
      setTimeout(calScript, 600);
    }
    modal.open = function () { warm(); open(); };
    $$('[data-book]').forEach(function (b) {
      ['pointerenter', 'focus', 'touchstart'].forEach(function (ev) { b.addEventListener(ev, warm, { passive: true, once: true }); });
      b.addEventListener('click', function (e) { e.preventDefault(); warm(); open(b); });
    });
    $$('[data-close]', m).forEach(function (b) { b.addEventListener('click', close); });
    doc.addEventListener('keydown', function (e) {
      if (m.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        var f = $$('button, input, select, textarea, a[href], iframe', m).filter(function (x) { return x.offsetParent !== null && !x.closest('.m-hp'); });
        if (!f.length) return; var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === a) { z.focus(); e.preventDefault(); } else if (!e.shiftKey && doc.activeElement === z) { a.focus(); e.preventDefault(); }
      }
    });
    back.addEventListener('click', function () { if (cur > 0) show(cur - 1); });
    // the states / provinces list follows the country
    var REG = {
      'United States': 'Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,District of Columbia,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming',
      'Canada': 'Alberta,British Columbia,Manitoba,New Brunswick,Newfoundland and Labrador,Northwest Territories,Nova Scotia,Nunavut,Ontario,Prince Edward Island,Quebec,Saskatchewan,Yukon',
      'Australia': 'Australian Capital Territory,New South Wales,Northern Territory,Queensland,South Australia,Tasmania,Victoria,Western Australia',
      'United Kingdom': 'England,Scotland,Wales,Northern Ireland',
      'India': 'Andhra Pradesh,Arunachal Pradesh,Assam,Bihar,Chhattisgarh,Delhi,Goa,Gujarat,Haryana,Himachal Pradesh,Jammu and Kashmir,Jharkhand,Karnataka,Kerala,Ladakh,Madhya Pradesh,Maharashtra,Manipur,Meghalaya,Mizoram,Nagaland,Odisha,Puducherry,Punjab,Rajasthan,Sikkim,Tamil Nadu,Telangana,Tripura,Uttar Pradesh,Uttarakhand,West Bengal',
      'United Arab Emirates': 'Abu Dhabi,Ajman,Dubai,Fujairah,Ras Al Khaimah,Sharjah,Umm Al Quwain'
    };
    /* ---- themed dropdowns: native popups (select lists, datalists) look like the operating system, not like us ---- */
    var openDD = null;
    function closeDD() {
      if (!openDD) return;
      openDD.list.hidden = true;
      if (openDD.btn) openDD.btn.setAttribute('aria-expanded', 'false');
      if (openDD.inp) openDD.inp.setAttribute('aria-expanded', 'false');
      openDD.wrap.classList.remove('is-open');
      openDD = null;
      var card = $('.modal-card', m); if (card) card.classList.remove('is-dd');
    }
    // the menu hangs from the field itself, so it stays under that control
    function place(wrap, list) {
      if (list.parentNode !== wrap) wrap.appendChild(list);
      list.style.position = ''; list.style.left = ''; list.style.right = ''; list.style.top = ''; list.style.bottom = ''; list.style.width = '';
      var card = $('.modal-card', m); if (card) card.classList.add('is-dd');
      var r = wrap.getBoundingClientRect(), gap = 6, pad = 12, cap = 260;
      var below = window.innerHeight - r.bottom - gap - pad, above = r.top - gap - pad;
      var up = below < Math.min(cap, (list.scrollHeight || cap) + 8) && above > below;
      var room = up ? above : below;
      if (room < 140 && Math.max(above, below) > room) { up = above > below; room = up ? above : below; }
      wrap.classList.toggle('dd-up', up);
      list.classList.toggle('dd-up', up);
      list.style.maxHeight = Math.max(120, Math.min(cap, room)) + 'px';
    }
    function activate(list, i, scroll) {
      var it = $$('[role=option]', list); if (!it.length) return -1; i = (i + it.length) % it.length;
      it.forEach(function (o, k) { o.classList.toggle('is-act', k === i); });
      if (scroll === false) return i;
      var o = it[i];
      if (o.offsetTop < list.scrollTop) list.scrollTop = o.offsetTop;
      else if (o.offsetTop + o.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = o.offsetTop + o.offsetHeight - list.clientHeight;
      return i;
    }
    // while the booking window is open, Lenis swallows the wheel. scroll the menu ourselves, and never
    // move it just because the pointer is resting on a row (that was cancelling the mouse wheel and the scrollbar)
    function armList(list) {
      list.setAttribute('data-lenis-prevent', '');
      list.addEventListener('wheel', function (e) {
        if (!e.deltaY || list.scrollHeight <= list.clientHeight + 1) return;
        var dy = e.deltaY;
        if (e.deltaMode === 1) dy *= 16; else if (e.deltaMode === 2) dy *= list.clientHeight;
        var max = list.scrollHeight - list.clientHeight, next = list.scrollTop + dy;
        if (next < 0) next = 0; else if (next > max) next = max;
        if (next === list.scrollTop) return;
        list.scrollTop = next;
        e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
    }
    function watchBlur(inp, wrap) {
      inp.addEventListener('blur', function () {
        setTimeout(function () {
          if (!openDD || openDD.wrap !== wrap) return;
          var a = doc.activeElement;
          if (a && wrap.contains(a)) return;
          closeDD();
        }, 140);
      });
    }
    function hoverList(list, getAct, setAct) {
      list.addEventListener('mousemove', function (e) {
        var li = e.target.closest && e.target.closest('[role=option]');
        if (!li || !list.contains(li)) return;
        var i = $$('[role=option]', list).indexOf(li);
        if (i > -1 && i !== getAct()) setAct(activate(list, i, false));
      });
    }
    function moneyDigits(v) { return String(v == null ? '' : v).replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 8); }
    function moneyCommas(d) { return d.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    // budget: type the amount. the dollar sign sits outside the field so it cannot be deleted
    function moneyField(inp) {
      var wrap = doc.createElement('div'); wrap.className = 'dd dd--money';
      var box = doc.createElement('div'); box.className = 'dd-money';
      var cur = doc.createElement('span'); cur.className = 'dd-cur'; cur.textContent = '$'; cur.setAttribute('aria-hidden', 'true');
      inp.classList.add('dd-amt'); inp.spellcheck = false;
      var lab = inp.closest('label'), cap = lab && $('span', lab);
      if (cap) { cap.id = cap.id || 'amt-' + inp.name; inp.setAttribute('aria-labelledby', cap.id); }
      inp.parentNode.insertBefore(wrap, inp);
      box.appendChild(cur); box.appendChild(inp); wrap.appendChild(box);
      if (inp.value) inp.value = moneyCommas(moneyDigits(inp.value));
      inp.addEventListener('input', function () {
        var caretDigits = moneyDigits(inp.value.slice(0, inp.selectionStart == null ? inp.value.length : inp.selectionStart)).length;
        var shown = moneyCommas(moneyDigits(inp.value));
        inp.value = shown;
        var seen = 0, i = 0;
        while (i < shown.length && seen < caretDigits) { if (shown.charAt(i) >= '0' && shown.charAt(i) <= '9') seen++; i++; }
        try { inp.setSelectionRange(i, i); } catch (err) {}
      });
    }
    $$('[data-money]', form).forEach(moneyField);
    // select -> button + listbox (the real <select> stays in the form, hidden, so the data sent is unchanged)
    $$('select', form).forEach(function (sel, n) {
      var wrap = doc.createElement('div'); wrap.className = 'dd';
      var btn = doc.createElement('button'); btn.type = 'button'; btn.className = 'dd-btn'; btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
      var lab = sel.closest('label'), cap = lab && $('span', lab); if (cap) { cap.id = cap.id || 'ddl' + n; btn.setAttribute('aria-labelledby', cap.id + ' ddv' + n); }
      var val = doc.createElement('span'); val.className = 'dd-val'; val.id = 'ddv' + n; btn.appendChild(val); btn.insertAdjacentHTML('beforeend', '<i class="dd-chev" aria-hidden="true"></i>');
      var list = doc.createElement('ul'); list.className = 'dd-list'; list.setAttribute('role', 'listbox'); list.hidden = true; list.tabIndex = -1;
      Array.prototype.forEach.call(sel.options, function (o, k) { var li = doc.createElement('li'); li.setAttribute('role', 'option'); li.textContent = o.textContent; li.setAttribute('data-k', k); list.appendChild(li); });
      function sync() { val.textContent = sel.options[sel.selectedIndex].textContent; $$('[role=option]', list).forEach(function (li, k) { li.setAttribute('aria-selected', String(k === sel.selectedIndex)); }); }
      function pick(k) { sel.selectedIndex = k; sync(); sel.dispatchEvent(new Event('change', { bubbles: true })); closeDD(); btn.focus(); }
      var act = 0;
      function open() { closeDD(); list.hidden = false; wrap.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); openDD = { wrap: wrap, list: list, btn: btn }; place(wrap, list); act = activate(list, sel.selectedIndex); }
      btn.addEventListener('click', function () { if (openDD && openDD.wrap === wrap) closeDD(); else open(); });
      list.addEventListener('mousedown', function (e) { if (e.target.closest && e.target.closest('[role=option]')) e.preventDefault(); });
      list.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); var li = e.target.closest('[role=option]'); if (li) pick(+li.getAttribute('data-k')); });
      hoverList(list, function () { return act; }, function (i) { act = i; });
      btn.addEventListener('keydown', function (e) {
        var isOpen = !list.hidden;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!isOpen) open(); else act = activate(list, act + (e.key === 'ArrowDown' ? 1 : -1)); }
        else if ((e.key === 'Enter' || e.key === ' ') && isOpen) { e.preventDefault(); pick(act); }
        else if (e.key === 'Escape' && isOpen) { e.preventDefault(); e.stopPropagation(); closeDD(); }
        else if (e.key === 'Tab' && isOpen) closeDD();
      });
      sel.classList.add('dd-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
      sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(btn); wrap.appendChild(list); wrap.appendChild(sel); sync(); armList(list);
    });
    // text input + suggestion list (country, then state / region for the chosen country)
    function suggest(inp, source) {
      var wrap = doc.createElement('div'); wrap.className = 'dd dd--input';
      var pop = doc.createElement('button'); pop.type = 'button'; pop.className = 'dd-pop'; pop.setAttribute('aria-haspopup', 'listbox'); pop.setAttribute('aria-expanded', 'false'); pop.setAttribute('aria-label', inp.name === 'country' ? 'Show countries' : 'Show regions'); pop.innerHTML = '<i class="dd-chev" aria-hidden="true"></i>';
      inp.parentNode.insertBefore(wrap, inp); wrap.appendChild(inp); wrap.appendChild(pop);
      var list = doc.createElement('ul'); list.className = 'dd-list'; list.setAttribute('role', 'listbox'); list.hidden = true; list.id = 'sg' + inp.name; wrap.appendChild(list);
      inp.setAttribute('role', 'combobox'); inp.setAttribute('aria-autocomplete', 'list'); inp.setAttribute('aria-controls', list.id); inp.setAttribute('aria-expanded', 'false');
      var act = -1;
      function render(opts) {
        var showAll = opts && opts.all;
        var q = showAll ? '' : inp.value.trim().toLowerCase(), all = source() || [], a = [], b = [];
        all.forEach(function (x) { var l = x.toLowerCase(); if (!q || l.indexOf(q) === 0) a.push(x); else if (l.indexOf(q) > 0) b.push(x); });
        var res = a.concat(b);
        if (!res.length) { closeDD(); return; }
        var cur = inp.value.trim().toLowerCase();
        list.innerHTML = '';
        res.forEach(function (x) { var li = doc.createElement('li'); li.setAttribute('role', 'option'); li.textContent = x; if (x.toLowerCase() === cur) li.setAttribute('aria-selected', 'true'); list.appendChild(li); });
        if (openDD && openDD.wrap !== wrap) closeDD();
        list.hidden = false; wrap.classList.add('is-open'); inp.setAttribute('aria-expanded', 'true'); pop.setAttribute('aria-expanded', 'true');
        openDD = { wrap: wrap, list: list, btn: pop, inp: inp }; place(wrap, list);
        var items = $$('[role=option]', list), idx = -1;
        items.forEach(function (li, k) { if (li.getAttribute('aria-selected') === 'true') idx = k; });
        act = idx > -1 ? activate(list, idx) : -1;
        if (idx < 0) list.scrollTop = 0;
      }
      function pick(li) { inp.value = li.textContent; inp.classList.remove('is-bad'); var w = inp.closest('.dd'); if (w) w.classList.remove('is-bad'); closeDD(); inp.dispatchEvent(new Event('change', { bubbles: true })); }
      inp.addEventListener('input', function () { render(); });
      inp.addEventListener('focus', function () { render({ all: true }); });
      inp.addEventListener('click', function () { if (list.hidden) render({ all: true }); });
      pop.addEventListener('mousedown', function (e) { e.preventDefault(); });
      pop.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); if (!list.hidden && openDD && openDD.wrap === wrap) closeDD(); else render({ all: true }); });
      list.addEventListener('mousedown', function (e) { var li = e.target.closest && e.target.closest('[role=option]'); if (li) { e.preventDefault(); pick(li); } });
      list.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
      hoverList(list, function () { return act; }, function (i) { act = i; });
      inp.addEventListener('keydown', function (e) {
        if (list.hidden) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); render({ all: true }); act = activate(list, e.key === 'ArrowDown' ? 0 : -1); } return; }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); act = activate(list, act + (e.key === 'ArrowDown' ? 1 : -1)); }
        else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); var items = $$('[role=option]', list); if (act > -1 && items[act]) pick(items[act]); else if (items[0]) pick(items[0]); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeDD(); }
        else if (e.key === 'Tab') closeDD();
      });
      watchBlur(inp, wrap); armList(list);
    }
    var countries = $$('#stCountries option').map(function (o) { return o.value; });
    if (E.country) suggest(E.country, function () { return countries; });
    if (E.region) suggest(E.region, function () { var r = REG[(E.country.value || '').trim()]; return r ? r.split(',') : []; });
    doc.addEventListener('pointerdown', function (e) { if (openDD && !openDD.wrap.contains(e.target) && !openDD.list.contains(e.target)) closeDD(); });
    $('.modal-card', m).addEventListener('scroll', function () { if (openDD) closeDD(); }, { passive: true });
    window.addEventListener('resize', function () { if (openDD) place(openDD.wrap, openDD.list); });
    function bad(f, isBad) { f.classList.toggle('is-bad', isBad); var w = f.closest && f.closest('.dd'); if (w) w.classList.toggle('is-bad', isBad); return isBad; }
    function clearBad(f) {
      if (!f || !f.classList) return;
      f.classList.remove('is-bad');
      var w = f.closest && f.closest('.dd');
      if (w) { w.classList.remove('is-bad'); var s = $('.dd-native', w); if (s) s.classList.remove('is-bad'); var vis = $('input.is-bad', w); if (vis) vis.classList.remove('is-bad'); }
    }
    function money(v) { return parseInt(String(v).replace(/[^0-9]/g, ''), 10) || 0; }
    function budgetState() {
      var mn = money(E.budget_min.value), mx = money(E.budget_max.value);
      return { mn: mn, mx: mx, empty: !mn || !mx, order: mn > 0 && mx > 0 && mx < mn };
    }
    function check(i) {
      var st = steps[i], ok = true;
      if (st.querySelector('[name=help]')) {
        var any = $$('[name=help]', st).some(function (x) { return x.checked; });
        $('#helpNote').classList.toggle('is-bad', !any); if (!any) return false;
      }
      if (st.querySelector('[name=budget_min]')) {
        var b = budgetState(), err = $('#budgetErr');
        err.textContent = b.empty ? 'Enter a minimum and a maximum budget.' : 'The maximum budget needs to be at least the minimum.';
        err.hidden = !b.empty && !b.order;
        if (bad(E.budget_min, !b.mn)) ok = false;
        if (bad(E.budget_max, !b.mx || b.order)) ok = false;
        if (bad(E.country, !E.country.value.trim())) ok = false;
      }
      if (st.querySelector('[name=email]')) {
        if (bad(E.name, !E.name.value.trim())) ok = false;
        if (bad(E.email, !/^\S+@\S+\.\S+$/.test(E.email.value.trim()))) ok = false;
      }
      if (!ok) {
        var f = $('.is-bad', st);
        var vis = f && f.closest && f.closest('.dd') && $('input:not(.dd-native), .dd-btn', f.closest('.dd'));
        if (vis && vis.focus) vis.focus({ preventScroll: true }); else if (f && f.focus) f.focus();
      }
      return ok;
    }
    $$('[name=help]', form).forEach(function (x) { x.addEventListener('change', function () { $('#helpNote').classList.remove('is-bad'); }); });
    // errors clear as soon as the visitor fixes the field
    ['input', 'change'].forEach(function (ev) { form.addEventListener(ev, function (e) {
      var t = e.target;
      if (t && t.classList && t.classList.contains('is-bad')) clearBad(t);
      if (t && t.classList && (t.classList.contains('dd-amt') || t.name === 'country' || t.name === 'region')) clearBad(t);
      if (t && (/budget_/.test(t.name || '') || (t.classList && t.classList.contains('dd-amt')))) {
        var b = budgetState(), err = $('#budgetErr');
        err.textContent = b.empty ? 'Enter a minimum and a maximum budget.' : 'The maximum budget needs to be at least the minimum.';
        err.hidden = !b.empty && !b.order;
        if (b.mn) clearBad(E.budget_min);
        if (b.mx && !b.order) clearBad(E.budget_max);
      }
    }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (cur >= LAST) return;
      if (!check(cur)) return;
      if (cur < DETAILS) { show(cur + 1); return; }
      var d = data();
      emit('lead', { cat: d.cat, stage: d.stage, stuck: d.stuck, help: d.help, budget: d.budget_min + '-' + d.budget_max, country: d.country });
      sendLead(d);
      show(LAST);
    });
  }

  /* ---------- cookie ---------- */
  function cookie() {
    var c = $('#cookie'); if (!c) return;
    var v = null; try { v = localStorage.getItem('st-cookie'); } catch (e) {}
    if (v) return;
    c.hidden = false; requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.add('is-on'); }); });
    $$('[data-ck]', c).forEach(function (b) {
      b.addEventListener('click', function () {
        try { localStorage.setItem('st-cookie', b.getAttribute('data-ck') === '1' ? 'yes' : 'no'); } catch (e) {}
        c.classList.remove('is-on'); setTimeout(function () { c.hidden = true; }, 700);
      });
    });
  }

  var plDoneFn = null, plDone = new Promise(function (r) { plDoneFn = r; setTimeout(r, 4000); });
  /* ---------- page loader: the footer logo draws itself while the next page loads ---------- */
  function internalUrl(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return null; }
    if (u.protocol !== location.protocol || u.host !== location.host || u.pathname === location.pathname) return null;
    if (u.pathname.indexOf('.') > -1 && !/\.html$/.test(u.pathname)) return null;
    return u;
  }
  (function () {
    var pl = $('#pl'); if (!pl) return;
    var wrap = $('.pl-w', pl);
    function phone() { return matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)').matches; }
    // one distance, two layers, the same start time: the mark cannot drift the way two CSS transitions did
    function pin() { var w = doc.documentElement.clientWidth; if (w) root.style.setProperty('--plw', w + 'px'); }
    function wipe(mode) {
      if (!wrap || RM || !pl.animate) return;
      pin();
      var w = Math.ceil(pl.offsetWidth || doc.documentElement.clientWidth || innerWidth); if (w < 2) w = innerWidth;
      var dur = mode === 'out' ? 700 : 500, from = mode === 'out' ? 0 : -w, to = mode === 'out' ? w : 0;
      pl.classList.add('pl-js');
      pl.style.transform = 'translate3d(' + from + 'px,0,0)';
      wrap.style.transform = 'translate3d(' + (-from) + 'px,0,0)';
      var opt = { duration: dur, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' };
      pl.animate([{ transform: 'translate3d(' + from + 'px,0,0)' }, { transform: 'translate3d(' + to + 'px,0,0)' }], opt);
      wrap.animate([{ transform: 'translate3d(' + (-from) + 'px,0,0)' }, { transform: 'translate3d(' + (-to) + 'px,0,0)' }], opt);
    }
    function clearWipe() {
      [pl, wrap].forEach(function (el) {
        if (!el || !el.getAnimations) return;
        el.getAnimations().forEach(function (a) { if (typeof a.transitionProperty !== 'string') a.cancel(); });
      });
      pl.classList.remove('pl-js');
      pl.style.transform = '';
      if (wrap) wrap.style.transform = '';
    }
    // the logo stays up at least ~0.75 s in total (counted from the click on the previous page), then wipes away;
    // the page underneath has already painted, so nothing waits on images or scripts
    function out() {
      if (!root.classList.contains('pl-in')) return;
      var since = window.__plAt ? Date.now() - window.__plAt : 9999, wait = RM ? 0 : Math.max(0, 750 - since);
      setTimeout(function () {
        pl.classList.add('is-out'); root.classList.remove('pl-in');
        wipe('out');
        if (plDoneFn) setTimeout(plDoneFn, 200);
        setTimeout(function () { pl.classList.remove('is-out'); clearWipe(); }, 800);
      }, wait);
    }
    // requestIdleCallback often never fires on a phone while the new page is starting, which left the mark stuck
    setTimeout(out, phone() ? 40 : 80);
    function go(fn) {
      try { sessionStorage.setItem('st-pl', String(Date.now())); } catch (x) {}
      root.style.removeProperty('--pl-t');
      pl.classList.remove('is-out'); clearWipe(); pl.classList.add('is-on'); wipe('in');
      // phones: the mark is already filled, so leave once the wipe has landed (it used to freeze mid-draw)
      setTimeout(fn, RM ? 0 : (phone() ? 520 : 640));
    }
    doc.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !internalUrl(a)) return;
      e.preventDefault(); prefetch(a.href); go(function () { location.href = a.href; });
    });
    // back buttons on inner pages: go back with the loader when the visitor came from this site
    $$('[data-goback]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var same = false; try { same = doc.referrer && new URL(doc.referrer).host === location.host; } catch (x) {}
        if (same && history.length > 1) { e.preventDefault(); e.stopPropagation(); go(function () { history.back(); }); }
      });
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) { pl.classList.remove('is-on', 'is-out'); root.classList.remove('pl-in'); clearWipe(); try { sessionStorage.removeItem('st-pl'); } catch (x) {} } });
  })();

  /* ---------- instant page switches: the next page is fetched the moment someone shows intent ---------- */
  var fetched = {};
  function slowNet() { var cn = navigator.connection; return !!(cn && (cn.saveData || /2g/.test(cn.effectiveType || ''))); }
  function prefetch(href) {
    if (!/^https?:$/.test(location.protocol) || slowNet()) return;
    var u = href.split('#')[0]; if (fetched[u]) return; fetched[u] = 1;
    var l = doc.createElement('link'); l.rel = 'prefetch'; l.href = u; doc.head.appendChild(l);
  }
  (function () {
    if (!/^https?:$/.test(location.protocol) || slowNet()) return;
    // Chrome / Edge / Opera: speculation rules fetch a page as soon as the pointer rests on its link
    if (window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
      var s = doc.createElement('script'); s.type = 'speculationrules';
      s.textContent = JSON.stringify({ prefetch: [{ source: 'document', where: { and: [{ href_matches: '/*' }, { not: { selector_matches: '[target=_blank], [download], [href^="#"], [href*="#book"]' } }] }, eagerness: 'moderate' }] });
      doc.head.appendChild(s);
    }
    // everyone else: prefetch on hover, focus or the first touch
    ['pointerover', 'focusin', 'touchstart'].forEach(function (ev) {
      doc.addEventListener(ev, function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a && internalUrl(a)) prefetch(a.href); }, { passive: true });
    });
  })();

  /* ---------- asset protection (deterrent): no right-click "save image" or drag-out on pictures and 3D ---------- */
  (function () {
    var MEDIA = 'img, canvas, picture, .mol-stage, .ind-c, .pb-img, .ip-photo, .logo-it, .forms-stage';
    doc.addEventListener('contextmenu', function (e) { if (e.target.closest && e.target.closest(MEDIA)) e.preventDefault(); });
    doc.addEventListener('dragstart', function (e) { if (e.target.closest && e.target.closest(MEDIA)) e.preventDefault(); });
    $$('img').forEach(function (i) { i.setAttribute('draggable', 'false'); });
  })();

  /* ---------- nothing animates where nobody is looking ---------- */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    // CSS loops (service cards, marquee, footer logo, bubbles…) pause while their section is off screen
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); }); }, { rootMargin: '160px 0px' });
    $$('main > section, .foot').forEach(function (s) { io.observe(s); });
    // the animated molecule icons (SVG animation runs on the main thread): only the ones on screen move
    var sprite = $('body > svg[width="0"]'); try { if (sprite && sprite.pauseAnimations) sprite.pauseAnimations(); } catch (x) {}
    var mols = $$('svg.mol-i, svg.ck-i').filter(function (m) { return m.pauseAnimations; });
    var mio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { try { if (e.isIntersecting && !LITE) e.target.unpauseAnimations(); else e.target.pauseAnimations(); } catch (x) {} });
    });
    mols.forEach(function (m) { try { m.pauseAnimations(); } catch (x) {} mio.observe(m); });
    onLite(function () { mols.forEach(function (m) { try { m.pauseAnimations(); } catch (x) {} }); });
  })();

  /* ---------- every image is ready before you reach it: lazy images load one by one while the page is idle ---------- */
  function warmImages() {
    if (slowNet()) return;
    var list = $$('img[loading="lazy"]').filter(function (i) { return i.getAttribute('src') || i.getAttribute('srcset'); });
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 200); };
    (function next() {
      var img = list.shift(); if (!img) return;
      idle(function () {
        if (img.complete && img.naturalWidth) { next(); return; }
        img.loading = 'eager';
        var done = function () { img.removeEventListener('load', done); img.removeEventListener('error', done); next(); };
        img.addEventListener('load', done); img.addEventListener('error', done);
        if (img.complete) done();
      }, { timeout: 2500 });
    })();
  }

  /* ---------- tab attention ---------- */
  (function () {
    var title = doc.title, tmr = 0, msgs = ['Still fighting that ad ban?', 'Come back. We will keep it quiet.'], fav = $('#favicon'), base = fav ? fav.getAttribute('href') : '';
    var ds = $$('#logo path').map(function (p) { return p.getAttribute('d'); });
    var tile = function (mol, glow) { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -132 537 537"><rect x="-30" y="-132" width="537" height="537" rx="110" fill="#060807"/>' + (glow ? '<circle cx="330" cy="150" r="150" fill="#3DF58F" opacity=".22"/>' : '') + ds.map(function (d, i) { return '<path fill="' + (i === 3 ? mol : '#EEF3EF') + '" d="' + d + '"/>'; }).join('') + '</svg>'); };
    var alt = tile('#3DF58F', true), alt2 = tile('#86FFBC', false);
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) { var i = 0; doc.title = msgs[0]; if (fav) fav.setAttribute('href', alt); tmr = setInterval(function () { i++; doc.title = msgs[i % 2]; if (fav) fav.setAttribute('href', i % 2 ? alt2 : alt); }, 1600); }
      else { clearInterval(tmr); if (fav) fav.setAttribute('href', base); doc.title = 'Welcome back.'; setTimeout(function () { if (!doc.hidden) doc.title = title; }, 1800); }
    });
  })();

  /* =====================================================
     BOOT
     ===================================================== */
  if (!RM && $('.hl-i')) gsap.set('.hl-i', { yPercent: 108 });
  try { hex = Hex(); } catch (e) { hex = null; }
  problem(); industries(); services(); formsScene(); process(); fluency(); testimonials(); faq(); modal();
  watchScramble();
  // arriving through the page loader: the hero animates in as the loader slides away, not hidden behind it
  // (this also keeps the main thread free while the loader is moving)
  splash().then(function () { return root.classList.contains('pl-in') ? plDone : null; }).then(function () {
    heroIn(); ST.refresh();
    // links like index.html#book (from the inner pages) open the booking modal
    if (location.hash === '#book' && modal.open) setTimeout(modal.open, 700);
  });
  var fr = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();
  Promise.race([fr, new Promise(function (r) { setTimeout(r, 1500); })]).then(function () { ST.refresh(); });
  window.addEventListener('load', function () {
    ST.refresh();
    var cn = navigator.connection, slow3g = !!(cn && /3g/.test(cn.effectiveType || ''));
    setTimeout(warmImages, slow3g ? 6000 : 1200);
    // offline support (service workers only run on http/https, not file://); registered once the page has settled
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !slowNet()) setTimeout(function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }, 2500);
  });
})();
