import { test, expect } from "@playwright/test";

// Captures the rendered editor so a human/agent can verify the design actually
// paints (not blank) and that complex-script text shapes correctly.
test("render Kannada invitation and screenshot", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Create New Invitation/i }).click();
  await page.getByPlaceholder("e.g. Arjun Kumar").fill("Arjun Kumar");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByPlaceholder("e.g. Meera Rao").fill("Meera Rao");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByPlaceholder("12 Feb 2026").fill("12 Feb 2026");
  await page.getByPlaceholder("10:30 AM").fill("10:30 AM");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /^Next/ }).click();
  // Kannada as primary
  await page.getByPlaceholder(/Search 40\+ languages/i).fill("Kannada");
  await page.getByRole("button", { name: /Kannada ಕನ್ನಡ/ }).click();
  await page.getByRole("button", { name: /Create invitation/i }).click();

  await expect(page).toHaveURL(/\/editor\//, { timeout: 20000 });
  await page.waitForTimeout(4000); // fonts + render
  await page.screenshot({ path: "e2e-output/editor-english.png", fullPage: false });

  // Switch primary to Kannada (complex script).
  await page.getByRole("button", { name: /^Kannada/ }).click();
  await page.waitForTimeout(3500);
  await page.screenshot({ path: "e2e-output/editor-kannada.png", fullPage: false });

  // Add Arabic (RTL) and switch to it.
  await page.getByRole("button", { name: /Add language/i }).click();
  await page.getByPlaceholder(/Search 40\+ languages/i).fill("Arabic");
  await page.getByRole("button", { name: /Arabic العربية/ }).click();
  await page.getByRole("button", { name: /^Add \d/ }).click();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: /^Arabic/ }).click();
  await page.waitForTimeout(3500);
  await page.screenshot({ path: "e2e-output/editor-arabic.png", fullPage: false });
});
