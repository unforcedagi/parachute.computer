---
title: "A type or field isn't there"
summary: "Your AI asked for a type the vault doesn't have, used a plain tag as a type, or wrote a field that doesn't fit. How to tell which, and the fix."
door: fix
order: 4
errors:
  tag_not_found: "no-type-by-that-name"
  unknown_tag: "no-type-by-that-name"
  tag_kind: "a-tag-not-a-type"
  schema_validation: "a-field-doesnt-fit"
  retype_conflict: "a-field-doesnt-fit"
  field_not_indexed: "a-field-cant-be-counted"
checked: "parachute-core next: packages/vault/core/src/type-write.ts (write defines a type), core/src/tag-kind.ts, core/src/query-warnings.ts (unknown_tag with did_you_mean, scan, field_not_indexed for aggregate), core/src/query-operators.ts, core/src/schema-defaults.ts (strict fields), core/src/mcp.ts (tag_not_found from list-types and rename); parachute-cloud next workers/vault/src/mcp.ts (0.8: refusals as JSON-RPC errors)"
---

A **type** says what a record is (`book`, `task`, `person`) and which fields it has. Your AI learns the vault's types
when it connects (`list-types`, and the `vault-guide` skill where skills work). When it guesses a name instead, one of
these happens.

## No type by that name

- **A search for a type that isn't there** finds nothing, with an `unknown_tag` warning that may carry `did_you_mean`
  (`books` → `book`). Not a refusal: use the suggested name.
- **`tag_not_found`**: `list-types` for one name, or a rename, found no such type. Check the name with `list-types`.
- **Writing a record with a new type makes the type.** `create-record { types: ["book"] }` on a vault with no `book`
  defines it, and the AI that made it may add fields to it later (`manage-types` on a new name defines it too). So if
  the AI meant a type you already have under another name (`reading`, `books`), ask it to use that one, and delete the
  stray type in the app.

## A tag, not a type

`tag_kind`: the name is a plain tag (a label like `pinned`), and the AI used it as a type, or the other way round. The
message says which call to use, for example `tag: "pinned"` instead of `type: "pinned"`. Turning a plain tag into a type
takes admin ([It needs admin](/docs/fix/needs-admin/)).

## A field doesn't fit

- **`schema_validation`**: a value doesn't fit a field the type marks `strict` (or the kind of an indexed field: text in
  a number field). `violations` lists every field that failed, and none of the write was applied. Fix those and write
  again. A value that doesn't fit a field that isn't strict is saved, with a warning.
- **`retype_conflict`**: changing a field's kind (text to number, say) would leave records whose values no longer fit.
  The message says how many. Change those records first, or make a new field.

## A field can't be counted

`field_not_indexed`: a count or sum grouped by a field the type doesn't index. Declare it `indexed: true` on the type
(`manage-types`), or count without grouping on it. The same thing in a `group_by` can come back as `invalid_query`
with `code: "FIELD_NOT_INDEXED"`. Sorting or filtering on such a field works, slower, with a `scan` warning.

## On Parachute Cloud today

Cloud runs 0.8, where a type is a tag with fields: the AI uses `tags` and `metadata` where these pages say `types` and
`fields`, and giving a tag fields (`update-tag`) takes admin. Refusals come as MCP errors with `error_type` in their
`data`, and some above (`tag_kind`, `retype_conflict`) don't exist there. See [Parachute Cloud](/docs/run/cloud/).
