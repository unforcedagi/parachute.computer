---
title: "Skills in your vault"
summary: "A skill is a record that teaches your AI how to do one thing your way. Every connected AI may follow it, so only an admin key or a pack you install can add or change one."
door: use
order: 2.6
checked: "parachute-core packages/vault/core/src/skills.ts, core/src/skill-files.ts, core/src/vault-projection.ts (SKILLS_LINE), src/mcp-skills.ts, src/mcp-modern.ts; contracts/suites/door/skills.test.ts"
---

A **skill** is a record of type `skill`. Its body is instructions, its `description` says when to use it, and every AI connected to your vault may read it and follow it: how you write product copy, how you check in with a client, how you file a receipt.

## How your AI finds them

- **Every AI.** Once your vault has a skill it can see, the connection tells your AI so. It lists them with `query-records { type: "skill" }` and reads the one a task matches before it starts.
- **Claude Code**, with Skills over MCP on: it lists them as skills (`parachute:<name>`) and loads one only when a task matches. Beside yours it gets two from Parachute: `vault-guide` (your vault's types and fields, made fresh from the vault) and `live-page` (how to [build a live page](/docs/use/claude-artifacts/)). Anthropic is still rolling this out; where it isn't on, the first way works.

## Make one

With an admin key (your own connection as the owner), ask your AI to write it, or write it yourself:

```
create-record {
  path: "Skills/Shop copy",
  types: ["skill"],
  fields: { description: "How to write product copy for the shop. Use when writing a listing or a caption." },
  body: "# Shop copy\n\nShort sentences. Say what it's made of and who made it. Read [the voice notes](voice.md)."
}
```

- Its name is the last part of its path as a slug (`shop-copy`), or a `name` field.
- Its files are skill records under its path: `Skills/Shop copy/voice` is `voice.md`. Only skill records count, so nobody can slip a file in beside it.
- A body that starts with `---` frontmatter is taken whole as a `SKILL.md`, so you can paste one from elsewhere.
- A skill without a `description` isn't listed.

## Who may add or change one

Only an admin key, or a pack you install. A skill is instructions every connected AI may follow, so a skill planted by anyone who can write would keep steering your AI. Any other key is refused with `skill_needs_admin`, which says why. That covers making a skill, changing its words or fields, taking the type off, and defining the `skill` type itself. Renaming a record a skill links to never rewrites the skill, and a recording attached to a skill never has its transcript written into it.

Reading and following skills needs no admin. Deleting one is like deleting any record: history keeps it.

The generated `vault-guide` shows your types and fields only by name. Anyone who can write may add a type, so it never repeats a type's description as instructions.

## Limits

- **Your own server** has skills and the admin rule once you update to the Parachute release that carries them. **Parachute Cloud doesn't yet:** until it takes that release it lists no skills and refuses skill writes from every key.
- **claude.ai chat** doesn't say yet whether it shows a connector's skills. The connection's own words reach every AI either way.
- **Claude Code asks you to allow each version** of a skill (when it isn't in auto mode). A changed skill asks again.
