---
title: "A type or field isn't there"
summary: "Your AI asked for a type the vault doesn't have, used a plain tag as a type, or wrote a field that doesn't fit. How to tell which, and the fix."
door: fix
order: 4
errors:
  tag_not_found: "no-type-by-that-name"
  tag_kind: "a-tag-not-a-type"
  schema_validation: "a-field-doesnt-fit"
  retype_conflict: "a-field-doesnt-fit"
  field_not_indexed: "a-field-cant-be-sorted-or-counted"
checked: "parachute-core packages/vault/core/src/type-write.ts (write defines types), core/src/tag-kind.ts, core/src/mcp-refusal.ts (schema_validation), core/src/query-warnings.ts (field_not_indexed), core/src/mcp.ts (did_you_mean); contracts/write-defines-types"
---

A **type** says what a record is (`book`, `task`, `person`) and which fields it has. Your AI learns the vault's types when it connects (the connection's own words, and the `vault-guide` skill where skills work). When it guesses a name instead, one of these happens.

## No type by that name

- **A search for a type that isn't there** finds nothing, and the reply may carry `did_you_mean` with the closest names (`books` → `book`). That isn't a refusal: the AI should use the suggested name.
- **`tag_not_found`**: a change to a type or tag that doesn't exist (renaming it, adding a field to it). Check the name with `list-types`, or the vault's guide.
- **Writing a record with a new type makes the type.** `create-record { types: ["book"] }` on a vault with no `book` defines it, and the AI that made it may add fields to it later. So if the AI meant a type you already have under another name (`reading`, `books`), ask it to use that one, and delete the stray type in the app.

## A tag, not a type

`tag_kind`: the name is a plain tag (a label like `pinned`), and the AI used it as a type, or the other way round. The message says which call to use, for example `tag: "pinned"` instead of `type: "pinned"`. To turn a plain tag into a type takes admin ([It needs admin](/docs/fix/needs-admin/)).

## A field doesn't fit

- **`schema_validation`**: a field's value doesn't match the type (text in a number field, a value not in the list a field allows). `violations` lists every field that failed, and none of the write was applied. Fix those and write again.
- **`retype_conflict`**: changing a field's kind (text to number, say) would leave records whose values no longer fit. The message says how many. Change those records first, or make a new field.

## A field can't be sorted or counted

`field_not_indexed`: a query sorts, filters with a range, or counts on a field the type doesn't index. The hint names the field: declare it `indexed: true` on the type (`manage-types`), or query without that part.

## On Parachute Cloud today

Cloud runs 0.8, where a type is a tag with fields. The AI uses `tags` and `metadata` where these pages say `types` and `fields`, and `update-tag` to give a tag fields; the refusals are the same. See [Parachute Cloud](/docs/run/cloud/).
