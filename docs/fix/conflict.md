---
title: "It changed somewhere else"
summary: "`conflict`, `precondition_required` or `transition_conflict`: the record changed after your AI read it, so nothing was overwritten. Read it again and redo the change."
door: fix
order: 5
errors:
  conflict: "conflict"
  precondition_required: "precondition_required"
  transition_conflict: "transition_conflict"
checked: "parachute-core next: packages/vault/core/src/mcp-refusal.ts (conflict: current_updated_at, hint; precondition_required), core/src/notes.ts (TransitionConflictError), core/src/mcp.ts (which updates need if_updated_at); claude.ai run of 2026-11-25 (a live page's conflict line)"
---

You, another AI or a live page changed the record between your AI reading it and writing it. Parachute refused the
write rather than lose the other change. Nothing was changed.

## conflict

The AI passed `if_updated_at` and the record has moved on. The refusal carries the record's `current_updated_at`.
Read the record again, apply the change to what's there now, and write with the new `updatedAt`. A live page should
show the new version and say so; in our claude.ai run Claude's own page said "This task changed somewhere else —
showing the latest. Try again."

## precondition_required

The update didn't say which version it read. Every change to a record (its body, fields, tags, links or path) needs
`if_updated_at`, except adding to the start or end of the body and a field change with `from` (below). Read the record,
then pass its `updatedAt`. `force: true` skips the check and overwrites: only when the person asked for that.

## transition_conflict

A change from one value to another (`status` from `open` to `done`, say) found a different value there: someone moved
it first. The refusal says what the field holds now. Tell the person, or redo the change from the current value.
