#!/usr/bin/env node
// npm run check: the built site (_site), read as a person and an AI would follow it. Exits 1 on any failure.
// - every local link and src on every HTML page, and every link in every markdown twin, llms.txt and llms-full.txt,
//   resolves to a built file (anchors on docs pages included);
// - every docs page has its twin, its place in docs/index.json, and a copy under every version in versions.json;
// - each refusal error_type in the index lands on a section that exists.
import fs from "node:fs";
import path from "node:path";

const SITE = "_site";
// the origin the build was made for (docs/index.json says it), so a check never skips links a build wrote
const ORIGIN = JSON.parse(fs.readFileSync(path.join(SITE, "docs/index.json"), "utf8")).origin.replace(/\/+$/, "");
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
const idsCache = new Map();
function idsIn(file) {
  if (!idsCache.has(file)) idsCache.set(file, new Set([...fs.readFileSync(file, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idsCache.get(file);
}
function checkLink(from, href) {
  if (href.startsWith(ORIGIN + "/")) href = href.slice(ORIGIN.length);
  if (!href.startsWith("/") || href.startsWith("//")) return;
  const target = fileFor(href);
  if (!target) return fail(`${from}: ${href} is not built`);
  const hash = href.split("#")[1];
  // every anchor lands on an id; a markdown twin's anchor is checked on its HTML page
  if (hash) {
    const html = target.endsWith(".md") ? fileFor(href.split("#")[0].replace(/\.md$/, "/").replace(/^\/docs\/v\/[^/]+\//, "/docs/")) : target;
    if (html && html.endsWith(".html") && !fs.readFileSync(html, "utf8").includes("http-equiv=\"refresh\"") && !idsIn(html).has(decodeURIComponent(hash)))
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
const versions = JSON.parse(fs.readFileSync("_data/versions.json", "utf8"));
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
if (!latest.core?.latest || !latest.docs) fail("latest.json lacks core.latest or docs");

const llms = fs.readFileSync(path.join(SITE, "llms.txt"), "utf8");
for (const t of pagesOnDisk) if (!llms.includes(`/docs/${t}.md`)) fail(`llms.txt doesn't list ${t}`);

if (fails.length) {
  console.log(fails.map((f) => "FAIL " + f).join("\n"));
  console.log(`${fails.length} failed`);
  process.exit(1);
}
console.log(`PASS: ${files.length} files; ${pagesOnDisk.length} docs pages × ${versions.versions.length} versions; ${Object.keys(index.errors).length} refusals mapped; links resolve`);
