# Shubha Muhurta Studio — Universal Invitation, Greeting & Event Card Designer

> *Every Occasion. Every Language. Your Creativity.*

A production-quality, **universal multilingual** card design studio. Create invitations,
greeting cards, event and announcement cards for **any occasion** — weddings, birthdays,
housewarmings, corporate events, religious ceremonies, greetings, or your own custom
occasion — with a Canva-style visual editor, a dynamic occasion/form engine, real export to
PNG/JPG/PDF, and genuine support for 40+ languages and complex scripts (Kannada, Devanagari,
Tamil, Arabic/RTL, CJK, and more). Weddings remain a first-class category.

![stack](https://img.shields.io/badge/React-18-61dafb) ![stack](https://img.shields.io/badge/TypeScript-5-3178c6) ![stack](https://img.shields.io/badge/FastAPI-0.115-009688) ![stack](https://img.shields.io/badge/Fabric.js-6-ff9800)

---

## Highlights

- **Dashboard** — create, search, filter, duplicate, delete invitation projects.
- **5-step wizard** — groom, bride, wedding, family, and language/format, with validation.
- **15 original templates** — genuinely distinct layouts (temple arch, floral corners, symmetric border, minimalist, banner), each language-independent.
- **Visual editor (Fabric.js)** — drag, resize, rotate, layer, edit text, add motifs/photos, undo/redo, real-time preview, front + inside pages, zoom/fit.
- **Universal multilingual engine** — a dynamic language registry (40+ locales), a font registry with per-script coverage detection and fallbacks, a language-independent content model, RTL support, and dynamic font loading. *No language is hardcoded into the editor.*
- **Real export** — PNG/JPG (standard/high/print/WhatsApp) and single- or multi-page PDF (digital, A5, A4 with bleed). Exports rasterise the live canvas, so every script and RTL language is preserved pixel-perfect.
- **Persistence** — projects save the full editable design JSON (not a flattened image); auto-save, reopen, duplicate.
- **Optional AI** — wording and palette assistance that works **offline**; external providers are opt-in via env vars, never faked, never hardcoded.

## Quick start (Windows, local dev)

```powershell
# 1. One-time setup (creates venv, installs deps)
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1

# 2. Launch backend (:8000) + frontend (:5173)
powershell -ExecutionPolicy Bypass -File scripts\start-dev.ps1
```

Then open <http://localhost:5173>.

### Manual start

```bash
# Backend
cd backend
py -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Docker (one command)

```bash
docker compose up --build
# open http://localhost:8080
```

## Tests

```bash
# Backend (19 tests)
cd backend && .venv\Scripts\python -m pytest -q

# Frontend units (28 tests)
cd frontend && npm test

# End-to-end (Playwright, uses system Chrome) — servers must be running
cd frontend && npm run e2e
```

## Project layout

```
backend/        FastAPI + SQLAlchemy + SQLite. Templates, languages, fonts, wordings,
                projects, assets, exports, optional AI. See app/.
frontend/       React + TS + Vite + Tailwind. Editor in src/editor/, engine in src/lib/,
                state in src/store/, pages in src/pages/.
docs/           Architecture, API, database, multilingual, export, test, security docs.
scripts/        Windows PowerShell setup/launch scripts.
```

## Documentation

See [`docs/`](docs/): [Architecture](docs/ARCHITECTURE.md) · [Occasion platform](docs/OCCASION_PLATFORM.md) · [Requirements traceability](docs/REQUIREMENTS.md) · [Database](docs/DATABASE_DESIGN.md) · [API](docs/API_SPECIFICATION.md) · [UI/UX](docs/UI_UX_DESIGN.md) · [Templates](docs/TEMPLATE_DESIGN_GUIDE.md) · [Multilingual & Kannada](docs/MULTILINGUAL_SUPPORT.md) · [Export](docs/EXPORT_SPECIFICATION.md) · [Test strategy](docs/TEST_STRATEGY.md) · [Security](docs/SECURITY_REVIEW.md) · [Tracker](docs/IMPLEMENTATION_TRACKER.md) · [Release notes](docs/RELEASE_NOTES.md).

**Audit & remediation:** [Remediation report](docs/REMEDIATION_REPORT.md) · [Regression test report](docs/REGRESSION_TEST_REPORT.md) · [Final acceptance report](docs/FINAL_ACCEPTANCE_REPORT.md) · [Implementation audit](docs/IMPLEMENTATION_AUDIT_REPORT.md).

## License & assets

All decorative motifs and templates were authored originally for this project. See [`ASSET_LICENSE.md`](ASSET_LICENSE.md). Fonts are open-source (Google Noto family + Cormorant Garamond + Playfair Display, SIL OFL).
