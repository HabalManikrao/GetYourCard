# Requirements Traceability Matrix (Audit)

> **POST-REMEDIATION UPDATE.** Status changes since the audit:
> R19 Dynamic layout → **FV** (lib/layout.ts + warnings + tests). R28 Image crop → **FV**
> (preset crop). R45 PDF selectable text → **FV (Latin)** / rasterized complex scripts.
> R43/R44 A4/A5 fit → **FV** (contain‑fit). R8 NFC → **FV**. R23 templates → **FV** (21/11
> layouts). R52 migrations → additive SQLite migration added. R57 offline → mechanism added
> (binaries pending). New: universal occasion platform (occasions, dynamic forms, custom
> occasions, backward‑compatible schema) — all **FV**. See
> [REMEDIATION_REPORT](REMEDIATION_REPORT.md) and [FINAL_ACCEPTANCE_REPORT](FINAL_ACCEPTANCE_REPORT.md).

---


Status legend: **FV** fully implemented & verified · **INV** implemented, not fully verified ·
**PI** partially implemented · **NI** not implemented · **BLK** blocked · **NA** not applicable.

Verification legend: I = implemented (code exists) · T = automated test · V = visually verified ·
PR = production-ready.

| ID | Requirement | Evidence (file / fn) | Test | Status | I/T/V/PR | Gap |
|----|-------------|----------------------|------|--------|----------|-----|
| R1 | Create invitation | `Wizard.tsx` `finish()`, `routers/projects.py` | smoke E2E, `test_api.test_project_crud` | FV | I T V | — |
| R2 | Bride/groom/parents/family details | `Wizard.tsx` steps | smoke | FV | I V | — |
| R3 | Dashboard CRUD/search/filter/dup/delete | `Dashboard.tsx`, `projects.py` | `test_project_crud` | FV | I T V | delete/dup not E2E-clicked |
| R4 | 5-step wizard + validation | `Wizard.tsx` `validateStep` | flows:TC022 | FV | I T V | — |
| R5 | Dynamic language registry (40+), search, add/remove, per-element | `language_data.py`, `LanguagePicker.tsx`, `editor.ts setPrimaryLocale` | `test_api.test_languages*` | FV | I T V | per-element language is auto by script, no explicit per-element UI picker |
| R6 | BCP-47 locales | `language_data.py` (e.g. `kn-IN`) | `test_languages_registry` | FV | I T | — |
| R7 | Unicode preservation | design JSON stores raw Unicode | `test_project_crud`, resolve units | FV | I T V | — |
| R8 | Unicode normalization (NFC) | — | — | **NI** | — | no normalization applied |
| R9 | Script detection | `lib/scripts.ts` | `scripts.test.ts` (16 scripts) | FV | I T | — |
| R10 | Font coverage validation + warning | `registry.ts fontCovers`, `RightPanel.tsx` warning | — | INV | I V | no automated test of the warning path |
| R11 | Font fallback chains | `font_data.py FALLBACK_SANS`, `registry.coveringFont` | `test_fonts_coverage` | FV | I T | — |
| R12 | Custom font upload | `fontLoader.ts registerCustomFont` | — | **PI** | I | **not wired to any UI**; unreachable |
| R13 | Font metadata + licensing | `font_data.py` (scripts/weights/license) | `test_fonts_coverage` | FV | I T | — |
| R14 | Complex-script shaping | browser shaping, `DesignCanvas.buildText` | visual-check (Kannada) | INV | I V | only Kannada/Arabic verified |
| R15 | Mixed-language rendering | per-element font/direction | visual (names Latin + body Kannada) | INV | I V | not explicitly asserted |
| R16 | RTL support | `direction` on Textbox | visual-check (Arabic) | FV | I V | — |
| R17 | Script-aware line breaking | Fabric native word-wrap | — | **PI** | I | no script-specific breaking (e.g. CJK/Thai rules) |
| R18 | Dynamic text measurement | Fabric internal | — | PI | I | not exposed; no overflow use |
| R19 | **Dynamic layout adaptation** (overflow/collision/auto-resize/safe margin/min font) | — | — | **NI** | — | **engine absent** (Section 5 "extremely important") |
| R20 | Translation Mode A (manual) | `RightPanel.tsx` content editor | — | INV | I V | — |
| R21 | Translation Mode B (AI) | `routers/ai.py /wording` | `test_ai_status` | PI | I T | no side-by-side translation UI; `verified` flag only |
| R22 | Translation approval / unverified flag | `LanguageLayer.verified`, LanguageBar tag | — | INV | I V | no approval workflow |
| R23 | Template gallery, ≥15 distinct | `template_data.py`, `TemplatesPage.tsx` | `test_templates_seeded` | PI | I T V | 15 present but 5 layouts; audit wants 20 |
| R24 | One template → many languages | token-based templates | `test_templates_seeded` | FV | I T V | — |
| R25 | Editor: add/edit/move/resize/rotate text | `DesignCanvas` + `LeftPanel`/`RightPanel` | flows:TC013 (add), units | INV | I V | drag/resize/rotate not E2E-asserted |
| R26 | Editor: change font/color/align/direction | `RightPanel TextProps` | visual (font switch) | INV | I V | — |
| R27 | Editor: image add/move/resize | `LeftPanel onUpload`, image element | `test_upload_valid_png` | INV | I T | placement not E2E |
| R28 | Editor: **image crop** | — | — | **NI** | — | Module D #6 not implemented |
| R29 | Decorations add/remove/recolor | `LeftPanel` motifs, `DecoThumb`, `decorations.ts` | — | INV | I V | add not E2E-asserted |
| R30 | Layer ordering | `editor.ts reorder`, `RightPanel` | — | INV | I | not tested |
| R31 | Group/ungroup | — | — | **NI** | — | not implemented |
| R32 | Lock/unlock | `editor.ts toggleLock` | — | INV | I | not tested |
| R33 | Undo/redo | `editor.ts undo/redo` | flows:TC013 | FV | I T V | — |
| R34 | Zoom / fit | `DesignCanvas.zoomBy/setZoom` | — | INV | I V | no pan |
| R35 | Pan | — | — | **NI** | — | not implemented |
| R36 | Multi-page (front/inside) | 2 pages per doc, page tabs | visual, `test_templates_seeded` | FV | I V | — |
| R37 | Real-time preview | store→canvas re-render | visual | FV | I V | — |
| R38 | Decoration library (SVG, recolor) | `decorations.ts` (24 motifs) | — | INV | I V | — |
| R39 | Wording library (≥8) | `wording_data.py` | `test_wordings` | FV | I T | — |
| R40 | PNG export | `export.ts`, `exports.py` | export:PNG | FV | I T V | **clips text (F-01)** |
| R41 | JPG export | `export.ts` tiers | — | INV | I | not separately E2E'd (PNG path shared) |
| R42 | PDF export (multi-page) | `buildPDF` | export:PDF | FV | I T V | rasterized; **clips text**; cover-fit |
| R43 | 300 DPI / print dims | multiplier 2.8, A5/A4 mm | — | PI | I | DPI not measured; A5 cover-crops |
| R44 | Bleed / safe margins | `buildPDF` bleedMm | — | PI | I | bleed present; no safe-margin guard |
| R45 | **Font embedding in PDF** | — (rasterized) | pymupdf: 0 text chars | **NI** | — | by design raster; Module E criterion unmet |
| R46 | WhatsApp export | JPG whatsapp tier | — | INV | I | not visually verified |
| R47 | Output excludes selection handles | `toDataURL` discards active obj | export artifacts | FV | I V | — |
| R48 | Project save/autosave/open | `Editor.tsx saveNow`, autosave effect | flows:TC015 | FV | I T V | — |
| R49 | Duplicate/rename/delete/version | `projects.py`, `editor setProjectName` | `test_project_crud` | FV | I T | rename/version not E2E |
| R50 | Export history | `GET /api/exports?project_id` | `test_export_roundtrip` | FV | I T | — |
| R51 | Persistence after backend restart | SQLite file + design JSON | flows:TC015 (reload) | INV | I V | backend-restart case not explicitly run |
| R52 | DB schema/relationships/indexes | `models.py` | `test_api` | FV | I T | no Alembic migrations |
| R53 | REST APIs + status codes + validation | `routers/*`, Pydantic | pytest suite | FV | I T | — |
| R54 | Upload validation (type/size/corrupt/SVG) | `assets.py` | `test_uploads_exports` | FV | I T | — |
| R55 | Security: path traversal, filenames, CORS, no secrets, error boundary | `assets/exports.py`, `main.py`, `ErrorBoundary.tsx` | `test_asset_path_traversal` | FV | I T | SVG sanitiser heuristic |
| R56 | Authentication / authorization | `password_hash` column only | — | **NI (by design)** | — | guest-only; required pre-multi-tenant |
| R57 | Offline functionality (multilingual export) | fonts via CDN | — | **NI** | — | F-03 CDN dependency |
| R58 | Offline (no AI required) | `config.ai_enabled`, offline wording | `test_ai_status` | FV | I T | — |
| R59 | Documentation set | `docs/` (13 files) | — | FV | I | — |
| R60 | Deployment (Docker/scripts) | Dockerfiles, compose, PS scripts | `docker compose config` | PI | I | runtime startup not audited (no image build run) |
| R61 | Acceptance: "no important text silently truncated" | — | export artifacts | **NI** | — | **F-01 clipping fails this** |

### Summary counts
FV ≈ 27 · INV ≈ 17 · PI ≈ 8 · NI ≈ 9 · (NI-by-design: R56).
Mandatory items failing: R19 (dynamic layout), R28 (crop), R45 (PDF font embedding),
R57 (offline), R61 (no silent truncation) → precludes "Complete and Verified".
