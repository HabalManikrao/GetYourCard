import { test, expect } from "@playwright/test";
import fs from "node:fs";

// Verifies real export output: PNG and PDF downloads are produced, non-trivial
// in size, and have correct file signatures (magic bytes).

async function createProject(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("link", { name: /Create New Invitation/i }).click();
  await page.getByPlaceholder("e.g. Arjun Kumar").fill("Arjun Kumar");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByPlaceholder("e.g. Meera Rao").fill("Meera Rao");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByPlaceholder("12 Feb 2026").fill("12 Feb 2026");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByPlaceholder(/Search 40\+ languages/i).fill("Kannada");
  await page.getByRole("button", { name: /Kannada ಕನ್ನಡ/ }).click();
  await page.getByRole("button", { name: /Create invitation/i }).click();
  await expect(page).toHaveURL(/\/editor\//, { timeout: 20000 });
  await page.waitForTimeout(3500);
}

test("export PNG produces a valid image", async ({ page }) => {
  await createProject(page);
  await page.getByRole("button", { name: /Download/i }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    page.getByText("PNG — High resolution").click(),
  ]);
  const path = await download.path();
  const buf = fs.readFileSync(path);
  expect(buf.length).toBeGreaterThan(20_000); // real artwork, not empty
  // PNG signature
  expect(buf[0]).toBe(0x89);
  expect(buf.subarray(1, 4).toString("latin1")).toBe("PNG");
  expect(download.suggestedFilename()).toMatch(/\.png$/);
  // Dimensions from the IHDR chunk — "High" tier = 2× the 1080×1920 design.
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  expect(width).toBe(2160);
  expect(height).toBe(3840);
});

test("export digital PDF embeds selectable Latin text (F-04)", async ({ page }) => {
  await createProject(page);
  await page.getByRole("button", { name: /Download/i }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    page.getByText("PDF — Digital").click(),
  ]);
  const path = await download.path();
  const buf = fs.readFileSync(path);
  expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  // The invisible, selectable Latin text layer must carry the actual names,
  // so the PDF is searchable (would fail if the layer were missing — F-04 regression).
  const body = buf.toString("latin1");
  expect(body).toContain("Arjun Kumar");
  expect(body).toContain("Meera Rao");
});

test("export PDF produces a valid multi-page document", async ({ page }) => {
  await createProject(page);
  await page.getByRole("button", { name: /Download/i }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    page.getByText("PDF — A5 Print + bleed").click(),
  ]);
  const path = await download.path();
  const buf = fs.readFileSync(path);
  expect(buf.length).toBeGreaterThan(20_000);
  expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
});
