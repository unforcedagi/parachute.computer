#!/usr/bin/env bun
// Writes the live gallery on the Components page (assets/components/): the app's own drawing of every part, and each
// look's tokens as the app writes them.
//
//   bun scripts/components-gallery.mjs <parachute checkout> <parts snapshot>
//
// <parachute checkout>  ParachuteComputer/parachute at the commit the page is checked against (its theme and kit CSS)
// <parts snapshot>      a static copy of the app showing its Parts applet (parts-*.html, from the app's style harness
//                       with STYLE_SNAP); the applet's own document is taken out of it
//
// parts.html  the Parts applet's document, with the kit's sheets (src/kit/base.css, parts.css) of the checkout, in the
//             order an applet's frame gets them (src/kit/frameCss.ts), and the faces from fonts.css beside it
// looks.json  for each look, light and dark: the CSS the app sets on a frame's root (theme.ts cssOf), and its motion
// Bun reads the app's theme.ts as it is, so the tokens are the app's own, not a copy of them.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const [app, snap] = process.argv.slice(2);
if (!app || !snap) { console.error("usage: bun scripts/components-gallery.mjs <parachute checkout> <parts snapshot>"); process.exit(2); }
const OUT = join(import.meta.dirname, "..", "assets", "components");
const sha = execFileSync("git", ["-C", app, "rev-parse", "--short=7", "HEAD"], { encoding: "utf8" }).trim();
const { LOOK_NAMES, themeFrom, tokensOf, cssOf } = await import(join(app, "src/theme/theme.ts"));

// each look, light and dark, as the app writes it on a frame's root
const looks = {};
for (const look of LOOK_NAMES) {
  const theme = themeFrom({ theme: { look } });
  looks[look] = Object.fromEntries([["light", false], ["dark", true]].map(([s, dark]) => [s, { css: cssOf(tokensOf(theme, dark)), motion: theme.motion }]));
}
writeFileSync(join(OUT, "looks.json"), JSON.stringify({ from: `ParachuteComputer/parachute ${sha}, src/theme/theme.ts`, looks }, null, 1) + "\n");

// the applet's document, out of the snapshot's frame
const shell = readFileSync(snap, "utf8");
const m = /<iframe[^>]*\btitle="Parts"[^>]*\bsrcdoc="([^"]*)"/.exec(shell);
if (!m) throw new Error(`${snap}: no Parts applet frame in it`);
const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, "&"); // the harness escapes only these two (zz-style.spec.ts attr)
let doc = unescape(m[1]);

// the kit's sheets of the checkout, as frameCss.ts puts them together for an applet's frame (a page)
const frameCss = readFileSync(join(app, "src/kit/frameCss.ts"), "utf8");
const layers = /export const LAYERS = "([^"]+)"/.exec(frameCss)?.[1];
const page = /const FRAME_PAGE = ("[^"]+")\s*\+\s*("[^"]+");/.exec(frameCss);
if (!layers || !page) throw new Error("src/kit/frameCss.ts: LAYERS or FRAME_PAGE not found; update this script");
const kit = layers + readFileSync(join(app, "src/kit/base.css"), "utf8") + readFileSync(join(app, "src/kit/parts.css"), "utf8") + JSON.parse(page[1]) + JSON.parse(page[2]);
if (kit.includes("<")) throw new Error("the kit's CSS holds a <");
const styles = [...doc.matchAll(/<style>([\s\S]*?)<\/style>/g)];
const old = styles.find((s) => s[1].startsWith(`${layers}@layer parachute.base`));
const tokens = styles.find((s) => s[1].includes(":root{--bg:"));
if (!old || !tokens) throw new Error(`${snap}: the frame's token and kit sheets not found`);
doc = doc.replace(old[0], () => `<style>${kit}</style>`).replace(tokens[0], () => `<style>${layers}${looks.paper.light.css}</style>`);
if (!doc.includes('href="../fonts.css"') || !doc.includes('<style id="taste"></style>')) throw new Error(`${snap}: no ../fonts.css link or #taste style`);
doc = doc.replace('href="../fonts.css"', 'href="fonts.css"')
  .replace(/^<!doctype html>/i, `<!doctype html>\n<!-- The app's Parts applet as the app drew it (made-up content), with the kit's sheets from ParachuteComputer/parachute ${sha}. Written by scripts/components-gallery.mjs: don't edit by hand. -->\n`);
writeFileSync(join(OUT, "parts.html"), doc);
console.log(`assets/components/parts.html and looks.json: from ${sha}`);
