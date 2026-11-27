#!/usr/bin/env node
// npm run check:pages: the built site (_site) in a real browser, used as a person would. Exits 1 on any failure.
// - the homepage's stage plays its three scenes (Claude files, ChatGPT finds, a local model ticks off), an AI's name
//   jumps to its scene, Pause holds it, and with reduce-motion nothing plays but every scene can still be seen;
// - Connect your AI shows one tab at a time, by click, by arrow key and by the address's #fragment, and without
//   script every section is simply there;
// - the docs page's "All N pages" lists every page of its door;
// - none of these pages scrolls sideways, at 320, 390 or 1280 wide, and the way in stays on screen.
// CHROMIUM_PATH=/usr/bin/chromium uses a browser already on the machine instead of Playwright's own.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const SITE = "_site";
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2", ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8" };
const server = http.createServer((req, res) => {
  let p = path.join(SITE, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!path.resolve(p).startsWith(path.resolve(SITE))) { res.writeHead(403).end(); return; }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  if (!fs.existsSync(p)) { res.writeHead(404).end("not found"); return; }
  res.writeHead(200, { "content-type": TYPES[path.extname(p)] || "application/octet-stream" }).end(fs.readFileSync(p));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const U = `http://127.0.0.1:${server.address().port}`;

const fails = [];
let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (e) { fails.push(`${name}: ${String(e.message || e).split("\n")[0]}`); }
}
const expect = (ok, what) => { if (!ok) throw new Error(what); };

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
async function open(url, { watch, ...opts } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...opts });
  const page = await ctx.newPage();
  // watch: record every state of the stage from the moment it exists
  if (watch) await page.addInitScript(() => {
    window.__states = [];
    new MutationObserver(() => {
      const stage = document.querySelector(".stage");
      if (!stage || stage.__watched) return;
      stage.__watched = true;
      window.__states.push(stage.dataset.vault);
      new MutationObserver(() => window.__states.push(stage.dataset.vault)).observe(stage, { attributes: true, attributeFilter: ["data-vault"] });
    }).observe(document, { childList: true, subtree: true });
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(U + url, { waitUntil: "load" });
  return { page, errors, close: () => ctx.close() };
}
const vault = (page) => page.locator(".stage").getAttribute("data-vault");
const pressed = (page) => page.locator('.ai-pick button[aria-pressed="true"]').innerText();

// ---- the homepage's stage ----
await check("home: the loop plays all three scenes and starts again", async () => {
  const { page, errors, close } = await open("/");
  // scene 1: the vault starts without the note, then Claude's note and task land in it
  await page.waitForFunction(() => document.querySelector(".stage").dataset.vault === "before", null, { timeout: 5000 });
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".rec.note")).opacity === "0", null, { timeout: 2000 })
    .catch(() => { throw new Error("the note is in the vault before it was said"); });
  await page.waitForFunction(() => document.querySelector(".stage").dataset.vault === "landed", null, { timeout: 8000 });
  expect((await pressed(page)) === "Claude", "scene 1 is not Claude's");
  // scene 2: ChatGPT finds them; scene 3: the local model ticks the task off
  await page.waitForFunction(() => document.querySelector(".stage").dataset.vault === "found", null, { timeout: 12000 });
  expect((await pressed(page)) === "ChatGPT", "scene 2 is not ChatGPT's");
  expect((await page.locator(".stage .scene:not(.sizer) .who").innerText()) === "ChatGPT", "the answer is not signed ChatGPT");
  await page.waitForFunction(() => document.querySelector(".stage").dataset.vault === "done", null, { timeout: 12000 });
  expect((await pressed(page)) === "Local model", "scene 3 is not the local model's");
  expect(await page.locator(".rec.task .done").isVisible(), "the task doesn't show as done");
  // and round again
  await page.waitForFunction(() => document.querySelector(".stage").dataset.vault === "before", null, { timeout: 12000 });
  expect(!errors.length, errors[0]);
  await close();
});
await check("home: an AI's name jumps to its scene, and Pause holds it", async () => {
  const { page, close } = await open("/");
  await page.getByRole("button", { name: "Local model" }).click();
  await page.waitForFunction(() => document.querySelector(".stage").dataset.vault === "done", null, { timeout: 8000 });
  await page.getByRole("button", { name: "Pause" }).click();
  expect(await page.getByRole("button", { name: "Play" }).isVisible(), "Pause didn't become Play");
  await page.waitForTimeout(7000);   // longer than any scene's hold: a loop still running would have moved on
  expect((await vault(page)) === "done" && (await pressed(page)) === "Local model", "the stage moved while paused");
  await page.getByRole("button", { name: "ChatGPT" }).click();
  expect((await vault(page)) === "found", "a name doesn't show its scene while paused");
  expect((await page.locator(".stage .scene:not(.sizer) .txt").innerText()).includes("garden gate"), "ChatGPT's answer isn't shown");
  await close();
});
await check("home: with reduce-motion nothing plays, and each scene can still be seen", async () => {
  // every state the stage passes through is kept from the first frame: a loop that played would empty the vault
  // ("before") within a second, and be back at "landed" by the time anyone looked
  const { page, close } = await open("/", { reducedMotion: "reduce", watch: true });
  await page.waitForTimeout(4000);
  const states = await page.evaluate(() => window.__states);
  expect(states.every((s) => s === "landed"), `the stage moved with reduce-motion on (${states.join(" → ")})`);
  expect((await pressed(page)) === "Claude", "the stage moved with reduce-motion on");
  expect(await page.locator(".stage .scene:not(.sizer) .you").evaluate((el) => getComputedStyle(el).opacity === "1"), "what was said isn't shown");
  expect(await page.locator(".ai-bar .pause").isHidden(), "Pause shows though nothing plays");
  await page.getByRole("button", { name: "Local model" }).click();
  expect((await vault(page)) === "done", "a name doesn't show its scene");
  await close();
});
await check("home: nothing below the stage moves when the scene changes, on a narrow phone", async () => {
  const { page, close } = await open("/", { viewport: { width: 320, height: 800 }, reducedMotion: "reduce" });
  const heights = [];
  for (const name of ["Claude", "ChatGPT", "Local model"]) {
    await page.getByRole("button", { name }).click();
    heights.push(await page.locator(".stage").evaluate((el) => Math.round(el.getBoundingClientRect().height)));
  }
  expect(new Set(heights).size === 1, `the stage is ${heights.join(", ")}px tall by scene`);
  // Pause (shown here as it is when the loop plays) has its 44px, and no name runs under it
  const { pause, gap } = await page.locator(".ai-bar .pause").evaluate((el) => {
    el.hidden = false;
    const p = el.getBoundingClientRect(), names = [...document.querySelectorAll(".ai-pick button")];
    return { pause: p.width, gap: p.left - names[names.length - 1].getBoundingClientRect().right };
  });
  expect(pause >= 44, `Pause is ${pause}px wide`);
  expect(gap >= 0, `the last name runs ${Math.round(-gap)}px under Pause`);
  await close();
});
await check("home: without script the first scene's last frame is there to read", async () => {
  const { page, close } = await open("/", { javaScriptEnabled: false });
  expect(await page.getByText("Saved a note and a task, linked to Maya.").isVisible(), "Claude's answer isn't shown");
  expect(await page.locator(".rec.note").evaluate((el) => getComputedStyle(el).opacity === "1"), "the note isn't in the vault");
  expect((await page.locator(".ai-pick button:visible").count()) === 1, "a name that does nothing is shown as a button");
  await close();
});

// ---- Connect your AI ----
const CONNECT = "/docs/use/connect-your-ai/";
const shown = (page) => page.locator(".tab-panel:not([hidden]) > h2").innerText();
await check("connect: one tab at a time, by click and by arrow key", async () => {
  const { page, errors, close } = await open(CONNECT);
  const tabs = page.getByRole("tab");
  expect((await tabs.count()) === 3, `expected 3 tabs, found ${await tabs.count()}`);
  expect((await shown(page)) === "Claude", "the first tab isn't Claude");
  expect((await page.getByRole("tab", { name: /Claude/ }).innerText()).includes("Tested end to end"), "Claude's tab doesn't say how far it is tested");
  await page.getByRole("tab", { name: /ChatGPT/ }).click();
  expect((await shown(page)) === "ChatGPT" && (await page.locator(".tab-panel:not([hidden])").count()) === 1, "ChatGPT's panel isn't the one shown");
  expect(await page.locator(".tab-panel:not([hidden])").getByText("we're still testing").isVisible(), "ChatGPT's panel doesn't say it is still being tested");
  expect(page.url().endsWith("#chatgpt"), "the address doesn't name the open tab");
  await page.waitForFunction(() => document.querySelector(".onpage a[aria-current]")?.textContent === "ChatGPT", null, { timeout: 2000 })
    .catch(() => { throw new Error("On this page doesn't mark the tab opened on an unscrolled page"); });
  await page.keyboard.press("ArrowRight");
  expect((await shown(page)) === "Local models", "ArrowRight didn't move to the next tab");
  await page.keyboard.press("ArrowRight");
  expect((await shown(page)) === "Claude", "ArrowRight on the last tab didn't wrap to the first");
  expect(!errors.length, errors[0]);
  await close();
});
await check("connect: the address's #fragment opens its tab, and a fold opens", async () => {
  const { page, close } = await open(CONNECT + "#local-models");
  expect((await shown(page)) === "Local models", "#local-models didn't open its tab");
  await page.getByRole("tab", { name: /Claude/ }).click();
  await page.waitForFunction(() => document.querySelector(".onpage a[aria-current]")?.textContent === "Claude", null, { timeout: 2000 })
    .catch(() => { throw new Error("On this page doesn't mark the tab just opened"); });
  await page.getByRole("tab", { name: /Local models/ }).click();
  await page.getByText("More: keep everything on your machine").click();
  expect(await page.getByText("both on your computer").isVisible(), "the fold didn't open");
  await page.locator(".onpage a", { hasText: "ChatGPT" }).click();   // a link: the tab follows the address, a moment later
  await page.waitForFunction(() => document.querySelector(".tab-panel:not([hidden]) > h2").textContent === "ChatGPT", null, { timeout: 3000 })
    .catch(() => { throw new Error("On this page didn't open ChatGPT's tab"); });
  await close();
});
await check("connect: a link to a tab's section lands with the tabs in view, on a phone too", async () => {
  for (const width of [390, 1280]) {
    const { page, close } = await open(CONNECT + "#chatgpt", { viewport: { width, height: 800 } });
    await page.waitForTimeout(400);
    // nothing sticky may cover the tabs: the nav, and on a phone the line that says where you are
    const { top, covered } = await page.evaluate(() => {
      const tabs = document.querySelector(".doc-tabs").getBoundingClientRect();
      const over = [...document.querySelectorAll(".site-nav, .toc")].map((el) => [getComputedStyle(el).position, el.getBoundingClientRect()])
        .filter(([pos, r]) => ["sticky", "fixed"].includes(pos) && r.left < tabs.right && r.right > tabs.left);   // pinned, and above the tabs' column
      return { top: tabs.top, covered: over.length ? Math.max(...over.map(([, r]) => r.bottom)) : NaN };
    });
    expect(!Number.isNaN(covered), "nothing is pinned above the tabs: has the nav been renamed?");
    expect(top >= covered - 1 && top < 800, `at ${width} the tabs sit at ${Math.round(top)}, under what is pinned to ${Math.round(covered)}`);
    await close();
  }
});
await check("connect: a bad #fragment leaves the first tab open", async () => {
  const { page, errors, close } = await open(CONNECT + "#%");
  expect((await shown(page)) === "Claude" && !errors.length, errors[0] || "the first tab isn't open");
  await close();
});
await check("connect: without script every section is there", async () => {
  const { page, close } = await open(CONNECT, { javaScriptEnabled: false });
  for (const id of ["claude", "chatgpt", "local-models"]) expect(await page.locator("#" + id).isVisible(), `#${id} isn't shown`);
  await close();
});

// ---- the docs page ----
await check("docs: All N pages lists every page of its door", async () => {
  const { page, close } = await open("/docs/");
  const index = JSON.parse(fs.readFileSync(path.join(SITE, "docs/index.json"), "utf8"));
  for (const door of ["use", "build", "run", "fix"]) {
    const card = page.locator(".door-card", { has: page.locator(`h2 a[href="/docs/${door}/"]`) });
    const want = index.pages.filter((p) => p.door === door).length;
    await card.locator("summary").click();
    const got = await card.locator("details li a").count();
    expect(got === want, `${door}: the fold lists ${got} pages, the door has ${want}`);
    expect((await card.locator("summary").innerText()).includes(String(want)), `${door}: the fold's label doesn't say ${want}`);
  }
  await close();
});

// ---- widths ----
for (const width of [320, 390, 1280]) for (const url of ["/", "/docs/", "/docs/use/start/", CONNECT]) {
  await check(`${url} at ${width}: nothing scrolls sideways, the way in is on screen`, async () => {
    const { page, close } = await open(url, { viewport: { width, height: 800 }, reducedMotion: "reduce" });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(over <= 0, `the page is ${over}px wider than the screen`);
    for (const name of ["Docs", "Start free"]) {
      const box = await page.locator(".site-nav").getByRole("link", { name, exact: true }).boundingBox();
      expect(box && box.x >= 0 && box.x + box.width <= width, `"${name}" in the nav is off screen`);
    }
    await close();
  });
}

await browser.close();
server.close();
if (fails.length) {
  console.log(fails.map((f) => "FAIL " + f).join("\n"));
  console.log(`${fails.length} failed, ${passed} passed`);
  process.exit(1);
}
console.log(`PASS: ${passed} checks in a browser (the stage, the tabs, the docs page, three widths)`);
