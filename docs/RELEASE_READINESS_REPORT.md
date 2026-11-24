# Release Readiness Report (Phase N) & Final Decision

> **POST-REMEDIATION UPDATE:** The P1 defects below were remediated. Current status is
> **REMEDIATION COMPLETE WITH DOCUMENTED LIMITATIONS** — see
> [FINAL_ACCEPTANCE_REPORT](FINAL_ACCEPTANCE_REPORT.md) and
> [REMEDIATION_REPORT](REMEDIATION_REPORT.md). Fixed & verified: F‑01 (clipping), F‑02
> (layout engine), F‑04 (Latin selectable PDF), F‑05 (A4/A5 fit), F‑06 (crop), F‑07 (21
> templates), F‑10 (tests). Documented limitations: F‑03 (offline font binaries — mechanism
> done, assets pending), F‑04 complex‑script selectable text, F‑08 full script matrix, F‑09
> font‑upload UI/group/pan, F‑11 auth. The sections below record the original audit baseline.

## Overall decision (original audit baseline — superseded by the update above)

## ▶ 3. PARTIALLY IMPLEMENTED

The application delivers a genuinely working, well-architected core (dashboard → wizard →
templates → canvas editor → multilingual switching → export → persistence), executed and
verified end-to-end for English, Kannada, and Arabic. However, it is **not**
"Complete and Verified": multiple **mandatory** requirements are incomplete or defective —
a reproducible export text-clipping defect, an absent dynamic layout engine, no true offline
multilingual export, rasterized PDFs without font embedding, missing image cropping, and
multilingual breadth verified for only 3 of the promised scripts.

### Four-way maturity split
- **Implemented (code works):** dashboard, wizard, 15 templates, editor core, language/font
  registries, content model, RTL, export mechanics, persistence, API, upload security, docs,
  Docker/compose config.
- **Tested (automated):** API CRUD/upload/export round-trip, script detection, token
  resolution, undo, validation, save/reopen, PNG/PDF file production.
- **Visually verified:** English/Kannada/Arabic canvas render; PNG/PDF rendered back to images.
- **Production-ready:** **No** — for internet/multi-tenant (no auth); and the P1 defects
  below must be fixed first even for the local release.

## Prioritized defect & gap list

### P0 — Critical blocker
_None that block the local happy path outright; the P1 items below are release-blocking for
the stated feature set but the app does run._

### P1 — High
| ID | Requirement | Status | Evidence | Impact | Root cause | Fix | Complexity |
|----|-------------|--------|----------|--------|-----------|-----|-----------|
| F-01 | No silent truncation / text not clipped | Defective | PNG+PDF artifacts clip invite line | Important text lost in every export using that element | Web-font load race in export re-render; element width assumes wrap that doesn't occur | Await `document.fonts.ready` inside `renderPageDataURL` before measuring; re-wrap after fonts load; add overflow guard | M |
| F-02 | Dynamic layout engine (overflow/collision/auto-resize/safe margin/min font/recalc) | Not implemented | no such code in `frontend/src` | Language switches can overflow/overlap; "extremely important" req unmet | Feature never built (only Fabric native wrap + font reassignment) | Build a layout pass: measure, detect overflow/collision, auto-fit font, enforce safe margins | L |
| F-03 | Offline multilingual export | Not met | `fontLoader.ts:11` CDN-only | Complex scripts tofu offline; offline export incorrect | Fonts fetched from Google CDN; none bundled | Self-host OFL font subsets via `@font-face`; CDN as enhancement | M |
| F-04 | PDF font embedding / selectable text | Not met (by design) | pymupdf: 0 text chars/page | PDFs not searchable/selectable; Module E criterion unmet | Rasterize-at-export design choice | Optional: add a text-layer PDF mode (embed subset fonts) alongside raster | L |

### P2 — Medium
| ID | Requirement | Status | Evidence | Impact | Fix | Complexity |
|----|-------------|--------|----------|--------|-----|-----------|
| F-05 | Accurate print dims (A5/A4) | Partial | A5 cover-fit crops 9:16 | Edges cropped in print | Contain-fit or paper-aspect template sizes | S |
| F-06 | Image cropping | Not implemented | no crop code | Module D #6 unmet | Add crop UI (Fabric clipPath) | M |
| F-07 | ≥20 distinct templates | Partial | 15 templates / 5 layouts | Below audit baseline; limited structural variety | Add ≥5 new layout archetypes | M |
| F-08 | Multilingual breadth verified | Partial | only en/kn/ar verified; 33 locales English-fallback content | "any language" unproven | Add per-script render tests; localize more defaults | M |
| F-09 | Custom font upload / group-ungroup / pan | Not wired / not implemented | `registerCustomFont` unused; no group/pan | Advertised editor features missing | Wire font upload UI; add group/pan | M |
| F-10 | Test breadth / visual regression | Narrow | export test missed F-01 | False confidence | Add visual + interaction + offline + per-script tests | M |

### P3 — Low
| ID | Gap | Status | Fix |
|----|-----|--------|-----|
| F-11 | Authentication/authorization | Absent (by design, local-first) | Add auth + project scoping before multi-tenant |
| F-12 | Unicode normalization (NFC) | Absent | Normalize on input/persist |
| F-13 | DB migrations | `create_all` only | Add Alembic |
| F-14 | Dependency vuln scan | Not run | Add `pip-audit` + `npm audit` to CI |
| F-15 | Script-aware line breaking | Generic only | CJK/Thai breaking rules |

## Build/deploy verification (Phase M)
- `tsc -b` clean · `vite build` success · `pytest` 19 · `vitest` 28 · `playwright` 7 ·
  `docker compose config` valid.
- **Not verified:** actual `docker compose up` image build + runtime health (not executed);
  `scripts/setup.ps1` / `start-dev.ps1` runtime startup not executed in this audit (scripts
  inspected and plausible, but un-run).

## Path to "Complete and Verified"
1. Fix F-01 (export clipping) + add a regression test. **(release-blocking)**
2. Bundle fonts for offline + verify per-script export matrix (F-03, F-08).
3. Implement the dynamic layout engine (F-02).
4. Add image cropping (F-06); wire custom-font upload (F-09).
5. Decide PDF strategy for font embedding/selectable text (F-04).
6. Reach 20 templates with real layout diversity (F-07).
7. Broaden tests incl. visual regression (F-10); run air-gapped + container runtime checks.
8. Add authentication before any shared deployment (F-11).

---
*Audit conducted read-only. No source code was modified, no files deleted, no commits made.
Audit tooling (`pymupdf`) was installed into the backend venv for PDF inspection only.*
