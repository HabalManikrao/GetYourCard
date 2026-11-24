import { test, expect } from "@playwright/test";
import fs from "node:fs";

// Offline resilience: with the Google Fonts CDN blocked, the app must still load,
// create a project, render the canvas, and export a valid PNG (no hard CDN
// dependency, no hang). Complex-script glyphs need vendored fonts (see
// public/fonts/README.md) — this test certifies operation, not complex-script
// visual fidelity, offline.

test("app works with the font CDN blocked (no mandatory CDN dependency)", async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());

  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Create beautiful invitations/i })).toBeVisible();

  await page.goto("/new?occasion=marriage");
  await page.getByPlaceholder("e.g. Arjun Kumar").fill("Arjun Kumar");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByPlaceholder("e.g. Meera Rao").fill("Meera Rao");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByPlaceholder("12 Feb 2026").fill("12 Feb 2026");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /Create invitation/i }).click();

  // Editor loads and renders even without the CDN (uses system fallback fonts).
  await expect(page).toHaveURL(/\/editor\//, { timeout: 25000 });
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 25000 });
  await page.waitForTimeout(3000);

  // Export still produces a valid PNG offline.
  await page.getByRole("button", { name: /Download/i }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    page.getByText("PNG — High resolution").click(),
  ]);
  const buf = fs.readFileSync(await download.path());
  expect(buf.subarray(1, 4).toString("latin1")).toBe("PNG");
  expect(buf.length).toBeGreaterThan(10_000);

  expect(errors, `page errors offline:\n${errors.join("\n")}`).toEqual([]);
});
