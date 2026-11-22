---
title: "Change the look"
summary: "One theme record sets the look of the whole app and every applet: one of four built-in looks, and any of its colours, fonts and style tokens."
door: build
order: 6
checked: "parachute docs/THEME.md, docs/CHANGE-YOUR-FRAME.md, docs/WRITE-AN-APPLET.md (Make it look like Parachute) and src/theme/theme.ts (LOOKS, STYLE_TOKENS) at 5501d56"
---

*On a 0.8 server (Parachute Cloud today):* `create-note`, with `metadata.theme` for `fields.theme`.

The whole app (its own screens, the list, every applet) takes its look from one record: `Parachute/Theme` in the home vault, tagged `parachute-theme`, with the theme in `fields.theme`. With none, the built-in theme: the Paper look, a moss accent, Literata for reading and Instrument Sans for the app's own words.

## The looks

A theme starts from one of four built-in looks. Each sets the two palettes and how the parts are drawn: rules, corners, depth, labels. See each on the parts: [Components](/docs/build/components/).

| Look | What it is |
|---|---|
| `paper` | The default: hairlines, soft corners, a card lifted a little, boxed fields. |
| `almanac` | Ink rules, dotted rows, a printed card, a line to write on. |
| `book` | A printed page: no raised parts, a double rule, small capitals. |
| `daylight` | Black on white for an e-paper screen: heavier rules, no tints or shadows, nothing moves. |

Daylight is usually a screen's own choice, not the record's: the record syncs to every device, and only the e-paper one should go black and white. Settings → Look → **This screen** sets it on that device alone, and writes nothing. A screen that says it is e-paper (slow to redraw, or grey only) gets Daylight by itself until the person chooses.

## The record

```json
create-record {
  "path": "Parachute/Theme",
  "tags": ["parachute-theme"],
  "fields": { "theme": {
    "look": "almanac",
    "colors": { "accent": "#2f5470" },
    "tokens": { "radius-card": "14px", "line-row": "1px dotted var(--muted)" },
    "density": "roomy"
  } }
}
```

| Key | What it sets |
|---|---|
| `look` | `paper`, `almanac`, `book` or `daylight`: the palettes and every style token. `daylight` also makes motion `still`, unless the record says otherwise. |
| `colors` | The light palette: `bg` (the page), `surface` (raised parts), `text`, `muted`, `line`, `accent`, `danger`. A colour given here stands over the look's. |
| `dark` | The same seven, for dark mode. |
| `tokens` | Any style token, by name without the `--`, over the look's value (below). |
| `fonts` | `serif` (names, titles, reading), `sans` (labels, buttons, the bar), `mono`: lists of font names, ending in `serif`, `sans-serif` or `monospace`. The app carries Literata and Instrument Sans; any other font must be one the device has. |
| `density` | `compact`, `regular` or `roomy`: padding, gaps, corners and text size. |
| `scheme` | `system`, `light` or `dark`. |
| `motion` | `flowing` or `still` (nothing moves). A device set to reduce motion, or a screen slow to redraw, is still whatever this says. |

Every key is optional. Anything left out, or written in a form the app doesn't read, stays the built-in value, and the rest still apply. A colour is hex, or `rgb()`, `hsl()`, `oklch()`, `oklab()` with plain numbers. Nothing else is read, so a theme can't load anything from the network.

If the record already exists, read it, then `update-record` with the whole `theme` object and the record's `if_updated_at`: `fields` merges one level deep, so a partial `theme` replaces the old one. In the app: Settings → **Look**. Choosing a style, a density, light or dark, or motion writes the record; a new style keeps any colour the person set. The app follows the record while it runs: every screen and every open applet changes at once.

## The style tokens

Each is a CSS variable (`--line-row`) in every applet's frame, and a key in `tokens` (`"line-row"`).

| Kind | Tokens |
|---|---|
| Colours | `primary` (the main action's fill), `on-primary`, `tint` (a row under the pointer), `card-fill`, `field-fill`, `entry-fill`, `button-fill`, `label-ink` |
| Rules | `line-head` (over a list), `line-row` (between rows), `line-card`, `line-quote`, `field-line`, `entry-line`, `button-line` |
| Edges and space | `card-edges`, `field-edges` (`1px` boxed, `0 0 1px` a line to write on), `field-pad` |
| Corners | `radius-card`, `radius-field`, `radius-entry`, `radius-button` (`999px`: a pill) |
| Depth | `shadow-card`, `shadow-sheet` |
| Labels and titles | `label-transform`, `label-caps`, `label-track`, `title-weight` |
| The page | `measure` (its width at most) |

What each draws, and its value in each look: [THEME.md](https://github.com/ParachuteComputer/parachute/blob/5501d56/docs/THEME.md#in-an-applet).

Each value is held to the grammar of its kind:

- a colour: as `colors` takes one, or `transparent`, or a palette colour by name (`var(--line)`);
- a rule: `1px solid <colour>`, the style one of `none`, `solid`, `dotted`, `dashed`, `double`;
- a length in `px`, `em` or `rem`; a shadow: `none`, or up to three of `<x> <y> <blur> <spread> <colour>`;
- a case `none`, `uppercase`, `lowercase` or `capitalize`; capitals `normal`, `small-caps` or `all-small-caps`; a letter spacing from `-0.3em` to `0.3em`; a weight `100` to `900`.

## In an applet

The kit's parts are drawn on these values, so they follow the theme with no work ([Components](/docs/build/components/)). For anything of your own, use the CSS variables, never your own colours or fonts: the palette `--bg`, `--surface`, `--text`, `--muted`, `--line`, `--accent`, `--danger`; `--serif`, `--sans`, `--mono`; `--pad`, `--gap`, `--radius`, `--size`, `--leading`; the type scale `--fs-title` … `--fs-label`; and the style tokens above. Motion: `--ease-out`, `--ease-in-out`, `--ease-drawer`, and `--t-press`, `--t-state`, `--t-sheet`, `--t-step`, all 0 when the theme or the device is still ([Make it feel good](/docs/build/make-it-feel-good/)).

## The order of styles

Every applet's frame gets the look in four steps, each over the one before:

1. **The tokens**, as CSS variables on the root.
2. **The base**: plain HTML drawn in the theme. A bare `<h1>`, `<p>`, `<button>`, `<input>`, `<table>` or `<blockquote>` comes out as the kit draws it, in the kit's column and margins.
3. **The parts**: the `pa-` classes the kit's parts are drawn with. An HTML applet can use them too: `<button class="pa-button pa-primary">`.
4. **The applet's own CSS**, in no layer. It wins over all of the above, whatever its specificity: `button { border-radius: 4px }` changes every button in the applet, the kit's included.

To override as an applet:

- **A token for your applet only:** set it on `body` or your own wrapper (`body { --accent: #8a5a2b; }`), not on `:root`. The app sets the theme on the root, and sets it again when the theme changes.
- **Edge to edge** (a map, a board): `body { padding: 0 }`.
- **Styles a later rule can still override:** put them in a layer of your own (`@layer mine { … }`).

An embed in someone else's page gets the same look, with each colour as `#rrggbb` and the built-in fonts.

## The screens around the notes

The list, a vault and a note are drawn by the **frame**, which is itself code the person can own: a record tagged `parachute-frame` in the home vault runs in place of the built-in one, after they allow it, as an applet is allowed. Settings → Frame → **Make this mine** copies the built-in frame into the vault to start from. The bar stays the app's.
