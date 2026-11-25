---
title: "Your own copy of the docs"
summary: "Advanced. Your server's AI reads these pages from parachute.computer for its version. Serve your own copy, or turn it off, with `docs.base_url`."
door: run
order: 9
status: next
status_note: "The docs tool's base_url setting comes with the Parachute release after 0.9.0-pre.2 (core's docs tool, T-476). Until then the tool, where a server has it, reads parachute.computer."
checked: "agentdocs DESIGN.md §1, §5 (T-476: the docs tool, docs.base_url, PARACHUTE_DOCS_URL, latest.json every six hours); this site's _data/site.js (SITE_ORIGIN), _data/versions.json, docs-versioned.njk, docs-index-json.njk, latest-json.njk"
---

An AI connected to your server has a `docs` tool. It reads these pages, for your server's version, from
parachute.computer, and a refusal points it at the page with the fix. Your server also reads
`https://parachute.computer/latest.json` at most every six hours, so the AI can say when a newer Parachute is out. Only
the request leaves your server, never anything from a vault.

Most people leave this alone. Change it to keep the docs on your own network, to add your own pages, or to stop the
calls out.

## What the tool reads

All from one origin, so a copy needs the same paths:

| Path | What |
|---|---|
| `/docs/v/<version>/<page>.md` | a page for a version (major.minor, e.g. `0.9`) |
| `/docs/<page>.md` | today's page, when a version has none |
| `/docs/index.json` | every page and its headings (for search), and each refusal's fix page |
| `/llms.txt` | the list of pages |
| `/latest.json` | the newest release |

## Serve your own copy

The site is open source. Build it with your own address, so its links point at itself:

```
git clone https://github.com/ParachuteComputer/parachute.computer
cd parachute.computer
npm ci
SITE_ORIGIN=https://docs.example.org npx @11ty/eleventy
npm run check
```

Serve `_site/` at that address (any static host: Caddy, nginx, Cloudflare Pages). Add or change pages in `docs/`
and build again; `npm run check` fails on a broken link. `latest.json` is written at build time from npm.

## Point your server at it

In `~/.parachute/vault/config.yaml`:

```yaml
docs:
  base_url: https://docs.example.org
```

- `base_url: off` lists no `docs` tool and makes no call for `latest.json`. Refusals still name their fix page, as
  text.
- The environment variable `PARACHUTE_DOCS_URL` wins over the file (for a container).
- Restart Parachute after a change (`parachute restart`).

The AI isn't told where the pages come from; it calls `docs` as before.
