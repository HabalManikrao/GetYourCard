# Architecture

## Overview

Shubha Muhurta is a two-tier application: a **FastAPI** backend (data, registries, file storage, optional AI) and a **React/TypeScript** single-page frontend that hosts a **Fabric.js** canvas editor. State persists as structured JSON in SQLite (PostgreSQL-ready).

```
┌─────────────────────────────── Browser (SPA) ───────────────────────────────┐
│  pages/            Dashboard · Wizard · TemplatesPage · Editor               │
│  editor/           DesignCanvas (Fabric v6) · TopToolbar · Left/Right panels │
│  store/ (Zustand)  editor (doc + undo/redo) · registry (langs + fonts)       │
│  lib/              scripts (detection) · fontLoader · resolve · export · deco │
└───────────────┬──────────────────────────────────────────────────────────────┘
                │ fetch /api (Vite proxy in dev, nginx in prod)
┌───────────────▼──────────────── FastAPI backend ─────────────────────────────┐
│  routers/   projects · templates · assets · exports · content · ai           │
│  data/      template_data · language_data · font_data · message_data · wording│
│  models/    SQLAlchemy: User, Project, Template, Asset, Export                │
│  storage/   uploads · exports · thumbnails (local filesystem, mountable)      │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Key design decisions

### 1. Design document as the single source of truth
A project stores a `DesignDocument` (JSON) with pages, elements, palette, fonts, a
language-independent content model, and wedding details. The editor renders it to a
Fabric canvas; saving writes the JSON back. **Nothing is stored as a flattened image** —
text, positions, styles, and decorations remain fully editable on reopen.

### 2. Rasterise-at-export
The editor keeps text as live Unicode Fabric `Textbox` objects (so complex scripts stay
editable). Only at **export** does the canvas rasterise to a high-resolution bitmap, which
is then embedded directly (PNG/JPG) or placed into a PDF via jsPDF. Because the browser
already shapes glyphs (HarfBuzz-equivalent) before rasterisation, **every script and RTL
language is preserved pixel-perfect** without wrestling with PDF font embedding/shaping.
See [EXPORT_SPECIFICATION](EXPORT_SPECIFICATION.md).

### 3. Universal multilingual engine (not hardcoded)
Languages, scripts, and fonts live in **registries** (backend data + `/api/languages`,
`/api/fonts`). The editor detects a text element's script at runtime, picks a covering
font (or warns), and sets direction. Adding a language is a data change, never an editor
change. See [MULTILINGUAL_SUPPORT](MULTILINGUAL_SUPPORT.md).

### 4. Token-based templates
Templates reference tokens (`{{invocation}}`, `{{invite_line}}`, `{{groom_name}}`, …).
Names/dates come from shared `details`; translatable copy comes from per-locale language
layers. One template works in every language.

## Request lifecycle (create → edit → export)

1. **Wizard** collects details + selected locales → builds a `DesignDocument` from a
   template (`buildDesignFromTemplate`) with a language layer per locale → `POST /api/projects`.
2. **Editor** loads the project, instantiates `DesignCanvas`, renders the active page,
   preloads fonts, and wires selection/drag/resize/text-edit back into the Zustand store.
3. **Edits** mutate the store (with undo/redo history); autosave `PUT`s the design every 1.5s.
4. **Export** renders each page to a clean raster at the chosen multiplier, builds the
   file (PNG/JPG/PDF), downloads it, and records an `Export` row via `POST /api/exports`.

## Technology

| Concern        | Choice |
|----------------|--------|
| Frontend       | React 18, TypeScript (strict), Vite 5, Tailwind 3 |
| Canvas editor  | Fabric.js 6 |
| State          | Zustand 5 |
| PDF            | jsPDF 2 |
| Backend        | FastAPI, Pydantic v2, SQLAlchemy 2, Uvicorn |
| DB             | SQLite (dev) → PostgreSQL-compatible schema |
| Image handling | Pillow (upload validation) |
| Tests          | Pytest, Vitest + RTL, Playwright |
| Fonts          | Google Noto family, Cormorant Garamond, Playfair Display (SIL OFL) |

## Module map

| Module | Location |
|--------|----------|
| Dashboard | `frontend/src/pages/Dashboard.tsx` |
| Wizard | `frontend/src/pages/Wizard.tsx` |
| Template gallery | `frontend/src/pages/TemplatesPage.tsx` |
| Design studio | `frontend/src/pages/Editor.tsx` + `frontend/src/editor/*` |
| Canvas engine | `frontend/src/editor/DesignCanvas.ts` |
| Multilingual engine | `frontend/src/lib/{scripts,fontLoader,resolve}.ts`, `src/store/registry.ts` |
| Decoration library | `frontend/src/lib/decorations.ts` |
| Export engine | `frontend/src/lib/export.ts` |
| Templates | `backend/app/template_data.py` |
| Languages/fonts/messages | `backend/app/{language_data,font_data,message_data}.py` |
