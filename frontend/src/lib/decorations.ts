// Original SVG decoration registry. Each motif is a set of path `d` strings in
// a normalized 100x100 viewBox, built as recolorable fabric.Path groups.
// Licensing: all paths authored originally for this project (see ASSET_LICENSE).

export interface DecoPath {
  d: string;
  opacity?: number;
  fillRule?: "nonzero" | "evenodd";
}

export interface Decoration {
  label: string;
  paths: DecoPath[];
}

const M = (d: string, opacity?: number, fillRule?: "nonzero" | "evenodd"): DecoPath => ({ d, opacity, fillRule });

export const DECORATIONS: Record<string, Decoration> = {
  ganesha: {
    label: "Lord Ganesha",
    paths: [
      // halo
      M("M50 8 a42 42 0 1 0 0.01 0 Z M50 16 a34 34 0 1 1 -0.01 0 Z", 0.25, "evenodd"),
      // head
      M("M50 24 c-16 0 -27 12 -27 27 c0 14 11 25 27 25 c16 0 27 -11 27 -25 c0 -15 -11 -27 -27 -27 Z", 0.9),
      // crown / mukut
      M("M34 26 l4 -12 l5 9 l7 -12 l7 12 l5 -9 l4 12 c-11 -5 -21 -5 -32 0 Z"),
      // trunk
      M("M50 52 c-4 0 -7 3 -7 8 c0 6 4 10 4 16 c0 5 -4 8 -9 8 c-4 0 -7 -3 -7 -7", 1),
      // ears
      M("M24 48 c-9 -2 -14 5 -13 12 c1 6 8 9 14 6 Z", 0.85),
      M("M76 48 c9 -2 14 5 13 12 c-1 6 -8 9 -14 6 Z", 0.85),
    ],
  },
  royal_crest: {
    label: "Royal Crest",
    paths: [
      M("M50 6 l10 18 l20 2 l-14 15 l4 20 l-20 -10 l-20 10 l4 -20 l-14 -15 l20 -2 Z"),
      M("M50 30 a14 14 0 1 0 0.01 0 Z M50 38 a6 6 0 1 1 -0.01 0 Z", 1, "evenodd"),
    ],
  },
  paisley: {
    label: "Paisley",
    paths: [
      M("M62 10 c22 6 30 34 14 52 c-12 13 -34 14 -44 2 c-8 -10 -4 -24 7 -28 c8 -3 16 2 16 10 c0 6 -5 9 -9 7 c7 6 18 1 18 -9 c0 -14 -14 -22 -27 -18 c-16 5 -22 25 -12 40", 0.95, "evenodd"),
      M("M55 70 a4 4 0 1 0 0.01 0 Z"),
    ],
  },
  kalash: {
    label: "Kalash (sacred pot)",
    paths: [
      // coconut + leaves
      M("M50 6 a8 8 0 1 0 0.01 0 Z"),
      M("M50 14 c-10 -4 -20 -2 -24 6 c10 -2 18 0 24 6 c6 -6 14 -8 24 -6 c-4 -8 -14 -10 -24 -6 Z", 0.9),
      // pot
      M("M30 30 c0 -6 40 -6 40 0 c6 4 8 14 8 24 c0 16 -11 26 -28 26 c-17 0 -28 -10 -28 -26 c0 -10 2 -20 8 -24 Z"),
      M("M28 30 l44 0 l-4 6 l-36 0 Z", 1),
    ],
  },
  mango_leaves: {
    label: "Mango Leaf Toran",
    paths: [
      M("M6 10 q6 30 10 44 q4 -14 10 -44 q-10 6 -20 0 Z"),
      M("M30 10 q6 30 10 44 q4 -14 10 -44 q-10 6 -20 0 Z"),
      M("M54 10 q6 30 10 44 q4 -14 10 -44 q-10 6 -20 0 Z"),
      M("M78 10 q6 30 10 44 q4 -14 10 -44 q-10 6 -20 0 Z"),
      M("M2 8 h96 v4 h-96 Z", 1),
    ],
  },
  lotus: {
    label: "Lotus",
    paths: [
      M("M50 84 c-20 0 -36 -8 -42 -18 c10 2 18 -2 24 -10 c-10 2 -18 -2 -22 -10 c10 4 20 2 26 -6 c-8 -2 -14 -8 -14 -16 c6 6 14 8 22 6 c-2 -8 0 -16 6 -22 c6 6 8 14 6 22 c8 2 16 0 22 -6 c0 8 -6 14 -14 16 c6 8 16 10 26 6 c-4 8 -12 12 -22 10 c6 8 14 12 24 10 c-6 10 -22 18 -42 18 Z"),
    ],
  },
  lotus_mandala: {
    label: "Lotus Mandala",
    paths: [
      M("M50 50 m-44 0 a44 44 0 1 0 88 0 a44 44 0 1 0 -88 0 M50 50 m-30 0 a30 30 0 1 1 60 0 a30 30 0 1 1 -60 0", 0.35, "evenodd"),
      M("M50 20 c6 10 6 20 0 30 c-6 -10 -6 -20 0 -30 Z M80 50 c-10 6 -20 6 -30 0 c10 -6 20 -6 30 0 Z M50 80 c-6 -10 -6 -20 0 -30 c6 10 6 20 0 30 Z M20 50 c10 -6 20 -6 30 0 c-10 6 -20 6 -30 0 Z"),
      M("M50 50 a8 8 0 1 0 0.01 0 Z"),
    ],
  },
  mandala: {
    label: "Mandala",
    paths: [
      M("M50 50 m-44 0 a44 44 0 1 0 88 0 a44 44 0 1 0 -88 0 M50 50 m-34 0 a34 34 0 1 1 68 0 a34 34 0 1 1 -68 0", 0.4, "evenodd"),
      M("M50 50 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0 M50 50 m-14 0 a14 14 0 1 1 28 0 a14 14 0 1 1 -28 0", 0.6, "evenodd"),
      M("M50 6 v14 M94 50 h-14 M50 94 v-14 M6 50 h14 M19 19 l10 10 M81 19 l-10 10 M81 81 l-10 -10 M19 81 l10 -10", 1),
      M("M50 44 a6 6 0 1 0 0.01 0 Z"),
    ],
  },
  peacock: {
    label: "Peacock",
    paths: [
      M("M46 82 c-2 -18 2 -34 14 -46 c8 -8 18 -12 28 -12 c-6 6 -8 12 -8 20 c0 4 -2 6 -6 6 c4 4 2 12 -4 14 c-10 4 -16 14 -18 24 Z"),
      M("M60 36 a4 4 0 1 0 0.01 0 Z", 1),
      // crest feathers
      M("M60 20 q2 -10 8 -14 M64 20 q4 -10 12 -12 M66 24 q8 -8 16 -8", 1),
      // tail fan
      M("M30 84 q-12 -2 -18 -12 q10 2 16 -4 q-10 0 -16 -8 q10 4 18 -2 q-8 -4 -10 -12 q8 6 16 4", 0.8),
    ],
  },
  peacock_feather: {
    label: "Peacock Feather",
    paths: [
      M("M50 6 c-8 20 -8 50 0 82 c8 -32 8 -62 0 -82 Z", 0.5),
      M("M50 24 c-14 0 -22 10 -22 22 c0 12 10 22 22 22 c12 0 22 -10 22 -22 c0 -12 -8 -22 -22 -22 Z", 0.9),
      M("M50 36 a10 10 0 1 0 0.01 0 Z"),
      M("M50 40 a5 5 0 1 0 0.01 0 Z", 1),
    ],
  },
  diya: {
    label: "Diya (lamp)",
    paths: [
      M("M50 22 c-3 0 -5 6 -5 12 c0 3 2 5 5 5 c3 0 5 -2 5 -5 c0 -6 -2 -12 -5 -12 Z", 0.9),
      M("M16 56 c0 -6 68 -6 68 0 c0 10 -16 16 -34 16 c-18 0 -34 -6 -34 -16 Z"),
      M("M12 54 q38 10 76 0 l-4 6 q-34 8 -68 0 Z", 1),
    ],
  },
  bells: {
    label: "Temple Bells",
    paths: [
      M("M50 10 v8 M50 18 a3 3 0 1 0 0.01 0 Z", 1),
      M("M50 24 c-12 0 -20 10 -20 26 c0 6 -2 10 -6 14 l52 0 c-4 -4 -6 -8 -6 -14 c0 -16 -8 -26 -20 -26 Z"),
      M("M50 66 a5 5 0 1 0 0.01 0 Z", 1),
    ],
  },
  garland: {
    label: "Floral Garland",
    paths: [
      M("M2 14 q48 28 96 0 l0 4 q-48 28 -96 0 Z", 0.8),
      M("M14 20 a5 5 0 1 0 0.01 0 Z M34 26 a5 5 0 1 0 0.01 0 Z M50 27 a5 5 0 1 0 0.01 0 Z M66 26 a5 5 0 1 0 0.01 0 Z M86 20 a5 5 0 1 0 0.01 0 Z"),
    ],
  },
  temple_arch: {
    label: "Temple Arch (Gopuram)",
    paths: [
      M("M14 90 l0 -34 q0 -42 36 -42 q36 0 36 42 l0 34 l-8 0 l0 -34 q0 -34 -28 -34 q-28 0 -28 34 l0 34 Z", 1, "evenodd"),
      M("M30 90 l0 -24 l8 -8 l12 0 l0 32 Z M70 90 l0 -24 l-8 -8 l-12 0 l0 32 Z", 0.8),
      M("M50 6 l6 10 l-12 0 Z", 1),
    ],
  },
  temple_pillar: {
    label: "Temple Pillar",
    paths: [
      M("M34 6 l32 0 l-4 8 l-24 0 Z"),
      M("M38 14 l24 0 l-2 70 l-20 0 Z", 0.95),
      M("M34 84 l32 0 l0 10 l-32 0 Z"),
      M("M40 24 l20 0 M40 40 l20 0 M40 56 l20 0 M40 72 l20 0", 0.5),
    ],
  },
  gold_ornament: {
    label: "Gold Ornament",
    paths: [
      M("M4 50 q20 -16 46 0 q26 -16 46 0 q-20 16 -46 0 q-26 16 -46 0 Z", 0.9, "evenodd"),
      M("M50 50 a6 6 0 1 0 0.01 0 Z"),
      M("M18 50 a4 4 0 1 0 0.01 0 Z M82 50 a4 4 0 1 0 0.01 0 Z", 1),
    ],
  },
  floral_spray: {
    label: "Floral Spray",
    paths: [
      M("M14 86 q10 -40 40 -62 q-6 14 -2 24 q8 -10 20 -10 q-10 8 -10 18 q10 -4 18 2 q-14 2 -22 12 q-18 20 -44 16 Z", 0.95),
      M("M40 40 a5 5 0 1 0 0.01 0 Z M58 30 a4 4 0 1 0 0.01 0 Z", 1),
    ],
  },
  rose: {
    label: "Rose",
    paths: [
      M("M50 24 c10 0 18 8 18 18 c0 12 -8 24 -18 30 c-10 -6 -18 -18 -18 -30 c0 -10 8 -18 18 -18 Z"),
      M("M50 34 c6 2 8 8 6 14 c-4 4 -8 4 -12 0 c-2 -6 0 -12 6 -14 Z", 0.5),
      M("M50 72 l0 16 M50 80 q-10 -2 -14 -10 M50 82 q10 -2 14 -10", 1),
    ],
  },
  eucalyptus: {
    label: "Eucalyptus Sprig",
    paths: [
      M("M50 90 l0 -74", 1),
      M("M50 30 a7 5 0 1 0 0.01 0 Z M38 44 a7 5 0 1 0 0.01 0 Z M62 44 a7 5 0 1 0 0.01 0 Z M40 60 a7 5 0 1 0 0.01 0 Z M60 60 a7 5 0 1 0 0.01 0 Z M44 76 a7 5 0 1 0 0.01 0 Z M56 76 a7 5 0 1 0 0.01 0 Z", 0.85),
    ],
  },
  sprig: {
    label: "Leaf Sprig",
    paths: [
      M("M50 92 q0 -40 0 -78", 1),
      M("M50 40 q14 -6 20 -18 M50 54 q-14 -6 -20 -18 M50 68 q14 -4 18 -14 M50 80 q-12 -4 -16 -12", 1),
    ],
  },
  dot_motif: {
    label: "Dot Motif",
    paths: [
      M("M50 50 a4 4 0 1 0 0.01 0 Z M30 50 a3 3 0 1 0 0.01 0 Z M70 50 a3 3 0 1 0 0.01 0 Z M50 30 a3 3 0 1 0 0.01 0 Z M50 70 a3 3 0 1 0 0.01 0 Z"),
    ],
  },
  art_deco: {
    label: "Art Deco",
    paths: [
      M("M50 8 l30 30 l-30 30 l-30 -30 Z M50 20 l18 18 l-18 18 l-18 -18 Z", 0.9, "evenodd"),
      M("M20 74 l60 0 M24 80 l52 0 M30 86 l40 0", 1),
    ],
  },
  mysore_gandhabérunda: {
    label: "Gandaberunda Emblem",
    paths: [
      M("M50 20 a16 16 0 1 0 0.01 0 Z M50 28 a8 8 0 1 1 -0.01 0 Z", 0.4, "evenodd"),
      M("M50 36 c-6 6 -8 14 -6 22 l12 0 c2 -8 0 -16 -6 -22 Z"),
      M("M34 44 q-14 -8 -14 -22 q8 6 14 14 M66 44 q14 -8 14 -22 q-8 6 -14 14", 1),
      M("M38 70 l24 0 l-4 16 l-16 0 Z", 0.85),
    ],
  },
  vintage_frame: {
    label: "Vintage Frame Corner",
    paths: [
      M("M90 10 l-50 0 q-30 0 -30 30 l0 50", 1),
      M("M40 10 q-6 10 -16 16 q10 2 14 -8 Z M10 40 q10 -6 16 -16 q2 10 -8 14 Z", 1),
    ],
  },
};

export const DECORATION_KEYS = Object.keys(DECORATIONS);

export function getDecoration(key: string): Decoration {
  return DECORATIONS[key] || DECORATIONS.dot_motif;
}
