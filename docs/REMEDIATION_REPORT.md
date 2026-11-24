# Remediation Report

Remediation of the independent audit findings, plus the universal-occasion product
expansion. Root causes were fixed (not symptoms); every defect has a regression test.
No existing functionality was removed; wedding projects and all prior tests still pass.

Status key: **Closed** (fixed + tested + verified) · **Closed‑ltd** (fixed within a
documented limitation) · **Partial** (mechanism done, completion blocked/deferred) ·
**By‑design**.

## Audit findings

| ID | Finding | Root cause | Fix | Evidence | Status |
|----|---------|-----------|-----|----------|--------|
| **F-01** | PNG/PDF clipped invite‑line text | Fabric wrapped text with stale fallback‑font metrics (font‑load race); no overflow guard | Clear Fabric font cache + `initDimensions()` re‑wrap after fonts load (`DesignCanvas.render`/`remeasureText`) | Regenerated PNG/PDF render cleanly (2‑line wrap); `e2e/layout.spec.ts` "no clip warnings"; `e2e/export.spec.ts` | **Closed** |
| **F-02** | No dynamic layout engine | Feature absent | `lib/layout.ts` (overflow/clip/collision/safe‑margin detection, `autoFitFontSize`, `LayoutMode`); live warnings banner; `DesignCanvas.computeLayoutWarnings` | 8 unit tests `layout.test.ts`; `e2e/layout.spec.ts` long‑text raises visible clip warning | **Closed** |
| **F-03** | Offline multilingual export depends on Google CDN | No self‑hosted fonts | Manifest‑driven local `@font-face` loader (`fontLoader.loadLocalFonts`), CDN fallback; `public/fonts/README.md` vendoring guide | Mechanism active on startup (`registry.load`); font binaries blocked by sandbox network | **Partial** (documented) |
| **F-04** | PDF rasterized — no selectable text | Rasterize‑at‑export design | Invisible, selectable **Latin** text layer over the digital‑PDF raster (`export.buildPDF` + `TopToolbar`); complex scripts stay rasterized | pymupdf extracts 332 chars incl. "Arjun Kumar"/"Meera Rao"/"weds"; `e2e/export.spec.ts` asserts names in bytes | **Closed‑ltd** (Latin selectable; complex‑script rasterized, documented) |
| **F-05** | A4/A5 cover‑fit cropped the design | Cover‑fit logic | Default **contain‑fit** + bg‑colour letterbox + `cover`/`stretch` modes (`export.buildPDF`) | A5 render shows whole card, no crop | **Closed** |
| **F-06** | Image cropping not implemented | Feature absent | Functional preset crop (1:1 / 3:4 / 4:3 / free‑reset) via Fabric native crop (`RightPanel.ImageProps`, `DesignCanvas.buildImage`, natural size from upload meta) | `e2e/crop.spec.ts` upload→crop→"Cropped to N×Npx" | **Closed‑ltd** (presets; free‑drag deferred) |
| **F-07** | 15 templates / 5 layouts (<20) | Limited library | +6 universal templates → **21 templates, 11 distinct layouts** | `test_api.test_templates_seeded` (≥20); `test_occasions.test_universal_templates_present` | **Closed** |
| **F-08** | Multilingual breadth unverified | Only 3 scripts tested | Universal templates widen script coverage; NFC normalization; en/kn/ar + birthday(en) visually verified | `visual-check` + `occasions-visual`; `scripts.test.ts` (16 scripts) | **Partial** (breadth still < full matrix; documented) |
| **F-09** | Custom font upload / group / pan absent | Not wired / absent | Local custom‑font loading mechanism added (`registerCustomFont` + manifest); upload UI, group/ungroup, pan still deferred | — | **Partial** (documented) |
| **F-10** | Export tests only checked magic bytes | Weak assertions | Added clip detection, PNG dimension (2160×3840), PDF text extraction, per‑occasion render tests | `export.spec.ts`, `layout.spec.ts`, `occasions*.spec.ts` | **Closed** |
| **F-11** | No authentication | By design (local‑first) | Documented as mandatory pre‑multi‑tenant; unchanged | `SECURITY_AUDIT_REPORT.md` | **By‑design** |
| **F-12** | No NFC / no migrations | — | NFC normalization in `resolve.substitute`; additive SQLite column migration (`database._migrate_sqlite`) | `test_occasions.test_project_carries_occasion` (migration) | **Closed‑ltd** (Alembic still recommended for prod) |

## Product scope expansion (universal occasion platform)

| Item | Implementation | Evidence | Status |
|------|----------------|----------|--------|
| Occasion registry (28 occasions, 8 categories) | `occasion_data.py`, `/api/occasions` | `test_occasions.py` | Closed |
| Dynamic form engine | occasion‑driven `Wizard.tsx` (groups→steps, field types) | `occasions.spec.ts` (birthday/corporate/greeting) | Closed |
| Build Your Own custom occasions | `BuildYourOwn.tsx`, `/api/occasions/custom` CRUD | `occasions.spec.ts` TC007/008; `test_custom_occasion_crud` | Closed |
| Backward‑compatible schema | additive Project columns + SQLite migration; wedding fields preserved | existing wedding E2E still pass; `test_wedding_fields_backward_compatible` | Closed |
| Occasion‑agnostic editor | RightPanel/LeftPanel labels neutralized; details derived from project | `occasions.spec.ts` asserts occasion fields, not wedding | Closed |
| Dashboard categories + Blank canvas | `Dashboard.CreatePanel` | manual + `occasions.spec` navigation | Closed |
| Universal templates | 6 occasion‑neutral templates, occasion filtering | `templates?occasion=` API | Closed |

## Net result
All P1 audit defects (F‑01, F‑02, F‑04, F‑05) and the test‑quality gap (F‑10) are **fixed and
verified**. F‑03 (offline fonts) and F‑09 (font‑upload UI / group / pan) are **mechanism‑complete
but asset/UI‑pending**; F‑08 breadth is partial. See
[FINAL_ACCEPTANCE_REPORT](FINAL_ACCEPTANCE_REPORT.md) for the decision.
