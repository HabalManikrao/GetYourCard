# Release Notes — Shubha Muhurta 1.0.0

First release of the Marriage Invitation Studio: a universal multilingual, production-quality
invitation design application.

## Features
- Creative **dashboard** with search, filter, duplicate, delete.
- **5-step wedding wizard** with validation and a searchable 40+ language picker.
- **15 original, genuinely distinct templates** across 5 layout archetypes.
- **Canva-style visual editor** (Fabric.js): editable/draggable/resizable/rotatable text,
  24 recolorable SVG motifs, image uploads, layers, undo/redo, zoom/fit, front + inside
  pages, real-time preview.
- **Universal multilingual engine**: dynamic language + font registries, language-independent
  content model, per-element script detection, font-coverage warnings, RTL support, dynamic
  Google-Fonts loading. Verified in English, Kannada (complex script), and Arabic (RTL).
- **Real export**: PNG/JPG (standard/high/print/WhatsApp) and single/multi-page PDF
  (digital, A5, A4 + bleed). Every language is preserved because exports rasterise the
  shaped canvas.
- **Persistence**: full editable design JSON, autosave, reopen, duplicate, versioning,
  export history.
- **Optional AI** wording/palette assistance that works offline; providers are env-gated
  and never faked.

## Quality
- 19 backend (Pytest) + 28 frontend unit (Vitest) + 7 end-to-end (Playwright) tests passing.
- TypeScript strict, clean production build.

## Known limitations
- No authentication yet (local-first, guest mode). Add before multi-tenant deployment.
- Fully-offline export needs a self-hosted font bundle (CDN used by default; custom-font
  upload supported).
- Dedicated image-crop tool, AI side-by-side translation UI, and bundle splitting are
  planned follow-ups.

## Upgrade / deploy
- Local dev: `scripts\setup.ps1` then `scripts\start-dev.ps1`.
- Containers: `docker compose up --build` → <http://localhost:8080>.
- Config via env (`backend/.env.example`); PostgreSQL via `SM_DATABASE_URL`.
