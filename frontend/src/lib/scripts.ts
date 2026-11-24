// Unicode script detection. Maps a string to a script key that matches the
// backend font/language registries, so the editor can pick a covering font.

interface Range {
  script: string;
  lo: number;
  hi: number;
}

// Ordered; CJK handled specially below.
const RANGES: Range[] = [
  { script: "Devanagari", lo: 0x0900, hi: 0x097f },
  { script: "Bengali", lo: 0x0980, hi: 0x09ff },
  { script: "Gurmukhi", lo: 0x0a00, hi: 0x0a7f },
  { script: "Gujarati", lo: 0x0a80, hi: 0x0aff },
  { script: "Odia", lo: 0x0b00, hi: 0x0b7f },
  { script: "Tamil", lo: 0x0b80, hi: 0x0bff },
  { script: "Telugu", lo: 0x0c00, hi: 0x0c7f },
  { script: "Kannada", lo: 0x0c80, hi: 0x0cff },
  { script: "Malayalam", lo: 0x0d00, hi: 0x0d7f },
  { script: "Thai", lo: 0x0e00, hi: 0x0e7f },
  { script: "Hebrew", lo: 0x0590, hi: 0x05ff },
  { script: "Arabic", lo: 0x0600, hi: 0x06ff },
  { script: "Arabic", lo: 0x0750, hi: 0x077f },
  { script: "Arabic", lo: 0xfb50, hi: 0xfdff }, // Arabic presentation forms (Urdu/Nastaliq)
  { script: "Arabic", lo: 0xfe70, hi: 0xfeff },
  { script: "Greek", lo: 0x0370, hi: 0x03ff },
  { script: "Cyrillic", lo: 0x0400, hi: 0x04ff },
  { script: "OlChiki", lo: 0x1c50, hi: 0x1c7f },
  { script: "MeeteiMayek", lo: 0xabc0, hi: 0xabff },
  { script: "Hiragana", lo: 0x3040, hi: 0x309f },
  { script: "Katakana", lo: 0x30a0, hi: 0x30ff },
  { script: "Hangul", lo: 0xac00, hi: 0xd7a3 },
  { script: "Han", lo: 0x4e00, hi: 0x9fff },
];

function scriptOf(cp: number): string | null {
  if (
    (cp >= 0x41 && cp <= 0x5a) ||
    (cp >= 0x61 && cp <= 0x7a) ||
    (cp >= 0xc0 && cp <= 0x24f) || // Latin-1 supplement + extended A/B
    (cp >= 0x1e00 && cp <= 0x1eff) // Latin extended additional (Vietnamese)
  ) {
    return "Latin";
  }
  for (const r of RANGES) {
    if (cp >= r.lo && cp <= r.hi) return r.script;
  }
  return null;
}

/** Dominant script of a string (ignores spaces/punctuation/digits). */
export function detectScript(text: string): string {
  const counts: Record<string, number> = {};
  let hiraKata = false;
  let hangul = false;
  let han = false;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    const s = scriptOf(cp);
    if (!s) continue;
    if (s === "Hiragana" || s === "Katakana") hiraKata = true;
    else if (s === "Hangul") hangul = true;
    else if (s === "Han") han = true;
    else counts[s] = (counts[s] || 0) + 1;
  }
  // CJK disambiguation (codepoints alone can't separate SC/TC; default SC).
  if (hiraKata) return "Japanese";
  if (hangul) return "Korean";
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length) {
    // A complex script dominates even when Latin digits/spaces are present.
    const top = entries[0][0];
    if (top !== "Latin") return top;
    if (han) return "HanSC";
    return "Latin";
  }
  if (han) return "HanSC";
  return "Latin";
}

export function directionForScript(script: string): "ltr" | "rtl" {
  return script === "Arabic" || script === "Nastaliq" || script === "Hebrew" ? "rtl" : "ltr";
}
