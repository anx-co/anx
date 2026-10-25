/* AX // auth.js — login obligatorio + SHA-256 en JS puro (sin dependencias) */
(function () {
  'use strict';
  var cfg = window.AX_AUTH || {};
  var KEY = 'ax_session_v1';
  var gate = document.getElementById('gate');
  var priv = document.getElementById('private');
  var form = document.getElementById('gateForm');
  var inp = document.getElementById('pw');
  var msg = document.getElementById('gateMsg');
  var lock = document.getElementById('lockIcon');
  var bars = document.querySelectorAll('#attempts i');
  var fails = 0, lockUntil = 0;

  /* ---------- SHA-256 ---------- */
  function rr(v, n) { return ((v >>> n) | (v << (32 - n))) >>> 0; }
  function sha256Hex(msg) {
    var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var b = new TextEncoder().encode(msg), l = b.length;
    var total = l + 9; total = ((total + 63) >> 6) << 6;
    var d = new Uint8Array(total); d.set(b); d[l] = 0x80;
    var bits = l * 8, hi = Math.floor(bits / 4294967296), lo = bits >>> 0;
    d[total-8]=hi>>>24&255; d[total-7]=hi>>>16&255; d[total-6]=hi>>>8&255; d[total-5]=hi&255;
    d[total-4]=lo>>>24&255; d[total-3]=lo>>>16&255; d[total-2]=lo>>>8&255; d[total-1]=lo&255;
    var w = new Uint32Array(64);
    for (var i = 0; i < total; i += 64) {
      for (var j = 0; j < 16; j++) w[j] = (d[i+j*4]<<24)|(d[i+j*4+1]<<16)|(d[i+j*4+2]<<8)|d[i+j*4+3];
      for (var j2 = 16; j2 < 64; j2++) {
        var s0 = rr(w[j2-15],7) ^ rr(w[j2-15],18) ^ (w[j2-15]>>>3);
        var s1 = rr(w[j2-2],17) ^ rr(w[j2-2],19) ^ (w[j2-2]>>>10);
        w[j2] = (w[j2-16] + s0 + w[j2-7] + s1) >>> 0;
      }
      var a=H[0],bb=H[1],c=H[2],dd=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
      for (var k = 0; k < 64; k++) {
        var S1 = rr(e,6)^rr(e,11)^rr(e,25);
        var ch = ((e & f) ^ ((~e) & g)) >>> 0;
        var t1 = (h + S1 + ch + K[k] + w[k]) >>> 0;
        var S0 = rr(a,2)^rr(a,13)^rr(a,22);
        var maj = ((a & bb) ^ (a & c) ^ (bb & c)) >>> 0;
        var t2 = (S0 + maj) >>> 0;
        h=g; g=f; f=e; e=(dd+t1)>>>0; dd=c; c=bb; bb=a; a=(t1+t2)>>>0;
      }
      H[0]=(H[0]+a)>>>0; H[1]=(H[1]+bb)>>>0; H[2]=(H[2]+c)>>>0; H[3]=(H[3]+dd)>>>0;
      H[4]=(H[4]+e)>>>0; H[5]=(H[5]+f)>>>0; H[6]=(H[6]+g)>>>0; H[7]=(H[7]+h)>>>0;
    }
    return H.map(function (v) { return ('00000000' + v.toString(16)).slice(-8); }).join('');
  }
  window.axSha256 = sha256Hex;

  function digest(pw) { var s = cfg.SALT || ''; return sha256Hex(s + pw + s); }
  function matches(pw) {
    if (cfg.HASH && cfg.HASH.length === 64) return digest(pw) === cfg.HASH.toLowerCase();
    return pw === (cfg.PLAIN || '');
  }

  /* ---------- sesión ---------- */
  function saveSession() {
    try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), min: cfg.SESSION_MIN || 120 })); } catch (e) {}
  }
  function hasSession() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (!o) return false;
      if (Date.now() > o.t + (o.min || 120) * 60000) { localStorage.removeItem(KEY); return false; }
      return true;
    } catch (e) { return false; }
  }
  function unlock(silent) {
    if (gate) gate.classList.add('open');
    if (priv) { priv.classList.remove('hide'); setTimeout(function () { priv.classList.add('in'); }, 60); }
    if (lock) lock.classList.add('ok');
    document.body.classList.add('unlocked');
    if (!silent) {
      var b = document.querySelectorAll('.bar i');
      b.forEach(function (el, i) { setTimeout(function () { el.style.width = el.dataset.w + '%'; }, 120 * i); });
    }
  }

  if (hasSession()) unlock(true);

  /* ---------- formulario ---------- */
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (Date.now() < lockUntil) {
      msg.textContent = 'BLOQUEADO · espera ' + Math.ceil((lockUntil - Date.now()) / 1000) + 's';
      return;
    }
    var pw = (inp.value || '');
    if (!pw) { msg.textContent = 'ESCRIBE LA CONTRASEÑA'; return; }
    if (matches(pw)) {
      msg.textContent = 'ACCESO CONCEDIDO · HASH OK';
      saveSession(); unlock(false);
    } else {
      fails++;
      bars.forEach(function (b, i) { if (i < fails) b.classList.add('used'); });
      if (form) form.classList.add('shake');
      setTimeout(function () { form.classList.remove('shake'); }, 500);
      if (fails >= (cfg.MAX_ATTEMPTS || 5)) {
        fails = 0; lockUntil = Date.now() + (cfg.LOCK_SECONDS || 20) * 1000;
        msg.textContent = 'DEMASIADOS INTENTOS · BLOQUEADO ' + (cfg.LOCK_SECONDS || 20) + 's';
        (function cd() {
          if (Date.now() >= lockUntil) { bars.forEach(function (b) { b.classList.remove('used'); }); msg.textContent = 'DESBLOQUEADO'; return; }
          msg.textContent = 'BLOQUEADO · ' + Math.ceil((lockUntil - Date.now()) / 1000) + 's';
          setTimeout(cd, 400);
        })();
      } else {
        msg.textContent = 'CONTRASEÑA INCORRECTA (' + fails + '/' + (cfg.MAX_ATTEMPTS || 5) + ')';
      }
      inp.value = ''; inp.focus();
    }
  });

  var eye = document.getElementById('eye');
  if (eye) eye.onclick = function () {
    inp.type = inp.type === 'password' ? 'text' : 'password';
    eye.textContent = inp.type === 'password' ? '◉' : '◎';
  };

  var out = document.getElementById('logout');
  if (out) out.onclick = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.reload();
  };
})();