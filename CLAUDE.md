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
  2026-07 self-contained landing is archived at `archive/home-v2/`). The nav is four plain words (Docs, Pricing,
  Blog, GitHub) and Start free; the docs' four doors are on `/docs/` and beside every docs page.
- **The pages a newcomer reads stay light** (the homepage had grown to several times the old one's length and read as heavy; a
  person should get the information without being buried in it). The homepage shows the product instead of describing it: one sentence
  and a stage where three AIs take turns over one vault (`index.njk`, `assets/home-loop.js`); it carries no docs
  index. Depth goes behind a fold, never onto the page: in a docs page write a plain `<details>` with a `<summary>`
  (blank lines inside, so the markdown renders); the markdown twin gives an AI all of it, the summary as a bold line.
  `npm run check` holds the homepage, `/docs/`, Start and Connect your AI to a word budget (words showing before any
  fold is opened); when one fails, cut or fold, don't raise it.
- **Any AI, with the tested level said.** Parachute is one vault for any AI: Claude is the first tested path, not the
  only one. `docs/use/connect-your-ai.md` has a section per AI, drawn as tabs (`tabs:` in its front matter:
  each entry is a section's heading id, its name, `level: full|part` and a short label; `assets/doc-tabs.js`). Each
  tabbed section opens with one paragraph saying how far it is tested, with the date; change it only when a run
  changes it. Don't claim more for ChatGPT or local models than the page's `checked:` line supports.
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
  `errors:` front matter; the Fix door's pages carry them) and `/latest.json` (npm dist-tags of `@openparachute/core` at build; `null` with the reason when npm can't be read; deploy.yml rebuilds main daily so it follows npm). At a release, run
  `npm run docs:freeze -- <old version>` before the pages move on, then add the new version as `current`.
  `SITE_ORIGIN=<url>` builds a copy whose machine-read links point at itself (a preview, or a self-hoster's docs).
- **`npm run check` after a build** (and in CI on every PR): every link on the live pages, the twins, llms.txt and
  llms-full.txt resolves, anchors included; every page exists under every version; every mapped refusal lands on a
  section; the word budgets hold. archive/ and design/ are dated records and aren't checked.
  **`npm run check:pages`** (CI too) drives the built site in a browser: the homepage's stage, the tabs, the docs
  page's folds, and no sideways scroll at 320, 390 and 1280. `CHROMIUM_PATH=/usr/bin/chromium` uses a browser already
  on the machine.
- **Don't publish fast-changing metrics** — file counts, version numbers, test
  counts — anywhere on the site or in this file. They go stale silently and then
  read as truth; link to GitHub for anything that changes frequently. A docs page's
  `checked:` line may name the version it was checked against: that is a dated record of
  a check, not a claim about today.
- **The look is `assets/site.css`**: the app's palette and motion tokens under the app's names, one type scale
  (`--fs-*`), and two open faces served from `assets/fonts/` (SIL OFL, licences beside them). `style.css` is the
  older pages' layer underneath it. The parachute itself is orange (`--canopy`: the mark, the favicon, the one warm
  thing on a page); links and ticks stay moss (`--accent`).
- **Door labels live in `_data/doorPages.json`** (the docs page's cards, the door pages, the list beside every docs
  page and llms.txt all read them).

Architecture design notes live in `design/`; update them when the shape they
describe changes, not per commit.
