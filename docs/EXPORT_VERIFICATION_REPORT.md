# Export Verification Report (Phase G)

> **POST-REMEDIATION UPDATE.** F‑01 (clipping), F‑04 (PDF text), F‑05 (A4/A5 crop) are fixed:
> - Invite‑line text now wraps and is fully visible in PNG and PDF (font‑cache clear +
>   `initDimensions()` re‑wrap). Regression: `e2e/layout.spec.ts`, `e2e/export.spec.ts`.
> - Digital PDF now carries an **invisible, selectable Latin text layer** — PyMuPDF extracts
>   332 chars incl. "Arjun Kumar"/"Meera Rao"/"weds". Complex scripts remain rasterized
>   (visually correct, not selectable) — documented limitation.
> - A5/A4 now use **contain‑fit** with a background‑matched letterbox — no cropping.
> The original audit findings below are retained for history.

---


**Method:** inspected real artifacts in `backend/storage/exports/`, decoded PNG headers with
Pillow, parsed PDF structure and rendered pages to images with PyMuPDF (audit-only tool),
and visually compared against the canvas.

## Artifacts examined
- Latest PNG: `2160 × 3840`, mode RGBA (= 2× multiplier of the 1080×1920 design → "high").
- Latest PDF: 2 pages, A5.

## PNG verification
| Check | Result |
|-------|--------|
| File exists | ✅ |
| PNG signature `89 50 4E 47` | ✅ (export E2E) |
| Dimensions | ✅ 2160×3840 (high); print tier would be ~3024×5376 |
| No selection handles | ✅ (`toDataURL` discards active object) |
| **Text not clipped** | ❌ **FAIL** — invite line clipped at right edge |

## PDF verification
| Check | Result | Evidence |
|-------|--------|----------|
| File exists / `%PDF-` | ✅ | export E2E |
| Page count | ✅ 2 (front + inside) | `pymupdf doc.page_count==2` |
| Rendered pages legible | ✅ (artwork renders) | `pdf_page0` render |
| **Embedded fonts / selectable text** | ❌ | **0 extractable text chars/page**; artwork is image XObjects (2/page); 14 `/Font` entries are jsPDF base-14, **unused** |
| **Text not clipped** | ❌ **FAIL** | invite line clipped on rendered page 0 |
| A5 fit | ⚠️ | 9:16 design **cover-fit** into A5 → top/bottom cropped |

## F-01 (P1) — Text clipping defect
The invite-line element renders as a single unwrapped line that overflows its box and is
**clipped at the right edge** in **both** the PNG and the A5 PDF:

> `request the honour of your presence at the wedding cerem⃓` (cut off)

- Present in the full-resolution digital PNG (no page-fit involved) → **not** an A5-only
  issue; it is a real render/measurement defect in the export pass.
- **Likely root cause:** web-font load race during the offscreen export re-render
  (`DesignCanvas.renderPageDataURL` → `render`): the `Textbox` measures with fallback-font
  metrics (narrower) and keeps the line unwrapped, then paints with the wider real font.
  The invite-line element width (840) assumes wrapping that does not occur.
- **Impact:** important invitation text is **silently truncated** in exported files —
  directly violates the acceptance criterion "No important text is silently truncated" and
  the export guarantee "downloads match the canvas preview".
- The export E2E did **not** catch this because it only asserts magic bytes + file size.

## F-04 (P1) — PDF is rasterized (no font embedding)
By design, `export.ts` embeds the canvas raster via `jsPDF.addImage`. Consequence: PDFs
contain **no embedded invitation fonts and no selectable/searchable text**. This guarantees
visual fidelity and complex-script/RTL correctness, but **fails** Module E's "verify font
embedding and text rendering in exported PDFs".

## F-05 (P2) — A5/A4 cover-fit crop
`buildPDF` fits the 9:16 design to A5/A4 by filling the page (cover), cropping top/bottom.
Recommend contain-fit (letterbox) or template page sizes matching the target paper aspect.

## Verified-good aspects
- Multi-page PDF ordering correct (front then inside).
- No editor chrome/handles in output.
- High-resolution raster (2×/2.8× tiers).
- Complex-script & RTL glyphs are preserved as pixels (shaped before rasterization).

**Status: PARTIALLY IMPLEMENTED** — export produces valid files and preserves scripts
visually, but has a **P1 clipping defect**, lacks font embedding/selectable text, and
cover-crops print pages.
