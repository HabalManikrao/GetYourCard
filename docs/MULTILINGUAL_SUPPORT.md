# Multilingual & Kannada Support

Shubha Muhurta is a **universal multilingual invitation engine**, not a Kannada/English
app with a language dropdown. No language is special-cased in the editor; adding one is a
data change.

## 1. Language registry (`backend/app/language_data.py`)

44 languages ship by default — 24 Indian + 20 international. Each entry:

```json
{ "locale": "kn-IN", "name": "Kannada", "native_name": "ಕನ್ನಡ",
  "direction": "ltr", "script": "Kannada",
  "fonts": ["Noto Serif Kannada", "Noto Sans Kannada"] }
```

Served at `GET /api/languages` (searchable via `?q=`). Indian: Kannada, English, Hindi,
Telugu, Tamil, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, Assamese, Urdu,
Sanskrit, Konkani, Tulu, Kashmiri, Sindhi, Manipuri, Nepali, Bodo, Santali, Maithili,
Dogri. International: Arabic, Chinese (Simplified/Traditional), Japanese, Korean, French,
German, Spanish, Portuguese, Italian, Russian, Turkish, Persian, Thai, Indonesian,
Vietnamese, Swahili, Dutch, Greek, Hebrew.

**Extensibility:** append an entry (and a font covering its script) — the editor needs no
changes.

## 2. Font registry (`backend/app/font_data.py`)

Each font declares the scripts it covers:

```json
{ "family": "Noto Serif Kannada", "scripts": ["Kannada"],
  "weights": [400,500,600,700], "serif": true, "source": "google",
  "license": "SIL Open Font License 1.1" }
```

Served at `GET /api/fonts` (optionally `?script=Kannada`, returns the fallback too). A
per-script fallback map guarantees a covering font always exists.

### Font pipeline per text element
1. **Detect** the script (`src/lib/scripts.ts`, Unicode-range based).
2. **Check** coverage: does the chosen font cover that script?
3. **Select** a covering font, preferring the user's choice; fall back otherwise.
4. **Warn** in the properties panel if coverage is missing — with a one-click fix. Glyphs
   are never silently replaced by tofu boxes.
5. **Load** dynamically via the Google Fonts CSS2 API and **await** `document.fonts.load`
   before first paint and before export, so rasterised output is always correctly shaped.

Custom fonts can be registered at runtime (`registerCustomFont`).

## 3. Language-independent content model

Invitation text is **not** stored in language-specific columns. The `DesignDocument` holds:

- `details` — structured, language-independent data (names, dates, times, venue).
- `languages[]` — one `LanguageLayer` per locale: `{ locale, languageName, direction,
  content: {token: string}, verified }`.
- `primaryLocale` — the language currently shown.

Text elements reference tokens (`{{invocation}}`, `{{groom_name}}`). Resolution
(`src/lib/resolve.ts`) fills a token from the active language layer first, then shared
details. Switching the primary language re-resolves tokens and reassigns a covering font
per element — **names/dates stay constant, wording and script adapt**. Manually edited
text is preserved.

Default localized wording for new language layers comes from
`GET /api/message-defaults/{locale}` (full translations for en, kn, hi, te, ta, ml, mr,
bn, gu, ar, ur; graceful English fallback for others — never empty, never tofu).

## 4. Complex scripts & RTL

- **Complex scripts** (Kannada conjuncts, Devanagari matras, Tamil, Arabic shaping) are
  shaped by the browser's text engine on the live canvas and preserved on export.
- **RTL** (Arabic, Urdu, Hebrew, Persian, Sindhi, Kashmiri) sets `direction: 'rtl'` on the
  Fabric `Textbox` and in content editors. Direction is auto-detected from the script and
  overridable per element.
- **Mixed-direction** content works: English names inside an Arabic invitation keep their
  own font/direction because detection and font selection are per element.

## 5. Translation modes

- **Mode A — Manual:** enter wording per language in the right-panel content editor.
- **Mode B — AI-assisted (optional):** `POST /api/ai/wording`; AI results are marked
  `verified: false` ("unverified") until approved. Works offline from the built-in library.
- **Mode C — Original:** create directly in the preferred language from the wizard.

Names, dates, venues, and relationships are preserved across languages because they live in
structured `details`, not in translated copy.

## 6. Verification

Rendering was visually verified (Playwright screenshots in `frontend/e2e/visual-check.spec.ts`):

| Language | Script | Status |
|----------|--------|--------|
| English | Latin | ✅ rendered + exported |
| Kannada | Kannada (conjuncts, vowel signs) | ✅ rendered + exported |
| Arabic  | Arabic (RTL, contextual shaping) | ✅ rendered RTL |

Script detection is unit-tested across 16 scripts (`src/lib/scripts.test.ts`). Export
preserves the on-canvas text because it rasterises the shaped glyphs — see
[EXPORT_SPECIFICATION](EXPORT_SPECIFICATION.md).

## Kannada specifics

- Unicode Kannada throughout — **no transliteration**, no premature conversion to images.
- Fonts: Noto Serif Kannada / Noto Sans Kannada.
- Default Kannada wording (invocation, invite line, invitation message, RSVP label, etc.)
  provided in `message_data.py` and fully editable.
- Conjuncts, vowel signs, and line wrapping render correctly via Fabric `Textbox`
  auto-wrapping; verified visually and in exports.
