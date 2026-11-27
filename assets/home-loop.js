// The homepage's stage: three AIs take turns over one vault. Claude files a note and a task, ChatGPT finds them, a
// local model ticks the task off; then it starts again. An AI's name jumps to its scene; the round button pauses.
// It plays only while it is on screen. With reduce-motion, or a screen slow to redraw, nothing plays: each name
// shows its scene's last frame. Without this script the page shows the first scene's last frame.
(function () {
  var stage = document.querySelector(".stage");
  if (!stage) return;
  var picks = [].slice.call(stage.querySelectorAll(".ai-pick button"));
  var you = stage.querySelector(".you"), it = stage.querySelector(".it"), who = stage.querySelector(".who"), txt = stage.querySelector(".txt");
  var pause = stage.querySelector(".pause");
  var still = matchMedia("(prefers-reduced-motion: reduce), (update: slow)");
  // each scene: who is talking, what is said, the vault before and after, and whether a note comes down
  var scenes = [
    { who: "Claude", you: you.textContent, it: txt.textContent, before: "before", after: "landed", drop: true },
    { who: "ChatGPT", you: "What did I say about the garden?",
      it: "The seed library box goes by the garden gate. Still open: ask Maya about hosting.", before: "landed", after: "found" },
    { who: "Local model, on your own machine", you: "Maya said yes. Tick that off.",
      it: "Done. “Ask Maya about hosting” is ticked off.", before: "landed", after: "done" }
  ];
  // The chat keeps the height of its tallest scene, at any width: each scene is also laid out unseen in the same
  // place, so nothing below moves when the scene changes.
  var live = stage.querySelector(".scene");
  scenes.forEach(function (s) {
    var sizer = live.cloneNode(true);
    sizer.classList.add("sizer");
    sizer.setAttribute("aria-hidden", "true");
    sizer.querySelector(".you").textContent = s.you;
    sizer.querySelector(".who").textContent = s.who;
    sizer.querySelector(".txt").textContent = s.it;
    live.parentNode.appendChild(sizer);
  });
  var WORD = 42;                 // ms between words, the same as the stylesheet's step
  var turn = 0, at = 0, paused = false, seen = false;

  function words(el, s) {        // the sentence as words that arrive one after another (the stylesheet times them)
    el.textContent = "";
    var list = s.split(" ");
    list.forEach(function (w, i) {
      var sp = document.createElement("span");
      sp.className = "w"; sp.style.setProperty("--i", i); sp.textContent = i < list.length - 1 ? w + " " : w;
      el.appendChild(sp);
    });
    return list.length;
  }
  function wait(ms, mine) {      // resolves only if no other scene has started since
    return new Promise(function (ok) { setTimeout(function () { if (mine === turn) ok(); }, ms); });
  }
  function select(i) {
    at = i;
    picks.forEach(function (b, n) { b.setAttribute("aria-pressed", n === i ? "true" : "false"); });
  }
  function show(i) {             // a scene's last frame, at once
    var s = scenes[i];
    turn++; select(i);
    stage.classList.remove("dropping");
    words(you, s.you); who.textContent = s.who; words(txt, s.it);
    you.classList.add("typed"); it.classList.add("typed");
    stage.dataset.vault = s.after;
  }
  async function play(i) {
    var mine = ++turn, s = scenes[i];
    select(i);
    stage.classList.remove("dropping");
    you.classList.remove("typed"); it.classList.remove("typed");
    stage.dataset.vault = s.before;
    var n = words(you, s.you); who.textContent = s.who; var m = words(txt, s.it);
    await wait(350, mine);
    you.classList.add("typed");
    await wait(500 + n * WORD, mine);
    if (s.drop) { stage.classList.add("dropping"); await wait(1250, mine); }
    stage.dataset.vault = s.after;
    await wait(500, mine);
    it.classList.add("typed");
    await wait(2600 + m * WORD, mine);
    play((i + 1) % scenes.length);
  }
  function running() { return seen && !paused && !still.matches && !document.hidden; }
  function resume() { if (running()) play((at + 1) % scenes.length); else show(at); }

  picks.forEach(function (b, i) {
    b.addEventListener("click", function () { if (running()) play(i); else show(i); });
  });
  pause.addEventListener("click", function () {
    paused = !paused;
    pause.classList.toggle("is-paused", paused);
    pause.setAttribute("aria-label", paused ? "Play" : "Pause");
    resume();
  });
  function fit() { pause.hidden = still.matches; resume(); }
  still.addEventListener("change", fit);
  document.addEventListener("visibilitychange", resume);
  new IntersectionObserver(function (e) {
    var now = e[e.length - 1].isIntersecting;
    if (now === seen) return;
    seen = now;
    if (seen && running()) play(0); else show(at);
  }, { threshold: 0.35 }).observe(stage);
  pause.hidden = still.matches;
  stage.classList.add("is-live");   // the names do something now
})();
