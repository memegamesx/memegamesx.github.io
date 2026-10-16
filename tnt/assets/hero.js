/* TNT — playable hold-to-grow demo for the landing page.
   Strings come from data-* attributes on .tnt-demo so EN and AR share this file. */
(function () {
  var box = document.querySelector(".tnt-demo");
  if (!box) return;
  var t = box.dataset, cv = box.querySelector("canvas"), x = cv.getContext("2d");
  var $s = box.querySelector(".tnt-score"), $b = box.querySelector(".tnt-best"), $fb = box.querySelector(".tnt-fb"), $h = box.querySelector(".tnt-hint");
  var C = { cyan: "#00F5D4", yellow: "#FFD93D", red: "#FF6B6B" };
  var PTS = { triangle: [[50,0],[100,100],[0,100]], pentagon: [[50,0],[100,38],[82,100],[18,100],[0,38]], hexagon: [[25,0],[75,0],[100,50],[75,100],[25,100],[0,50]], star: [[50,0],[62,33],[100,33],[70,55],[82,93],[50,68],[18,93],[30,55],[0,33],[38,33]], diamond: [[50,0],[100,50],[50,100],[0,50]] };
  var SHAPES = ["circle", "square", "triangle", "pentagon", "hexagon", "star", "diamond"];
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, dpr = 1;
  function fit() { var r = cv.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; }
  if (window.ResizeObserver) new ResizeObserver(fit).observe(cv); else addEventListener("resize", fit);
  fit();
  function path(k, s) {
    var h = s / 2; x.beginPath();
    if (k === "circle") { x.arc(0, 0, h, 0, Math.PI * 2); return; }
    if (k === "square") { var r = s * .12; x.moveTo(-h + r, -h); x.arcTo(h, -h, h, h, r); x.arcTo(h, h, -h, h, r); x.arcTo(-h, h, -h, -h, r); x.arcTo(-h, -h, h, -h, r); x.closePath(); return; }
    PTS[k].forEach(function (p, i) { var px = -h + p[0] / 100 * s, py = -h + p[1] / 100 * s; if (i) x.lineTo(px, py); else x.moveTo(px, py); });
    x.closePath();
  }
  var best = 0; try { best = +localStorage.getItem("tnt-demo-best") || 0; } catch (e) {}
  $b.textContent = best; $h.textContent = t.start;
  var st = { shape: "circle", target: 0, size: 0, hold: false, score: 0, chain: 0, tier: 1, hits: 0, outcome: null, at: 0, appear: 0, over: false, parts: [], time: 0, wait: 0 };
  function next() { var u = Math.min(Math.floor((st.tier - 1) / 2) + 2, 7); st.shape = SHAPES[Math.floor(Math.random() * u)]; st.target = Math.min(W, H) * (.36 + Math.random() * .14); st.size = 0; st.outcome = null; st.appear = st.time; }
  function speed() { return Math.min(W, H) * .2 * (1 + (st.tier - 1) * .2); }
  function burst(c, n) { var r = Math.max(st.size, 20) / 2; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2 + (Math.random() - .5) * .4, v = 90 + Math.random() * 130; st.parts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 0, m: .45 + Math.random() * .35, r: 2.5 + Math.random() * 2.5, c: c }); } }
  function show(title, color, line) {
    $fb.innerHTML = "";
    var s = document.createElement("strong"); s.textContent = title; s.style.color = color; s.style.textShadow = "0 0 14px " + color;
    var l = document.createElement("span"); l.textContent = line; l.dir = "ltr";
    $fb.appendChild(s); $fb.appendChild(l);
  }
  function judge() {
    var ratio = st.size / st.target, pct = (ratio * 100).toFixed(1) + "%"; st.at = st.time;
    if (ratio >= .85 && ratio < .98) {
      var close = ratio >= .95; st.chain = close ? st.chain + 1 : 0; var pts = close ? Math.min(1 + st.chain, 5) : 1;
      st.score += pts; st.hits++; if (st.hits % 4 === 0) st.tier++; st.outcome = close ? "close" : "almost";
      show(close ? t.close : t.almost, close ? C.yellow : C.cyan, "+" + pts + (st.chain > 1 ? " ×" + st.chain : "") + " · " + pct);
      burst(close ? C.yellow : C.cyan, close ? 28 : 18); st.wait = st.time + .5;
    } else {
      st.outcome = "miss"; st.chain = 0; st.over = true; burst(C.red, 10);
      var exact = ratio >= .98 && ratio <= 1.02;
      show(exact ? t.perfect : t.miss, C.red, (ratio < .85 ? t.small : exact ? t.exact : t.big) + " · " + pct);
      if (st.score > best) { best = st.score; $b.textContent = best; try { localStorage.setItem("tnt-demo-best", best); } catch (e) {} }
      $h.textContent = t.again;
    }
    $s.textContent = st.score;
  }
  function down(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (st.over) { st.over = false; st.score = 0; st.tier = 1; st.hits = 0; st.chain = 0; $s.textContent = 0; $fb.innerHTML = ""; $h.textContent = t.start; next(); return; }
    if (st.wait || st.hold || st.outcome) return;
    st.hold = true; $h.textContent = t.hold;
  }
  function up() { if (!st.hold) return; st.hold = false; judge(); }
  cv.addEventListener("pointerdown", function (e) { if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId); down(e); });
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("keydown", function (e) { if ((e.code === "Space" || e.code === "Enter") && !e.repeat) down(e); });
  cv.addEventListener("keyup", function (e) { if (e.code === "Space" || e.code === "Enter") up(); });
  cv.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  function glow(r) { if (st.outcome === "almost" || st.outcome === "close") return C.cyan; if (st.outcome === "miss") return C.red; if (r >= .98) return C.red; if (r >= .85) return C.cyan; if (r > .7) return C.yellow; return "#fff"; }
  var last = performance.now();
  function frame(now) {
    var dt = Math.min((now - last) / 1000, .05); last = now; st.time += dt;
    if (!st.target) next();
    if (st.wait && st.time >= st.wait) { st.wait = 0; $fb.innerHTML = ""; $h.textContent = t.next; next(); }
    if (st.hold) { st.size += speed() * dt; if (st.size > st.target * 1.5) { st.hold = false; judge(); } }
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H); x.translate(W / 2, H / 2 - 18);
    st.parts = st.parts.filter(function (p) { return (p.l += dt) < p.m; });
    st.parts.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - 2.5 * dt; p.vy *= 1 - 2.5 * dt; var k = p.l / p.m; x.globalAlpha = 1 - k; x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r * (1 - k / 2), 0, Math.PI * 2); x.fill(); });
    x.globalAlpha = 1;
    if (st.tier > 3 && !st.over && !reduce) x.translate(12 * Math.sin(st.time * Math.PI), -12 * Math.sin(st.time * Math.PI * .8));
    var ap = Math.min(1, (st.time - st.appear) / .3), as = .8 + .2 * (1 - Math.pow(1 - ap, 3)), so = st.time - st.at;
    x.globalAlpha = ap; x.save(); x.scale(as, as);
    x.setLineDash([4, 4]); x.lineWidth = 1; x.strokeStyle = "rgba(255,255,255,.1)"; path(st.shape, st.target * .85); x.stroke(); x.setLineDash([]);
    var tc = "rgba(255,255,255,.3)", ts = 1;
    if (st.outcome === "close" || st.outcome === "almost") { tc = st.outcome === "close" ? C.yellow : C.cyan; ts = 1 + .1 * Math.sin(Math.PI * Math.min(so / .3, 1)); x.shadowColor = tc; x.shadowBlur = 16; }
    else if (st.outcome === "miss") tc = C.red;
    x.save(); x.scale(ts, ts); x.lineWidth = 2; x.strokeStyle = tc; path(st.shape, st.target); x.stroke(); x.restore(); x.shadowBlur = 0;
    if (st.size > .5) {
      var r = st.size / st.target, c = glow(r), s = 1, sx = 0;
      if (st.outcome === "miss") { s = Math.max(0, 1 - so / .3); sx = 6 * Math.sin(so * 70) * s; } else if (st.outcome) s = 1 + .15 * Math.sin(Math.PI * Math.min(so / .4, 1));
      x.translate(sx, 0); x.shadowColor = c; x.shadowBlur = st.hold ? 30 : 16; x.fillStyle = c; path(st.shape, st.size * s); x.fill(); x.shadowBlur = 0;
      if (st.hold) { var pu = .5 + .5 * Math.sin(st.time * Math.PI * 2); x.fillStyle = "rgba(255,255,255," + (.15 + .15 * pu) + ")"; path(st.shape, st.size * .6 * (.8 + .2 * pu)); x.fill(); }
    } else if (!st.hold && !st.outcome) {
      var q = .5 + .5 * Math.sin(st.time * Math.PI * 2 / 1.5), rr = 6 * (1 + .2 * q); x.fillStyle = "rgba(255,255,255," + (.5 + .2 * q) + ")"; x.beginPath(); x.arc(0, 0, rr, 0, Math.PI * 2); x.fill();
    }
    x.restore();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
