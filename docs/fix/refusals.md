---
title: "Every refusal, and its fix"
summary: "When Parachute refuses a call it says why in `error_type`. Each one an AI may meet, in plain words, with what to do."
door: fix
order: 9
errors:
  unknown_parameter: "a-call-thats-not-right"
  missing_required_field: "a-call-thats-not-right"
  invalid_query: "a-call-thats-not-right"
  invalid_request: "a-call-thats-not-right"
  mutually_exclusive: "a-call-thats-not-right"
  invalid_search_syntax: "a-call-thats-not-right"
  cursor_invalid: "a-call-thats-not-right"
  batch_too_large: "a-call-thats-not-right"
  path_conflict: "a-name-thats-taken"
  target_exists: "a-name-thats-taken"
  size_mismatch: "a-file-that-didnt-arrive-whole"
  digest_mismatch: "a-file-that-didnt-arrive-whole"
  semantic_unavailable: "search-by-meaning-is-off"
  plan_required: "parachute-cloud-limits"
  internal_error: "something-broke"
checked: "parachute-core next: packages/vault/core/src/mcp-refusal.ts (one way to refuse: isError with structuredContent {error_type, message, hint}; the domain mapping), core/src/mcp-short.ts (unknown_parameter's hint), core/src/attachment/inline.ts (size and digest checks), core/src/store.ts (semantic_unavailable); agentdocs core docs-tool.ts (REFUSAL_DOCS: refusals carry `docs`); parachute-cloud next workers/vault/src/mcp.ts (0.8: JSON-RPC errors), caps.ts (plan_required, storage_cap_exceeded)"
---

A refusal comes back as a tool result with `isError: true` and `structuredContent`:

```json
{ "error_type": "conflict", "message": "…", "hint": "…", "docs": "https://parachute.computer/docs/v/0.9/fix/conflict/" }
```

Nothing was changed by a refused call unless the message says so. Read `message` and `hint` first: they name the
record, the field and the fix. From the next release, `docs` is the page with the fix, for the vault's version; the
`docs` tool reads it.

**On Parachute Cloud today** (0.8) a refusal is an MCP error instead, with `error_type` in its `data`, and an unknown
tool is a plain "Unknown tool" message. The meanings below are the same.

| `error_type` | What it means | Fix |
|---|---|---|
| `insufficient_scope`, `unknown_tool`, `skill_needs_admin`, `tag_scope_violation`, `tag_in_use_by_tokens` | the call needs more access than the connection has, or a key's reach is in the way | [It needs admin](/docs/fix/needs-admin/) |
| `tag_not_found`, `unknown_tag`, `tag_kind`, `schema_validation`, `retype_conflict`, `field_not_indexed` | a type, tag or field isn't what the call expected | [A type or field isn't there](/docs/fix/unknown-type/) |
| `inline_too_large`, `file_too_large`, `image_too_large`, `blocked_upload_extension`, `unsupported_attachment_type`, `storage_cap_exceeded`, `attachments_not_included` | a file too big, of a kind the vault won't keep or the AI can't read, or no room | [A file is too big](/docs/fix/file-too-large/) |
| `conflict`, `precondition_required`, `transition_conflict` | the record changed since it was read | [It changed somewhere else](/docs/fix/conflict/) |
| `not_found`, `ambiguous_path` | no record there, or one name with several files | [It isn't there](/docs/fix/not-found/) |
| `unknown_parameter`, `missing_required_field`, `invalid_query`, `invalid_request`, `mutually_exclusive`, `invalid_search_syntax`, `cursor_invalid`, `batch_too_large` | the call isn't shaped right | [below](#a-call-thats-not-right) |
| `path_conflict`, `target_exists` | the name is taken | [below](#a-name-thats-taken) |
| `size_mismatch`, `digest_mismatch` | a file arrived different from what the call said | [below](#a-file-that-didnt-arrive-whole) |
| `semantic_unavailable` | search by meaning is off | [below](#search-by-meaning-is-off) |
| `plan_required` | a Cloud account without a plan | [below](#parachute-cloud-limits) |
| `internal_error` | a bug on the server | [below](#something-broke) |

Not listed: an `error_type` you meet that isn't here says what it means in its `message`; read that first.

## A call that's not right

A parameter is missing, unknown, or the wrong shape. `field` names it and `hint` shows a good value
(`unknown_parameter`: "Did you mean …?"). `vault-info { help: "<tool name>" }` gives the tool's full reference; so does
the [MCP reference](/docs/build/reference/mcp/). `batch_too_large`: do it in smaller batches. `cursor_invalid`: start
the list again without a cursor.

## A name that's taken

`path_conflict`, `target_exists`: a record (or tag) already has that path or name. Pick another, or change the one
that's there.

## A file that didn't arrive whole

`size_mismatch`, `digest_mismatch`: the bytes sent don't match the size or SHA-256 the call gave, usually a file cut
short while typing it. Nothing was stored. Send it again, or see [A file is too big](/docs/fix/file-too-large/).

## Search by meaning is off

`semantic_unavailable`: a search asked for meaning only (`semantic: true`), and the vault has no meaning index (a new
server starts without one). Search by words instead, and tell the person; whoever keeps the server can turn it on.
An ordinary search falls back to words by itself, with a warning.

## Parachute Cloud limits

`plan_required`: the account has no plan, so its vaults are read-only; reading and exporting still work. In the open
beta every account has one; write to hello@parachute.computer if you see this.

## Something broke

`internal_error`: not the AI's fault and not the person's. Try once more; if it repeats, tell the person what was being
done. On your own server the log has it; on Parachute Cloud, write to hello@parachute.computer.
