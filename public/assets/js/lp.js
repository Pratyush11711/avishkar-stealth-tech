/* Stealth Tech: /peptide-store-build (landing page + thank-you page)
   No heavy libraries: Lenis for smooth scroll on desktop, everything else is native and only runs when needed.
   Splash, honeycomb, buttons, cursor and theme switch behave exactly like the main site. */
(function () {
  'use strict';

  /* ---------- settings ---------- */
  var LEAD_EMAIL = 'arpit@avishkarai.com';      // every lead is emailed here (FormSubmit) ...
  var LEAD_CC = 'arpitsharmawriting@gmail.com'; // ... with a copy here
  var FORM_ENDPOINT = '';                        // optional webhook (Zapier, Make, a CRM): POST JSON
  var HTTP = /^https?:$/.test(location.protocol);
  var THANK_YOU = HTTP ? '/peptide-store-build/thank-you' : 'thank-you/index.html';

  var doc = document, root = doc.documentElement, body = doc.body;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var MOB = matchMedia('(max-width: 900px)');
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var cssVar = function (n) { return getComputedStyle(root).getPropertyValue(n).trim(); };
  var gt = function () { try { if (window.gtag) window.gtag.apply(null, arguments); } catch (e) {} };
  var cssHref = ($('link[href*="css/lp.css"]') || {}).href || '/assets/css/lp.css';

  /* ---------- ad tracking: keep UTM / click ids for the lead ---------- */
  var utm = {};
  try { utm = JSON.parse(sessionStorage.getItem('st-utm') || '{}'); } catch (e) {}
  location.search.slice(1).split('&').forEach(function (p) {
    var kv = p.split('='), k = kv[0], v = '';
    try { v = decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')).slice(0, 120); } catch (e) {}
    if (/^utm_(source|medium|campaign|content|term)$/.test(k)) utm[k] = v;
    if (/^(gclid|fbclid|ttclid|msclkid)$/.test(k)) utm.click_id = k + ':' + v;
  });
  try { sessionStorage.setItem('st-utm', JSON.stringify(utm)); } catch (e) {}

  /* ---------- smooth scroll (desktop) ---------- */
  var lenis = null;
  if (window.Lenis && FINE && !RM && !MOB.matches) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.95 });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }
  function lock(v) { root.classList.toggle('is-locked', v); if (lenis) { v ? lenis.stop() : lenis.start(); } }
  function scrollToY(y, done) {
    if (lenis) lenis.scrollTo(y, { duration: 1.2, onComplete: done });
    else { window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' }); if (done) setTimeout(done, RM ? 0 : 700); }
  }
  function scrollToEl(el, off, done) { if (el) scrollToY(el.getBoundingClientRect().top + window.pageYOffset - (off || 0), done); }
  $$('a[href^="#"], [data-top]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.hasAttribute('data-top')) { e.preventDefault(); scrollToY(0); return; }
      var id = a.getAttribute('href'); if (!id || id.length < 2) return;
      if (a.hasAttribute('data-go-form') && $('#start')) { e.preventDefault(); goForm(); return; }
      var t = $(id); if (!t) return;
      e.preventDefault(); scrollToEl(t, 16);
    });
  });

  /* ---------- buttons: every letter is a tiny flipping cube ---------- */
  function splitBricks(el) {
    var t = el.textContent.replace(/\s+/g, ' ').trim(); el.textContent = '';
    var host = el.closest('a, button'); if (host) host.setAttribute('aria-label', t);
    t.split('').forEach(function (c, i) {
      var s = doc.createElement('span'); s.className = 'bk'; s.style.setProperty('--i', i); s.setAttribute('aria-hidden', 'true');
      var a = doc.createElement('span'), b = doc.createElement('span'), ch = c === ' ' ? ' ' : c;
      a.textContent = ch; b.setAttribute('data-c', ch); s.appendChild(a); s.appendChild(b); el.appendChild(s);
    });
  }
  function setLabel(btn, text) { var t = $('.btn-t', btn); if (t) { t.textContent = text; splitBricks(t); } }
  $$('.foot-cols a, .foot-b a, .ty-mail a').forEach(function (a) {
    if (a.querySelector('[data-brick]')) return;
    var label = a.textContent.replace(/\s+/g, ' ').trim(); if (!label) return;
    a.classList.add('lk'); a.innerHTML = ''; var sp = doc.createElement('span'); sp.setAttribute('data-brick', ''); sp.textContent = label; a.appendChild(sp);
  });
  $$('[data-brick], .btn-t').forEach(splitBricks);
  $$('.btn, .lk').forEach(function (h) {
    var off = 0;
    var on = function () { clearTimeout(off); h.classList.add('is-3d'); };
    var later = function () { clearTimeout(off); off = setTimeout(function () { if (!h.matches(':hover') && doc.activeElement !== h && !h.classList.contains('is-flow')) h.classList.remove('is-3d'); }, 900); };
    ['pointerenter', 'focus', 'touchstart'].forEach(function (ev) { h.addEventListener(ev, on, { passive: true }); });
    ['pointerleave', 'blur', 'touchend'].forEach(function (ev) { h.addEventListener(ev, later, { passive: true }); });
    h.addEventListener('pointerleave', function () { h.classList.remove('is-flow'); });
    h.addEventListener('pointerup', function (e) { if (e.pointerType === 'touch' && navigator.vibrate) try { navigator.vibrate(12); } catch (x) {} });
  });
  if (!RM) setInterval(function () {
    if (doc.hidden) return;
    $$('.btn[data-pulse]').forEach(function (b, n) {
      var r = b.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || b.matches(':hover')) return;
      setTimeout(function () { b.classList.add('is-3d', 'is-flow'); setTimeout(function () { b.classList.remove('is-flow'); setTimeout(function () { if (!b.matches(':hover')) b.classList.remove('is-3d'); }, 900); }, 1000); }, n * 220);
    });
  }, 6500);

  /* ---------- scrollbar: same thin bar as the main site (desktop only) ---------- */
  if (FINE && !RM) {
    var bar = $('#sbar'), th = $('#sthumb'), idleBar = 0, drag = false, dy = 0, PH = 0, TR = 0, TH = 40;
    if (bar && th) {
      root.classList.add('has-sbar');
      var measureBar = function () { PH = doc.documentElement.scrollHeight; TR = bar.clientHeight; TH = Math.max(40, TR * innerHeight / Math.max(1, PH)); th.style.height = TH + 'px'; };
      var updBar = function () {
        if (!PH) measureBar();
        var y = (window.pageYOffset / Math.max(1, PH - innerHeight)) * (TR - TH);
        th.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
        if (!bar._on) { bar._on = true; bar.classList.add('is-on'); }
        clearTimeout(idleBar); idleBar = setTimeout(function () { if (!drag) { bar._on = false; bar.classList.remove('is-on'); } }, 1000);
      };
      window.addEventListener('scroll', updBar, { passive: true });
      if (lenis) lenis.on('scroll', updBar);
      window.addEventListener('resize', function () { PH = 0; });
      if (window.ResizeObserver) new ResizeObserver(function () { PH = 0; }).observe(body);
      var toY = function (clientY) { var r = bar.getBoundingClientRect(), H = doc.documentElement.scrollHeight, h = th.offsetHeight; var p = clamp((clientY - r.top - dy) / (r.height - h), 0, 1); if (lenis) lenis.scrollTo(p * (H - innerHeight), { immediate: true }); else window.scrollTo(0, p * (H - innerHeight)); };
      th.addEventListener('pointerdown', function (e) { drag = true; bar.classList.add('is-drag'); dy = e.clientY - th.getBoundingClientRect().top; e.preventDefault(); });
      bar.addEventListener('pointerdown', function (e) { if (e.target === th) return; dy = th.offsetHeight / 2; toY(e.clientY); });
      window.addEventListener('pointermove', function (e) { if (drag) toY(e.clientY); }, { passive: true });
      window.addEventListener('pointerup', function () { drag = false; bar.classList.remove('is-drag'); });
      setTimeout(updBar, 400);
    }
  }

  /* ---------- custom cursor (OS cursor image: zero lag) ---------- */
  if (FINE && !RM) {
    var cl = doc.createElement('link'); cl.rel = 'stylesheet'; cl.href = cssHref.replace('lp.css', 'cursor.css');
    cl.onload = function () { root.classList.add('has-cur'); }; doc.head.appendChild(cl);
  }

  /* =====================================================
     BACKGROUND: same honeycomb as the main site (WebGL, desktop)
     Thin hexagon lines, very faint; near the cursor they brighten and ripple.
     The same lines light up in green where they meet the form card.
     Only the patch around the cursor is redrawn, and nothing runs while the mouse is still.
     ===================================================== */
  var hex = (function Hex() {
    var cv = $('#hexbg'); if (!cv || !FINE || MOB.matches || RM) return null;
    var gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true }); if (!gl) return null;
    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fs = [
      'precision mediump float;uniform vec2 uR;uniform vec2 uM;uniform float uI;uniform float uS;uniform vec3 uC;uniform vec3 uA;uniform float uB;uniform float uT;uniform float uK;uniform vec4 uF;uniform float uRad;',
      'void main(){',
      ' float S=34.;vec2 f=gl_FragCoord.xy;vec2 m=uM;',
      ' vec2 r=vec2(1.,1.7320508);vec2 hh=r*.5;vec2 p=f/S;',
      ' vec2 a=mod(p,r)-hh;vec2 b=mod(p-hh,r)-hh;vec2 gv=dot(a,a)<dot(b,b)?a:b;',
      ' vec2 q=abs(gv);float hd=max(dot(q,vec2(.5,.8660254)),q.x);',
      ' float edge=(.5-hd)*S;',
      ' float d=length(f-m);',
      ' float fo=uI*(1.-smoothstep(uS*.55,uS,d));',
      ' float wave=sin(d*.045-uT*4.)*exp(-d/260.)*fo;',
      ' float near=exp(-d*d/(190.*190.))*fo;',
      ' vec2 fc=f-uF.xy;vec2 hs=max(uF.zw-vec2(uRad),vec2(0.));vec2 qq=abs(fc)-hs;',
      ' float rd=length(max(qq,0.))+min(max(qq.x,qq.y),0.)-uRad;',
      ' float gd=max(rd,0.);float gnear=step(1.,uF.z)*exp(-gd*gd/(190.*190.));',
      ' float lw=.55+max(0.,wave)*.9+near*.5+gnear*.5;',
      ' float line=1.-smoothstep(lw-.45,lw+.65,edge);',
      ' float vg=smoothstep(0.,.85,1.-length((gl_FragCoord.xy/uR-vec2(.5,.62))*vec2(.9,1.25)));',
      ' float al=line*(uB*vg+near*.3+max(0.,wave)*.16+gnear*.3);',
      ' float A=clamp(al*uK,0.,1.);gl_FragColor=vec4(mix(uC,uA,clamp(near*1.4+gnear*1.4,0.,1.))*A*A*A,A*A);',
      '}'].join('\n');
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['uR', 'uM', 'uI', 'uS', 'uC', 'uA', 'uB', 'uT', 'uK', 'uF', 'uRad'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var W = 0, H = 0, mx = -999, my = -999, tmx = -999, tmy = -999, I = 0, tI = 0, raf = 0, colC = [1, 1, 1], colA = [0.24, 0.96, 0.56], base = 0.1, kmul = 1, t0 = performance.now(), idle = 0;
    function size() { W = innerWidth; H = innerHeight; cv.width = W; cv.height = H; gl.viewport(0, 0, W, H); }
    function theme() {
      var d = root.getAttribute('data-theme') === 'dark';
      colC = d ? [0.93, 0.95, 0.94] : [0.04, 0.1, 0.07]; colA = d ? [0.3, 0.9, 0.58] : [0.04, 0.42, 0.27]; base = d ? 0.21 : 0.12; kmul = d ? 1 : 0.42;
      draw(true);
    }
    var RAD = 400, box = null, form = [0, 0, 0, 0], formR = 30, formRSet = false;
    function formBox() {
      form[2] = 0;
      var el = $('.fcard'); if (!el || !H) return;
      var r = el.getBoundingClientRect();
      if (r.width < 8 || r.bottom < -80 || r.top > H + 80) return;
      form[0] = r.left + r.width * 0.5; form[1] = H - (r.top + r.height * 0.5); form[2] = r.width * 0.5; form[3] = r.height * 0.5;
      if (!formRSet) { var br = parseFloat(getComputedStyle(el).borderRadius); if (br) formR = br; formRSet = true; }
    }
    function draw(full) {
      mx = lerp(mx, tmx, 0.12); my = lerp(my, tmy, 0.12); I = lerp(I, tI, 0.05);
      formBox();
      var nb = [mx - RAD, H - my - RAD, mx + RAD, H - my + RAD], u = box ? [Math.min(nb[0], box[0]), Math.min(nb[1], box[1]), Math.max(nb[2], box[2]), Math.max(nb[3], box[3])] : nb;
      box = nb;
      if (full || mx < -900) gl.disable(gl.SCISSOR_TEST);
      else { gl.enable(gl.SCISSOR_TEST); var x0 = Math.max(0, Math.floor(u[0])), y0 = Math.max(0, Math.floor(u[1])); gl.scissor(x0, y0, Math.max(0, Math.min(W, Math.ceil(u[2])) - x0), Math.max(0, Math.min(H, Math.ceil(u[3])) - y0)); }
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.uR, W, H); gl.uniform2f(U.uM, mx, H - my); gl.uniform1f(U.uI, I); gl.uniform1f(U.uS, RAD);
      gl.uniform3fv(U.uC, colC); gl.uniform3fv(U.uA, colA); gl.uniform1f(U.uB, base); gl.uniform1f(U.uT, (performance.now() - t0) / 1000); gl.uniform1f(U.uK, kmul);
      gl.uniform4f(U.uF, form[0], form[1], form[2], form[3]); gl.uniform1f(U.uRad, formR);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function loop() { draw(false); if (I > 0.004 || tI > 0 || Math.abs(mx - tmx) > 0.5) raf = requestAnimationFrame(loop); else { raf = 0; I = 0; draw(true); } }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    addEventListener('pointermove', function (e) {
      if (mx < -900) { mx = e.clientX; my = e.clientY; }
      tmx = e.clientX; tmy = e.clientY;
      tI = 1; kick();
      clearTimeout(idle); idle = setTimeout(function () { tI = 0; }, 1400);
    }, { passive: true });
    doc.addEventListener('mouseleave', function () { tI = 0; });
    // the honeycomb is fixed to the screen; scrolling only redraws it so the form-edge glow stays put
    addEventListener('resize', function () { size(); draw(true); });
    addEventListener('scroll', function () { draw(true); }, { passive: true });
    if (lenis && lenis.on) lenis.on('scroll', function () { draw(true); });
    // the card slides in, so keep the glow stuck to its edge until that move finishes
    (function follow(wait) {
      if (!body.classList.contains('is-ready')) { if (wait < 600) requestAnimationFrame(function () { follow(wait + 1); }); return; }
      var n = 0; (function tick() { draw(true); if (++n < 80) requestAnimationFrame(tick); })();
    })(0);
    size(); theme(); root.classList.add('has-hex');
    return { theme: theme };
  })();

  /* ---------- theme switch (left-to-right sweep, same key as the main site) ---------- */
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('st-theme-v2', t); } catch (e) {}
    $$('[data-theme-toggle]').forEach(function (b) { b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); });
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#060807' : '#F2F3EE');
    if (hex) hex.theme();
  }
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  var themeBusy = false;
  $$('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (themeBusy) return; themeBusy = true; setTimeout(function () { themeBusy = false; }, 900);
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      gt('event', 'theme_switch', { theme: next });
      if (RM || !doc.startViewTransition) { applyTheme(next); return; }
      var vt = doc.startViewTransition(function () { applyTheme(next); });
      vt.ready.then(function () {
        root.animate({ clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { duration: 800, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' });
      }).catch(function () {});
    });
  });

  /* =====================================================
     SPLASH (same intro as the main site, on every load and reload)
     ===================================================== */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=';
  function scramble(el, dur) {
    var txt = el.getAttribute('data-txt') || el.textContent, len = txt.length, d = dur || 650, t0 = performance.now(), lastT = 0;
    el.style.width = el.offsetWidth + 'px';
    (function tick(now) {
      if (now - lastT < 32 && now - t0 < d) { requestAnimationFrame(tick); return; }
      lastT = now;
      var p = clamp((now - t0) / d, 0, 1), out = '';
      for (var i = 0; i < len; i++) { var ch = txt[i]; out += (ch === ' ' || p >= (i / len) * 0.75 + 0.2) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(tick); else { el.textContent = txt; el.style.width = ''; }
    })(t0);
  }
  function splash() {
    var sp = $('#splash');
    return new Promise(function (resolve) {
      if (!sp || RM || !root.classList.contains('sp-on')) { if (sp) sp.remove(); root.classList.remove('sp-on'); resolve(); return; }
      lock(true);
      var word = $('.sp-word', sp), cnt = $('#spCount'), clockEl = $('.sp-stage', sp), WORD = 1600, END = 2900;
      var anims = sp.getAnimations ? sp.getAnimations({ subtree: true }) : [];
      var clock = null; anims.forEach(function (a) { if (a.effect && a.effect.target === clockEl) clock = a; });
      var jsCount = !(window.CSS && CSS.registerProperty); if (jsCount) cnt.classList.add('sp-js');
      var rate = 1, t0 = performance.now(), wordOn = false, done = false, loaded = doc.readyState === 'complete', fontsOk = !doc.fonts;
      if (!loaded) addEventListener('load', function () { loaded = true; });
      if (doc.fonts) doc.fonts.ready.then(function () { fontsOk = true; });
      function now() { return clock && clock.currentTime != null ? clock.currentTime : (performance.now() - t0) * rate; }
      (function poll() {
        if (done) return;
        var t = now();
        if (jsCount) { var p = clamp(t / 2300, 0, 1), e = 0.5 - Math.cos(Math.PI * p) / 2; cnt.firstChild.textContent = String(Math.round(e * 100)).padStart(3, '0'); }
        if (!wordOn && t >= WORD) { wordOn = true; word.style.opacity = 1; scramble(word, 650 / rate); }
        if ((t >= END || (clock && clock.playState === 'finished')) && ((loaded && fontsOk) || performance.now() - t0 > 6500)) {
          done = true; word.style.opacity = 1; ready();
          sp.style.transition = 'opacity .45s ease'; sp.style.opacity = '0';
          setTimeout(function () { sp.remove(); root.classList.remove('sp-on'); lock(false); resolve(); }, 460);
          return;
        }
        requestAnimationFrame(poll);
      })();
      // a click or tap fast-forwards the intro
      sp.addEventListener('click', function () { rate = 3.5; anims.forEach(function (a) { try { a.playbackRate = 3.5; } catch (e) {} }); });
    });
  }
  var isReady = false;
  function ready() {
    if (isReady) return; isReady = true;
    body.classList.add('is-ready');
    revealOn();
  }

  /* ---------- reveals ---------- */
  function revealOn() {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
  }

  /* ---------- dock (landing page): rises once the hero has scrolled away ---------- */
  var dock = $('#dock'), topBar = $('#top');
  if (dock && topBar && !body.classList.contains('ty-page')) new IntersectionObserver(function (es) { dock.classList.toggle('is-on', !es[0].isIntersecting); }).observe(topBar);
  var hl = $('.dock-hl'), links = $$('.dock-links a'), cur = null;
  function moveHl(a) { if (!hl) return; if (!a) { hl.style.opacity = 0; return; } hl.style.opacity = 1; hl.style.width = a.offsetWidth + 'px'; hl.style.transform = 'translateX(' + a.offsetLeft + 'px)'; }
  links.forEach(function (a) { a.addEventListener('mouseenter', function () { moveHl(a); }); });
  var dl = $('#dockLinks'); if (dl) dl.addEventListener('mouseleave', function () { moveHl(cur); });
  if (links.length) {
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var a = $('.dock-links a[data-sec="' + e.target.id + '"]');
        if (e.isIntersecting) { links.forEach(function (l) { l.classList.toggle('is-cur', l === a); }); cur = a; moveHl(a); }
        else if (a === cur) { a.classList.remove('is-cur'); cur = null; moveHl(null); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = $('#' + a.getAttribute('data-sec')); if (s) secIO.observe(s); });
  }

  /* ---------- what we build: on desktop the section is pinned and each part opens as you scroll ---------- */
  var items = $$('.fr-item'), feat = $('#included'), fi = -1;
  function featOn(i) {
    if (i === fi) return; fi = i;
    items.forEach(function (it, k) { it.classList.toggle('is-on', k === i); $('.fr', it).setAttribute('aria-expanded', k === i ? 'true' : 'false'); });
  }
  var PIN = matchMedia('(min-width: 901px) and (min-height: 560px)');
  function featScroll() {
    if (!PIN.matches || !feat) return;
    var r = feat.getBoundingClientRect(), total = r.height - innerHeight;
    if (total <= 0) return;
    var p = clamp(-r.top / total, 0, 0.999);
    featOn(Math.floor(p * items.length));
  }
  if (items.length) {
    featOn(0);
    var ticking = false;
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; featScroll(); }); } }, { passive: true });
    // a click jumps to that part (scrolls the pinned section to it)
    items.forEach(function (it, k) {
      $('.fr', it).addEventListener('click', function () {
        if (PIN.matches) { var top = feat.getBoundingClientRect().top + pageYOffset, total = feat.offsetHeight - innerHeight; scrollToY(top + total * (k + 0.5) / items.length); }
        else featOn(k);
      });
    });
    // phones: every part is open; the checkout drawing plays once it comes into view
    var vio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-seen'); vio.unobserve(e.target); } }); }, { threshold: 0.4 });
    $$('.fr-vis').forEach(function (v) { vio.observe(v); });
    featScroll();
  }

  /* ---------- how it works: the line fills as you scroll ---------- */
  var tl = $('#tl'), tlFill = $('#tlFill'), tlSteps = $$('.tl-st'), tlOn = false;
  function tlUpdate() {
    // fills while the steps travel from the bottom of the screen to its upper third
    var r = tl.getBoundingClientRect(), vert = MOB.matches && innerWidth < 641;
    var p = vert ? clamp((innerHeight * 0.65 - r.top) / r.height, 0, 1) : clamp((innerHeight * 0.92 - r.top) / (innerHeight * 0.55), 0, 1);
    tl.style.setProperty('--tl', p.toFixed(3));
    tlSteps.forEach(function (st, i) { st.classList.toggle('is-hit', vert ? st.getBoundingClientRect().top + 22 < innerHeight * 0.65 : p * (tlSteps.length - 1) + 0.02 >= i); });
  }
  if (tl && tlFill) {
    new IntersectionObserver(function (es) { tlOn = es[0].isIntersecting; if (tlOn) tlUpdate(); }).observe(tl);
    var tlTick = false;
    addEventListener('scroll', function () { if (tlOn && !tlTick) { tlTick = true; requestAnimationFrame(function () { tlTick = false; tlUpdate(); }); } }, { passive: true });
    if (RM) { tl.style.setProperty('--tl', 1); tlSteps.forEach(function (st) { st.classList.add('is-hit'); }); }
  }

  /* ---------- client voices: one fixed box, slides cross-fade inside it ---------- */
  var slides = $$('.tm-slide'), dots = $$('.tm-dots button'), qi = 0, qT = 0, tmBox = $('#tm');
  var qBusy = 0;
  function quote(i, user) {
    if (user) { if (qBusy) return; qBusy = setTimeout(function () { qBusy = 0; }, 700); }
    qi = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('is-on', k === qi); s.setAttribute('aria-hidden', k === qi ? 'false' : 'true'); });
    dots.forEach(function (d, k) { d.classList.toggle('is-on', k === qi); d.setAttribute('aria-selected', k === qi ? 'true' : 'false'); });
  }
  function qPlay() { clearInterval(qT); if (!RM) qT = setInterval(function () { if (!doc.hidden) quote(qi + 1); }, 3000); }
  if (slides.length) {
    quote(0);
    $$('.tm-arr').forEach(function (b) { b.addEventListener('click', function () { quote(qi + +b.getAttribute('data-d'), true); qPlay(); }); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { quote(k, true); qPlay(); }); });
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) qPlay(); else clearInterval(qT); }).observe(tmBox);
  }

  /* ---------- FAQ: smooth open and close, one at a time ---------- */
  $$('.qa').forEach(function (q) {
    $('.qa-q', q).addEventListener('click', function () {
      var open = !q.classList.contains('is-open');
      $$('.qa').forEach(function (o) { o.classList.remove('is-open'); $('.qa-q', o).setAttribute('aria-expanded', 'false'); });
      if (open) { q.classList.add('is-open'); $('.qa-q', q).setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- thank-you page ---------- */
  var L = window.__stLead, tyHi = $('#tyHi');
  if (tyHi && L && L.name) tyHi.textContent = 'Great move, ' + String(L.name).replace(/[<>]/g, '').slice(0, 40) + '.';
  $$('[data-book]').forEach(function (b) { b.addEventListener('click', function () { gt('event', 'book_call_click', { form: 'peptide-store-build' }); }); });

  /* ---------- start: splash first, then the page ---------- */
  /* page loader: same wipe as the rest of the site, so this page does not play a second intro */
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
    function out() {
      if (!root.classList.contains('pl-in')) return;
      var since = window.__plAt ? Date.now() - window.__plAt : 9999, wait = RM ? 0 : Math.max(0, 750 - since);
      setTimeout(function () {
        pl.classList.add('is-out'); root.classList.remove('pl-in');
        wipe('out');
        setTimeout(function () { pl.classList.remove('is-out'); clearWipe(); }, 800);
      }, wait);
    }
    // requestIdleCallback often never fires on a phone while the new page is starting, which left the mark stuck
    setTimeout(out, phone() ? 40 : 80);
    function internalUrl(a) {
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return null; }
      if (u.protocol !== location.protocol || u.host !== location.host || u.pathname === location.pathname) return null;
      if (u.pathname.indexOf('.') > -1 && !/\.html$/.test(u.pathname)) return null;
      return u;
    }
    function go(fn) {
      try { sessionStorage.setItem('st-pl', String(Date.now())); } catch (x) {}
      root.style.removeProperty('--pl-t');
      pl.classList.remove('is-out'); clearWipe(); pl.classList.add('is-on'); wipe('in');
      // phones: the mark is already filled, so leave once the wipe has landed (it used to freeze mid-draw)
      setTimeout(fn, RM ? 0 : (phone() ? 520 : 640));
    }
    window.addEventListener('pageshow', function (e) { if (e.persisted) { pl.classList.remove('is-on', 'is-out'); root.classList.remove('pl-in'); clearWipe(); try { sessionStorage.removeItem('st-pl'); } catch (x) {} } });
    doc.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !internalUrl(a)) return;
      e.preventDefault(); go(function () { location.href = a.href; });
    });
  })();

  splash().then(ready);

  /* =====================================================
     THE FORM: 5 short steps → Netlify Forms + email → thank-you page
     ===================================================== */
  var form = $('#leadForm');
  function goForm() {
    var st = $('#start'); if (!st) { location.href = HTTP ? '/peptide-store-build#start' : '../index.html#start'; return; }
    scrollToEl(st, MOB.matches ? 14 : 80, function () {
      var cur = $('.lf-step.is-on'), f = cur && $('input:not([type=radio]), textarea', cur);
      if (f && FINE) try { f.focus({ preventScroll: true }); } catch (e) {}
    });
  }
  // thank-you page: Back returns to the page they came from
  $$('[data-back]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      var same = false; try { same = !!doc.referrer && new URL(doc.referrer).host === location.host; } catch (x) {}
      if (same && history.length > 1) { e.preventDefault(); history.back(); }
    });
  });
  if (!form) return;
  var steps = $$('.lf-step', form), N = steps.length, idx = 0, started = false, busy = false;
  var nextB = $('#lfNext'), backB = $('#lfBack'), skipB = $('#lfSkip'), err = $('#lfErr'), segs = $$('.fc-prog li'), now = $('#stepNow');
  Object.keys(utm).forEach(function (k) { var f = form.elements[k]; if (f) f.value = utm[k]; });


  /* ---------- phone: country code picked automatically from the visitor's time zone / language, flag shown ---------- */
  var CC = 'US|United States|1,CA|Canada|1,GB|United Kingdom|44,AU|Australia|61,NZ|New Zealand|64,IE|Ireland|353,DE|Germany|49,NL|Netherlands|31,FR|France|33,ES|Spain|34,IT|Italy|39,CH|Switzerland|41,AT|Austria|43,BE|Belgium|32,SE|Sweden|46,NO|Norway|47,DK|Denmark|45,FI|Finland|358,PL|Poland|48,PT|Portugal|351,CZ|Czechia|420,GR|Greece|30,HU|Hungary|36,RO|Romania|40,BG|Bulgaria|359,HR|Croatia|385,SK|Slovakia|421,SI|Slovenia|386,EE|Estonia|372,LV|Latvia|371,LT|Lithuania|370,LU|Luxembourg|352,MT|Malta|356,CY|Cyprus|357,IS|Iceland|354,UA|Ukraine|380,RS|Serbia|381,TR|Turkey|90,IL|Israel|972,AE|United Arab Emirates|971,SA|Saudi Arabia|966,QA|Qatar|974,KW|Kuwait|965,BH|Bahrain|973,OM|Oman|968,JO|Jordan|962,LB|Lebanon|961,EG|Egypt|20,MA|Morocco|212,ZA|South Africa|27,NG|Nigeria|234,KE|Kenya|254,GH|Ghana|233,IN|India|91,PK|Pakistan|92,BD|Bangladesh|880,LK|Sri Lanka|94,NP|Nepal|977,SG|Singapore|65,MY|Malaysia|60,TH|Thailand|66,ID|Indonesia|62,PH|Philippines|63,VN|Vietnam|84,HK|Hong Kong|852,TW|Taiwan|886,CN|China|86,JP|Japan|81,KR|South Korea|82,MX|Mexico|52,BR|Brazil|55,AR|Argentina|54,CO|Colombia|57,CL|Chile|56,PE|Peru|51,UY|Uruguay|598,CR|Costa Rica|506,PA|Panama|507,DO|Dominican Republic|1,PR|Puerto Rico|1,JM|Jamaica|1,BS|Bahamas|1,TT|Trinidad and Tobago|1,RU|Russia|7,KZ|Kazakhstan|7,GE|Georgia|995,AM|Armenia|374'.split(',').map(function (x) { var a = x.split('|'); return { iso: a[0], name: a[1], dial: a[2] }; });
  var TZ = {"America/New_York":"US","America/Chicago":"US","America/Denver":"US","America/Los_Angeles":"US","America/Phoenix":"US","America/Anchorage":"US","America/Detroit":"US","America/Boise":"US","Pacific/Honolulu":"US","America/Indiana":"US","America/Kentucky":"US","America/Toronto":"CA","America/Vancouver":"CA","America/Edmonton":"CA","America/Winnipeg":"CA","America/Halifax":"CA","America/Regina":"CA","America/St_Johns":"CA","America/Montreal":"CA","Europe/London":"GB","Europe/Dublin":"IE","Europe/Berlin":"DE","Europe/Amsterdam":"NL","Europe/Paris":"FR","Europe/Madrid":"ES","Europe/Rome":"IT","Europe/Zurich":"CH","Europe/Vienna":"AT","Europe/Brussels":"BE","Europe/Stockholm":"SE","Europe/Oslo":"NO","Europe/Copenhagen":"DK","Europe/Helsinki":"FI","Europe/Warsaw":"PL","Europe/Lisbon":"PT","Europe/Prague":"CZ","Europe/Athens":"GR","Europe/Budapest":"HU","Europe/Bucharest":"RO","Europe/Sofia":"BG","Europe/Zagreb":"HR","Europe/Bratislava":"SK","Europe/Ljubljana":"SI","Europe/Tallinn":"EE","Europe/Riga":"LV","Europe/Vilnius":"LT","Europe/Luxembourg":"LU","Europe/Malta":"MT","Asia/Nicosia":"CY","Atlantic/Reykjavik":"IS","Europe/Kiev":"UA","Europe/Kyiv":"UA","Europe/Belgrade":"RS","Europe/Istanbul":"TR","Asia/Jerusalem":"IL","Asia/Tel_Aviv":"IL","Asia/Dubai":"AE","Asia/Riyadh":"SA","Asia/Qatar":"QA","Asia/Kuwait":"KW","Asia/Bahrain":"BH","Asia/Muscat":"OM","Asia/Amman":"JO","Asia/Beirut":"LB","Africa/Cairo":"EG","Africa/Casablanca":"MA","Africa/Johannesburg":"ZA","Africa/Lagos":"NG","Africa/Nairobi":"KE","Africa/Accra":"GH","Asia/Kolkata":"IN","Asia/Calcutta":"IN","Asia/Karachi":"PK","Asia/Dhaka":"BD","Asia/Colombo":"LK","Asia/Kathmandu":"NP","Asia/Singapore":"SG","Asia/Kuala_Lumpur":"MY","Asia/Bangkok":"TH","Asia/Jakarta":"ID","Asia/Manila":"PH","Asia/Ho_Chi_Minh":"VN","Asia/Saigon":"VN","Asia/Hong_Kong":"HK","Asia/Taipei":"TW","Asia/Shanghai":"CN","Asia/Tokyo":"JP","Asia/Seoul":"KR","Pacific/Auckland":"NZ","America/Mexico_City":"MX","America/Tijuana":"MX","America/Sao_Paulo":"BR","America/Argentina":"AR","America/Bogota":"CO","America/Santiago":"CL","America/Lima":"PE","America/Montevideo":"UY","America/Costa_Rica":"CR","America/Panama":"PA","America/Santo_Domingo":"DO","America/Puerto_Rico":"PR","America/Jamaica":"JM","America/Nassau":"BS","America/Port_of_Spain":"TT","Europe/Moscow":"RU","Asia/Almaty":"KZ","Asia/Tbilisi":"GE","Asia/Yerevan":"AM","Australia":"AU"};
  var sel = $('#telCountry'), flag = $('#telFlag'), isoEl = $('#telIso'), dial = $('#telDial'), num = $('#telNum');
  function guessCountry() {
    var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    var hit = TZ[tz] || TZ[tz.split('/').slice(0, 2).join('/')] || TZ[tz.split('/')[0]];
    if (hit) return hit;
    var langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) { var m = /-([A-Z]{2})$/i.exec(langs[i] || ''); if (m && CC.some(function (c) { return c.iso === m[1].toUpperCase(); })) return m[1].toUpperCase(); }
    return 'US';
  }
  function setCountry(iso) {
    var c = CC.filter(function (x) { return x.iso === iso; })[0] || CC[0];
    sel.value = c.iso; dial.textContent = '+' + c.dial;
    flag.alt = c.name; flag.src = 'https://flagcdn.com/w40/' + c.iso.toLowerCase() + '.png';
    isoEl.textContent = c.iso; isoEl.hidden = false; flag.hidden = true;
  }
  if (sel) {
    var frag = doc.createDocumentFragment();
    CC.forEach(function (c) { var o = doc.createElement('option'); o.value = c.iso; o.textContent = c.name + ' (+' + c.dial + ')'; frag.appendChild(o); });
    sel.appendChild(frag);
    // the code shows straight away; the flag picture replaces it once it has loaded
    flag.onload = function () { flag.hidden = false; isoEl.hidden = true; };
    flag.onerror = function () { flag.hidden = true; isoEl.hidden = false; };
    setCountry(guessCountry());
    sel.addEventListener('change', function () { setCountry(sel.value); try { num.focus(); } catch (e) {} });
  }
  function fullPhone() {
    var c = CC.filter(function (x) { return x.iso === sel.value; })[0] || CC[0], n = num.value.trim();
    // if they typed the full international number anyway, keep it as typed
    return /^\+/.test(n) ? n : '+' + c.dial + ' ' + n.replace(/^0+/, '');
  }

  /* ---------- smart fields: numbers only where numbers belong, sensible limits, gentle fixes ---------- */
  var LEN = { US: [10, 10], CA: [10, 10], IN: [10, 10], GB: [10, 10], AU: [9, 9], NZ: [8, 10], AE: [9, 9], SG: [8, 8], DE: [10, 11], FR: [9, 9], NL: [9, 9], ES: [9, 9], IT: [9, 10], IE: [9, 9], SA: [9, 9] };
  function lenFor(c) { return LEN[c] || [6, 13]; }
  function fmtNum(c, d) {
    if ((c === 'US' || c === 'CA') && d.length > 3) return d.length > 6 ? d.slice(0, 3) + ' ' + d.slice(3, 6) + ' ' + d.slice(6) : d.slice(0, 3) + ' ' + d.slice(3);
    return d.replace(/(\d{3,4})(?=\d{3,})/g, '$1 ').trim();
  }
  if (num) {
    num.addEventListener('input', function () {
      var raw = num.value, plus = /^\s*\+/.test(raw);
      if (plus) { num.value = '+' + raw.replace(/[^\d ]/g, '').replace(/^ +/, '').slice(0, 18); return; }
      var d = raw.replace(/\D/g, '');
      if (d.length > 1 && d[0] === '0') d = d.replace(/^0+/, ''); // a leading 0 is a local trunk code, not part of the number
      d = d.slice(0, lenFor(sel.value)[1]);
      num.value = fmtNum(sel.value, d);
    });
    sel.addEventListener('change', function () { num.dispatchEvent(new Event('input')); });
  }
  var nameF = form.elements.name, emailF = form.elements.email;
  nameF.setAttribute('maxlength', '60');
  nameF.addEventListener('input', function () { var v = nameF.value.replace(/[0-9_@#$%^*=+<>{}\[\]|\\\/~`!?;:]/g, ''); if (v !== nameF.value) nameF.value = v; });
  emailF.setAttribute('maxlength', '120');
  emailF.addEventListener('input', function () { var v = emailF.value.replace(/\s/g, ''); if (v !== emailF.value) emailF.value = v; });
  var TYPO = { 'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gamil.com': 'gmail.com', 'hotmal.com': 'hotmail.com', 'hotmial.com': 'hotmail.com', 'yaho.com': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'outlok.com': 'outlook.com', 'iclod.com': 'icloud.com' };
  function emailFix(v) { var m = /@(.+)$/.exec(v); return m && TYPO[m[1].toLowerCase()] ? v.replace(/@.+$/, '@' + TYPO[m[1].toLowerCase()]) : ''; }

  function showErr(msg, field) {
    err.textContent = msg; err.hidden = !msg;
    if (field) { field.classList.remove('is-bad'); void field.offsetWidth; field.classList.add('is-bad'); try { field.focus(); } catch (e) {} }
  }
  function valid(i) {
    var f;
    if (i === 0 && !form.querySelector('input[name=type]:checked')) { showErr('Pick the option closest to your project.'); return false; }
    if (i === 1) { f = form.elements.project; if (f.value.trim().length < 3) { showErr('Add a line about your project, or press Skip.', f); return false; } }
    if (i === 2) { f = nameF; f.value = f.value.replace(/\s+/g, ' ').trim(); if (f.value.length < 2 || !/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F]/.test(f.value)) { showErr('Please add your name.', f); return false; } }
    if (i === 3) { f = emailF; f.value = f.value.trim().toLowerCase(); if (!/^[a-z0-9._%+'-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(f.value)) { showErr('Please check your email address.', f); return false; } var fx = emailFix(f.value); if (fx && f.dataset.fixed !== f.value) { f.dataset.fixed = fx; f.value = fx; showErr('We corrected a small typo: ' + fx + '. Press Continue if that is right.'); return false; } }
    if (i === 4) { f = num; var dg = f.value.replace(/\D/g, ''), L = lenFor(sel.value); if (/^\+/.test(f.value) ? (dg.length < 8 || dg.length > 15) : (dg.length < L[0] || dg.length > L[1])) { showErr(L[0] === L[1] && !/^\+/.test(f.value) ? 'Numbers in ' + sel.options[sel.selectedIndex].text.replace(/ \(.*$/, '') + ' have ' + L[0] + ' digits. Please check yours.' : 'Please check your phone or WhatsApp number.', f); return false; } }
    showErr(''); return true;
  }
  function show(i) {
    var back = i < idx;
    steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); s.classList.toggle('is-prev', k < i); s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    idx = i;
    segs.forEach(function (s, k) { s.classList.toggle('is-on', k <= idx); });
    now.textContent = idx + 1; backB.hidden = idx === 0; skipB.hidden = idx !== 1;
    setLabel(nextB, idx === N - 1 ? 'Get my free plan' : 'Continue');
    var f = $('input:not([type=radio]), textarea', steps[idx]);
    if (f && (FINE || idx > 1 || back)) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 120);
    gt('event', 'form_step', { step: idx + 1, form: 'peptide-store-build' });
  }
  steps.forEach(function (s, k) { s.setAttribute('aria-hidden', k === 0 ? 'false' : 'true'); });
  form.addEventListener('input', function (e) {
    if (!started) { started = true; gt('event', 'form_start', { form: 'peptide-store-build' }); }
    if (e.target.classList) e.target.classList.remove('is-bad');
    if (!err.hidden) showErr('');
  });
  // step 1 moves on by itself after a choice (one tap less)
  $$('input[name=type]', form).forEach(function (r) {
    r.addEventListener('change', function () { showErr(''); setTimeout(function () { if (idx === 0) show(1); }, 300); });
  });
  backB.addEventListener('click', function () { if (idx > 0) show(idx - 1); });
  skipB.addEventListener('click', function () { form.elements.project.value = ''; showErr(''); show(2); gt('event', 'form_skip_project', { form: 'peptide-store-build' }); });
  form.elements.project.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); nextB.click(); } });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy || !valid(idx)) return;
    if (idx < N - 1) { show(idx + 1); return; }
    send();
  });
  // Back from the thank-you page restores this page frozen on "Sending…". Put the button back.
  addEventListener('pageshow', function (e) {
    if (!e.persisted || !busy) return;
    busy = false; nextB.classList.remove('is-busy');
    setLabel(nextB, idx === N - 1 ? 'Get my free plan' : 'Continue');
  });

  function send() {
    busy = true; nextB.classList.add('is-busy'); setLabel(nextB, 'Sending…');
    form.elements.phone.value = fullPhone(); form.elements.country.value = (CC.filter(function (x) { return x.iso === sel.value; })[0] || CC[0]).name;
    if (!form.elements.project.value.trim()) form.elements.project.value = '(skipped)';
    var fd = new FormData(form), d = {};
    fd.delete && fd.delete('phone_local');
    fd.forEach(function (v, k) { if (k !== 'bot-field' && k !== 'form-name') d[k] = String(v).trim(); });
    var bot = !!(form.elements['bot-field'] && form.elements['bot-field'].value);
    // the thank-you page reads this once to fire the clean lead event (a refresh or a direct visit fires nothing)
    try { sessionStorage.setItem('st-lead', JSON.stringify({ name: d.name.split(' ')[0], type: d.type, t: Date.now() })); } catch (x) {}
    var done = function () { location.href = THANK_YOU; };
    if (bot || !HTTP) { setTimeout(done, 400); return; }
    var jobs = [];
    // 1) Netlify Forms (Site > Forms > peptide-store-build)
    var p = new URLSearchParams(); fd.forEach(function (v, k) { p.append(k, v); });
    jobs.push(fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: p.toString(), keepalive: true }).catch(function () {}));
    // 2) email to the team (FormSubmit)
    if (LEAD_EMAIL) {
      var mail = { _subject: 'New ad lead: ' + d.name + ' (' + d.type + ')', _template: 'table', _captcha: 'false', _replyto: d.email,
        'Project type': d.type, 'Project': d.project, 'Name': d.name, 'Email': d.email, 'Phone / WhatsApp': d.phone, 'Country': d.country, 'Page': d.page,
        'UTM source': d.utm_source || '-', 'UTM campaign': d.utm_campaign || '-', 'UTM content': d.utm_content || '-', 'Click id': d.click_id || '-' };
      if (LEAD_CC) mail._cc = LEAD_CC;
      jobs.push(fetch('https://formsubmit.co/ajax/' + LEAD_EMAIL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(mail), keepalive: true }).catch(function () {}));
    }
    // 3) optional webhook
    if (FORM_ENDPOINT) jobs.push(fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d), keepalive: true }).catch(function () {}));
    // move on when the lead is stored, or after 3.5s at the latest (keepalive lets the requests finish anyway)
    Promise.race([Promise.all(jobs), new Promise(function (r) { setTimeout(r, 3500); })]).then(done, done);
  }
})();
