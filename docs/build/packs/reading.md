---
title: "Reading list (a pack)"
summary: "Books you want to read, are reading and have read, with a template for notes and a view of what you're reading now. The pack Parachute's app adds with one tap."
door: build
order: 3.62
checked: "parachute src/kit/packs/reading.json (the same block; scripts/check-packs.mjs compares them), src/kit/packs.test.ts (the starter packs), e2e/start.spec.ts"
---

Books you want to read, are reading and have read, with the author, a rating and when you finished. A new book starts with Why I picked it, Notes and Quotes, and a saved view shows what you're reading now.

**In the app:** Vault, your vault, **Add a pack**, **Add Reading list**. **To your AI:** "Apply the Reading list pack from parachute.computer/docs/build/packs/reading.md to my vault."

A type you already have keeps its fields; a record of yours at one of these paths stays as it is. Adding it again changes nothing.

## For an AI applying it

Apply the block below exactly as written, its words too: read this page's markdown, https://parachute.computer/docs/build/packs/reading.md, not a summary of it. If you can't read the block exactly, stop and tell the person: don't rebuild it from a summary. The full rule is in [Templates and packs](/docs/build/templates/); in short:

1. `list-types { "include_schema": true }` and `query-records { "id": "Parachute/Receipts/reading" }`.
2. Each type: `manage-types { "tag": "<name>", "kind": "type", "description": …, "fields": … }` if it is missing. If it is already a type, keep its fields and send only the fields it lacks; if that is refused, add nothing and say so.
3. The records: one `create-record { "records": [ … ] }` with `"if_exists": "ignore"` inside each item. An item that comes back `existed: true` is the person's.
4. Last, the receipt, listing only what you made (types with the fields you sent; records that came back `existed: false`, with their `id` and `updatedAt`). Skip it if you made nothing and the receipt is there; if it is there and you made something, `update-record` it, keeping what it listed.
5. Tell the person what you added and what you left as theirs.

```text
create-record { "path": "Parachute/Receipts/reading", "tags": ["parachute-receipt"], "body": "Reading list, version 1.",
  "fields": { "receipt": { "contract": 1, "id": "reading", "name": "Reading list", "version": 1,
    "source": "https://parachute.computer/docs/build/packs/reading",
    "made": { "types": { "book": ["author", "status", "rating", "finished"], … }, "records": [ { "path": "Templates/book/Book", "id": "…", "updated_at": "…" }, … ] },
    "skipped": [ "what you left, and why, in a sentence each" ] } } }
```

```json
{
  "parachute_pack": 1,
  "id": "reading",
  "name": "Reading list",
  "version": 1,
  "source": "https://parachute.computer/docs/build/packs/reading",
  "summary": "Books you want to read, are reading and have read, with a template for notes and a view of what you're reading now.",
  "types": {
    "book": {
      "description": "A book you want to read, are reading, or have read.",
      "fields": {
        "author": {
          "type": "string"
        },
        "status": {
          "type": "string",
          "enum": [
            "want to read",
            "reading",
            "read"
          ],
          "default": "want to read"
        },
        "rating": {
          "type": "number"
        },
        "finished": {
          "type": "date"
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
      "path": "Templates/book/Book",
      "types": [
        "template"
      ],
      "fields": {
        "for": "book",
        "default": true,
        "guide": "Why I picked it: a line. Quotes: the words, then the page."
      },
      "body": "## Why I picked it\n\n## Notes\n\n## Quotes\n"
    },
    {
      "path": "Parachute/Views/book/Reading now",
      "tags": [
        "parachute-view"
      ],
      "fields": {
        "view": {
          "contract": 1,
          "layout": "table",
          "sort": null,
          "where": [
            {
              "field": "status",
              "op": "eq",
              "value": "reading"
            }
          ],
          "group": null
        }
      },
      "body": ""
    }
  ]
}
```
