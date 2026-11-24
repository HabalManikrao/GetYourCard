# Template Design Guide

## What a template is

A template is a `DesignDocument` configuration: canvas size, palette, fonts, decoration
set, and **pages of elements**. Templates are language-independent — message text uses
tokens, so one template serves every language.

Built in `backend/app/template_data.py`; seeded into the `templates` table.

## The 15 templates

Grouped by **layout archetype** (genuinely different structures, not recoloured copies):

| # | Template | Category | Layout archetype |
|---|----------|----------|------------------|
| 1 | Royal Traditional | Royal Traditional | symmetric border |
| 2 | South Indian Traditional | South Indian | temple arch |
| 3 | Karnataka Wedding | Karnataka | symmetric border |
| 4 | Kannada Heritage | Kannada Heritage | banner top |
| 5 | Temple Wedding | Temple | temple arch |
| 6 | Luxury Gold | Luxury Gold | minimal lines |
| 7 | Red and Gold | Red and Gold | symmetric border |
| 8 | Floral Wedding | Floral | floral corners |
| 9 | Pastel Wedding | Pastel | floral corners |
| 10 | Minimalist Wedding | Minimalist | minimal lines |
| 11 | Modern Elegant | Modern Elegant | banner top |
| 12 | Peacock Theme | Peacock | symmetric border |
| 13 | Lotus Theme | Lotus | floral corners |
| 14 | Antique Vintage | Antique Vintage | symmetric border |
| 15 | Premium Designer | Premium Designer | banner top |

Each varies by palette, decoration set, typography, and the archetype's structure (border
framing, temple gopuram arch, organic corner florals, minimalist rules, or a solid banner
header).

## Element schema

Shared with the editor and persistence (`frontend/src/types.ts`):

```ts
text:       { text, fontFamily, fontSize, fill, fontWeight, fontStyle,
              textAlign, lineHeight, charSpacing, field?, locale?, direction?, script? }
decoration: { asset, fill }            // key into the SVG decoration registry
shape:      { shape: "rect"|"line", fill?, stroke?, strokeWidth?, rx? }
image:      { src }
common:     { id, type, x, y, width, height?, rotation, opacity, locked }
```

Front-page tokens: `{{invocation}}`, `{{invite_line}}`, `{{groom_name}}`, `{{connector}}`,
`{{bride_name}}`, `{{wedding_date}}`, `{{muhurtham_time}}`, `{{venue}}`.
Inside-page tokens: `{{invocation}}`, `{{invitation_message}}`, `{{invited_by}}`,
`{{family_members}}`, `{{rsvp_label}}`, `{{contact}}`.

## Decoration library

`frontend/src/lib/decorations.ts` — 24 original SVG motifs in a normalized 100×100 viewBox,
rendered as recolorable Fabric `Path` groups: ganesha, kalash, mango-leaf toran, lotus,
lotus mandala, mandala, paisley, peacock, peacock feather, diya, temple arch, temple pillar,
bells, garland, gold ornament, floral spray, rose, eucalyptus, sprig, dot motif, art deco,
gandaberunda emblem, vintage frame, royal crest.

All are **colour-customisable** (set `fill`) and vector (crisp at any print resolution).

## Adding a template

1. Add a spec entry to `_SPECS` in `template_data.py` (id, name, category, layout, palette,
   decorations, fonts, languages).
2. Re-run the seed (`python -m app.seed`) or restart the backend.
3. It appears in the gallery and wizard automatically.

## Adding a layout archetype

Add a `layout_*` function returning an element list and register it in `LAYOUTS`. Reuse
`_body_block` for the central invitation block to keep token bindings consistent.
