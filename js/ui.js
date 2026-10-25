/* AX // ui.js — fondo, partículas, cursor, video, animaciones compartidas */
(function () {
  'use strict';
  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. VIDEO DE FONDO con cadena de respaldo ---------- */
  (function () {
    var v = document.getElementById('vid'); if (!v) return;
    var srcs = ['files/video1.mp4', 'files/video1.webm', 'files/video1.mov',
                'files/video1.m4v', 'files/video1.ogv', 'files/video1.mp3'];
    var i = 0, ok = false;
    function next() {
      if (ok || i >= srcs.length) { if (!ok) document.body.classList.add('no-video'); return; }
      var s = srcs[i++];
      var t = setTimeout(function () { if (!ok) next(); }, 1600);
      v.onerror = function () { clearTimeout(t); if (!ok) next(); };
      v.onplaying = function () { ok = true; clearTimeout(t); document.body.classList.add('has-video'); };
      v.src = s; try { v.load(); } catch (e) {}
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }
    next();
    document.addEventListener('click', function once() {
      var p = v.play(); if (p && p.catch) p.catch(function () {});
      document.removeEventListener('click', once);
    });
  })();

  /* ---------- 2. PARTÍCULAS ---------- */
  (function () {
    var c = document.getElementById('fx'); if (!c || REDUCED) return;
    var x = c.getContext('2d'), W, H, dpr, P = [], hue = 0, M = { x: -999, y: -999 };
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr;
      c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(110, innerWidth / 13));
      P = [];
      for (var i = 0; i < n; i++) P.push({
        x: Math.random() * innerWidth, y: Math.random() * innerHeight,
        vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
        r: Math.random() * 1.9 + .6
      });
    }
    size(); addEventListener('resize', size);
    addEventListener('mousemove', function (e) { M.x = e.clientX; M.y = e.clientY; });
    addEventListener('mouseout', function () { M.x = M.y = -999; });

    function loop() {
      x.clearRect(0, 0, innerWidth, innerHeight);
      hue = (hue + .25) % 360;
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.x += p.vx; p.y += p.vy;
        var dx = p.x - M.x, dy = p.y - M.y, d2 = dx * dx + dy * dy;
        if (d2 < 20000) { var f = (1 - d2 / 20000) * .9; p.x += dx * f * .04; p.y += dy * f * .04; }
        if (p.x < 0) p.x = innerWidth; if (p.x > innerWidth) p.x = 0;
        if (p.y < 0) p.y = innerHeight; if (p.y > innerHeight) p.y = 0;
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283);
        x.fillStyle = 'hsla(' + ((hue + i * 7) % 360) + ',100%,65%,.75)';
        x.fill();
      }
      for (var a = 0; a < P.length; a++) for (var b = a + 1; b < P.length; b++) {
        var ax = P[a].x - P[b].x, ay = P[a].y - P[b].y, dd = ax * ax + ay * ay;
        if (dd < 15000) {
          x.beginPath(); x.moveTo(P[a].x, P[a].y); x.lineTo(P[b].x, P[b].y);
          x.strokeStyle = 'hsla(' + ((hue + a * 5) % 360) + ',100%,60%,' + (0.18 * (1 - dd / 15000)) + ')';
          x.lineWidth = .7; x.stroke();
        }
      }
      requestAnimationFrame(loop);
    }
    loop();
  })();

  /* ---------- 3. CURSOR ---------- */
  (function () {
    if (matchMedia('(hover:none)').matches) return;
    var dot = document.getElementById('curDot'), ring = document.getElementById('curRing');
    if (!dot || !ring) return;
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)'; });
    (function f() { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)'; requestAnimationFrame(f); })();
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a,button,.tile,input,.term')) ring.classList.add('on'); else ring.classList.remove('on');
    });
  })();

  /* ---------- 4. BOOT ---------- */
  (function () {
    var boot = document.getElementById('boot'); if (!boot) return;
    var log = document.getElementById('bootLog'), bar = document.getElementById('bootBar');
    var lines = [
      '> ax.core ....... [ OK ]',
      '> gpu.rgb ........ [ OK ]',
      '> canvas.particles [ OK ]',
      '> sha256.module .. [ OK ]',
      '> subsistemas .... 4/4',
      '> listo.'
    ];
    var i = 0;
    (function step() {
      if (i < lines.length) {
        if (log) log.textContent += lines[i] + '\n';
        if (bar) bar.style.width = Math.round(((i + 1) / lines.length) * 100) + '%';
        i++; setTimeout(step, 170);
      } else {
        setTimeout(function () { boot.classList.add('done'); reveal(); }, 320);
      }
    })();
    setTimeout(function () { boot.classList.add('done'); reveal(); }, 3200);
  })();

  /* ---------- 5. REVEAL ---------- */
  function reveal() {
    var els = document.querySelectorAll('[data-rv]');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e, i) {
        if (e.isIntersecting) { setTimeout(function () { e.target.classList.add('in'); }, i * 90); io.unobserve(e.target); }
      });
    }, { threshold: .15 });
    els.forEach(function (e) { io.observe(e); });
  }
  if (!document.getElementById('boot')) reveal();

  /* ---------- 6. TILT 3D ---------- */
  document.querySelectorAll('[data-tilt]').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', ((px - .5) * 14).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((.5 - py) * 14).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (px * 100) + '%');
      el.style.setProperty('--my', (py * 100) + '%');
    });
    el.addEventListener('mouseleave', function () {
      el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg');
    });
  });

  /* ---------- 7. CONTADORES ---------- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseFloat(el.dataset.count), t0 = null;
    function tick(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { requestAnimationFrame(tick); }
    }, { threshold: .4 }).observe(el);
  });

  /* ---------- 8. TYPEWRITER ---------- */
  var ty = document.getElementById('typer');
  if (ty) {
    var txt = 'NÚCLEO RGB ACTIVO · 4 SUBSISTEMAS EN LÍNEA';
    var k = 0;
    (function t() {
      ty.textContent = txt.slice(0, k) + (k < txt.length ? '▌' : '');
      if (k++ < txt.length) setTimeout(t, 55);
    })();
  }

  /* ---------- 9. NAV / RELOJ / PARALLAX / AÑO ---------- */
  var burger = document.getElementById('burger'), links = document.getElementById('navLinks');
  if (burger && links) burger.onclick = function () { links.classList.toggle('open'); };

  var clock = document.getElementById('clock');
  if (clock) setInterval(function () {
    var d = new Date();
    clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (n) { return String(n).padStart(2, '0'); }).join(':');
  }, 1000);

  var par = document.querySelectorAll('[data-par]');
  if (par.length && !matchMedia('(hover:none)').matches) {
    addEventListener('mousemove', function (e) {
      var dx = (e.clientX / innerWidth - .5), dy = (e.clientY / innerHeight - .5);
      par.forEach(function (el) {
        var s = parseFloat(el.dataset.par) || 10;
        el.style.transform = 'translate(' + (-dx * s) + 'px,' + (-dy * s) + 'px)';
      });
    });
  }

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();