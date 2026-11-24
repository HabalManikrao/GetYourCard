# Remaining Gaps and Risks

Prioritized. P0 blocks the stated deployment target; P1 high; P2 medium; P3 low.

| ID | Gap | Priority | Impact | Status / mitigation | Effort |
|----|-----|----------|--------|---------------------|--------|
| G‑1 | **No authentication/authorization** | **P0 for shared deployment** (P3 for local) | Any client can read/modify/delete any project | By design for local‑first guest mode; MUST add auth + per‑user project scoping before internet/multi‑tenant exposure | L |
| G‑2 | ~~Offline complex‑script fonts not vendored~~ **RESOLVED (primary scripts)** | P3 (CJK only) | — | **19 OFL families vendored** (`public/fonts/`), offline‑verified (Kannada+Arabic, network disabled). **CJK not bundled** — optional add‑on per `OFFLINE_FONT_INSTALLATION_GUIDE.md` | S (CJK only) |
| G‑3 | Complex‑script **selectable** PDF text | P2 | Kannada/Arabic/CJK not searchable in PDF (visually correct) | Documented; needs a Chromium HTML→PDF pipeline (`PDF_TEXT_PRESERVATION_REPORT.md`) | L |
| G‑4 | Dependency vulnerability scan not run | P2 | Unknown CVEs | `npm audit` / `pip-audit` blocked (registry access); run in CI | S |
| G‑5 | Free‑drag image crop | P3 | Crop is preset‑only (1:1/3:4/4:3/free‑reset) | Functional crop shipped; free‑drag is an enhancement | M |
| G‑6 | Custom‑font **upload UI** | P3 | `registerCustomFont` + local manifest exist, but no in‑app upload control | Mechanism present; UI deferred | S |
| G‑7 | Canvas **panning** / group‑select polish | P3 | Pan via scroll container only; Fabric native multi‑select (`selection:true`) available but not E2E‑tested | Deferred; low user impact | S |
| G‑8 | Alembic migrations | P3 | Prod schema evolution relies on additive SQLite ALTER | Additive migration implemented for SQLite; add Alembic for Postgres prod | M |
| G‑9 | Full per‑script visual matrix | P3 | 11 scripts screenshot‑verified; Malayalam/Marathi/Korean/Persian/Latin‑EU rendered through identical pipeline but not individually spot‑checked | `MULTILINGUAL_CERTIFICATION_MATRIX.md` ⚙️ rows | S |
| G‑10 | Playwright `webServer` auto‑start | P3 | E2E require manually‑started servers | Harness fragility; configure `webServer` | S |
| G‑11 | SVG upload sanitiser is heuristic | P2 if multi‑user | Stored‑XSS risk via crafted SVG | Rejects `<script>`; for untrusted input add full sanitiser or rasterize SVGs | M |
| G‑12 | Undo/redo not persisted across reload | P3 | History resets on reopen | By design; autosave persists the document, not the undo stack | — |

## Risk notes
- **Deployment risk:** shipping to the internet without G‑1 (auth) is the single highest
  risk — do not expose publicly until addressed.
- **Offline claim risk:** do not advertise "offline multilingual export" until G‑2 fonts are
  vendored and verified with the CDN blocked.
- **Regression risk:** the remediation touched the export/render path; mitigated by the
  expanded regression suite (25 + 36 + 19) and artifact inspection. Keep running the full
  suite before releases.
