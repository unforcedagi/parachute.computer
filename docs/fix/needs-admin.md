---
title: "It needs admin"
summary: "Your AI was refused with `insufficient_scope`, `skill_needs_admin` or `tag_scope_violation`: it asked for more than you gave it. What admin is, and how to give it, or not."
door: fix
order: 2
errors:
  insufficient_scope: "what-the-refusal-says"
  skill_needs_admin: "skills"
  tag_scope_violation: "a-key-limited-to-some-tags"
checked: "parachute-core packages/vault/core/src/skills.ts (SkillWriteError), core/src/type-write.ts (writeTypeProblem, WRITE_MAY), core/src/mcp-refusal.ts, packages/hub/src/oauth-ui.ts; parachute-cloud workers/identity/src/ui.ts (consent: Read only, Read & write, Full admin, unticked); claude.ai runs of 2026-11-25 (claude.ai asks for read, write and admin)"
---

Every AI connection to a vault has one of three levels, chosen by you on the approval page when it connects:

| Level | It can |
|---|---|
| **Read** | read records, files and types |
| **Write** | also make and change records, attach files, make a new type and add fields to a type it made |
| **Admin** | also change any type (its fields, its parents), add or change a [skill](/docs/use/skills/), manage the vault's keys and settings |

Most of what you ask an AI for needs **Write**. Admin is for setting a vault up. claude.ai asks for all three levels every time it connects, so look at the approval page: on Parachute Cloud admin is off unless you choose it; on your own server it comes ticked today (untick it), and comes off from the next release.

## What the refusal says

The AI sees `isError` with `error_type: "insufficient_scope"` (or one of the two below) and a message that names what it tried, for example *"Changing the field "due" of "task", which you didn't make, needs admin. With write access you can make a new type, and add fields to a type you made."* It should tell you, not try another way round.

Choose one:

- **Do it another way at Write.** Often there is one: a new type instead of changing someone else's, or a new field instead of changing one.
- **Do it yourself** in the Parachute app, where you are the vault's owner.
- **Give the AI admin, on purpose.** Remove the connector in your AI app and add it again. On the approval page:
  - **Parachute Cloud:** choose **Full admin** (or tick **Also let it manage the vault**) for that vault.
  - **Your own server:** connect through the vault's own address, `https://<your server>/vault/<vault name>/mcp`, and tick admin there. The one address for all your vaults (`/mcp`) gives at most Write.

  When the setup is done, connect it again at **Read & write**.

## Skills

`skill_needs_admin`: only an admin key, or a pack you install, can add or change a skill. A skill is instructions every AI on the vault may follow, so one written by any AI that can write would keep steering the others. Reading and following skills needs no admin. The fix is the same as above: you write it in the app, or give your AI admin for the moment it writes it. More in [Skills in your vault](/docs/use/skills/#who-may-add-or-change-one).

## A key limited to some tags

`tag_scope_violation`: the key or connection can reach only records with certain tags, and this record is outside them, or the change would move it outside. Give it the record's tag, or use a key for the whole vault. An admin key limited to some tags counts as Write for types and skills. See [Keys and scopes](/docs/build/keys-and-scopes/).
