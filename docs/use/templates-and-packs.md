---
title: "Start from a pack"
summary: "Start a vault with one tap: people and projects, clients and sessions, or a reading list; new records start from a template, and any record can become one."
door: use
order: 3.5
checked: "parachute applets/vault.tsx (Packs, New from the template, Make this a template), docs/PACKS.md, src/kit/packs/*.json, e2e/packs.spec.ts, e2e/start.spec.ts"
---

A **pack** adds a set of kinds of record to a vault, each with its fields and a template. A **template** is how a new record starts.

## Add a pack

In the app, open **Vault**, then your vault, then **Add a pack** (on a new vault, **Start here** leads there). Each pack lists what it adds before you tap **Add**, and says afterwards what it added and what it left as you had it:

- [**Core types**](/docs/build/packs/core-types/): people, projects, meetings and tasks, a template for each, and a view of open tasks.
- [**Clients and sessions**](/docs/build/packs/clients/): for a practice (a coach, a tutor, a therapist): clients, a note for each session, the follow-ups you agreed, and a view of the open ones by client.
- [**Reading list**](/docs/build/packs/reading/): books, with a template for notes and a view of what you're reading now.

**Installed packs** shows what a vault has. Adding a pack again changes nothing. Coming from Notion? [Import your workspace](/docs/use/from-notion/): it lands the same way.

Or ask your AI: "Apply the Core types pack from parachute.computer/docs/build/packs/core-types.md to my vault." It reads [the same pack](/docs/build/packs/core-types/) and adds the same things.

## Start from a template

**New meeting** starts from the meeting template: its headings are there for you to fill in. The template is an ordinary record in `Templates/meeting/`: change it, and new meetings start from your version. Records you made before keep what they have.

## Make your own

On any record, **Make this a template** keeps its headings and makes a template of them. The first template for a kind of record is the one **New** uses.
