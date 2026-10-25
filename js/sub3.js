(function () {
  var c = document.getElementById('game'); if (!c) return;
  var x = c.getContext('2d'), W, H, dpr, keys = {}, blocks = [], parts = [], S = null, mouseX = null, ac = null;

  function beep(f, d, type) {
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || 'square'; o.frequency.value = f;
      g.gain.value = .05; o.connect(g); g.connect(ac.destination);
      o.start(); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + (d || .08));
      o.stop(ac.currentTime + (d || .08));
    } catch (e) {}
  }
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size(); addEventListener('resize', size);

  function reset() {
    S = { run: false, score: 0, lives: 3, lvl: 1, sp: 0, px: W / 2, py: H - 42, r: 16, t: 0, cd: 700, best: +(localStorage.getItem('ax_best') || 0) };
    blocks = []; parts = []; upd();
    document.getElementById('best').textContent = S.best;
  }
  function upd() {
    document.getElementById('score').textContent = S.score;
    document.getElementById('lvl').textContent = S.lvl;
    document.getElementById('lives').textContent = '♥'.repeat(Math.max(S.lives, 0)) || '—';
  }
  reset();

  document.getElementById('start').onclick = function () {
    document.getElementById('ov').classList.add('hide');
    reset(); S.run = true; beep(660, .12);
  };

  addEventListener('keydown', function (e) {
    keys[e.key] = true;
    if (['ArrowLeft','ArrowRight','a','d'].indexOf(e.key) > -1) e.preventDefault();
    if (e.key === ' ' && S && !S.run) document.getElementById('start').click();
  });
  addEventListener('keyup', function (e) { keys[e.key] = false; });
  c.addEventListener('pointermove', function (e) { mouseX = e.clientX - c.getBoundingClientRect().left; });

  function burst(px, py, col) {
    for (var i = 0; i < 14; i++) parts.push({ x: px, y: py, vx: (Math.random()-.5)*4, vy: (Math.random()-.5)*4, l: 1, c: col });
  }

  function loop() {
    requestAnimationFrame(loop);
    x.clearRect(0, 0, W, H);

    // rejilla
    x.strokeStyle = 'rgba(0,240,255,.07)'; x.lineWidth = 1;
    for (var gx = 0; gx < W; gx += 44) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, H); x.stroke(); }
    for (var gy = 0; gy < H; gy += 44) { x.beginPath(); x.moveTo(0, gy); x.lineTo(W, gy); x.stroke(); }

    if (S && S.run) {
      S.t += 16;
      if (keys.ArrowLeft || keys.a) S.px -= 7;
      if (keys.ArrowRight || keys.d) S.px += 7;
      if (mouseX !== null) S.px += (mouseX - S.px) * .22;
      S.px = Math.max(S.r, Math.min(W - S.r, S.px));

      S.sp += 16;
      if (S.sp > S.cd) {
        S.sp = 0;
        var bad = Math.random() < .32;
        blocks.push({ x: 20 + Math.random() * (W - 40), y: -20, r: 13, bad: bad, v: 2 + S.lvl * .55 });
      }

      for (var i = blocks.length - 1; i >= 0; i--) {
        var b = blocks[i]; b.y += b.v;
        if (b.y > H + 30) { blocks.splice(i, 1); if (!b.bad) { S.lives--; burst(b.x, H - 10, '255,45,85'); beep(180,.1,'sawtooth'); } }
        else {
          var dx = b.x - S.px, dy = b.y - S.py;
          if (dx*dx + dy*dy < (b.r + S.r) * (b.r + S.r)) {
            blocks.splice(i, 1);
            if (b.bad) { S.lives--; burst(b.x, b.y, '255,45,85'); beep(160,.12,'sawtooth'); }
            else {
              S.score += 10 * S.lvl; burst(b.x, b.y, '0,240,255'); beep(520 + S.score, .07);
              if (S.score > 0 && S.score % 150 === 0) { S.lvl++; S.cd = Math.max(280, S.cd - 70); beep(880,.15); }
              if (S.score > S.best) { S.best = S.score; localStorage.setItem('ax_best', S.best); document.getElementById('best').textContent = S.best; }
            }
            upd();
          }
        }
      }
      if (S.lives <= 0) {
        S.run = false;
        document.getElementById('ov').classList.remove('hide');
        document.querySelector('#ov h3').textContent = 'FIN · ' + S.score;
        document.querySelector('#ov h3').dataset.text = 'FIN · ' + S.score;
        document.querySelector('#start span').textContent = 'REINTENTAR';
      }
    }

    // bloques
    blocks.forEach(function (b) {
      x.save(); x.shadowBlur = 18;
      x.shadowColor = b.bad ? '#ff2d55' : '#00f0ff';
      x.fillStyle = b.bad ? 'rgba(255,45,85,.85)' : 'rgba(0,240,255,.85)';
      x.beginPath(); x.roundRect ? x.roundRect(b.x - b.r, b.y - b.r, b.r*2, b.r*2, 5) : x.rect(b.x - b.r, b.y - b.r, b.r*2, b.r*2);
      x.fill(); x.restore();
    });

    // partículas
    for (var p = parts.length - 1; p >= 0; p--) {
      var q = parts[p]; q.x += q.vx; q.y += q.vy; q.l -= .035;
      if (q.l <= 0) { parts.splice(p, 1); continue; }
      x.globalAlpha = q.l; x.fillStyle = 'rgb(' + q.c + ')';
      x.beginPath(); x.arc(q.x, q.y, 2.6, 0, 6.283); x.fill(); x.globalAlpha = 1;
    }

    // nave
    if (S) {
      x.save(); x.translate(S.px, S.py);
      x.shadowBlur = 24; x.shadowColor = '#b6ff00';
      x.fillStyle = '#b6ff00';
      x.beginPath(); x.moveTo(0, -18); x.lineTo(15, 14); x.lineTo(0, 7); x.lineTo(-15, 14); x.closePath(); x.fill();
      x.restore();
    }
  }
  loop();
})();