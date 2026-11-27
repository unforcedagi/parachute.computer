// A docs page with `tabs` in its front matter (Connect your AI): each listed section, its h2 and what follows up to
// the next h2, becomes a panel with a tab; one shows at a time. A #fragment that names a tab's section, or anything
// inside one, opens that tab. Without this script the sections simply follow one another. The markdown twin is
// untouched: an AI reads every section.
(function () {
  var art = document.querySelector("article.doc[data-tabs]");
  if (!art) return;
  var spec = JSON.parse(art.dataset.tabs).filter(function (t) { return document.getElementById(t.id); });
  if (spec.length < 2) return;
  var list = document.createElement("div"), tabs = [], panels = [];
  list.className = "doc-tabs";
  list.setAttribute("role", "tablist");
  list.setAttribute("aria-label", "Which AI");
  spec.forEach(function (t) {
    var h = document.getElementById(t.id), panel = document.createElement("section");
    panel.className = "tab-panel";
    panel.id = "panel-" + t.id;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", "tab-" + t.id);
    panel.tabIndex = 0;
    h.parentNode.insertBefore(panel, h);
    for (var n = h, next; n && !(n !== h && n.tagName === "H2"); n = next) { next = n.nextElementSibling; panel.appendChild(n); }
    var tab = document.createElement("button"), name = document.createElement("b"), lvl = document.createElement("span");
    tab.type = "button"; tab.id = "tab-" + t.id;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panel.id);
    name.textContent = t.name; lvl.textContent = t.label; lvl.className = "lvl lvl-" + t.level;
    tab.appendChild(name); tab.appendChild(lvl);
    list.appendChild(tab); tabs.push(tab); panels.push(panel);
  });
  // the tabs and their panels in one box: a hidden heading is placed at its top (the stylesheet), so the browser's
  // own jump to "#chatgpt" lands with the tabs in view
  var set = document.createElement("div");
  set.className = "tab-set";
  panels[0].parentNode.insertBefore(set, panels[0]);
  set.appendChild(list);
  panels.forEach(function (p) { set.appendChild(p); });
  art.classList.add("tabbed");

  function select(i, focus) {
    tabs.forEach(function (tab, n) {
      tab.setAttribute("aria-selected", n === i ? "true" : "false");
      tab.tabIndex = n === i ? 0 : -1;
      panels[n].hidden = n !== i;
    });
    dispatchEvent(new Event("sectionschange"));   // "On this page" marks the section now open
    if (focus) tabs[i].focus();
  }
  function fromHash() {          // the tab whose section holds the address's #fragment, if any
    var el = null;
    try { el = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { /* not a name */ }
    var i = el ? panels.findIndex(function (p) { return p.contains(el); }) : -1;
    if (i < 0) return false;
    select(i);
    // the browser's own jump found nothing to land on while the section was hidden
    (el.tagName === "H2" ? list : el).scrollIntoView();
    return true;
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { select(i); history.replaceState(null, "", "#" + spec[i].id); });
    tab.addEventListener("keydown", function (e) {
      var to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      to = (to + tabs.length) % tabs.length;
      select(to, true); history.replaceState(null, "", "#" + spec[to].id);
    });
  });
  addEventListener("hashchange", fromHash);
  if (!fromHash()) select(0);
})();
