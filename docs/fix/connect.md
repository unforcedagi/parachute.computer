---
title: "Claude won't connect"
summary: "The connector says it can't reach Parachute, sign-in goes round in a loop, or Claude doesn't see your vault. What each means and the fix."
door: fix
order: 1
checked: "claude.ai runs of 2026-11-25 (T-476 claudereal: Plugins › Add › Add custom connector, step 2, consent, Reconnect); parachute-cloud workers/vault/src/index.ts (root /mcp), workers/identity/src/ui.ts (consent, vault picker); parachute-core packages/hub/src/oauth-ui.ts"
---

Start with the address. It ends in `/mcp`, with nothing after it:

- Parachute Cloud: `https://my.parachute.computer/vault/<vault name>/mcp` (your vault's card shows it, with **Copy**), or `https://my.parachute.computer/mcp`.
- Your own server: `https://<your server>/mcp`, or one vault's own `https://<your server>/vault/<vault name>/mcp`.

## "Couldn't connect to the server"

claude.ai says this, or **Server not responding**, or marks the connector **needs attention** under **+ › Plugins**.

- **The address is wrong.** A missing `/mcp`, a typo in the vault name, or `http://` instead of `https://`. Open the connector's **⋯ › Remove**, then add it again with the address copied from your vault's card.
- **Your own server isn't reachable from the internet.** claude.ai connects from Anthropic's servers, not your computer. `localhost` and a tailnet name can't be reached from there. A quick tunnel (`trycloudflare.com`) failed in our tests; a named Cloudflare Tunnel or a public domain works. See [Run your own](/docs/run/self-host/).
- **A firewall in front of your server is checking browsers.** Cloudflare's bot protection or Browser Integrity Check may block Claude's requests (we haven't seen it happen). If you have either on, try your Parachute's address with them off.

## Sign-in opens, then nothing happens

You signed in and allowed it, and claude.ai still shows the connector as not connected.

- **You chose no vault.** On Parachute Cloud, `https://my.parachute.computer/mcp` asks which vault on the approval page; on your own server you choose a level for each vault. Connect again and pick a vault, at **Read & write** (Write on your own server).
- **You have no vault yet.** On Parachute Cloud the approval page says "You don't have a vault yet" and has no Allow. Make one in your account ("Name your vault", **Create my vault**), then connect again.
- **The sign-in link expired.** Links work once, for 10 minutes. Ask for a new one, or type the 6-digit code from the same email.

## Claude is connected but says it can't save

It connected at **Read only**. Remove the connector and add it again, and on the approval page choose **Read & write**. With read only it can look, but it can't remember anything for you.

## Claude says Parachute refused it

Each refusal names its reason (`error_type`) and the page with the fix: [It needs admin](/docs/fix/needs-admin/), [A type or field isn't there](/docs/fix/unknown-type/), [A file is too big](/docs/fix/file-too-large/), and [every refusal](/docs/fix/refusals/).

## Claude doesn't see a new skill, or an edited one

claude.ai reads your vault's list of skills when it connects, and in our tests didn't read it again in that session. After you add or change a skill, ask Claude to read it by name (it can read a skill as a record). Removing the connector and adding it again should refresh the list (not tried yet). See [Skills in your vault](/docs/use/skills/).

## Things that are normal

- **Claude asks before each tool call**, reads included, while your claude.ai account is on **Manual**. **Always allow** on the card is meant to stop that for the tool.
- **Each time you connect again, you approve again.** On Parachute Cloud the approval page offers to end Claude's earlier connection (ticked); on your own server the old one stays until you end it.
- **On Claude's free plan** you can add one custom connector (Parachute Cloud's account page says so).
