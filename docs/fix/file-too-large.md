---
title: "A file is too big"
summary: "Claude can store a small file in one call, about 20 KB in practice. For anything bigger, put it in from the app, or let Claude's sandbox reach your Parachute."
door: fix
order: 3
errors:
  inline_too_large: "in-a-chat-with-claude"
  file_too_large: "the-limits"
  image_too_large: "the-limits"
  blocked_upload_extension: "the-limits"
  unsupported_attachment_type: "the-limits"
checked: "claude.ai runs of 2026-11-25 (T-476 claudereal RESULTS2 §4: 784 B and 21 KB stored inline; 70 KB refused by Claude; the sandbox couldn't reach the host); parachute-core packages/vault/core/src/attachment/inline.ts (80 KiB), the add-attachment tool; parachute-cloud workers/vault/src/rest/storage-constants.ts (100 MB), workers/vault/src/restore.ts (50 MiB import), plans.ts"
---

## In a chat with Claude

Claude stores a file by typing it into the tool call (`add-attachment`, as base64). The vault takes up to 80 KiB that way, but Claude itself stops sooner. In our runs on claude.ai:

| File | What happened |
|---|---|
| a small CSV (under 1 KB) | stored, one approval |
| 21 KB | stored, in a call that took about 3 minutes |
| 70 KB | Claude declined to type it ("about 93,000 characters … more than I can reliably produce in one call") |
| 1 MB | no way through |

So a **2 MB PDF won't go in through the chat.** Instead:

- **Put it in from the app**, on the record it belongs to, and ask Claude to use it from there.
- **Let Claude's sandbox reach your Parachute.** For a bigger file Claude asks Parachute for an upload address (`attachment-url`) and sends the bytes from its code sandbox. claude.ai's sandbox reaches only the domains you allow, under **Settings › Capabilities**. Add your Parachute's domain there (`my.parachute.computer` on Cloud). We haven't tried this yet; Claude suggested it itself.
- **Keep the words, not the file.** Ask Claude to save a summary or the text it needs as a record.

The refusal an AI sees for an inline file that's too big is `inline_too_large`, with a hint to use `attachment-url` if its sandbox can reach your Parachute.

**On Parachute Cloud today** (0.8) files go only through the upload address, so from claude.ai, only with the domain allowed. Small files in the call come with Cloud's next release.

## The limits

| | Your own server | Parachute Cloud |
|---|---|---|
| One file in an MCP call (`add-attachment`) | 80 KiB | 80 KiB, from the next release |
| One file uploaded | 100 MB | 100 MB |
| All files in your account | your disk | 8 GB in the open beta |
| Importing a vault | no limit | 50 MiB |

- `file_too_large`: over 100 MB, or bigger than the size the upload address was made for. Make it smaller, or keep it elsewhere and link to it.
- `image_too_large`: an AI reads images up to 4 MiB. The file is kept; the AI can't look at it. Save a smaller copy beside it.
- `blocked_upload_extension`, `unsupported_attachment_type`: the vault doesn't keep files a browser would run (`.html`, `.svg`, `.xml`, `.js`, `.css`), so an attachment can never become a web page. Keep the file elsewhere, or save its text as a record.
