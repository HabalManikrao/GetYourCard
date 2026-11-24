# Offline Functionality Audit (Phase K)

**Method:** static dependency analysis of network calls + reasoning about offline behaviour.
A fully air-gapped runtime test was not executed, but the external dependency is proven by
source and is deterministic.

## External network dependencies

| Dependency | Where | Required for | Offline impact |
|------------|-------|--------------|----------------|
| **Google Fonts CSS2 API** (`fonts.googleapis.com`) | `frontend/src/lib/fontLoader.ts:11` `css2Url()` | loading **all** webfonts (Noto family, Cormorant, Playfair) | **No fonts load offline** unless browser-cached → fallback/system fonts or tofu for uncovered scripts |
| Google Fonts static (`fonts.gstatic.com`) | implied by CSS2 | font binary files | same |
| AI provider | `backend/app/routers/ai.py` (env-gated) | optional AI wording/image | ✅ none — offline wording works from built-in library; image returns 503 |

No other CDNs: the SPA bundles its own JS/CSS (Vite build); templates, languages, fonts
metadata, wordings, and message defaults are all served by the local backend.

## Offline capability matrix

| Capability | Offline? | Notes |
|------------|----------|-------|
| App startup (SPA + API) | ✅ | self-hosted assets; SQLite local |
| Template gallery | ✅ | from local API; **but** motifs are inline SVG (OK), preview SVG local (OK) |
| Language registry | ✅ | `/api/languages` local |
| Bundled fonts | ❌ | **not bundled** — fetched from Google CDN |
| Font fallback | ⚠️ | falls back to system fonts, which usually lack Indic/complex scripts → tofu |
| Canvas rendering (Latin) | ⚠️ | renders with a system serif; not the intended webfont |
| Canvas rendering (Kannada/Arabic/CJK) | ❌ likely | without Noto, the OS may lack glyphs → tofu/boxes |
| Project saving / reopening | ✅ | local DB |
| PNG / JPG / PDF export | ⚠️/❌ | mechanics work, but exported text uses whatever font loaded; **complex scripts likely tofu offline** |
| External AI | ✅ not required | offline wording/palettes |

## Conclusion (F-03, P1)
The application is **not** capable of producing correct **multilingual** exports offline,
because every webfont — including all Indic/Arabic/CJK Noto fonts — is loaded from the
Google Fonts CDN at runtime. Offline, complex scripts will render with missing glyphs. The
`registerCustomFont` API (unreachable in the UI) is **not** a substitute for a bundled font set.

Note: the original master prompt's explicit offline mandate was *"must work without external
AI access"* (✅ satisfied). True offline **font/export** support is implied by the universal
export requirement but is **not met**.

### Recommended fix
Self-host the required OFL fonts (subset per script) under `frontend/public/fonts`, switch
`fontLoader` to `@font-face` with local `url()`, and keep CDN as a progressive enhancement.
Then re-run the per-script render/export matrix air-gapped.

**Status: PARTIALLY IMPLEMENTED** — offline app + offline AI yes; offline multilingual
rendering/export no.
