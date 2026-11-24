# Implementation Audit Report — Shubha Muhurta

**Audit type:** Independent, audit-only (no source modified, no commits, no fixes).
**Method:** Source inspection + execution of all test suites + inspection of real export
artifacts + rendering exported PDF/PNG back to images for visual comparison.
**Overall verdict:** **PARTIALLY IMPLEMENTED** (see
[RELEASE_READINESS_REPORT](RELEASE_READINESS_REPORT.md) for the formal decision).

> The core create → edit → multilingual → export → persist happy path genuinely works and
> is well-built. However, several **mandatory** requirements are incomplete or defective —
> notably the dynamic layout engine, image cropping, true offline multilingual export, PDF
> font embedding, and a reproducible export **text-clipping defect**. Automated suites are
> green but narrow, and did not catch the clipping defect.

## Phase A — Implementation inventory

| Area | Implementation | Status |
|------|----------------|--------|
| Frontend architecture | React 18 + TS strict + Vite 5 + Tailwind + Zustand (`frontend/src/`) | ✅ real |
| Backend architecture | FastAPI + SQLAlchemy 2 + Pydantic v2 (`backend/app/`) | ✅ real |
| Database schema | `backend/app/models.py` (User, Project, Template, Asset, Export) | ✅ real |
| API endpoints | `backend/app/routers/*.py` (31 routes) | ✅ real |
| Canvas editor | `frontend/src/editor/DesignCanvas.ts` (Fabric v6) | ✅ real, with gaps |
| Template engine | `backend/app/template_data.py` (15 templates, 5 layouts) | ◐ partial (count/diversity) |
| Language registry | `backend/app/language_data.py` (44 locales) | ✅ real |
| Font management | `backend/app/font_data.py` + `frontend/src/store/registry.ts` | ◐ CDN-only, no UI upload |
| Unicode rendering | browser shaping on Fabric canvas | ◐ 3 scripts verified |
| RTL | `direction` on Textbox; `scripts.ts` detection | ✅ Arabic verified |
| Translation services | `message_data.py` defaults + `ai.py` (offline) | ◐ Mode B UI absent |
| Export engine | `frontend/src/lib/export.ts` + `routers/exports.py` | ◐ defect + rasterized |
| Project persistence | design JSON in `projects.project_data` | ✅ verified |
| Image handling | upload validated (Pillow); placed on canvas | ◐ no cropping |
| AI integration | `routers/ai.py`, env-gated, not faked | ✅ real (optional) |
| Security controls | upload validation, path sanitisation, CORS, error handler | ◐ no auth |
| Deployment | Dockerfiles, compose, nginx, PS scripts | ◐ config valid, runtime not audited |
| Documentation | 13 docs under `docs/` | ✅ present |
| Automated tests | 19 pytest + 28 vitest + 7 playwright | ◐ narrow |

### Placeholder / unused / not-wired code
- `fontLoader.ts:52 registerCustomFont` — implemented but **not referenced by any UI**
  (custom font upload is not reachable by a user). `grep registerCustomFont frontend/src` →
  only the definition.
- No `crop`, `group`/`ungroup`, or `pan` logic anywhere in `frontend/src/editor/`.
- No `overflow`, `collision`, `normalize`/`NFC`, `safe-margin`, or `min-font` logic in
  `frontend/src` (dynamic layout engine absent).

## Phase L/M — Executed results (this audit run)

| Suite | Command | Result |
|-------|---------|--------|
| Backend | `pytest -q` | **19 passed** |
| Frontend units | `vitest run` | **28 passed** |
| E2E | `playwright test` | **7 passed** |
| Typecheck | `tsc -b` | clean (prior run) |
| Compose | `docker compose config` | valid |

**Caveat:** the export E2E (`e2e/export.spec.ts`) asserts only file signature + size, not
visual correctness — it passed while the exported artwork contains clipped text (see Phase G).
This is a false-confidence gap, not a reason to trust completeness.

## Top findings (see per-area reports for detail)

| ID | Severity | Finding |
|----|----------|---------|
| F-01 | **P1** | Exported PNG **and** PDF clip the invite-line text at the right edge (`backend/storage/exports/*.png|pdf`). Violates "text is not clipped" / "no silent truncation". |
| F-02 | **P1** | Dynamic layout engine (overflow/collision detection, auto-resize, safe margins, min font size, layout recalculation) is **not implemented**; only Fabric's native word-wrap + font reassignment on language switch. |
| F-03 | **P1** | True offline multilingual export is **not supported**: all webfonts load from `fonts.googleapis.com` (`fontLoader.ts:11`); no bundled fonts. Offline → fallback/tofu for non-cached scripts. |
| F-04 | **P1** | PDF export is **rasterized**: 0 extractable text chars/page, artwork as image XObjects; the 14 `/Font` entries are jsPDF base-14, unused. No font embedding, no selectable text (Module E "verify font embedding" not met). |
| F-05 | **P2** | A5/A4 PDF uses **cover-fit**, cropping the 9:16 design top/bottom on the page. |
| F-06 | **P2** | Image **cropping not implemented** (Module D functional requirement #6). |
| F-07 | **P2** | **15 templates across only 5 structural layouts**; audit baseline asks for 20; several share a skeleton (differ by palette/decorations/fonts). |
| F-08 | **P2** | Multilingual breadth **not verified per script**: only English/Kannada/Arabic rendered; localized default content exists for ~11 languages, others fall back to English. |
| F-09 | **P2** | Custom font upload, group/ungroup, and canvas pan are not implemented/wired. |
| F-10 | **P2** | Test suites are narrow (no visual regression, no editor-interaction, upload-in-editor, offline, or decoration/image persistence tests). |
| F-11 | **P3** | No authentication/authorization (by design for local-first guest mode; required before multi-tenant). |
| F-12 | **P3** | Unicode normalization (NFC) not applied; no Alembic migrations (metadata `create_all`). |

See the companion reports for full evidence.
