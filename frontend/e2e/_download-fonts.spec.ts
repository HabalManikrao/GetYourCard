import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// One-off vendoring tool (not part of the regression suite; run explicitly).
// Downloads OFL woff2 subsets via the browser (CORS) and writes them + a manifest
// into public/fonts/. Each entry targets the subset covering the script's codepoint.
// Latin/Indic/Arabic/Hebrew scripts each fit a single subset file; CJK does NOT
// (Google splits it into 100+ slices) and is intentionally excluded here.

interface Spec {
  family: string;
  slug: string;
  weights: number[];
  cp: number; // representative codepoint of the target script
}

const SPECS: Spec[] = [
  { family: "Cormorant Garamond", slug: "cormorant-garamond", weights: [400, 700], cp: 0x41 },
  { family: "Playfair Display", slug: "playfair-display", weights: [400, 700], cp: 0x41 },
  { family: "Noto Serif", slug: "noto-serif", weights: [400, 700], cp: 0x41 },
  { family: "Noto Sans", slug: "noto-sans", weights: [400, 700], cp: 0x41 },
  { family: "Noto Serif Kannada", slug: "noto-serif-kannada", weights: [400, 700], cp: 0x0c95 },
  { family: "Noto Sans Kannada", slug: "noto-sans-kannada", weights: [400, 700], cp: 0x0c95 },
  { family: "Noto Serif Devanagari", slug: "noto-serif-devanagari", weights: [400, 700], cp: 0x0915 },
  { family: "Noto Sans Devanagari", slug: "noto-sans-devanagari", weights: [400, 700], cp: 0x0915 },
  { family: "Noto Serif Telugu", slug: "noto-serif-telugu", weights: [400, 700], cp: 0x0c15 },
  { family: "Noto Serif Tamil", slug: "noto-serif-tamil", weights: [400, 700], cp: 0x0b95 },
  { family: "Noto Serif Malayalam", slug: "noto-serif-malayalam", weights: [400, 700], cp: 0x0d15 },
  { family: "Noto Serif Bengali", slug: "noto-serif-bengali", weights: [400, 700], cp: 0x0995 },
  { family: "Noto Sans Gujarati", slug: "noto-sans-gujarati", weights: [400, 700], cp: 0x0a95 },
  { family: "Noto Sans Gurmukhi", slug: "noto-sans-gurmukhi", weights: [400, 700], cp: 0x0a15 },
  { family: "Noto Sans Oriya", slug: "noto-sans-oriya", weights: [400, 700], cp: 0x0b15 },
  { family: "Noto Naskh Arabic", slug: "noto-naskh-arabic", weights: [400, 700], cp: 0x0628 },
  { family: "Noto Sans Arabic", slug: "noto-sans-arabic", weights: [400, 700], cp: 0x0628 },
  { family: "Noto Nastaliq Urdu", slug: "noto-nastaliq-urdu", weights: [400, 700], cp: 0x0628 },
  { family: "Noto Serif Hebrew", slug: "noto-serif-hebrew", weights: [400, 700], cp: 0x05d0 },
];

test("download OFL font subsets via browser", async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto("/");
  const dir = path.resolve("public/fonts");
  fs.mkdirSync(dir, { recursive: true });
  const manifest: Record<string, Record<string, string>> = {};

  for (const s of SPECS) {
    for (const w of s.weights) {
      const res = await page.evaluate(
        async ({ family, weight, cp }) => {
          const fam = family.replace(/ /g, "+");
          const css = await (
            await fetch(`https://fonts.googleapis.com/css2?family=${fam}:wght@${weight}&display=swap`)
          ).text();
          // Split into @font-face blocks; pick the one whose unicode-range covers cp.
          const blocks = css.split("@font-face").slice(1);
          const inRange = (range: string, c: number) =>
            range.split(",").some((tok) => {
              const t = tok.trim().replace(/U\+/i, "");
              const [a, b] = t.split("-");
              const lo = parseInt(a, 16);
              const hi = b ? parseInt(b, 16) : lo;
              return !isNaN(lo) && c >= lo && c <= hi;
            });
          let chosen: string | null = null;
          for (const blk of blocks) {
            const url = blk.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
            const ur = blk.match(/unicode-range:\s*([^;]+);/i)?.[1];
            if (!url) continue;
            if (!ur || inRange(ur, cp)) {
              chosen = url;
              if (ur && inRange(ur, cp)) break; // exact script match wins
            }
          }
          if (!chosen) return { ok: false as const };
          const buf = new Uint8Array(await (await fetch(chosen)).arrayBuffer());
          let bin = "";
          for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
          return { ok: true as const, url: chosen, b64: btoa(bin) };
        },
        { family: s.family, weight: w, cp: s.cp },
      );
      expect(res.ok, `fetch ${s.family} ${w}`).toBeTruthy();
      if (!res.ok) continue;
      const file = `${s.slug}-${w}.woff2`;
      fs.writeFileSync(path.join(dir, file), Buffer.from(res.b64, "base64"));
      manifest[s.family] = manifest[s.family] || {};
      manifest[s.family][String(w)] = file;
      console.log(`SAVED ${file} (${Buffer.from(res.b64, "base64").length} bytes)`);
    }
  }

  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`MANIFEST families=${Object.keys(manifest).length}`);
});
