# Test Coverage & Quality Gap Report (Phase L)

> **POST-REMEDIATION UPDATE.** Suites grew to **25 pytest + 36 vitest + 16 Playwright**.
> Closed gaps: export tests now assert PNG dimensions, PDF page count, **clip detection**
> (a test fails when text is clipped), and **PDF text extraction** (Latin names present);
> added 8 layout unit tests; added occasion‑platform E2E (birthday/corporate/greeting/custom)
> and image‑crop E2E. Still open: air‑gapped offline test, full per‑script render matrix,
> drag/resize interaction tests, dependency scanning. See
> [REGRESSION_TEST_REPORT](REGRESSION_TEST_REPORT.md).

---


**Executed this audit:** Backend **19 passed**, Frontend units **28 passed**, E2E **7 passed**.
Tests were run unmodified. No test was altered to hide failures.

## What the existing tests genuinely cover (good)
- Backend: real API CRUD + persistence round-trip, upload validation (type/corrupt/SVG/
  traversal), export base64 round-trip + download, language/font registries, localized
  message defaults, AI-disabled behaviour. Realistic data, meaningful assertions, isolated
  temp DB. **Strong.**
- Units: script detection across 16 scripts, token resolution/fallback, export helpers. Good.
- E2E: full create flow, Kannada + Arabic render (visual screenshots), undo, validation,
  save/reopen persistence, PNG + PDF file production.

## Weaknesses & false confidence
| Issue | Detail |
|-------|--------|
| **Export tests assert only magic bytes + size** | `export.spec.ts` passed **despite the F-01 text-clipping defect**. No pixel/visual-regression or text-presence assertion. |
| No visual regression baseline | `visual-check.spec.ts` saves screenshots but makes **no assertions** on them. |
| Editor interactions untested | drag, resize, rotate, colour, font change, alignment, decoration-add, layer-order, lock — none have interaction tests. |
| Multilingual breadth untested | only en/kn/ar; no Telugu/Tamil/Hebrew/CJK render or export assertions. |
| Offline untested | no air-gapped test; CDN dependency unverified by test. |
| Persistence partial | reload tested; **backend-restart** persistence not explicitly tested; decoration/image persistence not asserted. |
| Image upload in editor | backend upload tested; placement on canvas + export inclusion not tested. |
| No auth tests | because no auth exists. |
| No dependency scan | `npm audit`/`pip-audit` absent. |
| No PDF-content assertions | page count/text/clipping not asserted in E2E (only file header). |

## Untested modules / paths
- `editor.ts`: `reorder`, `toggleLock`, `duplicateElement`, `setImageBackground`,
  `applyPalette`, `removeLanguageLayer`, `updateLayerContent` (no unit/integration tests).
- `DesignCanvas.ts`: geometry read-back (`emitModify`), decoration/image/shape builders,
  `renderPageDataURL` (the export path where F-01 originates).
- `docFactory.buildDesignFromTemplate` / `buildLayer` (no direct test).

## Flakiness
Observed: the full E2E suite "failed 7/7" once when the dev servers were down, then passed
7/7 when restarted — tests depend on externally-started servers (no Playwright `webServer`
auto-start configured for this run). Not flaky logic, but a harness fragility.

## Recommendations (priority order)
1. Add an export **text-presence / visual-regression** assertion that would have caught F-01.
2. Add Playwright interaction tests (drag/resize/rotate/colour/decoration/layer/lock).
3. Add a per-script render matrix (Telugu, Tamil, Bengali, Hebrew, Japanese, Chinese).
4. Add an offline (route-blocked `fonts.googleapis.com`) render/export test.
5. Add backend-restart persistence test and decoration/image persistence assertions.
6. Configure Playwright `webServer` to auto-start backend+frontend.
7. Add `pip-audit` + `npm audit` to CI.

**Status: tests pass but coverage is NARROW; green suites do not establish completeness.**
