---
title: "Start on Parachute Cloud"
nav: "Start here"
summary: "Five minutes: an account and a vault on Parachute Cloud, Claude connected to it, and the first things to ask. Free in the open beta."
door: use
order: 1
checked: "parachute-cloud next 005d073: workers/identity/src/ui.ts (Create your account, Name your vault, Create my vault, Connect your AI, consent: Read only / Read & write / Full admin), email-templates.ts, plans.ts (open beta: free, 5 vaults, 8 GB of files), console.ts (export); my.parachute.computer read 2026-11-25; claude.ai runs of 2026-11-25 (Plugins › Add › Add custom connector)"
---

Parachute keeps what you and your AI write in a **vault** that is yours: notes, tasks, people, books, whatever you
keep. Claude reads and writes it, so it remembers between chats, and it can build you live pages over it. These steps
use **Parachute Cloud**, where we run the server. To run your own instead, see [the other ways](#other-ways-to-start).

## 1. Make an account and a vault

1. Go to **[my.parachute.computer](https://my.parachute.computer)**, type your email and press **Email me a sign-in link**.
2. Open the email (*Welcome to Parachute*) and press **Create my account & sign in**, or type its 6-digit code. The
   link works once, for 10 minutes. No password.
3. Your account page asks you to **Name your vault**: a short name in lowercase, like `field-notes` or `home`. Press
   **Create my vault**.

The vault's card shows its address, with **Copy**:

```
https://my.parachute.computer/vault/<your vault>/mcp
```

That address is all your AI needs.

## 2. Connect Claude

On [claude.ai](https://claude.ai) (any plan; the free plan allows one custom connector):

1. In a chat, press **+**, then **Plugins › Manage plugins**. On the plugins page, **Add › Add custom connector**.
2. Name it `Parachute`, paste your vault's address, and press **Continue**. Leave what Claude detects (**Sign in now**,
   **Register automatically**) and press **Add**.
3. Parachute's page opens: sign in with the same email, and on **Connect Claude** choose **Read & write** (it's
   chosen already) and press **Allow**. Leave **Full admin** off.

It's connected in Claude's apps on your desktop and phone too. Step by step, with pictures:
[Connect Claude](/docs/use/connect-your-ai/).

## 3. Ask it

Start a chat and try:

- "Remember this in Parachute: the seed library box goes by the garden gate. Ask Maya if the garden will host it."
- "Make me a live board of my open tasks in Parachute that I can tick off."
- "What did I tell you about the garden this month?"

Claude asks before it uses a tool, until you press **Always allow** for that tool. What it writes is in your vault, for any chat
later and any AI you connect. Your account page downloads all of it (**Download everything**: plain markdown, with
your files).

More to try: [live pages](/docs/use/claude-artifacts/), and [skills](/docs/use/skills/) that teach Claude how
you do things. If something doesn't work: [Claude won't connect](/docs/fix/connect/), and [every fix](/docs/fix/).

## What the open beta gives you

Free, no card: up to 5 vaults and 8 GB of files. Before any paid plan you'll hear about it well ahead. Your vault is
yours to take: it downloads as plain markdown that a server of your own reads as it is.

Parachute Cloud runs the 0.8 engine today, a release behind a server of your own: small files from a chat come with
its next release, and skills in your vault when it moves to 0.9. [Parachute Cloud](/docs/run/cloud/) says what differs.

## The app

The **Parachute app** (Android, Apple Silicon Macs) shows your vault: your records, the small screens your AI makes
for them, and a home you arrange. It has no public release yet; builds are shared by hand while it is tried. When you
have it, **Sign in with Parachute Cloud** with the same email.

## Other ways to start

- **Your own computer.** One command installs Parachute on a Mac or a Linux box; its setup page makes your account
  and first vault. [Run your own](/docs/run/self-host/).
- **Your own Cloudflare.** Parachute Cloud's code on a Cloudflare account you own: your account, your data, your bill,
  no computer to keep on. [Your own Cloudflare](/docs/run/own-cloudflare/).
- **Someone else's.** An organisation or a friend can give you a vault on theirs: connect with the address they give you.
- **Coming from Notion?** [Bring your workspace in](/docs/use/from-notion/) (on your own server for now).
