import { test } from "@playwright/test";

test("render a birthday card and screenshot", async ({ page }) => {
  await page.goto("/new?occasion=birthday");
  await page.getByLabel(/Birthday person/i).fill("Aarav");
  await page.getByLabel(/Turning/i).fill("10");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByLabel(/^Date/i).fill("2026-05-01");
  await page.getByLabel(/^Time/i).fill("17:00");
  await page.getByLabel(/Venue/i).fill("Sunshine Hall");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /Create invitation/i }).click();
  await page.waitForURL(/\/editor\//, { timeout: 20000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "e2e-output/editor-birthday.png" });
});
