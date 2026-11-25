---
title: "Every refusal, and its fix"
summary: "When Parachute refuses a call it says why in `error_type`. This is each one an AI may meet, in plain words, with what to do."
door: fix
order: 9
errors:
  conflict: "changed-somewhere-else"
  precondition_required: "changed-somewhere-else"
  not_found: "not-there"
  ambiguous_path: "not-there"
  unknown_tool: "a-tool-or-parameter-it-doesnt-know"
  unknown_parameter: "a-tool-or-parameter-it-doesnt-know"
  missing_required_field: "a-call-thats-not-right"
  invalid_query: "a-call-thats-not-right"
  invalid_request: "a-call-thats-not-right"
  semantic_unavailable: "search-by-meaning-is-off"
  internal_error: "something-broke"
checked: "parachute-core packages/vault/core/src/mcp-refusal.ts (one way to refuse: isError with structuredContent {error_type, message, hint}), packages/vault/docs/HTTP_API.md (MCP refusals); every error_type in packages/vault/core/src and packages/vault/src"
---

A refusal comes back as a tool result with `isError: true` and `structuredContent`:

```json
{ "error_type": "conflict", "message": "…", "hint": "…" }
```

Nothing was changed by a refused call unless the message says so. Read `message` and `hint` first: they name the record, the field and the fix. Then:

| `error_type` | What it means | Fix |
|---|---|---|
| `insufficient_scope`, `skill_needs_admin`, `tag_scope_violation` | the call needs more access than the connection has | [It needs admin](/docs/fix/needs-admin/) |
| `tag_not_found`, `tag_kind`, `schema_validation`, `retype_conflict`, `field_not_indexed` | a type, tag or field isn't what the call expected | [A type or field isn't there](/docs/fix/unknown-type/) |
| `inline_too_large`, `file_too_large`, `image_too_large`, `blocked_upload_extension`, `unsupported_attachment_type` | a file is too big, or a kind the vault doesn't keep | [A file is too big](/docs/fix/file-too-large/) |
| `conflict`, `precondition_required` | the record changed since it was read | [below](#changed-somewhere-else) |
| `not_found`, `ambiguous_path` | no record there, or two match | [below](#not-there) |
| `unknown_tool`, `unknown_parameter` | a name the server doesn't know | [below](#a-tool-or-parameter-it-doesnt-know) |
| `missing_required_field`, `invalid_query`, `invalid_request` | the call isn't shaped right | [below](#a-call-thats-not-right) |
| `semantic_unavailable` | search by meaning is off | [below](#search-by-meaning-is-off) |
| `internal_error` | a bug on the server | [below](#something-broke) |

## Changed somewhere else

`conflict`: someone (you in the app, another AI, a live page) changed the record after the AI read it, and the AI passed `if_updated_at`, so nothing was overwritten. The reply carries the record's `current_updated_at`. Read it again, make the change on the new version, and write with the new `updatedAt`. A live page should show the new version and say so ("This changed somewhere else, showing the latest").

`precondition_required`: the call changes a whole body and didn't say which version it read. Read the record, then pass its `updatedAt` as `if_updated_at`. `force: true` skips the check and overwrites: only when the person asked for that.

## Not there

`not_found`: no record (or tag, or attachment) by that id or path, or none the connection can see. Search for it (`query-records` with `search`) rather than guess the path. `ambiguous_path`: two records match a path that differs only in case or spacing; `candidates` lists them; use the id.

## A tool or parameter it doesn't know

`unknown_tool`: the server has no tool by that name for this connection. Either the name is wrong (0.8 servers, Parachute Cloud today, say `create-note` where 0.9 says `create-record`), or the tool needs more access than the connection has, in which case the server doesn't list it ([It needs admin](/docs/fix/needs-admin/)). `unknown_parameter`: a parameter the tool doesn't take; the hint lists the ones it does.

## A call that's not right

`missing_required_field`, `invalid_query`, `invalid_request`: a parameter is missing or the wrong shape. `field` names it and `hint` shows a good value. Ask `vault-info { help: "<tool name>" }` for the tool's full reference, or read the [MCP reference](/docs/build/reference/mcp/).

## Search by meaning is off

`semantic_unavailable`: the vault has no meaning index (a new server starts without one). Search by words instead (`search` without `semantic: true`), and tell the person; whoever keeps the server can turn it on.

## Something broke

`internal_error`: not the AI's fault and not the person's. Try once more; if it repeats, tell the person what was being done. On your own server the log has it; on Parachute Cloud, write to hello@parachute.computer.
