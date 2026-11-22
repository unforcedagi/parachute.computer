---
title: "Get Parachute"
summary: "A vault of your own, the Parachute app, one sign-in, then something of yours in it and your AI connected."
door: use
order: 1
status: next
status_note: "The Parachute app has no public release yet. Builds for Android and Apple Silicon Macs come from the app's repository and are shared by hand while it is tried; this page says what the first release will ask of you."
checked: "parachute README.md (Install and sign in), docs/SIMPLE.md, src/key/KeyStart.tsx, src/views/AddParachute.tsx, src/frame/views/Launcher.tsx (Start here); parachute-cloud workers/identity/wrangler.toml; T-476 first-run walks 2026-11-21"
---

Parachute keeps your notes and records in a **vault** that is yours, and lets the AIs you choose read and write it, so
they remember what you tell them. You need two things: a vault, and the **Parachute app** to see it.

## 1. A vault

Pick one:

- **Your own Cloudflare.** Parachute's code on a Cloudflare account you own: you hold the account, the data and the bill, and there is no computer to keep on. For someone at home in a terminal. See [Your own Parachute on your own Cloudflare](/docs/run/own-cloudflare/).
- **Parachute Cloud.** Nothing to set up: sign up at [my.parachute.computer](https://my.parachute.computer/console) with your email. We run the server; your vault is yours to export. See [Parachute Cloud](/docs/run/cloud/).
- **Your own computer.** One command installs Parachute on a Mac or a Linux box, and its setup page makes your account and first vault. See [Run your own](/docs/run/self-host/).
- **Someone else's.** An organisation or a friend can give you a vault on theirs.

## 2. The app

Android (8 or newer, 64-bit ARM) and Apple Silicon Macs. The Mac build isn't notarised yet, so macOS asks once before it opens it.

## 3. Sign in

The app's first screen has a way in for each:

- **Parachute Cloud:** **Sign in with Parachute Cloud**, then the code it mails you.
- **Your own computer, or someone else's:** **Sign in with its address**. Type the address its setup page showed (say `http://192.168.1.20:1939`), say whose it is (**Mine**), and sign in on its own page with the account you made there. It asks you to approve the Parachute app: that is this app, on your device.
- **Your own Cloudflare:** sign in with your key: **Make a new key** or **Pair from a device that has your key**, then your Parachute's address ([how](/docs/run/own-cloudflare/)).

The first sign-in reads your **home vault**. Other vaults on the same server show in Settings as one line each, **Open**, and are read only after you tap it.

## 4. Make it yours

A new vault opens on **Start here**:

- **Bring in what you have.** [Import your Notion workspace](/docs/use/from-notion/), or start from a [pack](/docs/use/templates-and-packs/): clients and sessions, a reading list, or people, projects, meetings and tasks.
- **Connect your AI.** One address for Claude or ChatGPT. When your server asks, give it **Write** on your vault so it can save what you tell it: [Connect your AI](/docs/use/connect-your-ai/).

Then ask your AI to remember something, start a new chat, and ask again. What it wrote is in the app (Notes, Vault), and you can change it there.
