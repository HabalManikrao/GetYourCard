import { describe, it, expect } from "vitest";
import { substitute, resolveText, fontsInDoc } from "./resolve";
import type { DesignDocument, TextElement } from "../types";

function doc(partial: Partial<DesignDocument> = {}): DesignDocument {
  return {
    version: 1,
    templateId: null,
    width: 1080,
    height: 1920,
    palette: {},
    fonts: { en: "Cormorant Garamond", kn: "Noto Serif Kannada" },
    pages: [{ name: "Front", width: 1080, height: 1920, background: { type: "color", color: "#fff" }, elements: [] }],
    activePage: 0,
    primaryLocale: "en-IN",
    languages: [
      { locale: "en-IN", languageName: "English", direction: "ltr", content: { invocation: "Shubha Muhurta", invite_line: "invites you" } },
      { locale: "kn-IN", languageName: "Kannada", direction: "ltr", content: { invocation: "ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ", invite_line: "ಆಹ್ವಾನಿಸುತ್ತೇವೆ" } },
    ],
    details: { groom_name: "Arjun", bride_name: "Meera", wedding_date: "12 Feb 2026" },
    ...partial,
  };
}

describe("substitute", () => {
  it("fills tokens from the language layer, then details", () => {
    const d = doc();
    expect(substitute("{{invocation}} — {{groom_name}}", d, "en-IN")).toBe("Shubha Muhurta — Arjun");
  });

  it("uses the requested locale's content (multilingual switch)", () => {
    const d = doc();
    expect(substitute("{{invocation}}", d, "kn-IN")).toBe("ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ");
  });

  it("names/dates come from shared details regardless of locale", () => {
    const d = doc();
    expect(substitute("{{bride_name}} {{wedding_date}}", d, "kn-IN")).toBe("Meera 12 Feb 2026");
  });
});

describe("resolveText", () => {
  const base: TextElement = {
    id: "t1", type: "text", x: 0, y: 0, width: 400, rotation: 0, opacity: 1, locked: false,
    text: "{{venue}}", fontFamily: "X", fontSize: 30, fill: "#000", fontWeight: "normal",
    fontStyle: "normal", textAlign: "center", lineHeight: 1.2, charSpacing: 0,
  };

  it("shows a readable placeholder when a binding is empty", () => {
    expect(resolveText(base, doc())).toBe("{venue}");
  });

  it("preserves manually edited literal text", () => {
    expect(resolveText({ ...base, text: "Grand Palace Hall" }, doc())).toBe("Grand Palace Hall");
  });
});

describe("fontsInDoc", () => {
  it("collects document + element fonts", () => {
    const d = doc();
    d.pages[0].elements.push({ ...({} as TextElement), type: "text", fontFamily: "Noto Sans Arabic" } as TextElement);
    const fonts = fontsInDoc(d);
    expect(fonts).toContain("Cormorant Garamond");
    expect(fonts).toContain("Noto Serif Kannada");
    expect(fonts).toContain("Noto Sans Arabic");
  });
});
