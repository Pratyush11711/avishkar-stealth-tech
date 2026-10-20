/* Stealth Tech — forms.js
   Lightweight WebGL 1 renderer: 4 low-poly models that dissolve into particles and re-form.
   Data comes from assets/js/forms-data.js (window.ST_FORMS_DATA), so it also works from file://.
   Particles are sampled in the browser from the mesh surface (no big point files). */
(function () {
  'use strict';

  var VS_PTS = [
    'attribute vec3 a0;attribute vec3 a1;attribute vec3 a2;attribute vec3 a3;attribute float aR;',
    'uniform vec4 uW;uniform float uKeep;uniform float uScatter;uniform float uTime;uniform mat4 uP;uniform mat4 uMV;uniform float uSize;',
    'varying float vA;',
    'void main(){',
    ' vec3 p=a0*uW.x+a1*uW.y+a2*uW.z+a3*uW.w;',
    ' vec3 d=vec3(fract(aR*12.9898)-.5,fract(aR*78.233)-.5,fract(aR*37.719)-.5);',
    ' float k=.55+fract(aR*3.71);',
    ' p+=normalize(d+1e-4)*uScatter*k*1.5;',
    ' p.y+=uScatter*sin(aR*40.+uTime)*.25;',
    ' p+=vec3(sin(uTime*.9+aR*61.),cos(uTime*.7+aR*43.),sin(uTime*.8+aR*17.))*(.005+uScatter*.06);',
    ' vec4 mv=uMV*vec4(p,1.);',
    ' gl_Position=uP*mv;',
    ' gl_PointSize=uSize*(.6+fract(aR*9.13)*.9)/(-mv.z);',
    ' vA=.5+.5*fract(aR*5.3);',
    // low-quality mode drops a random half of the particles (evenly spread, so every shape stays whole)
    ' if(fract(aR*91.7)>uKeep){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;}',
    '}'
  ].join('\n');
  var FS_PTS = 'precision mediump float;uniform vec3 uC;uniform float uA;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float r=dot(c,c);if(r>.25)discard;float s=smoothstep(.25,0.,r);gl_FragColor=vec4(uC,uA*vA*s);}';
  var VS_MESH = [
    'attribute vec3 aP;attribute vec3 aN;uniform mat4 uP;uniform mat4 uMV;',
    'varying vec3 vN;varying vec3 vV;varying vec3 vO;',
    'void main(){vec4 mv=uMV*vec4(aP,1.);vN=normalize(mat3(uMV)*aN);vV=-mv.xyz;vO=aP;gl_Position=uP*mv;}'
  ].join('\n');
  var FS_MESH = [
    'precision mediump float;',
    'uniform vec3 uBase;uniform vec3 uRim;uniform float uA;uniform float uTime;uniform float uLight;',
    'varying vec3 vN;varying vec3 vV;varying vec3 vO;',
    'float h(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
    'void main(){',
    ' float n=h(floor(vO*34.));',
    ' if(n>uA)discard;',
    ' vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 V=normalize(vV);',
    ' vec3 L=normalize(vec3(.5,.8,.6));vec3 L2=normalize(vec3(-.7,-.2,.4));',
    ' float df=max(dot(N,L),0.);float df2=max(dot(N,L2),0.);',
    ' float fr=pow(1.-max(dot(N,V),0.),2.4);',
    ' vec3 H=normalize(L+V);float sp=pow(max(dot(N,H),0.),56.);',
    ' float sc=smoothstep(.94,1.,sin(vO.y*70.-uTime*1.8)*.5+.5);',
    ' vec3 col=uBase*(.28+.62*df)+uRim*df2*.18+uRim*fr*1.05+vec3(sp)*.6*uLight+uRim*sc*.22;',
    ' float edge=smoothstep(uA-.07,uA,n)*step(uA,.999);',
    ' col=mix(col,uRim*1.5,edge);',
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  function persp(fov, asp, n, f) { var t = 1 / Math.tan(fov / 2), nf = 1 / (n - f); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]); }
  function mv(rx, ry, rz, tx, ty, tz, s) {
    var cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
    var m00 = cz * cy - sz * sx * sy, m01 = -sz * cx, m02 = cz * sy + sz * sx * cy;
    var m10 = sz * cy + cz * sx * sy, m11 = cz * cx, m12 = sz * sy - cz * sx * cy;
    var m20 = -cx * sy, m21 = sx, m22 = cx * cy;
    return new Float32Array([m00 * s, m10 * s, m20 * s, 0, m01 * s, m11 * s, m21 * s, 0, m02 * s, m12 * s, m22 * s, 0, tx, ty, tz, 1]);
  }
  function sh(gl, type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function prog(gl, v, f) { var p = gl.createProgram(); gl.attachShader(p, sh(gl, gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl, gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
  function b64(s, Type) { var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Type(u.buffer); }
  function hex(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255]; }
  function sstep(a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
  // deterministic PRNG so every load samples the same particles
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

  // sample N points on mesh surface (area weighted), sorted by height so the morph flows vertically
  function sample(pos, N, r) {
    var tri = pos.length / 9, area = new Float32Array(tri), tot = 0, i;
    for (i = 0; i < tri; i++) {
      var o = i * 9, ax = pos[o + 3] - pos[o], ay = pos[o + 4] - pos[o + 1], az = pos[o + 5] - pos[o + 2], bx = pos[o + 6] - pos[o], by = pos[o + 7] - pos[o + 1], bz = pos[o + 8] - pos[o + 2];
      var cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
      tot += Math.sqrt(cx * cx + cy * cy + cz * cz); area[i] = tot;
    }
    var pts = [];
    for (var k = 0; k < N; k++) {
      var t = r() * tot, lo = 0, hi = tri - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (area[mid] < t) lo = mid + 1; else hi = mid; }
      var u = r(), v = r(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
      var q = lo * 9;
      var x = pos[q] + u * (pos[q + 3] - pos[q]) + v * (pos[q + 6] - pos[q]);
      var y = pos[q + 1] + u * (pos[q + 4] - pos[q + 1]) + v * (pos[q + 7] - pos[q + 1]);
      var z = pos[q + 2] + u * (pos[q + 5] - pos[q + 2]) + v * (pos[q + 8] - pos[q + 2]);
      pts.push([x, y, z, y + (r() - 0.5) * 0.06]);
    }
    pts.sort(function (a, b) { return a[3] - b[3]; });
    var out = new Float32Array(N * 3);
    for (k = 0; k < N; k++) { out[k * 3] = pts[k][0]; out[k * 3 + 1] = pts[k][1]; out[k * 3 + 2] = pts[k][2]; }
    return out;
  }

  // pose per form: [rotX, rotZ, scale]
  var POSE = [[0.15, -0.55, 0.92], [0.35, 0.0, 1.0], [0.25, 0.0, 0.98], [0.0, 0.32, 0.95]];

  function Forms(canvas, opts) {
    this.c = canvas; this.o = opts || {};
    this.p = 0; this.pt = 0; this.mx = 0; this.my = 0; this.tmx = 0; this.tmy = 0; this.drag = 0; this.dragV = 0;
    this.on = false; this.raf = 0; this.t0 = performance.now(); this.ready = false; this.theme = 'dark';
  }
  // init is split into small steps (one model per idle slot) so building the particles never freezes scrolling
  Forms.prototype.init = function (done, fail) {
    var D = window.ST_FORMS_DATA; if (!D) throw new Error('no data');
    var c = this.c, gl = c.getContext('webgl', { antialias: !this.o.mobile && !this.o.lite, alpha: true, premultipliedAlpha: false, powerPreference: 'high-performance' }) || c.getContext('experimental-webgl');
    if (!gl) throw new Error('no webgl');
    this.gl = gl;
    this.pp = prog(gl, VS_PTS, FS_PTS);
    this.pm = prog(gl, VS_MESH, FS_MESH);
    var N = this.o.mobile ? 2600 : 5600, r = rng(7), self = this;
    if (this.o.lite) { this.low = true; this.maxDpr = 1; }
    this.n = N; this.bufs = [];
    var todo = D.forms.slice(), idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 16); };
    function build(f) {
      var P16 = b64(f.p, Int16Array), N8 = b64(f.n, Int8Array);
      var pos = new Float32Array(P16.length); for (var i = 0; i < P16.length; i++) pos[i] = P16[i] / 32767;
      var pts = sample(pos, N, r), b = {};
      b.pts = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b.pts); gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);
      b.tri = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b.tri); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
      b.nrm = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b.nrm); gl.bufferData(gl.ARRAY_BUFFER, N8, gl.STATIC_DRAW);
      b.count = pos.length / 3; self.bufs.push(b);
    }
    (function step() {
      idle(function () {
        try {
          var f = todo.shift();
          if (f) { build(f); step(); return; }
          self.finish(r); if (done) done();
        } catch (e) { if (fail) fail(e); }
      }, { timeout: 400 });
    })();
  };
  Forms.prototype.finish = function (r) {
    var gl = this.gl, N = this.n, self = this, c = this.c;
    var rnd = new Float32Array(N); for (var j = 0; j < N; j++) rnd[j] = r();
    this.rb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.rb); gl.bufferData(gl.ARRAY_BUFFER, rnd, gl.STATIC_DRAW);
    var pp = this.pp, pm = this.pm;
    this.lp = { a: [0, 1, 2, 3].map(function (i) { return gl.getAttribLocation(pp, 'a' + i); }), r: gl.getAttribLocation(pp, 'aR') };
    this.up = {}; ['uW', 'uKeep', 'uScatter', 'uTime', 'uP', 'uMV', 'uSize', 'uC', 'uA'].forEach(function (u) { self.up[u] = gl.getUniformLocation(pp, u); });
    this.lm = { p: gl.getAttribLocation(pm, 'aP'), n: gl.getAttribLocation(pm, 'aN') };
    this.um = {}; ['uP', 'uMV', 'uBase', 'uRim', 'uA', 'uTime', 'uLight'].forEach(function (u) { self.um[u] = gl.getUniformLocation(pm, u); });
    // drag to rotate
    var down = false, lx = 0;
    c.addEventListener('pointerdown', function (e) { down = true; lx = e.clientX; self.dragV = 0; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - lx; lx = e.clientX; self.drag += dx * 0.008; self.dragV = dx * 0.008; });
    window.addEventListener('pointerup', function () { down = false; });
    this.resize(); this.ready = true;
    this.frame();
  };
  // lite mode (slow device): half the particles at 1x pixels
  Forms.prototype.lite = function () { if (!this.ready || this.low) return; this.low = true; this.maxDpr = 1; this.resize(); };
  Forms.prototype.setTheme = function (t) { this.theme = t; if (this.ready && !this.on) this.frame(); };
  Forms.prototype.setProgress = function (p) { this.pt = Math.max(0, Math.min(1, p)); if (this.ready && !this.on) this.frame(); };
  Forms.prototype.pointer = function (x, y) { this.tmx = x; this.tmy = y; };
  Forms.prototype.start = function () { if (this.on || !this.ready) return; this.on = true; var self = this; this.lt = 0; var loop = function () { if (!self.on) return; self.frame(); self.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop); };
  Forms.prototype.stop = function () { this.on = false; cancelAnimationFrame(this.raf); };
  Forms.prototype.resize = function () {
    var c = this.c, dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr || (this.o.mobile ? 1.25 : 1.5)), w = c.clientWidth, h = c.clientHeight; if (!w || !h) return;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); this.dpr = dpr; this.w = w; this.h = h;
    if (this.gl) this.gl.viewport(0, 0, c.width, c.height);
  };
  Forms.prototype.frame = function () {
    if (!this.ready) return;
    var gl = this.gl, now = performance.now(), t = (now - this.t0) / 1000, dt = Math.min(0.25, (now - (this.lt || now)) / 1000); this.lt = now;
    // adaptive quality: if this device keeps missing frames, drop to 1x pixels and half the particles (once)
    if (this.on && !this.low && dt > 0) { this.slow = (this.slow || 0) + (dt > 0.034 ? 1 : -0.5); if (this.slow < 0) this.slow = 0; if (this.slow > 24) { this.low = true; this.maxDpr = 1; this.resize(); } }
    var kp = 1 - Math.exp(-dt * 7.5), km = 1 - Math.exp(-dt * 3);
    this.p += (this.pt - this.p) * (this.on ? kp : 1);
    this.mx += (this.tmx - this.mx) * km; this.my += (this.tmy - this.my) * km;
    this.drag += this.dragV; this.dragV *= 0.92;
    var x = this.p * 3, k = Math.min(2, Math.floor(x)), f = x - k;
    if (this.p >= 1) { k = 2; f = 1; }
    var m = sstep(0.36, 0.64, f), w = [0, 0, 0, 0]; w[k] = 1 - m; w[k + 1] = m;
    var scatter = Math.sin(Math.PI * m) * 0.55;
    var meshA = [0, 0, 0, 0]; meshA[k] = 1 - sstep(0.1, 0.36, f); meshA[k + 1] = sstep(0.64, 0.88, f);
    var ptsA = Math.max(0.12, sstep(0.06, 0.34, f) * (1 - sstep(0.66, 0.9, f)));
    var dark = this.theme === 'dark', mob = this.o.mobile, asp = this.w / this.h;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var P = persp(0.62, asp, 0.1, 50), pa = POSE[k], pb = POSE[k + 1];
    var rxP = pa[0] + (pb[0] - pa[0]) * m, rzP = pa[1] + (pb[1] - pa[1]) * m, sc = pa[2] + (pb[2] - pa[2]) * m;
    var ry = t * 0.3 + this.p * 6.5 + this.mx * 0.5 + this.drag, rx = rxP + this.my * 0.22;
    var tx = mob ? 0 : Math.min(1.0, 0.44 * asp), ty = mob ? (asp > 0.8 ? 0.4 : 0.7) : 0, tz = mob ? -7.4 : -4.6;
    var MV = mv(rx, ry, rzP, tx, ty, tz, sc);
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND);
    gl.useProgram(this.pm);
    gl.uniformMatrix4fv(this.um.uP, false, P); gl.uniformMatrix4fv(this.um.uMV, false, MV);
    gl.uniform3fv(this.um.uBase, dark ? [0.12, 0.15, 0.135] : [0.88, 0.9, 0.885]);
    gl.uniform3fv(this.um.uRim, dark ? hex('#3DF58F') : hex('#0B6B43'));
    gl.uniform1f(this.um.uTime, t); gl.uniform1f(this.um.uLight, dark ? 1 : 0.55);
    for (var i = 0; i < 4; i++) {
      if (meshA[i] <= 0.002) continue;
      var b = this.bufs[i];
      gl.uniform1f(this.um.uA, meshA[i]);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.tri); gl.enableVertexAttribArray(this.lm.p); gl.vertexAttribPointer(this.lm.p, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.nrm); gl.enableVertexAttribArray(this.lm.n); gl.vertexAttribPointer(this.lm.n, 3, gl.BYTE, true, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, b.count);
    }
    gl.disableVertexAttribArray(this.lm.p); gl.disableVertexAttribArray(this.lm.n);
    gl.useProgram(this.pp); gl.enable(gl.BLEND);
    if (dark) gl.blendFunc(gl.SRC_ALPHA, gl.ONE); else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.uniformMatrix4fv(this.up.uP, false, P); gl.uniformMatrix4fv(this.up.uMV, false, MV);
    gl.uniform4fv(this.up.uW, w); gl.uniform1f(this.up.uKeep, this.low ? 0.5 : 1.0); gl.uniform1f(this.up.uScatter, scatter); gl.uniform1f(this.up.uTime, t);
    gl.uniform1f(this.up.uSize, (mob ? 9 : 11) * this.dpr);
    gl.uniform3fv(this.up.uC, dark ? hex('#7DFFB8') : hex('#0B5B3A'));
    gl.uniform1f(this.up.uA, ptsA * (dark ? 0.9 : 0.8));
    for (var j = 0; j < 4; j++) { gl.bindBuffer(gl.ARRAY_BUFFER, this.bufs[j].pts); gl.enableVertexAttribArray(this.lp.a[j]); gl.vertexAttribPointer(this.lp.a[j], 3, gl.FLOAT, false, 0, 0); }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.rb); gl.enableVertexAttribArray(this.lp.r); gl.vertexAttribPointer(this.lp.r, 1, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, this.n);
    for (var q = 0; q < 4; q++) gl.disableVertexAttribArray(this.lp.a[q]);
    gl.disableVertexAttribArray(this.lp.r);
    gl.depthMask(true);
  };
  window.StForms = Forms;
})();
