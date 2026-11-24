# Implementation Tracker

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Repo inspection & environment | ✅ (empty repo; Node 24, Python 3.12, Docker, pnpm available) |
| 1 | Foundation: FastAPI + SQLite + Vite/React/TS/Tailwind shell | ✅ both start & verified |
| 2 | Dashboard + 5-step wizard + validation + language select | ✅ |
| 3 | Template engine: 15 templates + 24-motif SVG library + previews | ✅ |
| 4 | Design editor: Fabric canvas, text edit, drag/resize/rotate, layers, undo/redo, panels | ✅ |
| 5 | Multilingual engine: language + font registries, content model, RTL, dynamic fonts | ✅ Kannada/Arabic verified |
| 6 | Export: PNG/JPG/PDF, print dims, bleed, WhatsApp | ✅ valid files verified |
| 7 | Persistence: autosave, reopen, duplicate, versioning, export history | ✅ reopen verified |
| 8 | Optional AI: offline wording/palettes, env-gated providers | ◐ core done |
| 9 | QA & security: pytest/vitest/playwright, upload/export/security | ✅ 19+28+7 passing |
| 10 | Release: Docker, Windows scripts, docs, QA report | ✅ |

## Test results (latest run)

- Backend Pytest: **19 passed**
- Frontend Vitest: **28 passed**
- Playwright E2E (system Chrome): **7 passed** (smoke, visual Kannada/Arabic, PNG, PDF,
  validation, undo, persistence)
- TypeScript: `tsc -b` clean · Vite production build: success

## Remediation + product expansion (post-audit)

| Item | Status |
|------|--------|
| F‑01 export text clipping | ✅ fixed + verified |
| F‑02 dynamic layout engine | ✅ detection/warnings/modes + tests |
| F‑03 offline fonts | ◐ mechanism done; binaries pending (sandbox‑blocked) |
| F‑04 PDF selectable text | ✅ Latin; ◐ complex‑script rasterized (documented) |
| F‑05 A4/A5 fit | ✅ contain‑fit |
| F‑06 image crop | ✅ preset crop |
| F‑07 ≥20 templates | ✅ 21 templates, 11 layouts |
| F‑10 export tests | ✅ clip/dims/text‑extraction |
| F‑12 NFC + migrations | ✅ NFC; additive SQLite migration |
| Universal occasion platform | ✅ 28 occasions, dynamic forms, Build Your Own, backward‑compatible |

Test totals now: **Pytest 25 · Vitest 36 · Playwright 16 · tsc clean · build ok**.
Final status: **REMEDIATION COMPLETE WITH DOCUMENTED LIMITATIONS**
([FINAL_ACCEPTANCE_REPORT](FINAL_ACCEPTANCE_REPORT.md)).

## Open items / future work
- Authentication & multi-tenant project scoping (local-first release ships guest mode).
- Alembic migrations + object storage for production.
- Full translation UI for Mode B (AI) with side-by-side per-language editing.
- Self-hosted font bundle for fully-offline export (currently Google Fonts CDN with
  `document.fonts.load` await; custom-font upload already supported).
- Image cropping UI (upload + freeform placement/resize exists; dedicated crop tool is next).
- Bundle code-splitting (editor/jsPDF) to reduce initial JS payload.
