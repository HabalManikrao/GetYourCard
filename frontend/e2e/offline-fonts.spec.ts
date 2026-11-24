import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

// FULL offline certification: block ALL external hosts (only localhost allowed), so
// any complex-script glyph that renders MUST come from the vendored local fonts, not
// the Google CDN. Verifies canvas render + PNG export offline for Kannada and Arabic.

async function goOffline(page: Page) {
  await page.route("**/*", (route) => {
    try {
      const host = new URL(route.request().url()).hostname;
      if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return route.continue();
      return route.abort();
    } catch {
      return route.abort();
    }
  });
}

async function createWedding(page: Page) {
  await page.goto("/new?occasion=marriage");
  await page.getByPlaceholder("e.g. Arjun Kumar").fill("Arjun");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByPlaceholder("e.g. Meera Rao").fill("Meera");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByPlaceholder("12 Feb 2026").fill("12 Feb 2026");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /Create invitation/i }).click();
  await expect(page).toHaveURL(/\/editor\//, { timeout: 25000 });
  await page.waitForTimeout(3500);
}

async function addAndSwitch(page: Page, name: string, chip: RegExp) {
  await page.getByRole("button", { name: /Add language/i }).click();
  await page.getByPlaceholder(/Search 40\+ languages/i).fill(name);
  await page.getByRole("button", { name: new RegExp(name, "i") }).first().click();
  await page.getByRole("button", { name: /^Add \d/ }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: chip }).first().click();
  await page.waitForTimeout(3000);
}

test("offline: Kannada + Arabic render from vendored fonts, PNG exports", async ({ page }) => {
  const extReqs: string[] = [];
  page.on("requestfailed", (r) => {
    try {
      const h = new URL(r.url()).hostname;
      if (h.includes("gstatic") || h.includes("googleapis")) extReqs.push(r.url());
    } catch {
      /* ignore */
    }
  });
  await goOffline(page);
  await createWedding(page);

  // Kannada (complex script) from the local font.
  await addAndSwitch(page, "Kannada", /^Kannada/);
  await expect(page.locator('[data-warning-type="clip"]')).toHaveCount(0);
  await page.screenshot({ path: "e2e-output/offline-kannada.png" });

  // Arabic (RTL) from the local font.
  await addAndSwitch(page, "Arabic", /^Arabic/);
  await page.screenshot({ path: "e2e-output/offline-arabic.png" });

  // PNG export works offline.
  await page.getByRole("button", { name: /Download/i }).click();
  const [dl] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    page.getByText("PNG — High resolution").click(),
  ]);
  const buf = fs.readFileSync(await dl.path());
  expect(buf.subarray(1, 4).toString("latin1")).toBe("PNG");
  expect(buf.length).toBeGreaterThan(20_000);

  // Google Fonts was never successfully used (either blocked or never requested).
  console.log("OFFLINE blocked-google-reqs=" + extReqs.length);
});
