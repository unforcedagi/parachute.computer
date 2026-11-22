---
title: "Coming from Notion"
summary: "Bring your Notion workspace in as one file: tables stay tables, pages stay pages, and they are yours."
door: use
order: 1.5
checked: "parachute applets/vault.tsx (Import from Notion), src/kit/notion.ts, docs/PACKS.md (From Notion), e2e/notion.spec.ts; Notion's help page Export your content (www.notion.com/help/export-your-content), read 2026-11-22"
---

Your Notion workspace comes in as one file.

## 1. Export it from Notion

On the web or the desktop app: **Settings**, under **Workspace** choose **General**, then **Export all workspace content**. Pick **Markdown & CSV**. For one page and what is inside it: **•••** at the top right of the page, **Export**, **Markdown & CSV**, and switch on **Include subpages**.

Notion gives you a .zip. A big workspace can take a while: Notion emails a link, which lasts 7 days. Keep the .zip as it is, without unzipping it.

## 2. Bring it in

In the Parachute app: **Vault**, your vault, **Import from Notion**, and choose the .zip (up to 200 MB). On a new vault the first screen leads there: **Start here**, **Bring in what you have**.

## What becomes what

| In Notion | In Parachute |
|---|---|
| A database, say Reading List | A type, `reading-list`. Its columns are its fields: dates, numbers, yes/no, lists, and links to other rows stay what they were. Rows a view hid come too. |
| A row | A record of that type. The row's page is its words. |
| A page | A record at the same place in the tree |
| A link between pages | A link between records |
| Images and attachments | Not yet. They stay in your export, and the app says which. |

Everything lands under `Notion/`, so nothing of yours is touched. Importing the same export again changes nothing. It is listed in Vault under **Packs**, **Installed packs**.

## Then

Open a type in Vault: it is a table you can sort, filter and group, and save as a view, as you would a Notion database. [Connect your AI](/docs/use/connect-your-ai/) and ask it about your work: "Which client work is due next?"
