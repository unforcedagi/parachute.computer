#!/usr/bin/env node
// npm run check: the built site (_site), read as a person and an AI would follow it. Exits 1 on any failure.
// - every local link and src on every HTML page, and every link in every markdown twin, llms.txt and llms-full.txt,
//   resolves to a built file (anchors on docs pages included);
// - every docs page has its twin, its place in docs/index.json, and a copy under every version in versions.json;
// - each refusal error_type in the index lands on a section that exists.
// - the pages a newcomer reads stay light: each has a word budget for what shows before any fold is opened;
// - no fold's HTML reaches an AI's markdown, and Connect your AI stays one flow for any AI.
import fs from "node:fs";
import path from "node:path";

const SITE = "_site";
// the origin the build was made for (docs/index.json says it), so a check never skips links a build wrote
const ORIGIN = JSON.parse(fs.readFileSync(path.join(SITE, "docs/index.json"), "utf8")).origin.replace(/\/+$/, "");
const versions = JSON.parse(fs.readFileSync("_data/versions.json", "utf8"));
const FROZEN = versions.versions.filter((v) => v.frozen).map((v) => v.version);
const fails = [];
const fail = (m) => fails.push(m);
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const files = walk(SITE);
const has = (p) => fs.existsSync(p);

// A site path → the file that serves it (GitHub Pages: /a/ → /a/index.html, /a → /a.html or /a/index.html).
function fileFor(urlPath) {
  const p = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  const f = path.join(SITE, p);
  if (p.endsWith("/")) return has(path.join(f, "index.html")) ? path.join(f, "index.html") : null;
  if (has(f) && fs.statSync(f).isFile()) return f;
  if (has(f + ".html")) return f + ".html";
  if (has(path.join(f, "index.html"))) return path.join(f, "index.html");
  return null;
}
// a page's ids, and whether it is a redirect page (read once per file)
const pageCache = new Map();
function pageOf(file) {
  if (!pageCache.has(file)) {
    const html = fs.readFileSync(file, "utf8");
    pageCache.set(file, { ids: new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])), redirect: html.includes('http-equiv="refresh"') });
  }
  return pageCache.get(file);
}
const idsIn = (file) => pageOf(file).ids;
function checkLink(from, href) {
  if (href.startsWith(ORIGIN + "/")) href = href.slice(ORIGIN.length);
  if (!href.startsWith("/") || href.startsWith("//")) return;
  const target = fileFor(href);
  if (!target) return fail(`${from}: ${href} is not built`);
  const hash = href.split("#")[1];
  // every anchor lands on an id; a markdown twin's anchor is checked on its HTML page (a frozen version's pages
  // link to headings as they were, so theirs aren't)
  if (hash && !FROZEN.some((v) => from.startsWith(`${SITE}/docs/v/${v}/`))) {
    // a twin's anchor, and a versioned address's (a redirect page), are checked on today's page
    const page = href.split("#")[0].replace(/\.md$/, "/").replace(/^\/docs\/v\/[^/]+\//, "/docs/");
    const html = target.endsWith(".md") || href.startsWith("/docs/v/") ? fileFor(page) : target;
    if (html && html.endsWith(".html") && !pageOf(html).redirect && !idsIn(html).has(decodeURIComponent(hash)))
      fail(`${from}: ${href}: no #${hash} on ${html}`);
  }
}

// archive/ and design/ are dated records, kept with their links as they were written
const LIVE = (f) => !/^_site\/(archive|design)\//.test(f);
for (const f of files.filter(LIVE)) {
  if (f.endsWith(".html")) {
    const html = fs.readFileSync(f, "utf8");
    if (html.includes('http-equiv="refresh"')) continue; // a redirect page: its target is checked below
    for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      let href = m[1].replace(/&amp;/g, "&");
      if (href.startsWith("#") || /^(mailto|tel|javascript|data):/.test(href)) continue;
      if (!href.startsWith("/") && !href.startsWith(ORIGIN)) {
        if (/^[a-z]+:/i.test(href)) continue;
        href = path.posix.join("/" + path.relative(SITE, path.dirname(f)), href);
      }
      checkLink(f, href);
    }
  } else if (f.endsWith(".md") || f.endsWith(".txt")) {
    const text = fs.readFileSync(f, "utf8").replace(/```[\s\S]*?```/g, "");
    for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) checkLink(f, m[1]);
  }
}

// redirects: every target exists
const redirects = JSON.parse(fs.readFileSync("_data/redirects.json", "utf8"));
for (const r of redirects) if (!fileFor(r.to)) fail(`redirect ${r.from} → ${r.to}: target is not built`);

// the docs: twins, index, versions, errors
const index = JSON.parse(fs.readFileSync(path.join(SITE, "docs/index.json"), "utf8"));
const pagesOnDisk = walk("docs").filter((f) => f.endsWith(".md")).map((f) => f.replace(/^docs\//, "").replace(/\.md$/, ""));
const topics = new Set(index.pages.map((p) => p.topic));
for (const t of pagesOnDisk) {
  if (!topics.has(t)) fail(`docs/${t}.md is not in docs/index.json`);
  if (!has(path.join(SITE, "docs", t + ".md"))) fail(`docs/${t}.md has no twin`);
  if (!has(path.join(SITE, "docs", t, "index.html"))) fail(`docs/${t}.md has no page`);
  for (const v of versions.versions) {
    // a frozen version keeps the pages it had; a page added since is read from today's pages
    if (!v.frozen && !has(path.join(SITE, "docs/v", v.version, t + ".md"))) fail(`docs/${t}.md is missing for ${v.version}`);
    if (!has(path.join(SITE, "docs/v", v.version, t, "index.html"))) fail(`docs/${t}/ has no address for ${v.version}`);
  }
}
for (const p of index.pages) {
  if (!p.title || !p.summary || !p.door) fail(`index: ${p.topic} lacks a title, summary or door`);
}
for (const [type, where] of Object.entries(index.errors)) {
  const [topic, anchor] = where.split("#");
  const page = path.join(SITE, "docs", topic, "index.html");
  if (!has(page)) { fail(`errors.${type}: ${topic} has no page`); continue; }
  if (anchor && !idsIn(page).has(anchor)) fail(`errors.${type}: no #${anchor} on ${topic}`);
}
const latest = JSON.parse(fs.readFileSync(path.join(SITE, "latest.json"), "utf8"));
if (!latest.docs || !latest.core || !("latest" in latest.core)) fail("latest.json lacks core.latest or docs");
if (latest.core && latest.core.latest === null && !String(latest.source).startsWith("unknown")) fail("latest.json: core.latest is null without saying why");

// The pages a newcomer reads stay light (T-476: the homepage had grown to 1,386 words). A budget counts the words a
// person sees in the page's own part before opening any fold (<details>).
// Over budget? Cut, or fold the detail: don't raise the number without a reason a reader would accept.
const BUDGETS = [
  { page: "index.html", part: /<main[\s\S]*?<\/main>/, max: 220 },
  { page: "docs/index.html", part: /<main[\s\S]*?<\/main>/, max: 140 },
  { page: "docs/use/start/index.html", part: /<div class="doc-body">[\s\S]*?<nav class="pager"/, max: 470 },
  { page: "docs/use/connect-your-ai/index.html", part: /<div class="doc-body">[\s\S]*?<nav class="pager"/, max: 260 },
];
const wordsIn = (html) => html.replace(/<details[\s\S]*?<\/details>/g, " ").replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ")
  .replace(/&[a-z#0-9]+;/g, "x").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const counted = [];
for (const b of BUDGETS) {
  const html = fs.readFileSync(path.join(SITE, b.page), "utf8");
  let part = (html.match(b.part) || [""])[0];
  if (!part) { fail(`${b.page}: the part its word budget counts is gone`); continue; }
  const n = wordsIn(part);
  counted.push(`${b.page.replace(/\/?index\.html$/, "") || "home"} ${n}/${b.max}`);
  if (n > b.max) fail(`${b.page}: ${n} words before any fold, over its budget of ${b.max}. Cut, or fold the detail (<details>).`);
}
// The homepage shows any AI, not one: the three it names are all there.
const home = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
for (const ai of ["Claude", "ChatGPT", "Local model"]) if (!new RegExp(`<button[^>]*>${ai}</button>`).test(home)) fail(`index.html: the stage has no "${ai}"`);
// Connect your AI is one flow for whatever AI: no heading there names one AI app (their notes are inside a fold).
for (const h of index.pages.find((p) => p.topic === "use/connect-your-ai").headings)
  if (/claude|chatgpt|local[- ]models?|codex|cursor|gemini|grok|muse|copilot/i.test(h)) fail(`docs/use/connect-your-ai: the section "${h}" is for one AI; the page is one flow, with notes for some apps in a fold`);
// A fold's HTML never reaches the markdown an AI reads.
for (const f of files.filter((f) => LIVE(f) && /^_site\/(docs\/.*\.md|llms-full\.txt)$/.test(f)))
  if (/<\/?(details|summary)>/.test(fs.readFileSync(f, "utf8").replace(/```[\s\S]*?```/g, ""))) fail(`${f}: a fold's HTML is in the markdown an AI reads`);

const llms = fs.readFileSync(path.join(SITE, "llms.txt"), "utf8");
for (const t of pagesOnDisk) if (!llms.includes(`/docs/${t}.md`)) fail(`llms.txt doesn't list ${t}`);

if (fails.length) {
  console.log(fails.map((f) => "FAIL " + f).join("\n"));
  console.log(`${fails.length} failed`);
  process.exit(1);
}
console.log(`PASS: ${files.length} files; ${pagesOnDisk.length} docs pages × ${versions.versions.length} versions; ${Object.keys(index.errors).length} refusals mapped; links resolve; words before a fold: ${counted.join(", ")}`);
