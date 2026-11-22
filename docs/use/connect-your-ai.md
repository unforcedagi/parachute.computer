---
title: "Connect your AI"
summary: "Give Claude, ChatGPT or any MCP app one address, your Parachute's /mcp; it can then read and write the vaults you choose."
door: use
order: 2
checked: "parachute docs/SIMPLE.md (Connect), applets/connect.tsx; parachute-core contracts/suites/door/one-address.test.ts, packages/hub/src/oauth-ui.ts renderVaultLevels; parachute-cloud workers/vault/src/index.ts (root /mcp), workers/identity/src/console.ts cardFor; parachute-core packages/vault/src/mcp-tools.ts getServerInstruction, packages/vault/core/src/mcp-annotations.ts"
---

Your AI gets one address, your Parachute's own with `/mcp` on the end:

```
https://<your server>/mcp
```

The first time an AI app connects, you sign in and approve it on your server's page; nothing else to paste. There you choose what it reaches. **Give it write access on the vaults it should save to**: with read only it can look, but it can't remember anything for you.

- On your own server, each vault has **None**, **Read** or **Write**, and starts at Read: choose **Write**.
- On Parachute Cloud, **Read & write** is chosen already.

In the app the address is under **Connect**, with **Copy**.

The AI connects as itself, with access of its own, not yours. On your own server, Vault, your vault, **Sharing** lists it, and **End** there takes it back.

**Just one vault:** to give an AI one vault and nothing else, use that vault's own address instead, `https://<your server>/vault/<vault name>/mcp`. Connect lists it under **Just one vault**.

On Parachute Cloud, `https://my.parachute.computer/mcp` reaches one vault for now: you pick it when you allow the AI. Each vault's own address works too, `https://my.parachute.computer/vault/<vault name>/mcp`; your Cloud account page shows it with the Claude Code command ready to copy.

## Claude

- **Claude:** on claude.ai, **Customize → Connectors → + Add → Add custom connector**. Paste the address, press Continue, and allow it when Parachute asks. It then works in Claude's desktop and phone apps too.
- **Claude Code:** `claude mcp add --transport http parachute https://<your server>/mcp`

## ChatGPT

In Settings, **Apps & Connectors**: create a custom connector (an MCP server) and paste the same address. It needs a paid plan, and may need Developer mode. Each tool says whether it only reads or changes something, so ChatGPT needn't ask before every read.

## Any other MCP app

Cursor, Grok, Muse and others take the same address: an MCP server over HTTP, signed in with OAuth.

## Then ask it

Your AI starts each conversation knowing your vault's name and its types (and, on a server with the `docs` tool, how to read these pages). Try:

- "Make me a reading tracker I can use in Parachute."
- "What did I capture this week? Sort it into the right places."
- "Make me a home screen with my journal and my reading list pinned."

What it makes shows up in the app: records in your vaults, new [applets](/docs/build/make-an-applet/) in the list of applets (in **Everything**, or your bundle; each asks you before it runs), and your [home](/docs/use/your-home/).

## What it can do

The connection can do what you allowed when you approved it, in the vaults you gave it: read, or read and write (which includes making a type and adding fields to a type it made). Through one vault's own address it can also be given more there, such as managing that vault's types and keys. It never reaches a vault you left out. An AI can't make an applet run: you allow each one in the app ([What Allow means](/docs/use/allowing-applets/)).
