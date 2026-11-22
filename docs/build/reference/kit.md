---
title: "Applet reference: the kit"
summary: "Every call and part an applet imports from \"parachute\", saved state, and links."
door: "build"
order: 22
nav: "Reference: the kit"
checked: "copied by scripts/docs-sync.mjs from ParachuteComputer/parachute docs/WRITE-AN-APPLET.md at 5501d56"
---
*Copied as it is from the app's own guide, [docs/WRITE-AN-APPLET.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/WRITE-AN-APPLET.md) at 5501d56; a bundle is still called an "app" there. Before: [the record](/docs/build/reference/applet/). Next: [worked examples](/docs/build/reference/applet-examples/).*

## The code

For `tsx` or `jsx`: one module. Its **default export is a React component** (a function, or what `memo` returns), and
the app renders it. It may `await` at its top level. It may import only these:

| Import | What it is |
|---|---|
| `react` | React 19 (`useState`, `useEffect`, …) |
| `react-dom`, `react-dom/client` | ReactDOM, if you need it (the app already renders your default export) |
| `parachute` | The app's kit, below |

Nothing else: no npm packages, no other files, no network, no storage. Put CSS in a `<style>` element inside your
component, or in `style={…}`. Write plain, working code: types are stripped, not checked.

For `html`: a page, run as written, with the same kit on `window.parachute`.

### Something for the person (`fields.signals`)

What counts as something for the person: the count is the badge on the bar while the applet is closed, and on a phone
the same count is the notification while Parachute is closed ([design/APP-RECORD.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/design/APP-RECORD.md), "Signals").
Up to four, each a line on the card:

```yaml
signals:
  - id: for-you                     # lower-case words joined by -
    name: mentions and messages from Uni   # the notification's words: "Rooms · 3 new"
    from: { service: rooms }        # a relay service with notify: its gateway counts what it would tell you about
  - id: unread
    name: unread mail
    from: { service: mail, feed: unread }   # an http service's number: the applet sets it while it runs
    via: https://push.example/      # the gateway the count goes to, for your other devices and your closed phone
  - id: new
    name: new ideas from others
    from: { vault: here, path: Ideas/, others: true }   # notes in a folder it may read, made since you last opened it
    via: https://push.example/
```

Nothing of the applet runs to count. Notes in its vault are counted by the app, live, from the vault (`others`: only
notes someone else made); a relay's by its push gateway; a feed by the applet itself, with `signal(id, count)` while
it runs (its own number wins: Mail knows what is unread). Opening the applet makes its counts 0. A gateway gets your
public key, the applet as a number it can't read back, the signal's id and the count: never what was counted. An
applet in someone else's vault may count only its notes, and the count goes nowhere.

### Write it on the kit

The kit is the standard library: for each thing an applet needs, there is one part, and every applet uses it, so they
all look and behave as one app and follow the person's theme. Reach for the part before writing your own:

| To | Use |
|---|---|
| lay out the screen: its width, title, a way back, pull to refresh | `Page` |
| say a date or a time | `when` (`when.short(t)`, `when.day`, `when.time`, …): never `Intl`, `toLocale…` or `getHours` |
| show rows of things, short or long | `List` (a long one draws only what is on screen; `more` for the next page) |
| say it is reading, there is nothing yet, or it failed | `Loading`, `Empty`, `Problem` (with Try again) |
| say what an action did ("Saved", "Not sent: …") | `toast` |
| show a choice, a short form or a detail over the page | `Drawer` |
| take words: a line, a box, a chat's composer | `Field`, `Write` |
| search | `Search` |
| switch between places in one screen | `Tabs` |
| a button | `Button` (`kind="primary"` for the one main action; a row's or a card's own action is plain and `small`) |
| put buttons side by side, or groups in columns | `<div className="pa-actions">`, `<div className="pa-grid">` (with `Page wide` for a board) |
| record a voice note | `Record`, then `voiceNote` and `useTranscripts` for one the hub transcribes |
| link to a note, or open one | `Link`, `Linked`, `Note`, `link.open` |
| keep a draft, or where it was | `useSaved` |
| colour and size | the theme's CSS variables and the type scale (`--fs-title` … `--fs-label`, [THEME.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/THEME.md)) |
| move something | nothing, mostly: the parts already arrive, give under a press and rise as sheets. Your own: `transform` and `opacity` on the theme's curves and times (`--ease-out`, `--t-state`, …) |

Your own CSS is for what no part draws (a chart, a calendar grid) on those variables; columns and rows of buttons are `pa-grid` and `pa-actions`. What makes a screen feel good, as short
rules an agent can check its work against, is in [DESIGN-RULES.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/DESIGN-RULES.md). The applets this repo ships are held to
this: `src/kit/conformance.ts` fails one that formats a date itself, draws its own list, input, button, error or status
line, picks its own colour, font or text size, or moves something on times of its own, and says which part to use (`npm test`). Write yours the same way:
an agent can read that file for the exact rules (they run in this repo's tests, not in the app: an applet in a vault is
asked to follow them, not checked). A shipped applet with a real reason to keep something of its own names the reason
there (`EXCEPTIONS` in `conformance.test.ts`). The guide's own examples below are checked too.

### The kit's calls (`import { … } from "parachute"`)

| Call | What it does |
|---|---|
| `ready()` | Resolves when the app has started it: `{ applet: { id, name }, access, services, theme, open?, launch? }`. `access` is the folders it was allowed (`[{ path, verbs }]`) and `services` its servers as its card allowed them (a relay's `rooms`, `approvals`, `notify`): read your room, or which key is Uni's, from here rather than keeping a copy in the code. |
| `launch()`, `onLaunch(cb)` | What the app opened it for from a notification's tap: `{ room, event? }` (or null), and each later one. |
| `onFresh(cb)` | `cb()` when the vault's answer to a read differs from what the read was answered with. While one listens, the app may answer a read at once from what it read before and ask the vault behind it, so a screen shows at once; `Page` with `onRefresh` listens for you (below). |
| `shown()`, `onShown(cb)` | Whether it is on screen, and each change. The app keeps an applet running while the person is elsewhere, so going back to it is instant; hidden, it gets no tap, and anything only a person looking should do (marking a message read) waits for `true`. |
| `onOpen(cb)` | `cb({ note: { id, path }, screen })` when the person opened a note in it (now, and each time after). |
| `vault.queryRecords({ pathPrefix, tag, search, limit, includeBody, includeFields })` | Records in folders it may read: `{ id, path, updatedAt }`, and with `tag`, `includeBody` or `includeFields` also `tags` and `fields` (and with `includeBody` the `body`). |
| `vault.getRecord(idOrPath)` | One record it may read, with its body. |
| `vault.createRecord({ path, body, types?, tags?, fields? })` | A new record, in a folder it may `create` in, with its types, tags and fields: `{ id, path, types, tags, fields, updatedAt }` (`getRecord` for its body). |
| `vault.updateRecord(id, { if_updated_at, body?, fields?, types?, tags? })` | A change to a record it may `update`, in one call: a new body, fields merged (`null` removes one), and `types` / `tags` as `{ add, remove }`. `if_updated_at` is required: the record's `updatedAt` as you read it. Resolves the record as saved (`{ id, path, updatedAt, … }`: keep its `updatedAt` for the next change). If someone changed it since, it rejects with `conflict`: read it again, and change that. |
| `app.recent({ limit })` | With `recent`: the newest notes across every vault on this device, newest first: `{ vaultName, title, updatedAt, href }`. Titles only: no folder, never content. `limit` up to 40. |
| `app.pins()` | With `pins`: what is on the person's bar: `{ name, glyph, href, home }`. |
| `app.copy(text)` | With `copy`: puts text on the clipboard while the person taps in the applet (up to 2,000 characters). Resolves to whether it went. |
| `app.changes()` | With `changes` (level 5, Home's line, [VAULT.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/VAULT.md) "Changes"): what others (an AI, another app) changed since midnight in the first six vaults on this device: `{ count, names, more, href }`. `names` are the writers, the one who wrote last first, never what changed; `more` says there may be more than `count` (a vault couldn't be read, or a read hit its cap); `href` opens Vault's Changes for the vault with the most (`app.open(href)`), null when nothing changed or the device has no home vault. |
| `app.open(href)` | With `open`: take the person to a note or an applet (an `href` from the calls above; an applet at a room with `?room=<id>[&event=<id>]`, which it hears as its launch, or `app.changes()`'s `href`, Vault at a vault's Changes), while they tap inside the applet. Resolves to whether it went. |
| `app.links(links, from)`, `app.follow(link, { from, choose })`, `app.address(noteId)` | With `open`: the calls under the kit's note links. Use `Link`, `Linked`, `Note` and `link` (see [Links](#links)) rather than these. |
| `app.openLink(url)` | With `links`: an `http`, `https` or `mailto` address in the person's browser, while they tap, at most one a second. Resolves to whether it went. |
| `app.save(name, bytes, type)` | With `save`: a file (an `ArrayBuffer`, 25 MB at most) into the person's Downloads, while they tap. The name is made bare (no folder, no leading dot, 100 characters at most) and the app picks a free one. Resolves `{ saved: name }`. |
| `app.pick({ accept, multiple })` | With `attach`: the app's own picker, while they tap (`accept`: like `"image/*,.pdf"`). Resolves the files chosen, `[{ name, type, bytes }]` (25 MB each, 10 at most), or `[]`. |
| `voice.record({ max_s })` | With `reach: [voice]`: the app's own recorder sheet over the applet, while they tap (Record, Stop, Send, Cancel; 10 minutes unless `max_s` is less). Resolves `{ bytes, type: "audio/webm", duration }` on Send, `null` on Cancel. The applet never touches the microphone. |
| `saved.get(key)`, `saved.set(key, value)`, `saved.all()`, `saved.flush()` | What the app keeps for this applet on this device as it goes ([Saved state](#saved-state)): handed back with `ready`, so `get` answers at once after it; `set` reaches the app within 250 ms. |
| `storage.get(key)`, `storage.set(key, value)`, `storage.keys()` | With `storage`: JSON kept by the app on this device for this applet (drafts; what it last showed, so its next open paints at once), 256 KB in all with what it saved, keys up to 100 characters. A value may be any size within the 256 KB: the kit sends it as JSON text in bytes, past the 8 KB a call's parameters may be. `set(key, null)` removes it. Never synced. |
| `vault.attach(id, bytes, type, { transcribe })` | A file (25 MB at most) onto a record it may `update`, through the hub. `transcribe: true` asks the hub to transcribe audio: write the record with `_Transcript pending._` and the hub puts the words in its place. Resolves `{ id, path, type, transcribe }`. |
| `props()`, `onProps(cb)` | In a component a page embeds: the plain data the page hands it (also its React props), and each change after. Empty in an applet. |
| `services.fetch(id, path, { method, headers, body, as })` | With `services`: a request to that server, under its url. `as`: `text`, `json` or `bytes`. Resolves `{ status, headers, body }`. |
| `services.relay(id)` | With `services`: the relay. `.subscribe(filters, onEvents, onEose?)` (returns a function that stops it; one room per subscription on a Buzz relay), `.query(filters)`, `.publish({ kind, content, tags })` (resolves `{ ok, id, message, event }`), `.loadPrivate(prefix)`, `.savePrivate(d, text)`, `.onStatus(cb)`. |
| `services.upload(id, bytes, type)`, `services.media(id, sha256, ext)` | With `media`: a file up (the server's descriptor) or down (`{ bytes, type }`, for a `blob:` address an `<img>`, `<audio>` or `<video>` plays). |
| `services.me()` | Who the app signs as: `{ pubkey }`. |
| `services.card(id, event)` | With `approvals`: Uni's card in that signed message, as the app checked it: `{ kind, refused, rows: [{ rid, credential, action, class, scope, ttl_s, uses, expires, always_unlock, answer, … }] }`. Never a key. |
| `services.answer(id, event, "approve" \| "deny", rids)` | On a tap: the app asks for the unlock when it must, seals the answer with the approval key and sends it. Resolves `{ view, sent, failed? }`. A tap answers once. |
| `services.secret(id, event)`, `services.forgetSecret(id, event)` | On a tap: the app's own sheet takes the secret (`{ sent }`); or asks the requester to forget it. |
| `vaults.list()`, `vaults.hubs()`, `vaults.types(vault)`, `vaults.query(vault, { type, tag, search, path, where, sort, limit, offset })`, `vaults.get(vault, id)`, `vaults.history(vault, id)`, `vaults.version(vault, id, ix)`, `vaults.update(vault, id, { if_updated_at, body?, fields?, types?, tags? })`, `vaults.create(vault, { path, body, types?, tags?, fields? })`, `vaults.watch(vault, type, cb)`, `vaults.packs(vault)`, `vaults.addPack(vault, id)` | With `vaults` (Vault's, [VAULT.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/VAULT.md); its card says it, stressed): every vault this device holds (`{ key, name, host, mine, home, level, connector, view, reach }`: `connector` where an AI connects, `view` where a published record is read (add its id; null where the hub has no such page, as on Parachute Cloud for now), `reach` who can open the vault's address: `this-device`, `network` or `anyone`), each hub they are on with its one address for an AI (`{ host, address, vaults }`: `<hub>/mcp`, every vault the person gives the AI; `null` where each vault keeps its own; an app from before 11-21 has no `hubs`), each one's types with counts and fields, a page of records (`{ records, more }`, 200 at most; `where` is `[{ field, op, value }]`, `op` one of eq, ne, gt, gte, lt, lte, in, not_in, exists; `sort` is `{ by, dir }`), one record with its links both ways, its kept versions, a change (to the version read: `if_updated_at` must be the record's) or a new record in one call, and `cb({ upsert } \| { remove })` as changes land (it returns the function that stops it). `packs` lists Parachute's starter packs and the vault's installed ones; `addPack` applies one of Parachute's own ([PACKS.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/PACKS.md)); an app from before 11-21 doesn't have them (check `typeof vaults.addPack`). Never code, an applet's, a component's or the app's own records, nor publishing (the `publish`/`published` tag or field: that is `sharing`'s), and a change to a published record asks the person first; nor `Applets/`, `Parachute/` (but saved views in `Parachute/Views/`) or `.parachute/`. A change to a vault Parachute only reads asks the person first. |
| `vaults.changes(vault, since, offset?)`, `vaults.compare(vault, id, before, after)`, `vaults.restore(vault, id, ix, ifUpdatedAt?)`, `vaults.remove(vault, id, ifUpdatedAt)` | With `vaults`, level 5 (Vault's Changes, [VAULT.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/VAULT.md)): what changed since an ISO time, newest first (`{ changes, deletes, more }`; each change `{ key, id, path, title, op: created \| changed \| deleted \| restored, at, via, kind, by, mine, before, after, gone, own }`, `before`/`after` the versions holding each side, null for none or for as it is now; `deletes: "hidden"` when the hub won't list deleted records to this app); a change's two sides (`{ before, after }`, each `{ path, body, fields, types?, tags? }` or null); putting a record back as a version holds it, a deleted one too (to the version read: `ifUpdatedAt` must be the record's, and none for a deleted one), which is a change of its own in history; and taking away a record an AI made (its tombstone is kept). The same refusals as `update`: never code, an applet's, a component's or the app's own records; what comes back published, or a change to one that is, asks the person first. |
| `vaults.access(vault)`, `vaults.publish(vault, id, on)`, `vaults.revoke(vault, noteId)`, `vaults.readOnly(vault)` | With `sharing`: what reaches a vault (this app's level, the applets allowed there on this device, the address an AI connects at); and, each after the person's yes on the app's own sheet over their tap (fails with `not_confirmed` otherwise): publish a record (the field `published`: anyone with its link can read it; unpublishing isn't asked), take an applet's access back, or let Parachute only read the vault. `publish`/`published` is never a tag or field `vaults.update` or `create` gives or takes. A refused ask fails with `not_confirmed` (the person said no) or `needs_tap` (no live tap in the applet). |
| `vaults.reach(vault)`, `vaults.manage(vault)`, `vaults.giveKey(vault, { name, can, types })`, `vaults.endReach(vault, id)`, `vaults.stopManaging(vault)` | With `sharing`, level 6 (Vault's "Who reaches", [VAULT.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/VAULT.md)): who reaches a vault, `{ managing, rows }`, `rows` null until Parachute manages it (each `{ id, name, who, app, can: read \| change \| manage \| backup, types (null: every type), until, lastUsed, self }`); `manage` asks the hub for the vault's admin for this visit (the app's sheet first, then the page goes to the hub and comes back to Vault's Sharing); `giveKey` makes a key for an AI, `can` `read` or `write`, `types` null or a list; the app shows its secret once on its own sheet, and the applet gets `{ name, until, types, address }`, never the secret; `endReach` ends one by its `id`; `stopManaging` gives the admin back now. `manage`, `giveKey` and `endReach` each ask on the app's own sheet first. |
| `vaults.people(vault)`, `vaults.invite(vault, name, from?)`, `vaults.takeBack(vault, id)`, `vaults.end(vault, key, name?)` | With `sharing` (sharing a vault with a friend, [design/SHARING.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/design/SHARING.md)): for the vault's owner, who else is in it (`{ people: [{ key, name, role }], invites: [{ id, name, expires_at }] }`, or `{ people: null, why: no_key \| not_owner \| no_hub \| unknown_key }`); a link that lets one person in, to read and change everything (`{ url, id, expires_at }`; after the person's yes on the app's own sheet, so an applet never gets one unasked; `from` is the person's own name as the friend will see it); an invite taken back; a person's access ended, after the person's yes (their next request is refused). Each is a request the person's key signs at the vault's hub, so it needs Parachute on a phone or Mac. |
| `signal(id, count)` | Its own number for a signal its record declares (0 to 9999): the bar's count, and through the signal's gateway, the person's other devices'. Fails with `out_of_scope` for a signal it doesn't declare. |
| `theme.get()`, `theme.now()`, `theme.on(cb)` | The app's look, which the person can change ([THEME.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/THEME.md)): `get` asks for it, `now` gives the last one sent (or null), `on` calls back now and at each change and returns a function that stops it. Beside the values below, it says `scheme` (`light` or `dark`), `density` and `motion` (`flowing` or `still`). Every value is also a CSS variable: `--bg`, `--surface`, `--text`, `--muted`, `--line`, `--accent`, `--danger`, `--serif`, `--sans`, `--mono`, `--pad`, `--gap`, `--radius`, `--size`, `--leading`, and the style tokens ([THEME.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/THEME.md#in-an-applet)): `--primary`, `--on-primary`, `--tint`, `--card-fill`, `--field-fill`, `--entry-fill`, `--button-fill`, `--label-ink`, `--line-head`, `--line-row`, `--line-card`, `--line-quote`, `--field-line`, `--entry-line`, `--button-line`, `--card-edges`, `--field-edges`, `--field-pad`, `--radius-card`, `--radius-field`, `--radius-entry`, `--radius-button`, `--shadow-card`, `--shadow-sheet`, `--label-transform`, `--label-caps`, `--label-track`, `--title-weight`, `--measure`. It also says `look`, the built-in look the theme starts from. |

A call outside what it was allowed fails with `out_of_scope` or `not_granted`. It never reaches anything else.

### Components, embeds and imports

A **component** is a record like an applet, tagged `component`, that a page shows rather than one that has a screen.
Its own frame, its own card, its own vault; or, from a vault you trust, imported into your code with
`import Events from "component:events"`. All of it, with a worked example, is in
[OTHER-PARACHUTES.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/OTHER-PARACHUTES.md). Three things for an applet's author:

- **A page with embeds scrolls as a whole.** An applet whose record has `fields.embeds` is drawn as tall as its content,
  with its embeds under it; `position: fixed` and its own inner scrolling scroll with the page. A page that grows by the
  same amount three times running is held at its height (that is how a layout sized to the screen stops growing for
  ever), so one that adds rows on a tap should page them rather than grow without end.
- **Check who a message is from.** The kit only reads messages from the app. An HTML applet that listens for
  `message` events itself must check `event.source === parent`: on a page with embeds, other frames can post to it.
- **Never ask for a key or a password.** Parachute never does inside a page, and the person is told so.
- **A `<form>` works as you'd write it.** The sealed frame has no `allow-forms`, so the browser drops a submit; the kit
  sends it to your `onSubmit` itself, from a submit button or Enter in a field (call `e.preventDefault()` as usual). A
  button's `onClick` works too.

### The parts (`import { … } from "parachute"`, TSX and JSX only)

The pieces to build a screen from, drawn in the app's look: they follow the person's theme, as the rest of the app
does. Each takes plain props; a newer prop is only ever added, never changed.

| Part | What it draws |
|---|---|
| `<Note body path? tags? fields? onLink? />` | A note's text as the app's note view draws it: markdown, and rich notes (a recipe with servings and timers, tasks, logs, callouts, charts from tables); give the record's `tags` and `fields` so a typed note (tagged `recipe`) draws as its type, and its `path`, which tells one note from the next. Its links are the kit's ([Links](#links)): a `[[wikilink]]`, a `<vault>:<ULID>` and a note's address open the note in the app, a web address the browser. With `onLink(target)` a tap goes there instead, with a wikilink's target as written (`[[Green herb rice]]` gives `Green herb rice`), the `<vault>:<ULID>` or the address: open it yourself, or hand it to `link.follow`. The renderer is large, so the app loads it only for an applet that imports `Note`. |
| `<Link to from? >…</Link>` | One link: a note's address, `<vault>:<ULID>`, `[[target]]` (with `from`, the path of the note it is in) or a web address. See [Links](#links). |
| `<Linked text web? />` | Plain text with its note links drawn as `Link`s: a message, a mail. With `web`, its other web addresses too (they open only with `links`). |
| `link (.to, .follow, .open, .parse, .find)` | The links as calls: `await link.to(record)` is the address to write for a note of the applet's vault; `link.follow(target, { from })` opens one on a tap; `link.open(record)` opens a note of its own vault on a tap (a row's `onPress`); `link.parse(text)` says what a link names (or null); `link.find(text)` gives the links in plain text. |
| `<Days times? counts? days? label? inline? />` | What changed, a day at a time: a column of ink marks per day, weeks set apart, today marked. Give `times` (ISO times, counted by day) or `counts` (one number a day, oldest first, today last: `1` and `0` for done or not). It shows; it is not a control. `days` defaults to 28; `inline` draws it inside a line (a row, a link). |
| `<List label? hideLabel? rows more? />` | Rows under a label. A row is `{ key?, title, meta?, aside?, glyph?, onPress?, badge?, strong?, current?, under?, label?, data? }`: `meta` a line under the title, `aside` a word at the right (a date, a count), `glyph` one character in a mark at the left, `badge` a small count after the title, `strong` bold (what is new), `current` the row open now, `under` a line in the accent across the row's foot (what wants the person), `label` what a screen reader says for it; one with `onPress` is a button. A long list costs little (a row off screen isn't drawn); `more: { label, onPress }` asks for the next page; `hideLabel` says the label to a screen reader only. |
| `<Card title?>…</Card>` | A block that stands apart, with a title: a summary, one thing's detail, a choice to make. Buttons in it go in a `<div className="pa-actions">`. Rows of things are a `List`, not cards. |
| `<Table label columns rows? groups? sort? onSort? more? />` | Records as rows and columns (level 3). `columns` is `[{ key, label, align?, width?, sortable? }]`, a row `{ key, cells: { [column key]: text }, onPress?, current?, label? }`; the first column stays in view as the rest scroll across, a header's tap calls `onSort(key)` (show it with `sort: { by, dir }`), `groups: [{ key, label, count?, rows }]` draws headings, and `more` reads the next page by itself as the foot comes near. A row off screen isn't drawn. |
| `<Fields label? fields onSave? />` | A record's fields, name and value (level 3). A field is `{ name, label?, kind?, choices?, value, readOnly? }`, `kind` one of `text`, `number`, `yesno`, `choice`, `date`, `list`, `long`; with `onSave(name, value)` each is changed where it stands (a choice, a box for yes or no, a number, a date) and saved on Enter, on leaving it or on the pick, the value typed back by its kind (`""` is `null`). |
| `<Field label placeholder? action? onAction? value? onChange? clearOnAction? />` | A line to write on, and one action (its button, or Enter): `onAction(text)` gets what was written. It keeps its own text unless `value` is given, and clears after the action unless `clearOnAction` is false. `onAction` should catch its own errors and show them: a failed action leaves the text as it was. |
| `<Empty>…</Empty>` | What shows when there is nothing yet: a sprig and a line. |
| `<Page title? kicker? aside? back? onRefresh? wide? className? >…</Page>` | The applet's screen: one width and margin for every applet (`--measure`, 760 px), its title on the type scale (a small `kicker` above, `aside` at its right, `back: { label, onPress }` a way back above it), with `onRefresh` pull down at the top to read again (and the page is drawn at once from what it read before, then `onRefresh` runs again by itself when the vault's answer differs: `onFresh`). `wide` lets it grow to 1240 px on a computer, for a board or a table; put what sits side by side in a `<div className="pa-grid">`. |
| `<Tabs label tabs current onChange />` | Places to switch between in one screen (Inbox, Later, Sent): `tabs` is `[{ key, label, count? }]`, the one shown is marked. |
| `<Loading>…</Loading>` | The quiet line while something is read ("Reading…" unless you say). |
| `<Problem error? onRetry? >…</Problem>` | What went wrong, said once: your words, then the error's, and Try again with `onRetry`. |
| `<Button kind? small? busy? onClick >…</Button>` | A button in the app's look: `primary` (the one main action), `plain` (the default) or `quiet`. |
| `<Search label placeholder? value? onChange? onSearch live? />` | A search box: Enter searches (each pause in typing, with `live` ms); emptying it searches for "". |
| `<Write label labelled? value onChange onSend? send? sendLabel? canSend? busy? enter? line? maxLength? inputRef? onKeyDown? >…</Write>` | A box to write in and its action (Ctrl or ⌘ Enter; with `enter="send"`, Enter alone on a computer, as in a chat). `labelled` shows the label above it, as a Field's. Your own buttons (`Record`) sit beside the action; `line` makes it one line that grows; `sendLabel` names the action for a screen reader, `canSend` says there is something to send without words (a file). |
| `<Record onRecorded label? max_s? disabled? kind? small? >…</Record>` | The microphone button: the app's own recorder sheet (needs `reach: [voice]`); `onRecorded({ bytes, type, duration })` on Send. |
| `<Drawer open onClose title? label? >…</Drawer>` | A panel that rises from the foot of the screen over the page (level 4): a choice, a short form, a record's detail. Show it with `open`; `onClose` is asked to put it away (dragged down by its grip, or anywhere while its content fits; a tap outside; Escape; or your own button). It follows the finger; focus goes into it and back. In a page drawn at its content's height (one with embeds) it opens in place instead. |
| `toast(text, { error? })` | A short word after an action ("Saved"), rising at the foot of the screen, gone by itself (held while pointed at or while the app is away; a tap or a swipe down puts it away). |
| `voiceNote(recording, create)` | A recording made a note: `create(body)` makes the record (its path is yours), the recording is attached with transcription asked, and the hub writes the words in. |
| `useTranscripts(bodies, reload)` | While a voice note waits for its words: reads again a few times; `say(body)` is the line to show, `strip(body)` the text without the hub's marker, `again()` after a new recording. |
| `when (.time, .day, .date, .short, .full, .ago, .stamp, .path, .parse)` | Dates and times, one way in every applet, in the person's language: `when.short(t)` is "9:41 AM" today, "Yesterday", "Mon", "Nov 17"; `when.day(t)` "Today", "Yesterday" or the date; `when.date(t)` "Saturday, November 21"; `when.time(t)` "9:41 AM"; `when.full(t)` the date and time; `when.ago(t)` "now", "5m", "3h", then as `short`; `when.parse(t)` a `Date` (or null). `t` is a Date, an ISO string, milliseconds or seconds; a date alone (`"2026-11-21"`, as a field holds one) is that day on this device, not midnight in London. Today as a field holds a date: `when.stamp(Date.now()).slice(0, 10)` (`when.stamp` is `"2026-11-21 09-41"`, this device's day and time). |
| `useTheme()` | The look as values (`accent`, `bg`, …, `scheme`, `density`, `motion`), or null until the app has sent it. Most applets need only the CSS variables. |
| `useSaved(key, initial)` | `useState` that the app keeps on this device: a draft, the box it was on, the item open. See [Saved state](#saved-state). |
| `pa-actions`, `pa-grid` (class names) | Layout with no CSS of yours: `<div className="pa-actions">` puts buttons side by side (a card's, a drawer's); `<div className="pa-grid">` puts lists or cards side by side on a wide screen, one under another on a phone. |

**Keep state in fields.** A box the person ticks is a field on the record (`fields: { book_status: "read" }`), not a
`- [x]` in its body: the vault, the note view and any AI connected to the vault then read the same value. The type and
its fields are the AI's to define (`manage-types` over MCP; write access may make a new type). Field values are plain:
text, numbers, yes/no, or a list of those (never `published`). The only types an applet gives or takes away are the
ones its card names for that folder, what it opens there (`fields.opens`): a tag can put a note on the web, so no other.
It never changes a note of the app's own (`applet`, `component`, `parachute-*`). An app from before this (T-476) refuses a write
with fields, types or tags (`bad_params`), and its note view doesn't list fields.

An HTML applet has no parts as components, but it is drawn in the look all the same: plain HTML (a title, a list, a
`<button>`, an `<input>`, a `<table>`) comes out in the theme with no CSS of its own, and the parts' classes work in it
(`<button class="pa-button pa-primary">`). It has the kit's calls and the CSS variables; what your own CSS says wins over the
kit's ([THEME.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/THEME.md#the-order-of-styles)).

**Older apps.** An applet lives in the vault, and each device's app updates on its own time, so an applet meets
older apps ([docs/design/VERSIONS.md](https://github.com/ParachuteComputer/parachute/blob/5501d56a482626fc03a344629e59a4b46f824f1c/docs/design/VERSIONS.md)). Each part has the level of the app it came in. All the
parts above are level 1, the floor: the kit of 11-20, with every prop it lists, but `Table` and `Fields`, which are level 3
(as are the `vaults` and `sharing` words), and `Drawer`, level 4; `vaults.changes`, `compare`, `restore`, `remove` and
the `changes` word are level 5; `vaults.reach`, `manage`, `giveKey`, `endReach` and `stopManaging` are level 6. A newer prop counts as a newer part,
and an older app ignores it. If an applet uses a part above the floor, either fall back for it, or put
`"needs": <its level>` beside `applet` in the fields. With `needs`, an older app lists the applet and says "Update
Parachute to open …" instead of running it (`src/kit/olderApp.test.ts` checks the shipped applets do one or the other).
If an applet touches a part this app doesn't have and then stops, the frame says to update rather than that it broke.
A fallback:

```tsx
import { Newer as KitNewer } from "parachute";
const Newer = KitNewer ?? (({ children }: { children?: unknown }) => <>{children}</>);
```

### Saved state

An applet can stop at any moment and lose nothing. The app may unload it to make room (it keeps 6 running on a phone,
12 on a computer), the person may close the app, the phone may restart. What the applet gives the kit to save comes
back when it starts again, before its first paint:

```tsx
const [draft, setDraft] = useSaved("draft", "");      // what is being written
const [tab, setTab] = useSaved("tab", "inbox");        // where it was
<Write label="Your note" value={draft} onChange={setDraft} />
```

- **Saved as it changes.** The kit sends what changed 250 ms after the last change (at most a second while the person
  keeps typing; at once when the applet is hidden), and the app writes it to the device's disk then: a file of the
  applet's own in the app, localStorage in a browser. Nothing waits for a way out, so a force-stop or leaving the
  applet loses at most that last moment. A write that fails is tried again; keys are 1 to 100 plain characters.
- **Setting it back to `initial` forgets it.** Clear a draft when it is sent.
- **Where the page was scrolled** is kept by itself and put back once the page is tall enough again.
- **On this device only**, never synced and never in a vault. A draft that should follow the person to another device
  is a note, written by the applet in its own folder.
- **Gone with Revoke.** When the person revokes the applet (its menu, Settings, or on another device with their key) or
  signs out of its vault, what it saved here is removed: a draft isn't left on the device for whatever is allowed there
  next. A new version the person allows keeps it.
- **256 KB per applet**, the same store as `storage` (`storage.get/set` and `useSaved` see each other's keys). Every
  applet that runs has it, someone else's too; no word in `fields.app` is needed.
- A plain `useState` is lost when the applet stops, as before. In an HTML applet, the calls are
  `parachute.saved.get(key)` (after `ready()`), `parachute.saved.set(key, value)` and `parachute.saved.flush()`.

### Links

A link to a note is written one way, and stored that way: **the note's address on its hub**,

```
https://<hub>/vault/<vault>/view/<id>
```

the page the hub itself serves for the note (to anyone when the note is published, and to someone with a key for that
vault otherwise). So the link works outside Parachute too, and inside the app it opens the note. Get it with
`await link.to(record)` (a note of the applet's own vault) and put it in the text you write; never build it by hand.

The kit also reads two short forms, which applets read but never write:

- `<vault>:<ULID>`, a vault by its name and a note's id: `uni:01KA3Z9V6B2W8XQJ4M7N5P0R1S`, as Uni writes in chat.
- `[[Path or Title]]` inside a note: a note in the same vault, by its path, or beside the note it is in, and only in the
  folders the applet may read (a path can be guessed: the app won't say what is there to an applet that can't read it).

And the address Parachute's web app shows for a note (`https://<hub>/surface/parachute/v/<vault>/n/<id>`).

Draw links only with the kit: `Linked` for text you show as it is (a message, a mail), `Link` for one link you place,
and `Note` for a note's text. Each asks the app what a note link leads to, and the app answers from the vaults the
person has, without telling the applet which those are:

| The link | What the person sees | A tap |
|---|---|---|
| a note in a vault they have | a link | opens the note in the app: in the applet whose `opens` takes its kind, else the plain note view |
| an address of a vault they haven't added | a link | the app's link screen, which says so and offers to add that Parachute |
| an address in a vault they have whose note part isn't an id, or whose note isn't there | a link | the app's link screen, which opens what the vault has at that address, or says it isn't there |
| a `<vault>:<ULID>` of a vault they don't have, or of a note that isn't there; a `[[wikilink]]` to nothing | plain text | nothing: no guess |
| any other web address | a link | the browser (with `links`) |

The app looks a note up by its id only: an address or short form that names a path or a title is never asked for, and
a note found some other way doesn't count, so an applet can't learn which notes exist outside what it may read.

A long-press (a right-click on a computer) on a note link asks with **Open with…** instead. Note links need `open` in
`fields.app`; without it they are drawn as text (an address as a web address). The shipped applets link only through
the kit (`src/kit/links.test.ts` checks it): no `<a>` of their own, no `app.openLink` of their own, and no `app.open` but in a home applet (one that asks for `pins` or `recent`), for the app's own places.
