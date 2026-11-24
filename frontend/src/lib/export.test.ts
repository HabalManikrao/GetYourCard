import { describe, it, expect } from "vitest";
import { multiplierFor, safeFilename, dataURLToBlob } from "./export";

describe("multiplierFor", () => {
  it("scales print above screen resolution", () => {
    expect(multiplierFor("standard")).toBe(1);
    expect(multiplierFor("high")).toBeGreaterThan(1);
    expect(multiplierFor("print")).toBeGreaterThanOrEqual(multiplierFor("high"));
  });
});

describe("safeFilename", () => {
  it("produces a filesystem-safe slug", () => {
    expect(safeFilename("Arjun & Meera's Wedding!")).toBe("arjun-meera-s-wedding");
    expect(safeFilename("")).toBe("invitation");
    expect(safeFilename("ಮದುವೆ")).toBe("invitation"); // non-latin falls back
  });
});

describe("dataURLToBlob", () => {
  it("decodes a PNG data URL to a typed blob", () => {
    // 1x1 transparent PNG
    const url =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    const blob = dataURLToBlob(url);
    expect(blob.type).toBe("image/png");
    expect(blob.size).toBeGreaterThan(0);
  });
});
