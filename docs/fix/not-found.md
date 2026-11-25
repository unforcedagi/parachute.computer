---
title: "It isn't there"
summary: "`not_found` or `ambiguous_path`: no record by that name the connection can see, or one name with several files. Search instead of guessing."
door: fix
order: 6
errors:
  not_found: "not_found"
  ambiguous_path: "ambiguous_path"
checked: "parachute-core next: packages/vault/core/src/mcp-refusal.ts (not_found, ambiguous_path: path, candidates), core/src/notes.ts (paths compared without case, one path several extensions), core/src/mcp.ts"
---

## not_found

No record, tag or file by that id or path, or none this connection can see (a key limited to some tags sees only
those). Paths are easy to guess wrong: search for it with `query-records` and a `search`, then use the id it returns.
If the person thinks it's there, ask which vault: a connection reaches only the vaults it was given.

## ambiguous_path

One path is held by several records with different extensions (`Notes/Plan` as `.md` and as `.csv`, say). The
refusal lists the `candidates`. Pass the `extension` you mean, or use the record's id.
