# UI / UX Design

## Design direction
Premium Indian wedding aesthetic — a blend of Canva's usability and a traditional
invitation studio. Warm paper backgrounds, restrained ornament, elegant serif display type.

## Palette (`tailwind.config.js`)
| Token | Hex | Use |
|-------|-----|-----|
| maroon | #7a1226 | primary brand, headings, buttons |
| maroon-dark | #5a0d1c | hover/gradient |
| royal | #a81e2e | accents |
| gold | #b8860b | rules, highlights, secondary buttons |
| gold-light / pale | #d4af37 / #e8c877 | ornament, on-dark text |
| ivory | #fbf3e4 | surfaces |
| emerald2 | #0d6b63 | peacock theme |
| blush | #e07a9a | floral theme |

Typography: **Cormorant Garamond** / **Playfair Display** for display; the editor chrome
uses a neutral system sans for clarity.

## Screens
- **Dashboard** — hero banner, "Create New Invitation", searchable/filterable project
  grid with edit/duplicate/delete, template gallery link. Modern creative-studio layout.
- **Template gallery** — category chips, SVG preview cards, supported-language tags,
  "Use this template".
- **Wizard** — 5 steps with a progress indicator, inline validation, searchable language
  multi-select.
- **Editor** — professional three-pane layout:
  - *Top toolbar*: home, project name, saved/unsaved, undo/redo, save, download menu.
  - *Left panel*: Text, Motifs, Background, Uploads, Wording tabs.
  - *Canvas*: zoom −/Fit/+, Front/Inside page tabs, large work area.
  - *Language bar*: shows active languages, switch primary, add language, RTL/unverified tags.
  - *Right panel*: element properties (font, size, colour, bold/italic, align, spacing,
    transform, opacity, layer order, duplicate/lock/delete) or — when nothing is selected —
    layers list + wedding details + per-language wording editor, with a **font-coverage
    warning** and one-click fix.

## Interaction principles
- Every control does something real — no decorative/fake buttons.
- Real-time preview: edits reflect immediately on the canvas.
- Keyboard: Ctrl/Cmd+Z undo, Ctrl+Shift+Z / Ctrl+Y redo, Delete removes selection.
- Autosave (1.5 s debounce) with a visible Saved/Unsaved indicator.

## Responsiveness
Relative units, flex/grid layouts. On smaller screens the left/right panels toggle via
toolbar buttons (`PanelLeft`/`PanelRight`) so the canvas stays usable on tablet and mobile.

## Accessibility
Semantic buttons/labels, `aria-label`s on icon-only controls and inputs, visible focus
rings, sufficient contrast on maroon/ivory/gold combinations.
