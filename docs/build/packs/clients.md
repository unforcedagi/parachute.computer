---
title: "Clients and sessions (a pack)"
summary: "For a practice: your clients, a note for each session, and what you agreed to follow up, each with a template, and a view of open follow-ups. The pack Parachute's app adds with one tap."
door: build
order: 3.61
checked: "parachute src/kit/packs/clients.json (the same block; scripts/check-packs.mjs compares them), src/kit/packs.test.ts (the starter packs), e2e/start.spec.ts"
---

Clients, a note for each session, and the follow-ups you or a client agreed to. For a coach, a tutor, a therapist, anyone who sees the same people over time. Each has a template (a session starts with How they are, Notes, Agreed and Next time), and the follow-ups have a saved view of the open ones, by client.

**In the app:** Vault, your vault, **Add a pack**, **Add Clients and sessions**. **To your AI:** "Apply the Clients and sessions pack from parachute.computer/docs/build/packs/clients.md to my vault."

A type you already have keeps its fields; a record of yours at one of these paths stays as it is. Adding it again changes nothing.

## For an AI applying it

Apply the block below exactly as written, its words too: read this page's markdown, https://parachute.computer/docs/build/packs/clients.md, not a summary of it. If you can't read the block exactly, stop and tell the person: don't rebuild it from a summary. The full rule is in [Templates and packs](/docs/build/templates/); in short:

1. `list-types { "include_schema": true }` and `query-records { "id": "Parachute/Receipts/clients" }`.
2. Each type: `manage-types { "tag": "<name>", "kind": "type", "description": …, "fields": … }` if it is missing. If it is already a type, keep its fields and send only the fields it lacks; if that is refused, add nothing and say so.
3. The records: one `create-record { "records": [ … ] }` with `"if_exists": "ignore"` inside each item. An item that comes back `existed: true` is the person's.
4. Last, the receipt, listing only what you made (types with the fields you sent; records that came back `existed: false`, with their `id` and `updatedAt`). Skip it if you made nothing and the receipt is there; if it is there and you made something, `update-record` it, keeping what it listed.
5. Tell the person what you added and what you left as theirs.

```text
create-record { "path": "Parachute/Receipts/clients", "tags": ["parachute-receipt"], "body": "Clients and sessions, version 1.",
  "fields": { "receipt": { "contract": 1, "id": "clients", "name": "Clients and sessions", "version": 1,
    "source": "https://parachute.computer/docs/build/packs/clients",
    "made": { "types": { "client": ["status", "working_on", "email", "next_session"], … }, "records": [ { "path": "Templates/client/Client", "id": "…", "updated_at": "…" }, … ] },
    "skipped": [ "what you left, and why, in a sentence each" ] } } }
```

```json
{
  "parachute_pack": 1,
  "id": "clients",
  "name": "Clients and sessions",
  "version": 1,
  "source": "https://parachute.computer/docs/build/packs/clients",
  "summary": "For a practice: your clients, a note for each session, and what you agreed to follow up, with a template each and a view of open follow-ups.",
  "types": {
    "client": {
      "description": "Someone you work with over time: a coaching client, a patient, a student.",
      "fields": {
        "status": {
          "type": "string",
          "enum": [
            "active",
            "paused",
            "finished"
          ],
          "default": "active"
        },
        "working_on": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "next_session": {
          "type": "date"
        }
      }
    },
    "session": {
      "description": "One conversation with a client.",
      "fields": {
        "date": {
          "type": "date"
        },
        "client": {
          "type": "reference"
        }
      }
    },
    "follow-up": {
      "description": "Something you or a client agreed to do, to check next time.",
      "fields": {
        "client": {
          "type": "reference"
        },
        "due": {
          "type": "date"
        },
        "done": {
          "type": "boolean",
          "default": false
        }
      }
    },
    "template": {
      "description": "A starting point for new records of one type. Its body is the new record's body.",
      "fields": {
        "for": {
          "type": "string"
        },
        "default": {
          "type": "boolean"
        },
        "guide": {
          "type": "string"
        }
      }
    }
  },
  "records": [
    {
      "path": "Templates/client/Client",
      "types": [
        "template"
      ],
      "fields": {
        "for": "client",
        "default": true,
        "guide": "Working on: their goal in their own words, one line. Background is what's worth knowing before a session."
      },
      "body": "## Working on\n\n## Background\n\n## Notes\n"
    },
    {
      "path": "Templates/session/Session",
      "types": [
        "template"
      ],
      "fields": {
        "for": "session",
        "default": true,
        "guide": "Agreed: one line for each thing either of you will do; each can also be a follow-up. Next time: what to ask first."
      },
      "body": "## How they are\n\n## Notes\n\n## Agreed\n\n## Next time\n"
    },
    {
      "path": "Templates/follow-up/Follow-up",
      "types": [
        "template"
      ],
      "fields": {
        "for": "follow-up",
        "default": true,
        "guide": "Who does it, and what done looks like, in a sentence."
      },
      "body": "## Done when\n"
    },
    {
      "path": "Parachute/Views/follow-up/Open",
      "tags": [
        "parachute-view"
      ],
      "fields": {
        "view": {
          "contract": 1,
          "layout": "table",
          "sort": {
            "by": "due",
            "dir": "asc"
          },
          "where": [
            {
              "field": "done",
              "op": "ne",
              "value": true
            }
          ],
          "group": "client"
        }
      },
      "body": ""
    }
  ]
}
```
