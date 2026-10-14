/* MINO Grid — tiny playable 3x3 demo for the landing page.
   Strings come from data-* attributes on .toy so EN and AR share this file. */
(function () {
  var toy = document.querySelector(".toy");
  if (!toy) return;
  var inner = toy.querySelector(".board-inner");
  var movesEl = toy.querySelector(".moves");
  var statusEl = toy.querySelector(".status");
  var shuffleBtn = toy.querySelector("[data-shuffle]");
  var t = toy.dataset;

  var COLORS = { L: "#d6a2e8", R: "#f3a0d3", S: "#a9cef4" };
  var NAMES = { L: t.lav, R: t.rose, S: t.sky };
  var GOAL = ["L", "L", "L", "R", "R", "R", "S", "S", null];
  var N = 3, STEP = 34.67; // tile 30.66% + gap 4.01%

  var cells = GOAL.slice(); // index -> color key or null
  var tiles = [];           // DOM buttons, each tracks its own index
  var moves = 0;

  // build tiles once
  GOAL.forEach(function (key, i) {
    if (!key) return;
    var b = document.createElement("button");
    b.className = "tile";
    b.type = "button";
    b.style.background = COLORS[key];
    b._key = key;
    b._index = i;
    b.addEventListener("click", function () { tryMove(b); });
    inner.appendChild(b);
    tiles.push(b);
  });

  function emptyIndex() { return cells.indexOf(null); }
  function adjacent(a, b) {
    var ar = Math.floor(a / N), ac = a % N, br = Math.floor(b / N), bc = b % N;
    return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
  }
  function solved() {
    for (var i = 0; i < GOAL.length; i++) if (cells[i] !== GOAL[i]) return false;
    return true;
  }

  function render() {
    var e = emptyIndex();
    tiles.forEach(function (b) {
      var i = b._index;
      b.style.left = (i % N) * STEP + "%";
      b.style.top = Math.floor(i / N) * STEP + "%";
      var canMove = adjacent(i, e);
      b.classList.toggle("locked-out", !canMove);
      b.setAttribute("aria-label", NAMES[b._key] + (canMove ? " — " + t.slide : ""));
    });
    movesEl.textContent = t.moves.replace("%d", moves);
  }

  function tryMove(b) {
    var e = emptyIndex();
    if (!adjacent(b._index, e) || statusEl.classList.contains("win")) {
      b.classList.remove("nudge"); void b.offsetWidth; b.classList.add("nudge");
      return;
    }
    cells[e] = b._key; cells[b._index] = null; b._index = e;
    moves++;
    render();
    if (solved()) {
      statusEl.textContent = t.solved.replace("%d", moves);
      statusEl.classList.add("win");
    }
  }

  function shuffle() {
    cells = GOAL.slice();
    tiles.forEach(function (b) { b._index = GOAL.indexOf(b._key); });
    // place same-colour tiles on distinct starting cells
    var used = {};
    tiles.forEach(function (b) {
      for (var i = 0; i < GOAL.length; i++) if (GOAL[i] === b._key && !used[i]) { b._index = i; used[i] = 1; break; }
    });
    var prev = -1;
    for (var n = 0; n < 40 || solved(); n++) {
      var e = emptyIndex();
      var opts = [];
      for (var i = 0; i < 9; i++) if (adjacent(i, e) && i !== prev) opts.push(i);
      var pick = opts[Math.floor(Math.random() * opts.length)];
      var tile = tiles.filter(function (b) { return b._index === pick; })[0];
      cells[e] = cells[pick]; cells[pick] = null; tile._index = e;
      prev = e;
      if (n > 200) break;
    }
    moves = 0;
    statusEl.textContent = t.hint;
    statusEl.classList.remove("win");
    render();
  }

  shuffleBtn.addEventListener("click", shuffle);
  shuffle();
})();
