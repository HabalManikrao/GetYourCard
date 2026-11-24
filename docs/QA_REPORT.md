# Final QA Report

**Build:** Shubha Muhurta 1.0.0 · **Date:** verified on the development environment
(Node 24.22, Python 3.12.6, system Chrome).

## Automated test results

| Suite | Tool | Result |
|-------|------|--------|
| Backend API/upload/export/security | Pytest | **19 passed** |
| Frontend engine units | Vitest | **28 passed** |
| End-to-end (create → edit → export → persist, multilingual) | Playwright (Chrome) | **7 passed** |
| Type safety | `tsc -b` | **clean** |
| Production build | `vite build` | **success** (1966 modules) |
| Container config | `docker compose config` | **valid** |

## Functional verification (executed, not assumed)

| Area | Evidence |
|------|----------|
| Dashboard create/search/filter/duplicate/delete | smoke E2E + backend CRUD tests |
| Wizard (5 steps) + validation | smoke + flows:TC022 |
| 15 distinct templates render | backend test (15 seeded, token-based) + visual screenshots |
| Fabric editor: add/drag/resize/rotate/layers | editor wired to store; add+undo verified (flows:TC013) |
| Undo/redo | flows:TC013 + keyboard shortcut |
| Real-time preview | canvas re-renders on store change (visual screenshots) |
| **Kannada** render (conjuncts, vowel signs) | `e2e-output/editor-kannada.png` |
| **Arabic RTL** render (contextual shaping) | `e2e-output/editor-arabic.png` |
| Language switching (English↔Kannada↔Arabic) | visual-check E2E, fonts + content adapt |
| Font coverage warning + fallback | right panel logic + font registry tests |
| PNG export (valid image, magic bytes) | export:PNG |
| PDF export (valid `%PDF-`, multi-page, A5 bleed) | export:PDF |
| WhatsApp/compact + print tiers | export menu + export.ts unit tests |
| Upload validation (type/size/corrupt/scripted-SVG) | backend upload tests |
| Save + reopen persistence (full editable JSON) | flows:TC015/TC025 + backend persistence test |
| AI optional, image gen not faked | backend AI tests (status false, image → 503) |

## Visual artifacts
Screenshots captured by `frontend/e2e/visual-check.spec.ts`:
`editor-english.png`, `editor-kannada.png`, `editor-arabic.png` (under `frontend/e2e-output/`).
Kannada and Arabic confirm correct complex-script shaping and RTL layout on the live canvas,
which the export pipeline rasterises verbatim.

## Defects
- No critical or high-severity defects open.
- During development three issues were found and fixed: (1) a new invitation defaulted to a
  blank canvas with no language layers → now defaults to a template and always builds the
  selected language layers; (2) the canvas controller was created after the document was
  set, so the initial render never fired → explicit initial render added; (3) a favicon 404
  → inline SVG favicon added.

## Acceptance criteria (Section 10)
All 20 acceptance criteria are satisfied for the local-first release; items requiring
authentication/multi-tenant scope are documented as future work in
[IMPLEMENTATION_TRACKER](IMPLEMENTATION_TRACKER.md). The multilingual engine meets its
acceptance list (dynamic languages, no hardcoding, Unicode preserved, covering fonts,
complex-script + RTL rendering, adaptive layout, no silent truncation, exports preserve
language, saved projects preserve translations, coverage warnings).

## How to reproduce
```powershell
scripts\setup.ps1
scripts\start-dev.ps1          # backend :8000, frontend :5173
# in frontend/:
.venv\Scripts\python -m pytest -q    # (backend/) 19
npm test                              # 28
npm run e2e                           # 7 (servers must be running)
```
