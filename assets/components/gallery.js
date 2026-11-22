// The Components page's gallery: the link to the app's drawing of every part (parts.html) becomes the drawing itself,
// in a window, with a choice of look and of light or dark. A choice writes that look's tokens, as the app writes them
// (looks.json, from theme.ts), into the frame's `#taste` style: the same parts, restyled in place.
(function () {
  var link = document.querySelector('.doc-body p > a[href$="/assets/components/parts.html"]:only-child');
  if (!link) return;
  var LOOKS = [
    ["paper", "Paper", "the default: hairlines, soft corners, a card lifted a little, boxed fields."],
    ["almanac", "Almanac", "ink rules, dotted rows, a printed card, a line to write on."],
    ["book", "Book", "a printed page: no raised parts, a double rule, small capitals."],
    ["daylight", "Daylight", "black on white for an e-paper screen: heavier rules, no tints or shadows, nothing moves."],
  ];
  // what the frame needs on this page: the code is beside each part below, so not in the frame too
  var EXTRA = ".part > pre{display:none}";
  // light or dark follows the reader's device until they choose
  var dark = matchMedia("(prefers-color-scheme: dark)"), chosen = false;
  var state = { look: "paper", scheme: dark.matches ? "dark" : "light" };
  dark.addEventListener("change", function () { if (!chosen) { state.scheme = dark.matches ? "dark" : "light"; paint(); } });
  var data = null;

  var fig = document.createElement("figure");
  fig.className = "parts-gallery";
  var bar = document.createElement("div");
  bar.className = "pg-bar";
  function group(label, items, key) {
    var g = document.createElement("div");
    g.className = "pg-seg";
    g.setAttribute("role", "group");
    g.setAttribute("aria-label", label);
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = it[1];
      b.dataset[key] = it[0];
      b.addEventListener("click", function () { state[key] = it[0]; if (key === "scheme") chosen = true; paint(); });
      g.appendChild(b);
    });
    bar.appendChild(g);
  }
  group("Look", LOOKS, "look");
  group("Light or dark", [["light", "Light"], ["dark", "Dark"]], "scheme");
  var win = document.createElement("div");
  win.className = "pg-window";
  var frame = document.createElement("iframe");
  frame.title = "Every part, drawn by the app";
  frame.src = link.getAttribute("href");
  win.appendChild(frame);
  var cap = document.createElement("figcaption");
  cap.setAttribute("aria-live", "polite");
  fig.append(bar, win, cap);
  link.parentNode.replaceWith(fig);

  function paint() {
    bar.querySelectorAll("button").forEach(function (b) {
      var on = b.dataset.look ? b.dataset.look === state.look : b.dataset.scheme === state.scheme;
      b.setAttribute("aria-pressed", String(on));
    });
    var info = LOOKS.find(function (l) { return l[0] === state.look; });
    cap.innerHTML = "";
    var b = document.createElement("b");
    b.textContent = info[1];
    cap.append(b, ", " + info[2]);
    fig.dataset.look = state.look;
    fig.dataset.scheme = state.scheme;
    var doc = frame.contentDocument;
    if (!data || !doc || !doc.getElementById("taste")) return;
    var t = data.looks[state.look] && data.looks[state.look][state.scheme];
    if (!t) return;
    doc.getElementById("taste").textContent = t.css + EXTRA;
    doc.documentElement.dataset.motion = t.motion;
    // the window's own ground is the look's, so nothing else shows around the frame as it redraws
    var ground = getComputedStyle(doc.body).backgroundColor;
    if (ground !== "rgba(0, 0, 0, 0)") win.style.background = ground;
  }

  // the two buttons in the drawing that would show a toast and a drawer: drawn with the parts' own classes, as the kit does
  function wire() {
    var doc = frame.contentDocument;
    if (!doc || doc.__wired) return;
    doc.__wired = true;
    doc.addEventListener("submit", function (e) { e.preventDefault(); }, true);
    doc.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (a) { e.preventDefault(); return; }
      var btn = e.target.closest("button");
      if (!btn) return;
      if (btn.textContent.trim() === "Show a toast") toast(doc);
      else if (btn.textContent.trim() === "Open the drawer") drawer(doc, btn);
    });
  }
  function later(fn, ms) { return setTimeout(fn, ms); }
  function twoFrames(fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); }
  function ms(doc, name) { return parseFloat(getComputedStyle(doc.documentElement).getPropertyValue(name)) || 0; }
  function toast(doc) {
    // one host, as the kit keeps; a new toast takes the place of the one showing
    var host = doc.querySelector(".pa-toasts");
    if (!host) { host = doc.createElement("div"); host.className = "pa-toasts"; host.setAttribute("role", "status"); doc.body.appendChild(host); }
    host.textContent = "";
    var t = doc.createElement("div");
    t.className = "pa-toast";
    t.dataset.state = "before";
    t.textContent = "Saved";
    host.appendChild(t);
    twoFrames(function () { t.dataset.state = "in"; });
    later(function () { t.dataset.state = "gone"; later(function () { t.remove(); }, ms(doc, "--t-sheet") + 50); }, 2000);
  }
  function drawer(doc, opener) {
    if (doc.querySelector('.pa-drawer-scrim:not([data-state="gone"])')) return;
    var scrim = doc.createElement("div");
    scrim.className = "pa-drawer-scrim";
    scrim.dataset.state = "before";
    scrim.setAttribute("role", "presentation");
    scrim.innerHTML = '<section class="pa-drawer" role="dialog" aria-modal="true" tabindex="-1" aria-label="The Overstory">'
      + '<button type="button" class="pa-drawer-grip" aria-label="Close"></button>'
      + '<header class="pa-drawer-head"><h2 class="pa-drawer-title">The Overstory</h2></header>'
      + '<div class="pa-drawer-body"><p>Richard Powers, 2018. Lent to Mira on Friday.</p></div></section>';
    doc.body.appendChild(scrim);
    var sheet = scrim.firstChild;
    function close() {
      if (scrim.dataset.state === "gone") return;
      scrim.dataset.state = "gone";
      doc.removeEventListener("keydown", esc);
      later(function () { scrim.remove(); }, ms(doc, "--t-sheet") + 50);
      opener.focus();
    }
    function esc(e) { if (e.key === "Escape") close(); }
    scrim.addEventListener("click", function (e) { if (e.target === scrim || e.target.closest(".pa-drawer-grip")) close(); });
    doc.addEventListener("keydown", esc);
    twoFrames(function () { scrim.dataset.state = "open"; sheet.focus(); });
  }

  frame.addEventListener("load", function () { wire(); paint(); });
  fetch("/assets/components/looks.json").then(function (r) { return r.json(); }).then(function (d) { data = d; paint(); });
  paint();
})();
