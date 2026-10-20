/* Stealth Tech: the molecule (hero, footer and 404; replaces the car everywhere).
   One engine for every element with [data-mol]. The rendered peptide chain picture is drawn with WebGL 1:
   - it forms out of thousands of particles (hero: after the splash; footer / 404: when it comes into view),
   - it breathes softly, a gentle accordion and vertical wave run through it, with a slow idle sway in perspective,
   - particles keep rising from the whole structure; a mint energy wave and a light sweep pass over it,
   - hover: a glow runs from the centre out to both ends,
   - click: a smooth wave rolls from left to right; three quick clicks: the bonds stretch, then spring back and the units knock together,
   - drag: the part you grab is pulled along and springs back,
   - a soft shadow under it follows every stretch and pull.
   No libraries. ES5. On file:// the picture comes from assets/js/chain-*.js (data URL) so WebGL may read it.
   Without WebGL, on a software renderer or with reduced motion, the plain picture is shown instead (CSS breathing only). */
(function (w) {
  'use strict';
  var doc = document, root = doc.documentElement;
  var stages = doc.querySelectorAll('[data-mol]');
  if (!stages.length) return;
  var RM = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MQ = w.matchMedia('(max-width: 900px)');
  var FINE = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function LITE() { return root.classList.contains('lite'); }
  function NOGPU() { return root.classList.contains('no-gpu') && !/[?&]perf=full/.test(location.search); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function each(list, fn) { for (var i = 0; i < list.length; i++) fn(list[i], i); }

  // the plain picture: only downloads when it is needed
  function still(st) {
    st.classList.add('is-still'); st.classList.remove('is-on');
    each(st.querySelectorAll('img[data-src]'), function (im) {
      if (im.getAttribute('data-srcset')) im.setAttribute('srcset', im.getAttribute('data-srcset'));
      im.setAttribute('src', im.getAttribute('data-src')); im.removeAttribute('data-src');
    });
  }
  if (RM) { each(stages, still); return; }

  /* ---------------- the picture, loaded and analysed once for every instance ---------------- */
  var PIC = null, waiting = [], loading = false;
  function picture(cb) {
    if (PIC) { cb(PIC); return; }
    waiting.push(cb); if (loading) return; loading = true;
    // same rule as the <link rel=preload> in the page head, so the preloaded file is the one used
    var big = w.matchMedia('(min-width: 901px) and (min-resolution: 1.5dppx), (min-width: 1301px)').matches, small = w.matchMedia('(max-width: 600px)').matches,
      name = big ? 'chain-1800' : small ? 'chain-760' : 'chain-1100';   // phones get the light 760px picture (~40 KB)
    function done(p) { PIC = p; var l = waiting; waiting = []; each(l, function (f) { f(p); }); }
    function fromUrl(u) { var im = new Image(); im.onload = function () { done(analyse(im)); }; im.onerror = function () { done(false); }; im.src = u; }
    if (/^https?:$/.test(location.protocol)) { fromUrl('assets/img/' + name + '.webp?v=75e0c789c1'); return; }
    // file://: a picture loaded from disk cannot be read by WebGL, a data URL can
    var s = doc.createElement('script'); s.src = 'assets/js/' + name + '.js';
    s.onload = function () { if (w.ST_CHAIN) fromUrl(w.ST_CHAIN); else done(false); }; s.onerror = function () { done(false); }; doc.head.appendChild(s);
  }
  function analyse(img) {
    var asp = img.naturalWidth / img.naturalHeight, sw = 320, sh = Math.round(sw / asp), c = doc.createElement('canvas'), px;
    c.width = sw; c.height = sh; var g = c.getContext('2d'); g.drawImage(img, 0, 0, sw, sh);
    try { px = g.getImageData(0, 0, sw, sh).data; } catch (e) { return false; }
    var body = [], dens = new Float32Array(sw), x, y, k, mx = 0;
    for (y = 0; y < sh; y++) for (x = 0; x < sw; x++) { k = (y * sw + x) * 4; dens[x] += px[k + 3] / 255; if (px[k + 3] > 140) body.push(x, y, k); }
    for (x = 0; x < sw; x++) { dens[x] /= sh; if (dens[x] > mx) mx = dens[x]; }
    // where the picture is thin (the bonds) it may stretch; the units stay rigid. C = where each column goes when the bonds stretch.
    var wgt = new Float32Array(sw), tot = 0, C = new Float32Array(sw + 1);
    for (x = 0; x < sw; x++) { var d = dens[x] / (mx || 1), t = clamp((0.42 - d) / 0.26, 0, 1); wgt[x] = 0.04 + t * t * (3 - 2 * t); }
    for (var pass = 0; pass < 2; pass++) { var b = new Float32Array(sw); for (x = 0; x < sw; x++) { var s0 = 0, n0 = 0; for (var j = -3; j <= 3; j++) { var xx = x + j; if (xx >= 0 && xx < sw) { s0 += wgt[xx]; n0++; } } b[x] = s0 / n0; } wgt = b; }
    for (x = 0; x < sw; x++) { C[x] = tot; tot += wgt[x]; } C[sw] = tot; for (x = 0; x <= sw; x++) C[x] /= tot;
    // soft shadow: the chain's mass per column, blurred, spread into a flat ellipse
    var cov = new Float32Array(sw); for (x = 0; x < sw; x++) cov[x] = dens[x] / (mx || 1);
    for (pass = 0; pass < 4; pass++) { b = new Float32Array(sw); for (x = 0; x < sw; x++) { s0 = 0; n0 = 0; for (j = -14; j <= 14; j++) { xx = x + j; if (xx >= 0 && xx < sw) { s0 += cov[xx]; n0++; } } b[x] = s0 / n0; } cov = b; }
    var SH = 48, sc = doc.createElement('canvas'); sc.width = sw; sc.height = SH; var sg = sc.getContext('2d'), sd = sg.createImageData(sw, SH);
    for (y = 0; y < SH; y++) {
      var v = (y / (SH - 1) - 0.5) * 2, gy = Math.exp(-v * v * 4.5);
      for (x = 0; x < sw; x++) {
        // tapered like a real contact shadow: strongest under the middle, fading out well before the ends
        var u = x / (sw - 1), ue = (u - 0.5) * 2, wx = Math.max(0, 1 - ue * ue), sm = clamp(u / 0.14, 0, 1) * clamp((1 - u) / 0.14, 0, 1);
        k = (y * sw + x) * 4; sd.data[k] = sd.data[k + 1] = sd.data[k + 2] = 255;
        sd.data[k + 3] = Math.round(clamp(Math.pow(cov[x], 0.9) * Math.sqrt(wx) * sm * sm * (3 - 2 * sm) * gy, 0, 1) * 255);
      }
    }
    sg.putImageData(sd, 0, 0);
    return { img: img, asp: asp, sw: sw, sh: sh, px: px, body: body, C: C, shadow: sc };
  }
  function kAt(P, u) { var f = clamp(u, 0, 1) * P.sw, i = Math.min(P.sw - 1, Math.floor(f)), r = f - i; return P.C[i] + (P.C[i + 1] - P.C[i]) * r; }

  /* ---------------- shaders (shared by every instance) ---------------- */
  var DEFORM = [
    'uniform float uT;uniform vec2 uC;uniform vec2 uS;uniform float uAmp;uniform float uWave;uniform float uStr;uniform vec3 uGrab;uniform vec2 uPull;uniform vec2 uRot;',
    'vec3 shape(vec2 uv,float k){',
    ' float x=(uv.x-.5)*uS.x,y=(uv.y-.5)*uS.y,edge=abs(uv.x-.5)*2.;',
    // soft breathing, a gentle accordion and a vertical wave (the logo unit in the middle stays almost still)
    ' float br=sin(uT*.95)*.008+sin(uT*.41+1.3)*.004;x*=1.+br;y*=1.-br*.6;',
    ' x+=sin(uv.x*9.4-uT*1.3)*uS.x*.0022*uAmp*(.3+.7*edge);',
    ' float wv=sin(uv.x*6.3-uT*1.1)*.55+sin(uv.x*2.9+uT*.78)*.45;y+=wv*uS.y*.024*uAmp*(.2+.8*edge);',
    // three clicks: only the bonds stretch (k = where each column goes), then they spring back and the units knock together
    ' x+=uStr*uS.x*(k-.5);y*=1.+min(uStr,0.)*.6;',
    // one click: a smooth wave rolls from left to right
    ' float p=-.25+uWave*.6,q=uv.x-p,fd=1.-smoothstep(1.7,2.5,uWave);',
    ' y+=uS.y*.085*fd*(-exp(-q*q*38.)+.42*exp(-(q+.13)*(q+.13)*55.));',
    // drag: the part under the pointer is pulled along
    ' float g=exp(-pow((uv.x-uGrab.x)/.16,2.))*uGrab.z;x+=uPull.x*g;y+=uPull.y*g;',
    ' y+=sin(uT*.85)*uS.y*.016;',
    ' return vec3(x,y,edge*edge*uS.x*.12);}',
    // turn it toward the mouse (plus a slow sway) and project with perspective, so it reads as a real object
    'vec2 proj(vec3 p){',
    ' float cy=cos(uRot.y),sy=sin(uRot.y),cx=cos(uRot.x),sx=sin(uRot.x);',
    ' vec3 q=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);q=vec3(q.x,q.y*cx-q.z*sx,q.y*sx+q.z*cx);',
    ' float f=uS.x*1.5;return uC+q.xy*(f/(f+q.z));}'
  ].join('\n');
  var VS_IMG = [
    'attribute vec3 aP;uniform vec2 uRes;uniform float uMode;varying vec2 vUV;', DEFORM,
    'void main(){vUV=aP.xy;vec3 s=shape(aP.xy,aP.z);',
    // shadow: a flat soft band on the floor under the chain; it follows the stretch, the breathing and a pull
    ' if(uMode>.5){s.y=uS.y*.6+(aP.y-.5)*uS.y*.34;s.x*=.96;s.z+=uS.x*.03;}',
    ' vec2 p=proj(s);gl_Position=vec4(p.x/uRes.x*2.-1.,1.-p.y/uRes.y*2.,0.,1.);}'
  ].join('\n');
  var FS_IMG = [
    'precision mediump float;uniform sampler2D uTex;uniform sampler2D uShTex;uniform float uModeF;uniform vec4 uShC;',
    'uniform float uRev;uniform float uSweep;uniform float uGlow;uniform float uHov;uniform float uHovA;uniform vec3 uMint;',
    'varying vec2 vUV;',
    'void main(){',
    ' float d=abs(vUV.x-.5)*2.;float n=fract(sin(dot(floor(vUV*vec2(220.,70.)),vec2(12.9898,78.233)))*43758.5453);',
    ' float rv=1.-smoothstep(uRev-.12,uRev,d+n*.12);',
    ' if(uModeF>.5){float a=texture2D(uShTex,vUV).a*uShC.a*rv;gl_FragColor=vec4(uShC.rgb*a,a);return;}',
    ' vec4 c=texture2D(uTex,vUV);',
    ' float green=clamp((c.g-max(c.r,c.b)*.9)*3.5,0.,1.);float lum=dot(c.rgb,vec3(.33));',
    // idle energy wave over the glass
    ' vec3 col=c.rgb+uMint*green*exp(-pow((vUV.x-uSweep)*6.,2.))*(.55+uGlow)*.55*c.a;',
    // hover: a glow runs from the centre out to both ends, again and again while the mouse is on it
    ' float r=fract(uHov/1.9)*1.35-.12;float hb=exp(-pow((d-r)*6.5,2.))*uHovA;',
    ' col+=uMint*(green*1.05+lum*.3)*hb*c.a;',
    // far ends a touch darker (depth)
    ' col*=1.-d*d*d*.1;',
    ' gl_FragColor=vec4(col,c.a)*rv;}'
  ].join('\n');
  var VS_P = [
    'attribute vec4 aA;attribute vec4 aB;uniform vec2 uRes;uniform float uAge;uniform float uDpr;uniform vec2 uM;uniform float uBoost;uniform float uAura;uniform vec3 uMintP;',
    'varying vec3 vCol;varying float vA;', DEFORM,
    // aA = u, v, k, kind (0 forms the picture, 1 keeps rising); aB = r, g, b, random
    'void main(){',
    ' float r1=aB.w,r2=fract(aB.w*91.7+aA.y*7.3);',
    ' float del=r1*.45+abs(aA.x-.5)*.95;float p=clamp((uAge-del)/1.15,0.,1.);float e=1.-pow(1.-p,3.);',
    ' vec2 tgt=proj(shape(aA.xy,aA.z));float ang=r2*6.2832;',
    ' vec2 st=uC+vec2(cos(ang)*uS.x*(.45+r1*.5),sin(ang)*uS.y*(1.1+r2*1.2));',
    ' vec2 pos=mix(st,tgt,e)+vec2(-sin(ang),cos(ang))*sin(p*3.1416)*uS.y*.45;',
    ' float a=smoothstep(0.,.12,p)*(1.-smoothstep(.72,1.,p));vCol=aB.rgb;',
    ' if(aA.w>.5){',
    '  float life=fract(uAge*(.06+r1*.08)+r2);',
    '  vec2 au=tgt+vec2(sin(uAge*.7+r2*40.)*uS.y*.05,-life*uS.y*(.28+r1*.32));',
    '  float k=step(1.,p);pos=mix(pos,au,k);',
    '  a=mix(a,sin(life*3.1416)*uAura*(.5+uBoost),k);vCol=mix(aB.rgb,uMintP,k);',
    ' }',
    // particles step aside from the mouse
    ' vec2 dm=pos-uM;float dd=length(dm)+.001;pos+=dm/dd*max(0.,50.*uDpr-dd)*.35;',
    ' vA=a;gl_Position=vec4(pos.x/uRes.x*2.-1.,1.-pos.y/uRes.y*2.,0.,1.);',
    ' gl_PointSize=(1.3+r1*1.7)*uDpr*(aA.w>.5?1.3:1.);}'
  ].join('\n');
  var FS_P = 'precision mediump float;varying vec3 vCol;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float r=dot(c,c)*4.;if(r>1.)discard;float a=vA*(1.-r);gl_FragColor=vec4(vCol*a,a);}';

  /* ---------------- one molecule ---------------- */
  function Mol(stage) {
    var cv = stage.querySelector('.mol-gl'), kind = stage.getAttribute('data-mol') || 'hero';
    if (!cv) return;
    var gl = null;
    try { gl = cv.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true }) || cv.getContext('experimental-webgl'); } catch (e) {}
    if (!gl) { still(stage); return; }
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    function prog(v, f) { var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link'); return p; }
    var PI, PP;
    try { PI = prog(VS_IMG, FS_IMG); PP = prog(VS_P, FS_P); } catch (e) { if (w.console) console.warn('molecule:', e.message); still(stage); return; }
    function locs(p, names) { var o = {}; each(names, function (n) { o[n] = gl.getUniformLocation(p, n); }); return o; }
    var COMMON = ['uT', 'uC', 'uS', 'uAmp', 'uWave', 'uStr', 'uGrab', 'uPull', 'uRot', 'uRes'];
    var UI = locs(PI, COMMON.concat(['uMode', 'uModeF', 'uTex', 'uShTex', 'uShC', 'uRev', 'uSweep', 'uGlow', 'uHov', 'uHovA', 'uMint']));
    var UP = locs(PP, COMMON.concat(['uAge', 'uDpr', 'uM', 'uBoost', 'uAura', 'uMintP']));
    var aP = gl.getAttribLocation(PI, 'aP'), aA = gl.getAttribLocation(PP, 'aA'), aB = gl.getAttribLocation(PP, 'aB');
    var tex = gl.createTexture(), stex = gl.createTexture(), gb = gl.createBuffer(), eb = gl.createBuffer(), sb = gl.createBuffer(), seb = gl.createBuffer(), pb = gl.createBuffer();
    var NI = 0, NSI = 0, NB = 0, NA = 0, ready = false, P = null;

    function texFrom(t, src, premul) {
      gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !!premul);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    // a grid (u, v, k) so the picture bends smoothly; k lets the bonds stretch without stretching the units
    function grid(GX, GY, vb, ib) {
      var v = [], ix = [], x, y;
      for (y = 0; y <= GY; y++) for (x = 0; x <= GX; x++) v.push(x / GX, y / GY, kAt(P, x / GX));
      for (y = 0; y < GY; y++) for (x = 0; x < GX; x++) { var i0 = y * (GX + 1) + x; ix.push(i0, i0 + 1, i0 + GX + 1, i0 + 1, i0 + GX + 2, i0 + GX + 1); }
      gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ix), gl.STATIC_DRAW);
      return ix.length;
    }
    function build(p) {
      if (!p) { still(stage); return; }
      P = p;
      try { texFrom(tex, p.img, true); texFrom(stex, p.shadow, false); } catch (e) { still(stage); return; }
      NI = grid(140, 16, gb, eb); NSI = grid(70, 2, sb, seb);
      // particles: many form the picture, some keep rising from the whole structure afterwards
      var mob = MQ.matches, lite = LITE(), d = [], n = p.body.length / 3;
      NB = lite ? 800 : (mob ? 1200 : (kind === 'hero' ? 2400 : 2000)); NA = lite ? 50 : (mob ? 80 : 140);
      function add(rise) {
        var j = Math.floor(Math.random() * n) * 3, k = p.body[j + 2], u = (p.body[j] + Math.random()) / p.sw, v = (p.body[j + 1] + Math.random()) / p.sh;
        d.push(u, v, kAt(p, u), rise ? 1 : 0, p.px[k] / 255, p.px[k + 1] / 255, p.px[k + 2] / 255, Math.random());
      }
      var b; if (n) { for (b = 0; b < NB; b++) add(false); for (b = 0; b < NA; b++) add(true); } else { NB = NA = 0; }
      gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(d), gl.STATIC_DRAW);
      ready = true; resize(); if (want) go();
    }

    /* layout: the picture sits in the middle of the stage; the canvas is taller so waves, pulls and rising particles fit */
    var W = 0, H = 0, dpr = 1, IW = 0, IH = 0, CX = 0, CY = 0, SR = null;
    function resize() {
      dpr = Math.min(w.devicePixelRatio || 1, LITE() ? 1 : 1.5);
      W = cv.clientWidth; H = cv.clientHeight; if (!W || !H || !P) return;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      var mob = MQ.matches, sr = stage.getBoundingClientRect(), cr = cv.getBoundingClientRect();
      var fw = kind === 'hero' ? (mob ? 0.94 : 0.8) : kind === 'foot' ? (mob ? 0.96 : 0.74) : (mob ? 0.94 : 0.62);
      IW = Math.min(W * fw, sr.height * (mob ? 0.92 : 0.9) * P.asp, kind === '404' ? 900 : 1240); IH = IW / P.asp;
      CX = W / 2; CY = (sr.top + sr.height / 2) - cr.top;
    }

    /* state */
    var t0 = 0, on = false, vis = false, raf = 0, last = 0, started = false, want = false, scrollUntil = 0;
    // while the page is scrolling, the molecule draws at half rate so every frame of the scroll stays smooth
    w.addEventListener('scroll', function () { scrollUntil = performance.now() + 180; }, { passive: true });
    var pmx = -9999, pmy = -9999, amp = 1, hot = false, hovA = 0, hovAt = 0, boost = 0;
    var waveAt = -99, S = 0, Sv = 0, stretchAt = -99, clicks = [];
    var down = false, dragging = false, sx0 = 0, sy0 = 0, grabU = 0.5, grabZ = 0, pX = 0, pY = 0, vX = 0, vY = 0;
    function now() { return (performance.now() - t0) / 1000; }

    function frame(ms) {
      raf = 0; if (!on) return;
      if ((LITE() || ms < scrollUntil) && ms - last < 31) { raf = requestAnimationFrame(frame); return; }
      var dt = last ? Math.min(0.05, (ms - last) / 1000) : 0.016; last = ms;
      step(dt); render(now()); raf = requestAnimationFrame(frame);
    }
    function step(dt) {
      var t = now();
      amp += ((hot ? 1.25 : 1) - amp) * 0.05;
      hovA += ((hot ? 1 : 0) - hovA) * (hot ? 0.08 : 0.04); boost *= 0.95;
      // three clicks: stretch for a moment, then a spring pulls the bonds back and the units knock together
      var ts = t - stretchAt;
      if (ts >= 0 && ts < 0.32) { var e = ts / 0.32; S = 0.24 * (1 - Math.pow(1 - e, 3)); Sv = 0; }
      else { var a = -230 * S - 9 * Sv; Sv += a * dt; S += Sv * dt; if (S < -0.15) { S = -0.15; Sv = Math.abs(Sv) * 0.35; boost = 1; } if (Math.abs(S) < 0.0004 && Math.abs(Sv) < 0.002) { S = 0; Sv = 0; } }
      // drag: the grabbed part follows the pointer; released, it springs back
      if (!dragging) { var ax = -210 * pX - 12 * vX, ay = -210 * pY - 12 * vY; vX += ax * dt; vY += ay * dt; pX += vX * dt; pY += vY * dt; if (Math.abs(pX) + Math.abs(pY) < 0.2 && Math.abs(vX) + Math.abs(vY) < 2) { pX = pY = vX = vY = 0; grabZ = 0; } }
    }
    function setCommon(U, t) {
      gl.uniform1f(U.uT, t); gl.uniform2f(U.uC, CX * dpr, CY * dpr); gl.uniform2f(U.uS, IW * dpr, IH * dpr);
      gl.uniform1f(U.uAmp, amp); gl.uniform1f(U.uWave, t - waveAt); gl.uniform1f(U.uStr, S);
      gl.uniform3f(U.uGrab, grabU, 0, grabZ); gl.uniform2f(U.uPull, pX * dpr, pY * dpr);
      gl.uniform2f(U.uRot, Math.sin(t * 0.33) * 0.012, Math.sin(t * 0.27) * 0.03); gl.uniform2f(U.uRes, cv.width, cv.height); // idle sway only: the object never follows the mouse
    }
    function render(t) {
      if (!W) resize(); if (!W) return;
      var dark = root.getAttribute('data-theme') !== 'light';
      gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.disable(gl.DEPTH_TEST);
      var rev = Math.min(1.25, Math.max(0, (t - 0.45) / 1.3) * 1.25);
      gl.useProgram(PI); setCommon(UI, t);
      gl.uniform1f(UI.uRev, rev); gl.uniform1f(UI.uSweep, t > 2.4 ? ((t - 2.4) % 5.5) / 4.6 * 1.3 - 0.15 : -1);
      gl.uniform1f(UI.uGlow, boost); gl.uniform1f(UI.uHov, t - hovAt); gl.uniform1f(UI.uHovA, hovA);
      gl.uniform3fv(UI.uMint, dark ? [0.24, 0.96, 0.56] : [0.06, 0.62, 0.38]);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(UI.uTex, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, stex); gl.uniform1i(UI.uShTex, 1);
      gl.enableVertexAttribArray(aP);
      // 1) soft shadow on the floor (a faint mint glow in the dark theme)
      gl.uniform1f(UI.uMode, 1); gl.uniform1f(UI.uModeF, 1);
      gl.uniform4fv(UI.uShC, dark ? [0.24, 0.96, 0.56, 0.14] : [0.02, 0.16, 0.1, 0.2]);
      if (dark) gl.blendFunc(gl.ONE, gl.ONE); else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindBuffer(gl.ARRAY_BUFFER, sb); gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, seb); gl.drawElements(gl.TRIANGLES, NSI, gl.UNSIGNED_SHORT, 0);
      // 2) the picture
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(UI.uMode, 0); gl.uniform1f(UI.uModeF, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, gb); gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eb); gl.drawElements(gl.TRIANGLES, NI, gl.UNSIGNED_SHORT, 0);
      gl.disableVertexAttribArray(aP);
      // 3) particles: all of them while it forms, afterwards only the rising ones (less work every frame)
      if (NB + NA) {
        gl.useProgram(PP); setCommon(UP, t);
        if (dark) gl.blendFunc(gl.ONE, gl.ONE);
        gl.uniform1f(UP.uAge, t); gl.uniform1f(UP.uDpr, dpr); gl.uniform2f(UP.uM, pmx * dpr, pmy * dpr); gl.uniform1f(UP.uBoost, Math.max(boost, hovA * 0.6));
        gl.uniform1f(UP.uAura, dark ? 0.85 : 0.7); gl.uniform3fv(UP.uMintP, dark ? [0.45, 1, 0.7] : [0.05, 0.45, 0.28]);
        gl.bindBuffer(gl.ARRAY_BUFFER, pb);
        gl.enableVertexAttribArray(aA); gl.vertexAttribPointer(aA, 4, gl.FLOAT, false, 32, 0);
        gl.enableVertexAttribArray(aB); gl.vertexAttribPointer(aB, 4, gl.FLOAT, false, 32, 16);
        if (t < 3) gl.drawArrays(gl.POINTS, 0, NB + NA); else gl.drawArrays(gl.POINTS, NB, NA);
        gl.disableVertexAttribArray(aA); gl.disableVertexAttribArray(aB);
      }
    }

    function start() { if (on || !vis || doc.hidden || !started) return; on = true; last = 0; raf = requestAnimationFrame(frame); }
    function stop() { on = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    function go() {
      want = true; if (started || !ready) return;
      if (NOGPU()) { still(stage); return; }
      started = true; t0 = performance.now(); stage.classList.add('is-on'); start();
    }
    if (w.IntersectionObserver) new IntersectionObserver(function (es) {
      vis = es[0].isIntersecting;
      // footer and 404: it forms out of particles the first time it comes into view
      if (vis && kind !== 'hero' && es[0].intersectionRatio > 0.2) go();
      vis ? start() : stop();
    }, { threshold: [0, 0.25] }).observe(stage);
    else vis = true;
    doc.addEventListener('visibilitychange', function () { if (doc.hidden) stop(); else start(); });
    var rzT = 0; w.addEventListener('resize', function () { clearTimeout(rzT); rzT = setTimeout(resize, 100); });
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stop(); still(stage); });

    /* pointer: hover glow, click wave, three clicks = stretch, drag = pull (the object itself never follows the mouse) */
    function local(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function inChain(x, y) { return Math.abs(x - CX) < IW * 0.52 && Math.abs(y - CY) < IH * 0.62; }
    w.addEventListener('pointermove', function (e) {
      var l = local(e); pmx = l[0]; pmy = l[1];
      if (down) {
        var dx = e.clientX - sx0, dy = e.clientY - sy0;
        if (!dragging && dx * dx + dy * dy > 49) { dragging = true; stage.classList.add('is-drag'); grabZ = 1; }
        if (dragging) { var len = Math.sqrt(dx * dx + dy * dy), lim = IH * 0.18, f = lim * (1 - Math.exp(-len * 0.28 / lim)) / (len || 1); pX = dx * f; pY = dy * f; vX = vY = 0; } // (it resists more the further you pull)
        return;
      }
      if (!started || !FINE) return;
      var h = inChain(pmx, pmy);
      if (h && !hot) hovAt = now();
      hot = h; stage.classList.toggle('is-hot', h);
    }, { passive: true });
    doc.addEventListener('pointerleave', function () { pmx = pmy = -9999; hot = false; stage.classList.remove('is-hot'); });
    cv.addEventListener('pointerdown', function (e) {
      if (!started) return; var l = local(e); if (!inChain(l[0], l[1])) return;
      down = true; dragging = false; sx0 = e.clientX; sy0 = e.clientY; grabU = clamp((l[0] - (CX - IW / 2)) / IW, 0, 1);
    });
    w.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (dragging) { dragging = false; stage.classList.remove('is-drag'); return; }
      var t = now(); waveAt = t; boost = Math.max(boost, 0.5);
      clicks.push(t); clicks = clicks.filter(function (c) { return t - c < 0.7; });
      if (clicks.length >= 3) { clicks = []; stretchAt = t; boost = 1; }
      try { if (navigator.vibrate) navigator.vibrate(clicks.length ? 10 : [12, 40, 24]); } catch (x) {}
    });
    w.addEventListener('pointercancel', function () { down = false; dragging = false; stage.classList.remove('is-drag'); });
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    // the hero needs its picture now (it is preloaded); footer and 404 fetch it only when they get close to the screen
    if (kind === 'hero' || !w.IntersectionObserver) picture(build);
    else { var lio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { lio.disconnect(); picture(build); } }, { rootMargin: '600px 0px' }); lio.observe(stage); }
    if (kind === 'hero') {
      // the hero forms right after the splash (main.js adds .is-ready to <body>)
      var heroIn = function () { return doc.body.classList.contains('is-ready'); };
      if (heroIn()) setTimeout(go, 200);
      else if (w.MutationObserver) { var mo = new MutationObserver(function () { if (heroIn()) { mo.disconnect(); setTimeout(go, 200); } }); mo.observe(doc.body, { attributes: true, attributeFilter: ['class'] }); }
      else setTimeout(go, 3500);
    }
  }

  // set each molecule up only when it is needed (no graphics work at page load for one that is far down the page),
  // and never on a device without a real graphics chip (the plain picture is shown there instead)
  function lazy(st) {
    var kind = st.getAttribute('data-mol');
    function boot() { if (st._mol) return; st._mol = 1; if (NOGPU()) still(st); else Mol(st); }
    if (kind === 'hero' || !w.IntersectionObserver) {
      // after main.js has run (it detects the graphics chip); the preloaded picture is already on its way
      if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 0); }); else setTimeout(boot, 0);
      return;
    }
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); boot(); } }, { rootMargin: '700px 0px' });
    io.observe(st);
  }
  each(stages, lazy);
})(window);
