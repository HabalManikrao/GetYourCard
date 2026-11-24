# Multilingual Engine Deep Audit (Phase C)

> **POST-REMEDIATION UPDATE.** Added Unicode **NFC normalization** (`resolve.substitute`), a
> manifest‑driven **self‑hosted font loader** for offline (`fontLoader.loadLocalFonts`;
> binaries pending — F‑03), and wider script reach via universal occasion templates. The same
> engine now powers every occasion. Breadth beyond en/kn/ar is still not fully visually
> verified (F‑08, documented).

---


## Is it a universal architecture (not hardcoded to kn/en/ar)?

**Yes, architecturally.** Evidence:
- Languages are data: `backend/app/language_data.py` defines 44 locales; served at
  `GET /api/languages`. Adding a language = appending an entry (+ a covering font). The
  editor reads the registry (`frontend/src/store/registry.ts`) — **no editor source change
  is required** to add a language.
- Scripts are detected at runtime (`lib/scripts.ts`), fonts chosen by coverage
  (`registry.coveringFont`), direction set per element. No `if (locale === 'kn')` branching
  in the editor.

**Verified by test:** `test_api.test_languages_registry` asserts ≥40 locales incl.
`kn-IN, en-IN, ar-SA, ja-JP, ta-IN` and RTL flag on Arabic.

## Capability checklist

| # | Capability | Status | Evidence |
|---|------------|--------|----------|
| 1 | Dynamic language registry | ✅ | `language_data.py`, `/api/languages` |
| 2 | BCP-47 locales | ✅ | `kn-IN`, `zh-CN`, … |
| 3 | Language registration (config) | ✅ (data) / ⚠️ no runtime "add custom language" UI | registry is data-driven; UI adds from registry only |
| 4 | Language removal | ✅ | `editor.removeLanguageLayer`, LanguageBar ✕ |
| 5 | Multiple languages per project | ✅ | `DesignDocument.languages[]`; visual (en+kn+ar) |
| 6 | Dynamic language selection | ✅ | `LanguagePicker`, `setPrimaryLocale` |
| 7 | Per-element language assignment | ⚠️ partial | auto-assigned by detected script on switch; no explicit per-element locale picker in UI |
| 8 | Unicode preservation | ✅ | raw Unicode in design JSON; resolve unit tests |
| 9 | Unicode normalization | ❌ | no NFC/NFD applied anywhere |
| 10 | Script detection | ✅ | `scripts.test.ts` covers 16 scripts |
| 11 | Font coverage validation | ✅ | `registry.fontCovers`, warning in `RightPanel` |
| 12 | Font fallback chains | ✅ | `FALLBACK_SANS`, `coveringFont` |
| 13 | Custom font upload | ❌ (unreachable) | `registerCustomFont` exists but no UI calls it |
| 14 | Font metadata | ✅ | `font_data.py` (scripts, weights, styles, source, license) |
| 15 | Font licensing | ✅ | OFL recorded; `ASSET_LICENSE.md` |
| 16 | Complex-script shaping | ⚠️ 1 verified | Kannada verified (conjuncts/vowel signs) |
| 17 | Mixed-language rendering | ✅ visual | Latin names + Kannada/Arabic body in one card |
| 18 | RTL support | ✅ | Arabic rendered RTL (`editor-arabic.png`) |
| 19 | Language-specific line breaking | ❌ | only generic word-wrap (no CJK/Thai rules) |
| 20 | Dynamic text measurement | ⚠️ | Fabric internal only; not used for layout decisions |
| 21 | Language-specific layout adaptation | ❌ | no reflow/overflow handling (see Phase F) |
| 22 | Translation management | ⚠️ | manual per-language editor (Mode A); Mode B API exists |
| 23 | Translation approval | ⚠️ | `verified` flag + "unverified" tag; no workflow |
| 24 | Project language persistence | ✅ | layers saved in design JSON; flows:TC015 |

## Per-script verification matrix

"Arch" = supported by architecture · "Font" = covering font in registry · "Shape" = shaping
verified on canvas · "Canvas/PNG/PDF" = rendering verified in that output.

| Script | Arch | Font | Shape | Canvas | PNG | PDF | Notes |
|--------|------|------|-------|--------|-----|-----|-------|
| Latin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | English verified end-to-end |
| Kannada | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | verified (`editor-kannada.png`) |
| Arabic | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | canvas RTL verified; export not separately captured |
| Devanagari (Hindi/Marathi/…) | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | localized defaults exist; **not visually verified** |
| Telugu | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | defaults exist; not verified |
| Tamil | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | defaults exist; not verified |
| Malayalam | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | defaults exist; not verified |
| Bengali | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | defaults exist; not verified |
| Gujarati | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | defaults exist; not verified |
| Gurmukhi | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | not verified |
| Odia | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | not verified |
| Persian | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | RTL; not verified; **English fallback content** |
| Hebrew | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | RTL; not verified; English fallback content |
| Chinese | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | not verified; English fallback content |
| Japanese | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | not verified; English fallback content |
| Korean | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | not verified; English fallback content |

**Key limitation:** localized default wording (`message_data.py`) exists only for
**en, kn, hi, te, ta, ml, mr, bn, gu, ar, ur**. All other locales fall back to **English
content** rendered in that locale's font — so "switch to Japanese" shows English words, not
Japanese. Full-language support for those requires manual translation (Mode A) or AI (Mode B).

## Conclusion
The architecture is genuinely universal and extensible. **Breadth is unproven**: only 3
scripts are visually verified, and 33 locales ship with English fallback content. Dynamic
layout adaptation and Unicode normalization are missing. Status: **PARTIALLY IMPLEMENTED**
with a strong foundation.
