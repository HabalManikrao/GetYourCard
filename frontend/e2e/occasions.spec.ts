import { test, expect, type Page } from "@playwright/test";

// Universal occasion platform (scope expansion). Verifies non-wedding cards can
// be created end-to-end and the editor renders them (no wedding assumptions).

async function finishLanguageAndOpenEditor(page: Page) {
  await page.getByRole("button", { name: /Create invitation/i }).click();
  await expect(page).toHaveURL(/\/editor\//, { timeout: 20000 });
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(2500);
  await expect(page.locator('[data-warning-type="clip"]')).toHaveCount(0);
}

test("TC002: create a birthday invitation", async ({ page }) => {
  await page.goto("/new?occasion=birthday");
  await expect(page.getByRole("heading", { name: /Details/i })).toBeVisible();
  await page.getByLabel(/Birthday person/i).fill("Aarav");
  await page.getByLabel(/Turning/i).fill("30");
  await page.getByRole("button", { name: /^Next/ }).click(); // Party group
  await page.getByLabel(/^Date/i).fill("2026-05-01");
  await page.getByRole("button", { name: /^Next/ }).click(); // Language
  await finishLanguageAndOpenEditor(page);
  // Editor shows the occasion field (celebrant) — not wedding fields.
  await expect(page.getByText(/celebrant name/i)).toBeVisible();
});

test("TC004: create a corporate invitation", async ({ page }) => {
  await page.goto("/new?occasion=business-launch");
  await page.getByLabel(/Organization/i).fill("Zen Technologies");
  await page.getByLabel(/Event title/i).fill("Grand Launch");
  await page.getByRole("button", { name: /^Next/ }).click(); // Event group
  await page.getByLabel(/^Date/i).fill("2026-06-10");
  await page.getByRole("button", { name: /^Next/ }).click(); // Language
  await finishLanguageAndOpenEditor(page);
});

test("TC005: create a thank-you greeting card", async ({ page }) => {
  await page.goto("/new?occasion=thank-you");
  await page.getByLabel(/^To/i).fill("Grandma");
  await page.getByLabel(/message/i).fill("Thank you for everything.");
  await page.getByLabel(/^From/i).fill("Meera");
  await page.getByRole("button", { name: /^Next/ }).click(); // Language
  await finishLanguageAndOpenEditor(page);
});

test("TC007/TC008: Build Your Own custom occasion", async ({ page }) => {
  await page.goto("/build");
  await page.getByPlaceholder(/Community Celebration/i).fill("Village Festival");
  // Default fields include Title (required); fill it after save-flow starts.
  await page.getByRole("button", { name: /Save & start designing/i }).click();
  await expect(page).toHaveURL(/\/new\?occasion=/, { timeout: 15000 });
  await expect(page.getByText(/Village Festival/i)).toBeVisible();
  await page.getByLabel(/Title/i).first().fill("Annual Village Festival");
  await page.getByRole("button", { name: /^Next/ }).click(); // Language
  await finishLanguageAndOpenEditor(page);
});
