# Regression Test Report

All suites executed after remediation + product expansion. Servers (backend :8000,
frontend :5173) running; Playwright uses system Chrome. No tests were modified to hide
failures; tests were updated only where the UI/contract legitimately changed (template
count 15→21, wedding validation message, occasion‑agnostic editor).

## Summary

| Suite | Tool | Before (audit) | After (now) | Result |
|-------|------|----------------|-------------|--------|
| Backend API/upload/export/security/occasions | Pytest | 19 | **25** | ✅ all pass |
| Frontend units (scripts/resolve/export/layout) | Vitest | 28 | **36** | ✅ all pass |
| End‑to‑end | Playwright (Chrome) | 7 | **16** | ✅ all pass |
| Type safety | `tsc -b` | clean | **clean** | ✅ |
| Production build | `vite build` | ok | **ok (11.9s)** | ✅ |
| Container config | `docker compose config` | valid | valid | ✅ |

## Backend (25)
`test_api.py` (health, templates≥20, languages/fonts/wordings, message‑defaults, project CRUD
+ persistence, AI disabled), `test_uploads_exports.py` (valid/invalid uploads, export round‑trip,
traversal), `test_occasions.py` (registry, wedding backward‑compat, greeting has no wedding
fields, custom‑occasion CRUD, project carries occasion, universal templates).

## Frontend units (36)
`scripts.test.ts` (16 scripts + RTL + dominance), `resolve.test.ts` (token/locale/placeholder),
`export.test.ts` (multipliers/filenames/blob), `layout.test.ts` (8: clip/margin/collision/deco‑bleed/
autoFit).

## End‑to‑end (16)
| Spec | Tests | Covers |
|------|-------|--------|
| smoke | 1 | create → editor → language switch, zero console errors |
| flows | 3 | validation (TC022), undo (TC013), persistence reopen (TC015/025) |
| layout | 2 | **F‑01** no clip on default; **F‑02** long text raises clip warning |
| export | 3 | PNG valid+dims 2160×3840; **F‑04** digital PDF contains selectable "Arjun/Meera"; A5 multi‑page PDF |
| visual‑check | 1 | English/Kannada/Arabic render (complex script + RTL) screenshots |
| occasions | 4 | birthday, corporate, greeting, custom occasion end‑to‑end (scope expansion) |
| occasions‑visual | 1 | birthday card renders with resolved occasion tokens (screenshot) |
| crop | 1 | **F‑06** upload image → apply 1:1 crop |

## Artifact verification (manual/scripted)
- **PNG** (2160×3840) rendered & inspected — invite line wraps, no clipping.
- **A5 PDF** rendered via PyMuPDF — entire card contained, no crop.
- **Digital PDF** text‑extracted via PyMuPDF — **332 chars**, incl. "Arjun Kumar", "Meera Rao",
  "weds", "Shree Ganeshaya Namaha" → selectable Latin text confirmed.
- **Birthday card** screenshot — occasion tokens ({{celebrant_name}}, {{age}}) resolve; editor
  shows occasion fields, not wedding fields.

## Known flakiness / harness notes
- E2E depend on externally‑started dev servers (no Playwright `webServer` auto‑start configured);
  if servers are down, all E2E fail fast — restart and re‑run. Not a logic flake.

## Not executed this cycle
- Air‑gapped offline render/export (font binaries not vendored — F‑03, sandbox‑blocked).
- `docker compose up` runtime (image build not run); PS scripts inspected, not executed.
- `pip-audit` / `npm audit` (registry access).
