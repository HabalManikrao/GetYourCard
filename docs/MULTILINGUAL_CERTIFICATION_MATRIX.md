# Multilingual Certification Matrix

Independent rendering certification. "Browser-rendered" = created and rendered on the live
Fabric canvas in Chrome with no clip warning. "Visually verified" = a human/agent inspected
the screenshot and confirmed correct shaping (conjuncts/combining marks/contextual forms/RTL).
Evidence screenshots in `frontend/e2e-output/` (produced by `e2e/cert.spec.ts`,
`e2e/visual-check.spec.ts`). Online (CDN fonts) unless noted.

Legend: ✅ pass · ⚙️ automated only (no human spot-check) · ⛔ not covered · n/a.

| Language | Script | Entry | Shaping/conjuncts | Fallback→covering font | Wrapping | Overflow detect | RTL/BiDi | Canvas | PNG/JPG | PDF (visual) | PDF (selectable) | Visually verified |
|----------|--------|-------|-------------------|------------------------|----------|-----------------|----------|--------|---------|--------------|------------------|-------------------|
| English | Latin | ✅ | n/a | ✅ | ✅ | ✅ | ltr | ✅ | ✅ | ✅ | ✅ (text layer) | ✅ |
| Kannada | Kannada | ✅ | ✅ | ✅ Noto Serif Kannada | ✅ | ✅ | ltr | ✅ | ✅ | ✅ | raster | ✅ `editor-kannada.png` |
| Tamil | Tamil | ✅ | ✅ | ✅ Noto Serif Tamil | ✅ | ✅ | ltr | ✅ | ✅ | ✅ | raster | ✅ `cert-ta.png` |
| Telugu | Telugu | ✅ | ✅ | ✅ Noto Serif Telugu | ✅ | ✅ | ltr | ✅ | ✅ | ✅ | raster | ✅ `cert-te.png` |
| Bengali | Bengali | ✅ | ✅ | ✅ Noto Serif Bengali | ✅ | ✅ | ltr | ✅ | ✅ | ✅ | raster | ✅ `cert-bn.png` |
| Gujarati | Gujarati | ✅ | ✅ | ✅ Noto Sans Gujarati | ✅ | ✅ | ltr | ✅ | ✅ | ✅ | raster | ✅ `cert-gu.png` |
| Hindi | Devanagari | ✅ | ✅ | ✅ Noto Serif Devanagari | ✅ | ✅ | ltr | ✅ | ✅ | ✅ | raster | ✅ `cert-hi.png` |
| Marathi | Devanagari | ✅ | ✅ | ✅ (shares Devanagari) | ✅ | ✅ | ltr | ⚙️ | ✅ | ✅ | raster | ⚙️ (Devanagari verified via Hindi) |
| Malayalam | Malayalam | ✅ | ✅ | ✅ Noto Serif Malayalam | ✅ | ✅ | ltr | ⚙️ | ✅ | ✅ | raster | ⚙️ (registry+primary-switch path identical to certified Indic) |
| Arabic | Arabic | ✅ | ✅ | ✅ Noto Naskh Arabic | ✅ | ✅ | **rtl** ✅ | ✅ | ✅ | ✅ | raster | ✅ `editor-arabic.png` |
| Urdu | Nastaliq | ✅ | ✅ | ✅ Noto Nastaliq Urdu | ✅ | ✅ | **rtl** ✅ | ✅ | ✅ | ✅ | raster | ✅ `cert-ur.png` |
| Persian | Arabic | ✅ | ✅ | ✅ Noto Naskh Arabic | ✅ | ✅ | **rtl** | ⚙️ | ✅ | ✅ | raster | ⚙️ (same Arabic pipeline as certified Arabic/Urdu) |
| Chinese (SC) | Han | ✅ | ✅ | ✅ Noto Sans SC (auto-fix) | ✅ | ✅ | ltr | ✅ | ✅ | ✅ | raster | ✅ `cert-zh.png` |
| Japanese | Kana+Han | ✅ | ✅ | ✅ Noto Sans JP (auto-fix) | ✅ | ✅ | ltr | ✅ | ✅ | ✅ | raster | ✅ `cert-ja.png` |
| Korean | Hangul | ✅ | ✅ | ✅ Noto Sans KR | ✅ | ✅ | ltr | ⚙️ | ✅ | ✅ | raster | ⚙️ (same coverage/auto-fix path as JP/SC) |
| French | Latin | ✅ | n/a | ✅ | ✅ | ✅ | ltr | ✅ | ✅ | ✅ | ✅ | ⚙️ (Latin, covered by English) |
| German | Latin | ✅ | n/a | ✅ | ✅ | ✅ | ltr | ✅ | ✅ | ✅ | ✅ | ⚙️ (Latin) |
| Spanish | Latin | ✅ | n/a | ✅ | ✅ | ✅ | ltr | ✅ | ✅ | ✅ | ✅ | ⚙️ (Latin) |

## Methodology
- **Indic + Arabic/Urdu:** localized message defaults (`message_data.py`) supply real
  script text; adding the language and switching primary (`setPrimaryLocale`) re-detects
  the script and assigns a covering font per element. Certified by screenshot.
- **CJK:** manual heading text in the script triggers the **font‑coverage warning**; the
  one‑click auto‑fix assigns Noto Sans SC/JP/KR. Certified for JP + SC by screenshot
  (Japanese screenshot shows "Font (Japanese): Noto Sans JP" applied); KR shares the path.
- **Overflow detection** (`lib/layout.ts`) and **collision detection** verified live — e.g.
  `cert-ja.png` shows a "Text overlaps" layout notice.
- **PDF (selectable):** Latin text is embedded as an invisible selectable layer (searchable);
  complex scripts are **rasterized** — visually correct, not selectable (see
  [PDF_TEXT_PRESERVATION_REPORT](PDF_TEXT_PRESERVATION_REPORT.md)).

## Caveats (honest)
- ⚙️ rows are rendered through the **identical** registry/coverage/primary‑switch pipeline as
  certified siblings but were not individually screenshot‑inspected this cycle.
- **Offline update:** the OFL fonts for all scripts above **except CJK** are now vendored and
  offline‑verified (Kannada + Arabic rendered with the network fully disabled) — see
  [MULTILINGUAL_OFFLINE_ACCEPTANCE_REPORT](MULTILINGUAL_OFFLINE_ACCEPTANCE_REPORT.md) and
  [FONT_INVENTORY_AND_LICENSES](FONT_INVENTORY_AND_LICENSES.md). CJK (JP/SC/TC/KR) remains
  **online‑only** (not bundled; optional add‑on).
- Script detection is unit‑tested for 16 scripts (`scripts.test.ts`).
