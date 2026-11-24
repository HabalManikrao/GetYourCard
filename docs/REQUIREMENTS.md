# Requirements → Implementation Traceability

Legend: ✅ done & verified · ◐ implemented (core), extensible · ○ future work.

## Core product (Sections 1–3)

| # | Requirement | Implementation | Verified |
|---|-------------|----------------|----------|
| 1 | Create a new invitation | Wizard → `POST /api/projects` | ✅ smoke E2E |
| 2 | Bride/groom details | Wizard steps 1–2 | ✅ |
| 3 | Parents/family details | Wizard steps 1,2,4 | ✅ |
| 4 | Select templates | Gallery + wizard `?template=` | ✅ |
| 5 | Select language (dynamic, 40+) | Language registry + picker | ✅ |
| 6 | Customize wording | Wording library + content editor | ✅ |
| 7 | Colours/backgrounds/fonts/borders/decorations | Left panel + right panel + palettes | ✅ |
| 8 | Add photographs | Uploads → image element | ✅ backend tests |
| 9 | Ganesha + motifs | 24-motif SVG decoration library | ✅ |
| 10 | Real-time preview | Fabric canvas re-render on store change | ✅ |
| 11 | Edit individual elements | Right-panel properties | ✅ |
| 12 | Download PNG/JPG/PDF | Export engine | ✅ export E2E |
| 13 | Front + inside pages | Two-page design doc + page tabs | ✅ |
| 14 | WhatsApp digital invite | JPG WhatsApp tier | ✅ |
| 15 | Save & reopen projects | Design JSON persistence | ✅ flows E2E |
| — | Desktop/tablet/mobile | Responsive layout, panel toggles | ◐ |

## Modules (Section 3)

| Module | Status | Notes |
|--------|--------|-------|
| A Dashboard | ✅ | create/list/search/filter/duplicate/delete |
| B Wizard | ✅ | 5 steps + validation + language select |
| C Template gallery | ✅ | 15 distinct templates |
| D Design studio | ✅ | canvas, drag/resize/rotate, layers, undo/redo, panels |
| E Kannada support | ✅ | Unicode, Noto fonts, verified render + export |
| F Wording library | ✅ | 8 styles incl. Kannada + bilingual |
| G Decoration library | ✅ | 24 SVG motifs, recolorable, licensed |
| H Export/download | ✅ | PNG/JPG/PDF, print dims, bleed, WhatsApp |
| I Project management | ✅ | save/autosave/open/duplicate/rename/delete/version/export history |
| J Optional AI | ◐ | offline wording/palettes; providers env-gated, never faked |

## Universal multilingual engine (new requirement)

| # | Requirement | Implementation | Verified |
|---|-------------|----------------|----------|
| 1 | Dynamic language management, search, multi-add, per-element language | registry + `LanguagePicker` + `setPrimaryLocale` | ✅ |
| 1 | Not limited to 4 languages | 44-locale registry, extensible | ✅ backend test |
| 2 | Unicode-first, script-aware, BiDi | `scripts.ts`, Fabric `direction` | ✅ unit + visual |
| 3 | Font registry: coverage, fallback, upload, warning | `font_data.py`, `registry.ts`, coverage warning | ✅ |
| 4 | Language-independent content model | `details` + `languages[]` layers | ✅ unit |
| 5 | Dynamic layout: wrap, RTL, mixed direction | Fabric Textbox wrap + per-element direction | ✅ visual |
| 6 | Language-independent templates | token-based templates | ✅ backend test |
| 7 | Translation modes A/B/C, unverified flag | manual editor, AI endpoint, `verified` | ◐ |
| 8 | Export preserves all languages | rasterise-at-export | ✅ export + visual |
| 9 | Language testing framework | script unit tests + visual matrix | ✅ |
| 10 | No silent truncation / tofu | readable placeholders + coverage warning | ✅ |

## Non-functional (Sections 5–8)

| Area | Status |
|------|--------|
| Database schema, relationships, indexes | ✅ |
| REST API, status codes, validation, docs (`/docs`) | ✅ |
| Upload validation, safe filenames, no secrets, CORS, error boundaries | ✅ |
| Test suite (pytest/vitest/playwright) | ✅ 19 + 28 + 7 passing |
| Docker, Windows scripts, docs | ✅ |
| Authentication / multi-tenant | ○ (local-first release) |
