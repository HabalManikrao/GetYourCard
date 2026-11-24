# Test Strategy

Three layers, all runnable locally. No mocks stand in for real functionality — exports
produce real files, the editor renders a real canvas, persistence round-trips through the
real API.

## Backend — Pytest (`backend/tests/`, 19 tests)

Isolated temp DB + storage per run (`conftest.py`). Covers:
- Health, template seeding (15, token-based/language-independent), SVG preview.
- Language registry (≥40 locales, RTL flags), search, font coverage + fallback.
- Localized message defaults (Kannada/Arabic content, English fallback, never empty).
- Wordings (≥8, language filter).
- **Project CRUD + persistence** (full design JSON round-trip, version bump, search,
  duplicate independence, delete → 404).
- **Upload validation**: valid PNG accepted + served; wrong type → 415; corrupt image →
  400; scripted SVG → 400.
- **Export**: base64 round-trip + download (PNG magic bytes); bad base64 → 400; unknown
  project → 404; path-traversal sanitised.
- AI disabled by default; image generation returns 503 (never faked).

Run: `cd backend && .venv\Scripts\python -m pytest -q`

## Frontend units — Vitest (`frontend/src/**/*.test.ts`, 28 tests)

- **Script detection** across 16 scripts (Latin, Kannada, Devanagari, Telugu, Tamil,
  Malayalam, Bengali, Gujarati, Gurmukhi, Arabic, Hebrew, Japanese, Korean, Han, Thai,
  Greek, Cyrillic) + RTL direction + complex-script dominance over Latin digits.
- **Content resolution**: token substitution from language layer → details fallback;
  per-locale switching; readable placeholder for empty bindings; manual text preserved.
- **Export helpers**: quality multipliers, safe filenames, data-URL → Blob.

Run: `cd frontend && npm test`

## End-to-end — Playwright (`frontend/e2e/`, 7 tests, system Chrome)

Mapped to the acceptance test cases (TC001–TC025):

| Test | Covers |
|------|--------|
| smoke | TC001 open, TC002 create, TC003–005 details, TC006 Kannada, TC007 template, editor renders, language switch, **zero console errors** |
| visual-check | TC006/TC012 Kannada render, RTL Arabic render (screenshots), TC019 complex script in canvas |
| export (PNG) | TC016/TC017 PNG/JPG — valid image, magic bytes |
| export (PDF) | TC018 PDF — valid `%PDF-`, multi-page |
| flows:TC022 | missing-field validation |
| flows:TC013 | add element + undo |
| flows:TC015/TC025 | save + reopen persistence across reload |

Run (servers up): `cd frontend && npm run e2e`

### Acceptance-case coverage summary

| TC | Scenario | Where |
|----|----------|-------|
| 001–007 | open/create/details/language/template | smoke |
| 008 edit wording | right-panel content editor | flows (text edit), unit resolve |
| 009 decorations | left panel motifs | editor (manual + DecoThumb) |
| 010 upload photo | assets upload | backend upload tests + editor |
| 011 drag/resize text | Fabric modify → store | editor (object:modified) |
| 012 font/colour | right panel | visual-check (font switch), editor |
| 013 undo/redo | history | flows:TC013 |
| 014/015 save/reopen | autosave + load | flows:TC015 |
| 016–018 PNG/JPG/PDF | export | export spec |
| 019 Kannada in export | rasterised shaped glyphs | visual-check + export |
| 020 WhatsApp export | compact JPG tier | export menu + export.ts |
| 021 responsive | panel toggles, relative units | UI (manual/responsive layout) |
| 022 validation | wizard | flows:TC022 |
| 023 corrupt upload | rejected | backend upload tests |
| 024 delete project | dashboard + API | backend CRUD |
| 025 persistence after restart | JSON design reload | flows:TC015 + backend CRUD |

## Visual regression
`visual-check.spec.ts` saves `e2e-output/editor-{english,kannada,arabic}.png` for manual or
snapshot comparison. PDF/PNG verification uses file signatures, not just text extraction.
