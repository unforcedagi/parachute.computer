---
title: "It needs admin"
summary: "Your AI was refused with `insufficient_scope`, `skill_needs_admin`, `tag_scope_violation` or `unknown_tool`: it asked for more than you gave it. What admin is, and how to give it, or not."
door: fix
order: 2
errors:
  insufficient_scope: "what-the-refusal-says"
  unknown_tool: "a-tool-it-cant-see"
  skill_needs_admin: "skills"
  tag_scope_violation: "a-key-limited-to-some-tags"
  tag_in_use_by_tokens: "a-key-limited-to-some-tags"
checked: "parachute-core next: packages/vault/core/src/skills.ts (SkillWriteError), core/src/type-write.ts (writeTypeProblem, WRITE_MAY), core/src/mcp-refusal.ts, packages/hub/src/oauth-ui.ts (scopes pre-ticked), oauth-handlers.ts (per-vault None/Read/Write); parachute-cloud next: workers/vault/src/discovery.ts (read and write advertised), workers/identity/src/ui.ts and oauth-authorize.ts (the level selector on /mcp: Read only, Read & write, Full admin); agentdocs core docs-tool.ts (unknown_tool says the caller's level); claude.ai runs of 2026-11-25 (Claude asks for every scope a server advertises)"
---

Every AI connection to a vault has one of three levels, chosen by you on the approval page when it connects:

| Level | It can |
|---|---|
| **Read** | read records, files and types |
| **Write** | also make and change records, attach files, make a new type and add fields to a type it made |
| **Admin** | also change any type (its fields, its parents), add or change a [skill](/docs/use/skills/), manage the vault's keys and settings |

Most of what you ask an AI for needs **Write**. Admin is for setting a vault up, so give it on purpose:

- **Parachute Cloud** offers Claude read and write only. Admin is there only if you choose **Full admin** yourself, on
  the approval page of `https://my.parachute.computer/mcp`.
- **Your own server:** Claude asks for every level a server offers. Through a vault's own address admin comes ticked
  on the approval page: untick it unless you mean it. Through `https://<your server>/mcp` the most is Write.

## What the refusal says

The AI sees `isError` with `error_type: "insufficient_scope"` (or one of those below) and a message that names what it
tried and that it needs admin, for example *"Changing "task", which you didn't make, needs admin. With write access you
can make a new type, and add fields to a type you made."* It should tell you, not try another way round.

Choose one:

- **Do it another way at Write.** Often there is one: a new type instead of changing someone else's, a new field
  instead of changing one.
- **Do it yourself** in the Parachute app, where you are the vault's owner.
- **Give the AI admin, for the job.** Remove the connector in your AI app and add it again:
  - **Parachute Cloud:** with the address `https://my.parachute.computer/mcp`; on the approval page pick the vault and
    choose **Full admin**.
  - **Your own server:** with the vault's own address, `https://<your server>/vault/<vault name>/mcp`, and leave admin
    ticked.

  When the job is done, connect it again at **Read & write**.

## A tool it can't see

`unknown_tool`: a connection sees only the tools its level allows, so a tool that needs admin isn't listed for a
Write connection, and calling it by name gets `unknown_tool` (the message says the connection's level). The name may
also be wrong: Parachute Cloud today (0.8) says `create-note` where 0.9 says `create-record`. If the tool is one that
needs admin, the fix is above.

## Skills

`skill_needs_admin`: only an admin key, or a pack you install, can add or change a skill. A skill is instructions every
AI on the vault may follow, so one written by any AI that can write would keep steering the others. Reading and
following skills needs no admin. Write it yourself in the app, or give your AI admin for the moment it writes it. More
in [Skills in your vault](/docs/use/skills/#who-may-add-or-change-one).

## A key limited to some tags

`tag_scope_violation`: the key or connection can reach only records with certain tags, and this record is outside
them, or the change would move it outside. Give it the record's tag, or use a key for the whole vault. An admin key
limited to some tags counts as Write for types and skills. `tag_in_use_by_tokens`: deleting or merging a tag that a key is
limited to would change what that key reaches, so it's refused and the keys are named. Change or end those keys first,
or pass `force: true` if you mean it. See [Keys and scopes](/docs/build/keys-and-scopes/).
