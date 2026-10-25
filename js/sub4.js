(function () {
  var body = document.getElementById('body'), inp = document.getElementById('cmd'); if (!body) return;
  var hist = [], hp = -1, mx = document.getElementById('matrix'), mctx = mx.getContext('2d'), cols = [], mrunning = false, drops = [];

  function out(t, cls) {
    var d = document.createElement('div');
    d.className = 'out ' + (cls || ''); d.textContent = t;
    body.appendChild(d); body.scrollTop = body.scrollHeight;
  }
  function type(t, cls) {
    var d = document.createElement('div'); d.className = 'out ' + (cls || '');
    body.appendChild(d); var i = 0;
    (function s() { d.textContent = t.slice(0, ++i); body.scrollTop = body.scrollHeight; if (i < t.length) setTimeout(s, 12); })();
  }

  type('AX-OS v4.1 — núcleo holográfico', 'ok');
  type('Escribe "ayuda" para ver los comandos disponibles.', 'out');

  var CMDS = {
    ayuda: function () { out('comandos:\n  ayuda      esta lista\n  ax         quién soy\n  quien      usuario actual\n  fecha      fecha y hora\n  estado     estado del núcleo\n  color      cambia el acento\n  matrix     lluvia on/off\n  grito      ...\n  clear      limpia', 'out'); },
    help: function () { CMDS.ayuda(); },
    ax: function () { out('AX — interfaz holográfica RGB con 4 subsistemas y acceso cifrado SHA-256.', 'ok'); },
    quien: function () { out('operador@ax · uid 001 · privilegios: totales', 'ok'); },
    whoami: function () { CMDS.quien(); },
    fecha: function () { out(new Date().toLocaleString('es-ES')); },
    date: function () { CMDS.fecha(); },
    estado: function () { out('[ok] núcleo ....... estable\n[ok] rgb .......... activo\n[ok] sha256 ....... listo\n[ok] subsistemas .. 4/4', 'ok'); },
    status: function () { CMDS.estado(); },
    color: function () {
      var h = Math.floor(Math.random() * 360);
      document.documentElement.style.setProperty('--cy', 'hsl(' + h + ',100%,60%)');
      document.documentElement.style.setProperty('--mg', 'hsl(' + ((h + 120) % 360) + ',100%,60%)');
      out('acento reajustado → hsl(' + h + ')', 'ok');
    },
    matrix: function () {
      mrunning = !mrunning; mx.classList.toggle('on', mrunning);
      out('matrix ' + (mrunning ? 'ACTIVADA' : 'DESACTIVADA'), 'ok');
    },
    grito: function () { out('¡AX! ¡AX! ¡AX!'); },
    clear: function () { body.innerHTML = ''; },
    limpia: function () { CMDS.clear(); },
    hack: function () {
      var l = ['> conectando a 10.0.0.1 …', '> eludiento firewall … ok', '> inyectando rgb … ok', '> ACCESO TOTAL CONCEDIDO'];
      l.forEach(function (t, i) { setTimeout(function () { out(t, 'er'); }, i * 380); });
    },
    salir: function () { out('cerrando sesión de consola… (sigue abierta, tranquilo)', 'ok'); }
  };

  function run(raw) {
    var line = raw.trim(); if (!line) return;
    var d = document.createElement('div'); d.className = 'you';
    d.textContent = 'ax@nucleo:~$ ' + line; body.appendChild(d);
    var c = line.split(' ')[0].toLowerCase();
    if (CMDS[c]) CMDS[c](line); else out('comando no reconocido: "' + c + '" → prueba "ayuda"', 'er');
    body.scrollTop = body.scrollHeight;
  }

  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { var v = inp.value; inp.value = ''; if (v.trim()) { hist.push(v); hp = hist.length; } run(v); }
    else if (e.key === 'ArrowUp') { if (hp > 0) { hp--; inp.value = hist[hp]; } e.preventDefault(); }
    else if (e.key === 'ArrowDown') { if (hp < hist.length - 1) { hp++; inp.value = hist[hp]; } else { hp = hist.length; inp.value = ''; } e.preventDefault(); }
  });
  document.querySelector('.term').addEventListener('click', function () { inp.focus(); });
  inp.focus();

  /* matrix rain */
  function msize() { mx.width = innerWidth; mx.height = innerHeight; var n = Math.floor(innerWidth / 16); drops = []; for (var i = 0; i < n; i++) drops.push(Math.random() * innerHeight); }
  msize(); addEventListener('resize', msize);
  var glyph = 'アカサタナハマヤラワAX01<>{}#$%&';
  (function mloop() {
    requestAnimationFrame(mloop);
    if (!mrunning) { mctx.clearRect(0, 0, mx.width, mx.height); return; }
    mctx.fillStyle = 'rgba(4,5,10,.12)'; mctx.fillRect(0, 0, mx.width, mx.height);
    mctx.font = '15px monospace';
    for (var i = 0; i < drops.length; i++) {
      var ch = glyph[Math.floor(Math.random() * glyph.length)];
      mctx.fillStyle = Math.random() < .1 ? '#fff' : '#00f0ff';
      mctx.fillText(ch, i * 16, drops[i]);
      drops[i] += 16; if (drops[i] > mx.height && Math.random() > .975) drops[i] = 0;
    }
  })();
})();