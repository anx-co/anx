(function () {
  var cube = document.getElementById('cube'); if (!cube) return;
  var rx = -22, ry = -32, ax = .35, ay = .55, auto = true, scale = 1, drag = false, lx = 0, ly = 0;
  var speed = document.getElementById('speed'), sc = document.getElementById('scale'), hu = document.getElementById('hue');

  function apply() { cube.style.transform = 'scale(' + scale + ') rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)'; }
  function loop() {
    if (auto && !drag) { rx += ax; ry += ay; }
    apply(); requestAnimationFrame(loop);
  }
  loop();

  speed.oninput = function () {
    var v = this.value / 10; ax = .35 * v; ay = .55 * v;
    document.getElementById('vSpeed').textContent = v.toFixed(1) + 'x';
  };
  sc.oninput = function () {
    scale = this.value / 100; document.getElementById('vScale').textContent = scale.toFixed(1) + 'x';
  };
  hu.oninput = function () {
    document.getElementById('vHue').textContent = this.value + '°';
    cube.style.filter = 'hue-rotate(' + this.value + 'deg)';
  };
  document.getElementById('auto').onclick = function () { auto = true; };

  cube.addEventListener('pointerdown', function (e) { drag = true; auto = false; lx = e.clientX; ly = e.clientY; cube.setPointerCapture(e.pointerId); });
  cube.addEventListener('pointermove', function (e) {
    if (!drag) return;
    ry += (e.clientX - lx) * .5; rx -= (e.clientY - ly) * .5;
    lx = e.clientX; ly = e.clientY;
  });
  cube.addEventListener('pointerup', function () { drag = false; });
})();