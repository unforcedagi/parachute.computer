---
title: "Keys and what they reach"
summary: "Every connection reaches one vault at one level: read, write or admin. A key for an AI can be held to some types. One list shows who reaches a vault, and ends any of it."
door: build
order: 7
checked: "parachute-core packages/vault/src/mcp-http.ts (tools filtered by scope), tools/list at each level on 0.9.0-pre.1, packages/cli/src/front.ts and keys.ts (parachute keys new); typed keys, the list and ending one: parachute-core #140 (contracts/suites/door/typed-keys.test.ts) on a box; parachute docs/design/SCOPES.md and docs/VAULT.md"
---

A connection to a vault (an AI app, a script, the Parachute app) holds a **scope**: `vault:<name>:<level>`.

| Level | It can | MCP tools it sees |
|---|---|---|
| `read` | read records, types, files | `query-records`, `list-types`, `vault-info`, `docs`, `doctor`, `read-attachment`, `attachment-url` (download) |
| `write` | also create, change and delete records, add files; make a new type, and add fields to a type it made | + `create-record`, `update-record`, `delete-record`, `manage-types` (at the vault's own address) |
| `admin` | also change any type, the vault's description and keys | + every `manage-types` action, `manage-keys` |

A tool a connection can't use isn't listed to it, and calling it by name fails.

## A key held to some types

A key can reach some types of a vault and nothing else: a key named `claude` that may read and add `recipe` records
never sees a `journal` record, not by id, in a search, a link, a count, a file or an old version. The vault keeps the
key's grant and checks every request against it, so ending the key works on its very next request.

- **In the app:** Vault > a vault > **Sharing** > **Give an AI a key**: its name, read or read and add, every type or
  some. The key is shown once, with the vault's own address.
- **Over the account API:** `POST /account/keys {"name": "claude", "vault": "home", "can": "write", "types": ["recipe"]}`.

One key reads and writes the same types; it can't be widened later (end it and make another). A key held to types sees
no history yet. On Parachute Cloud, keys reach the whole vault for now.

## Who reaches a vault

**Sharing** in the app lists every key, AI and app that reaches a vault, each by name, with what it may do, to which
types and until when, and ends any of them with one tap. Over the account API that is
`GET /account/vaults/<name>/statements` (each credential a row) and `DELETE /account/vaults/<name>/statements/<id>`,
with the owner's sign-in or the vault's own admin key. Not yet on Parachute Cloud.

A scope narrowed to some tags (`permissions.scoped_tags`, made by `manage-keys`) still works; types replace it at 1.0.

## An AI app

The person picks the level on the server's page when they connect it. Ask for the least that works.

## A script or a job

Make a key for it:

- **In a conversation:** `manage-keys { "action": "mint", "scope": "vault:home:read", "name": "nightly-digest" }`. Short-lived by default: 15 minutes, `ttl_seconds` up to an hour, or up to 90 days (`7776000`) with `long_lived: true`. A key can't reach further than the connection that made it.
- **On the server:** `parachute keys new nightly-digest --vault home --can read` (0.8: `parachute auth mint-token --scope vault:home:read`).
- **On Parachute Cloud:** keys come from the account API (`POST /account/keys`, read or write); a page for them is coming. In a conversation, Cloud's 0.8 tool is `manage-token`.

Use it as `Authorization: Bearer <key>`: [Scripts and the REST API](/docs/build/scripts/). Revoke it with `manage-keys { "action": "revoke", "name": "nightly-digest" }`, `parachute keys revoke nightly-digest`, or **End** in the app's Sharing.

## Applets are narrower

An applet doesn't hold a key. The app holds the person's sign-in and lets each applet reach only the folders on its card, in its own vault ([What Allow means](/docs/use/allowing-applets/)). When an applet that writes is allowed and the app can only read that vault, the server asks the person once more, for that vault.
