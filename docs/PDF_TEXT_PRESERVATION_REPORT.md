# PDF Text Preservation Report

## Objective
Preserve selectable/searchable text in exported PDFs **without sacrificing visual
correctness** — especially for complex scripts (Kannada, Arabic, CJK).

## Current pipeline (`frontend/src/lib/export.ts`)
Each design page is rasterized from the live Fabric canvas (glyphs already shaped by the
browser) and embedded as a high‑resolution image, guaranteeing **pixel‑perfect visual
fidelity for every script and RTL**. For **digital** PDFs, an **invisible, selectable Latin
text layer** is drawn over the raster using jsPDF's base‑14 font with
`renderingMode: "invisible"`, so the PDF is searchable/copyable for Latin content.

### Verified behaviour
| Property | Result | Evidence |
|----------|--------|----------|
| Visual correctness (all scripts, RTL) | ✅ | PNG/PDF renders; Kannada/Arabic/CJK certified |
| Selectable Latin text | ✅ | PyMuPDF extracts 332 chars incl. "Arjun Kumar"/"Meera Rao"/"weds"; `export.spec.ts` asserts names in bytes |
| Selectable complex‑script text | ❌ by design | extraction returns the Latin layer only |
| Page dimensions / multi‑page | ✅ | A5/A4 contain‑fit, digital px; 2‑page verified |
| Copy/paste (Latin) | ✅ | invisible text layer is real text |

## Evaluation of full complex‑script selectable text
| Approach | Font embedding | OpenType shaping | BiDi | Visual | Verdict |
|----------|----------------|------------------|------|--------|---------|
| jsPDF `.text()` + embedded Noto TTF | yes | **no** (jsPDF has no shaper) | no | **broken** for Indic/Arabic (unshaped, wrong joins) | ✗ sacrifices correctness |
| jsPDF invisible layer, complex scripts | needs embedded Unicode font | n/a (invisible) | n/a | correct (raster) | △ searchable but glyph‑order/÷cluster issues; base‑14 can't encode the codepoints without embedding |
| **Chromium `page.pdf()` from an HTML/SVG render** | yes | **yes** (browser shaper) | yes | correct | ✅ best, but requires a **second HTML renderer** of the design (parallel to the Fabric canvas) |
| SVG → PDF (svg2pdf) | partial | depends on text vs path | partial | varies | △ text‑as‑`<text>` reintroduces the shaping problem; text‑as‑path loses selectability |

### Recommendation
The only approach that yields **selectable + correctly‑shaped complex‑script** text is a
**Chromium print pipeline** (render the design as HTML with real `@font-face`, then
`page.pdf()`), because the browser performs HarfBuzz shaping and embeds subsetted fonts with
ToUnicode maps. This is a **significant architectural addition** (an HTML renderer mirroring
the canvas) and was **not** built this cycle to avoid risking the verified raster pipeline.

Until then, the current design is the correct trade‑off per the brief ("do not sacrifice
visual correctness"): **visual correctness for all scripts + selectable Latin text**, with
complex‑script selectability documented as a limitation.

## Status
- F‑04 **Closed‑with‑documented‑limitation**: Latin selectable ✅; complex‑script rasterized
  (visually correct, not selectable).
- Future work (tracked in `REMAINING_GAPS_AND_RISKS.md`): optional Chromium HTML→PDF export
  mode for fully selectable, shaped complex‑script PDFs.
