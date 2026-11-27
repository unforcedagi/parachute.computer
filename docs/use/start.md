---
title: "Start on Parachute Cloud"
nav: "Start here"
summary: "Five minutes: an account, a vault, and your AI connected. Free in the open beta."
door: use
order: 1
checked: "parachute-cloud next 005d073: workers/identity/src/ui.ts (Create your account, Name your vault, Create my vault, Connect your AI, consent: Read only / Read & write / Full admin), email-templates.ts, plans.ts (open beta: free, 5 vaults, 8 GB of files), console.ts (export); my.parachute.computer read 2026-11-25; claude.ai runs of 2026-11-25 (Plugins › Add › Add custom connector)"
---

A **vault** is where Parachute keeps what you and your AI write. Any AI you connect reads and writes it, so what you
tell one, the others know. Three steps on **Parachute Cloud**, where we run the server
([other ways to start](#other-ways-to-start)).

## 1. Make an account and a vault

1. Go to **[my.parachute.computer](https://my.parachute.computer)**, type your email and press **Email me a sign-in link**.
2. Open the email (*Welcome to Parachute*) and press **Create my account & sign in**, or type its 6-digit code. The
   link works once, for 10 minutes. No password.
3. **Name your vault**: a short name in lowercase, like `field-notes` or `home`. Press **Create my vault**.

## 2. Connect your AI

Give your AI this address, the same for every Parachute Cloud account:

```
https://my.parachute.computer/mcp
```

**In Claude**, the path we've tested most, on [claude.ai](https://claude.ai):

1. In a chat, press **+**, then **Plugins › Manage plugins**. On the plugins page, **Add › Add custom connector**.
2. Name it `Parachute`, paste the address, and press **Continue**, then **Add**.
3. Parachute's page opens. Sign in with the same email, pick your vault, keep **Read & write** and press **Allow**.

**ChatGPT or a local model** takes the same address. [Connect your AI](/docs/use/connect-your-ai/) has each one's
steps, the screens, and how far each is tested.

## 3. Ask it

- "Remember this in Parachute: the seed library box goes by the garden gate. Ask Maya if the garden will host it."
- In a new chat: "What did I tell you about the garden this month?"
- "Make me a live board of my open tasks in Parachute that I can tick off."

What it writes is in your vault, for any chat later and any AI you connect.

Next: [live pages](/docs/use/claude-artifacts/), and [skills](/docs/use/skills/) that teach your AI how you do
things. Stuck? [It won't connect](/docs/fix/connect/), and [every fix](/docs/fix/).

## What you get

- **Free in the open beta, no card:** up to 5 vaults, 500 MiB of notes and 8 GiB of files. Before any paid plan
  you'll hear about it well ahead.
- **Yours to take:** your account page downloads all of it (**Download everything**: plain markdown, with your
  files), and a server of your own reads that as it is.
- **The Parachute app** (Android, Apple Silicon Macs) shows your vault and the small screens your AI makes for it.
  No public release yet.

<details>
<summary>More: the app, what differs on Cloud today, the fine print of connecting</summary>

- The app's builds are shared by hand while it is tried. When you have it, **Sign in with Parachute Cloud** with the
  same email. It shows your records, the small screens your AI makes, and a home you arrange.
- Parachute Cloud runs the 0.8 engine today, a release behind a server of your own: small files from a chat come
  with its next release, and skills in your vault when it moves to 0.9. [Parachute Cloud](/docs/run/cloud/) says what
  differs.
- In step 2 leave what Claude detects (**Sign in now**, **Register automatically**), and on Parachute's page leave
  **Full admin** unchosen. **Read & write** is chosen already.
- Each vault also has its own address, under **Connect your AI** on its card; it skips the choice of vault.
- On claude.ai's **Manual** setting Claude asks before each tool call, and **Always allow** on the card stops that for
  the tool; on **Auto** (claude.ai's default now) it goes ahead.

</details>

## Other ways to start

- **Your own computer:** one command on a Mac or a Linux box. [Run your own](/docs/run/self-host/).
- **Your own Cloudflare:** your account, your data, your bill, no computer to keep on.
  [Your own Cloudflare](/docs/run/own-cloudflare/).
- **Someone else's:** an organisation or a friend can give you a vault on theirs. Connect with the address they give you.
- **Coming from Notion?** [Bring your workspace in](/docs/use/from-notion/) (on your own server for now).
