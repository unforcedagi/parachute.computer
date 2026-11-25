# parachute.computer

Public site + blog for Parachute Computer, built with Eleventy (11ty), served at
**parachute.computer**. The blog is the primary public communication channel.
Standard 11ty repo — `eleventy.config.js` and `_includes/` show how it builds;
this file only carries what the repo can't tell you.

## Gotchas

- **Blog post dates need the `T12:00:00` suffix** (`date: 2026-02-15T12:00:00`).
  A bare date parses as UTC midnight and Eleventy renders it a day early in
  US timezones — the off-by-one is silent and only visible on the rendered site.
- **One layout, one nav** (`_includes/base.njk`), the homepage included (since T-476; the
  2026-07 self-contained landing is archived at `archive/home-v2/`).
- **The docs are `docs/<door>/<page>.md`** (door: use, build, run, fix), each with `title`,
  `summary`, `door`, `order` and `checked` (the code it was checked against) in its front
  matter. Every page is also served as markdown at `/docs/<door>/<page>.md`
  (`docs-md.njk`), and `/llms.txt` and `/llms-full.txt` are generated from them: write a
  page once and both readers get it. The MCP `docs` tool in parachute-core reads these
  `.md` addresses, so a page's address is a contract: rename one only with a redirect.
  `docs/build/reference/` is generated (`npm run docs:sync`): don't edit it by hand.
- **What an AI reads, besides the twins** (a contract with core's and Cloud's `docs` tool, T-476):
  `/docs/v/<version>/<page>.md` for each version in `_data/versions.json` (major.minor), `/docs/index.json` (every
  page, its headings, and `errors`: each refusal `error_type` → the page and section with its fix, from a page's
  `errors:` front matter; the Fix door's pages carry them) and `/latest.json` (npm dist-tags of `@openparachute/core` at build). At a release, run
  `npm run docs:freeze -- <old version>` before the pages move on, then add the new version as `current`.
  `SITE_ORIGIN=<url>` builds a copy whose machine-read links point at itself (a preview, or a self-hoster's docs).
- **`npm run check` after a build** (and in CI on every PR): every link on the live pages, the twins, llms.txt and
  llms-full.txt resolves, anchors included; every page exists under every version; every mapped refusal lands on a
  section. archive/ and design/ are dated records and aren't checked.
- **Don't publish fast-changing metrics** — file counts, version numbers, test
  counts — anywhere on the site or in this file. They go stale silently and then
  read as truth; link to GitHub for anything that changes frequently. A docs page's
  `checked:` line may name the version it was checked against: that is a dated record of
  a check, not a claim about today.
- **The look is `assets/site.css`**: the app's palette and motion tokens under the app's names, one type scale
  (`--fs-*`), and two open faces served from `assets/fonts/` (SIL OFL, licences beside them). `style.css` is the
  older pages' layer underneath it. The homepage drawing is generated: `node scripts/draw-canopy.mjs` writes
  `_includes/canopy.svg`.
- **Door labels live in `_data/doorPages.json`** (the nav, the door pages, the homepage
  and llms.txt all read them).

Architecture design notes live in `design/`; update them when the shape they
describe changes, not per commit.
