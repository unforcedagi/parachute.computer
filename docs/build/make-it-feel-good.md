---
title: "Make it feel good"
summary: "Build from the kit's parts and the applet feels like the rest of the app: calm, quick, nothing jumping. The short rules, for you and your AI."
door: build
order: 4.5
checked: "parachute docs/LOOK.md, docs/DESIGN-RULES.md, docs/THEME.md (motion), docs/WRITE-AN-APPLET.md (Page, Pages, Write, Drawer, toast, still), src/kit/conformance.ts (motion, layout) at the T-476 look (PRs 165, 166, 168)"
---

An applet built from the kit's parts (`Page`, `List`, `Field`, `Button`, `Drawer`, `toast` and the rest) already feels
like the rest of Parachute. A place is a short run of pages: a finger drags a page and it settles on the next, an
arrow glides it in under a quarter of a second, the keys turn it at once; a line to write in sits under the pages, so
writing never turns them. A button gives under a press; a drawer rises from the foot of the screen and follows the
finger; a toast rises and can be swiped away. Nothing jumps as content loads, and with the device set to reduce
motion, on an e-paper screen or on the Daylight, nothing moves at all: pages turn at once and nothing follows the
finger. You write none of that.

The full list is [the design rules](https://github.com/ParachuteComputer/parachute/blob/next/docs/DESIGN-RULES.md):
short rules an AI can check its work against. Give it that page with the applet guide. The short version:

- **Use the parts.** Reach for `Loading`, `Empty` and `Problem` for a screen's states, `toast` after an action,
  `Drawer` for a choice or a short form over the page ([Components](/docs/build/components/)).
- **Colours, type and space from the theme:** `var(--accent)`, `var(--fs-body)`, `var(--gap)` and the rest
  ([Change the look](/docs/build/change-the-look/)). Never a colour or a size of your own.
- **Lines, corners and depth from the look:** `var(--line-row)` between rows, `var(--radius-card)` and
  `var(--shadow-card)` for a block that stands apart. Each look draws these its own way; a fixed `1px solid #ccc` or a
  shadow of your own breaks three of them.
- **Most things don't move.** What is used all day (a tab, a row, typing) changes at once. Only what arrives moves.
- **If you move something,** move only `transform` and `opacity`, on the theme's curves and times: `--ease-out`,
  `--ease-in-out`, `--ease-drawer`; `--t-press` (160 ms), `--t-state` (200 ms), `--t-sheet` (300 ms), `--t-step`
  (40 ms), `--t-turn` (240 ms), `--t-swap` (150 ms). They are 0 when the person asks for stillness, so your applet is
  still with the rest. Motion your own code makes (a loop, a drag) asks `still()` first, and lands at once when it says so.
- **Keep the page still under the reader:** an image gets `width` and `height`; what is read lands below what is
  there.
- **Every state has words,** and plain ones: "Saved", "Not sent: offline", "No books yet. Add one above."

A person who wants nothing to move sets **Settings → Look → Motion → Still** (or `"motion": "still"` in their theme
record), and every applet built this way follows.
