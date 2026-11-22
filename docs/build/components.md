---
title: "Components"
summary: "Every part an applet imports from `parachute`, drawn live in each look, with the code that draws it."
door: build
order: 4.2
checked: "parachute docs/COMPONENTS.md, docs/WRITE-AN-APPLET.md (The parts), docs/THEME.md (looks), src/kit/base.css, src/kit/parts.css and src/theme/theme.ts at 5501d56; the drawing is the app's own Parts applet (scripts/components-gallery.mjs)"
gallery: true
---

Build an applet from these parts and it looks like the rest of Parachute: in the person's look, light and dark, on a phone and a computer, with no CSS of yours. Copy the code under each one. Every prop: [the kit](/docs/build/reference/kit/).

The app draws them all here, in its own Parts applet with made-up content. Pick a look, or light or dark, and the same parts are drawn again with that look's values.

[Every part, drawn by the app](/assets/components/parts.html)

## A screen

```tsx
import { Page, List, Button } from "parachute";

export default function Shelf() {
  return (
    <Page title="Reading" aside={<Button small>Sort</Button>}>
      <List label="Reading" rows={[{ key: "1", title: "The Overstory", meta: "Richard Powers" }]} />
    </Page>
  );
}
```

`Page` gives the screen its title, one width and one margin, a way back (`back`), pull to read again (`onRefresh`) and room for two columns on a computer (`wide`). Start every applet with it.

## Button

```tsx
<Button kind="primary">Save</Button>
<Button>Later</Button>
<Button kind="quiet">Cancel</Button>
<Button small>Small</Button>
```

One `primary` on a screen: the main action. `plain` (the default) for the rest, `quiet` for a way out.

## Tabs

```tsx
<Tabs label="Shelves" current={tab} onChange={setTab}
  tabs={[{ key: "reading", label: "Reading", count: 2 }, { key: "want", label: "Want to read" }, { key: "read", label: "Read" }]} />
```

Places to switch between on one screen. The one shown is marked; `count` sits beside a label.

## List

```tsx
<List label="Reading" rows={[
  { key: "1", title: "The Overstory", meta: "Richard Powers", aside: "p. 212", glyph: "❧", onPress: open },
  { key: "2", title: "Braiding Sweetgrass", meta: "Robin Wall Kimmerer", badge: 3, strong: true, onPress: open },
]} />
```

Things of a kind, as rows under a rule: a title, a line under it (`meta`), something at the right (`aside`), a mark (`glyph`), a count (`badge`), bold for what is new (`strong`), the row open now (`current`). A row with `onPress` is a button.

## Card

```tsx
<Card title="Seed order">
  <p>Rye, late kale, the striped beans from last year.</p>
  <Button small kind="primary">Send it</Button>
</Card>
```

A block that stands apart from the rows around it. Use few: rows are not cards.

## Field, Search and Write

```tsx
<Field label="Add a book" placeholder="A title" action="Add" onAction={add} />
<Search label="Search the shelf" placeholder="Search" onSearch={find} />
<Write label="A note" labelled value={draft} onChange={setDraft} onSend={save} send="Save" />
```

`Field` is a line to write on with one action (Enter does it too). `Search` searches on Enter. `Write` is a box for longer words, with its action.

## Table and Fields

```tsx
<Table label="Books" columns={[{ key: "title", label: "Title" }, { key: "author", label: "Author" }, { key: "pages", label: "Pages", align: "end" }]}
  rows={books.map((b) => ({ key: b.id, cells: b, onPress: () => open(b) }))} />

<Fields label="This book" onSave={save} fields={[
  { name: "status", kind: "choice", choices: ["reading", "want", "done"], value: "reading" },
  { name: "pages", kind: "number", value: 387 }, { name: "lent", kind: "yesno", value: false },
]} />
```

Records as rows and columns; a record's fields, each changed where it stands.

## Days

```tsx
<Days times={notes.map((n) => n.updatedAt)} label="Four weeks of notes" />
```

What changed, a day at a time: a column of marks per day, weeks set apart, today marked. Give `times`, or `counts` (one number a day; `1` and `0` for done or not).

## Empty, Loading and Problem

```tsx
<Empty>No books yet. Add one above, or ask your AI.</Empty>
<Loading />
<Problem error={err} onRetry={load}>Couldn't read the shelf.</Problem>
```

Every state has words: what to do next, what is being read, what failed and Try again.

## Drawer and toast

```tsx
<Button onClick={() => setOpen(true)}>More</Button>
<Drawer open={open} onClose={() => setOpen(false)} title="The Overstory">…</Drawer>
toast("Saved");
```

A detail or a short form rises from the foot of the screen; a toast says what an action did.

## Laying them out

```tsx
<Page title="Clients" wide>
  <div className="pa-grid">
    <List label="Active" rows={active} />
    <List label="Waiting" rows={waiting} />
  </div>
  <Card title="Next up">
    <p>Call Ada about the second draft.</p>
    <div className="pa-actions"><Button small kind="primary">Done</Button><Button small>Later</Button></div>
  </Card>
</Page>
```

`pa-grid` puts its children side by side when there is room (about 280 px each) and one under another on a phone; `Page wide` gives a board room on a computer. `pa-actions` puts buttons in a row that wraps. No CSS of yours.

## Plain HTML

```html
<h3>Shed roof</h3>
<p>Corrugated or <a href="#">cedar shakes</a>?</p>
<blockquote>Measure twice.</blockquote>
<button>A bare button</button> <input placeholder="A bare field">
```

Bare elements are drawn in the look too, in TSX and in an HTML applet. In an HTML applet the parts' classes work: `<button class="pa-button pa-primary">`, `<div class="pa-card">`, `<ul>` inside `<div class="pa-list">`.

For something of your own (a board, a chart), write your CSS on the look's tokens: [Change the look](/docs/build/change-the-look/#in-an-applet).
