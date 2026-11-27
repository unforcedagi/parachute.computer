---
title: "Parachute Cloud"
summary: "We run the server; your vaults are yours to export. Sign up with an email."
door: run
order: 1
checked: "parachute-cloud next 005d073 workers/identity/src/ui.ts (sign-up, Name your vault, Download everything, Import a vault), plans.ts (open beta), account-api.ts and account-delete.ts (confirm, 24-hour restore), restore.ts (50 MiB); parachute-cloud CLAUDE.md (Cloudflare Workers, one Durable Object per vault, D1, R2), workers/identity/wrangler.toml (ISSUER, APP_ORIGIN, VAULT_PUBLIC_ORIGIN), workers/identity/src/console.ts cardFor"
---

**Cloud runs the 0.8 engine today.** Its MCP tools have the note names (`create-note`, `query-notes`, `update-note`, `update-tag`, with `content` for a body and `metadata` for fields) and REST is `/api/notes`; the record tools, `/api/records` and the `docs` tool come when Cloud moves to 0.9. The [build pages](/docs/build/) use 0.9's words; each says the 0.8 name where it differs.

Parachute Cloud is Parachute run for you. Sign up at [my.parachute.computer](https://my.parachute.computer) with your email (a link or a 6-digit code, no password), name your first vault, and connect your AI: [Start on Parachute Cloud](/docs/use/start/). Your account page lists your vaults, each with its connector address and **Copy**.

- **Open beta:** free, no card; up to 5 vaults, 500 MiB of notes and 8 GiB of files. Before any paid plan you'll hear about it well ahead.

- **Your vaults** live at `https://my.parachute.computer/vault/<name>/`. The connector address for an AI is that plus `mcp`. See [Connect your AI](/docs/use/connect-your-ai/).
- **Sign in** in the Parachute app with **Sign in with Parachute Cloud**: your email, then the code it mails you. No key needed.
- **Keys** for scripts come from the account API, `POST /account/keys` (read or write); a page for them is coming ([Keys](/docs/build/keys-and-scopes/)).
- **Export** any time, with your files: **Download everything** on the vault's card (a `.tar` of plain markdown), or `GET /vault/<name>/api/export` with a key. It is the same portable markdown a server of your own reads, so moving is a copy, not a migration. **Import a vault** on the account page takes one back in (up to 50 MiB).
- **Deleting** a vault or your account is an account API call for now (`DELETE /account/vaults/<name>`, `POST /account/delete`, each with a `confirm`); a deleted account can be restored for 24 hours, a deleted vault can't. Download first.
- **Pricing:** [one page says it](/pricing/).

## How it runs

The same vault engine as a server of your own (`@openparachute/core`), inside Cloud's own code on Cloudflare: each vault is its own Durable Object holding its own SQLite database, files in R2, accounts in D1. Your vaults' addresses are on `my.parachute.computer`; the sign-in server is `cloud.parachute.computer`. A shared test suite holds Cloud's MCP tools and REST routes to a server of your own's of the same release.
