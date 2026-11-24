import { describe, it, expect } from "vitest";
import { detectScript, directionForScript } from "./scripts";

describe("detectScript", () => {
  const cases: [string, string][] = [
    ["Arjun Kumar", "Latin"],
    ["ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ", "Kannada"],
    ["श्री गणेशाय नमः", "Devanagari"],
    ["శ్రీ గణేశాయ నమః", "Telugu"],
    ["ஸ்ரீ கணேசாய நமஹ", "Tamil"],
    ["ശ്രീ ഗണേശായ നമഃ", "Malayalam"],
    ["শ্রী গণেশায় নমঃ", "Bengali"],
    ["શ્રી ગણેશાય નમઃ", "Gujarati"],
    ["ਪੰਜਾਬੀ", "Gurmukhi"],
    ["العربية", "Arabic"],
    ["עברית", "Hebrew"],
    ["日本語テスト", "Japanese"],
    ["한국어", "Korean"],
    ["简体中文", "HanSC"],
    ["ไทย", "Thai"],
    ["Ελληνικά", "Greek"],
    ["Русский", "Cyrillic"],
  ];
  it.each(cases)("detects %s", (text, script) => {
    expect(detectScript(text)).toBe(script);
  });

  it("a complex script dominates even with Latin digits/spaces", () => {
    expect(detectScript("ಮದುವೆ 2026")).toBe("Kannada");
  });
});

describe("directionForScript", () => {
  it("flags RTL scripts", () => {
    expect(directionForScript("Arabic")).toBe("rtl");
    expect(directionForScript("Hebrew")).toBe("rtl");
    expect(directionForScript("Nastaliq")).toBe("rtl");
    expect(directionForScript("Latin")).toBe("ltr");
    expect(directionForScript("Kannada")).toBe("ltr");
  });
});
