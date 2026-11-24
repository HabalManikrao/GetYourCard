import { test, expect, type Page } from "@playwright/test";

async function createDefault(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: /Create New Invitation/i }).click();
  await page.getByPlaceholder("e.g. Arjun Kumar").fill("Arjun Kumar");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByPlaceholder("e.g. Meera Rao").fill("Meera Rao");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByPlaceholder("12 Feb 2026").fill("12 Feb 2026");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /Create invitation/i }).click();
  await expect(page).toHaveURL(/\/editor\//, { timeout: 20000 });
  await page.waitForTimeout(3000);
}

test("TC022: wizard validates required fields", async ({ page }) => {
  await page.goto("/new");
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.getByText(/Groom full name is required/i)).toBeVisible();
});

test("TC013: add element then undo removes it", async ({ page }) => {
  await createDefault(page);
  await page.getByRole("button", { name: /Add heading/i }).click();
  await page.waitForTimeout(500);
  // New "Heading" element appears in the layers list.
  await expect(page.getByText('“Heading”')).toBeVisible();
  // Undo via keyboard.
  await page.keyboard.press("Control+z");
  await page.waitForTimeout(400);
  await expect(page.getByText('“Heading”')).toHaveCount(0);
});

test("TC015/TC025: edits persist after reopening the project", async ({ page }) => {
  await createDefault(page);
  const url = page.url();

  // Add a uniquely named heading, then edit its text via the right panel.
  await page.getByRole("button", { name: /Add heading/i }).click();
  await page.waitForTimeout(400);
  const textarea = page.locator("textarea").first();
  await textarea.fill("MANGALYAM-UNIQUE");
  await page.waitForTimeout(2500); // allow autosave (1.5s debounce)

  // Reopen in a fresh navigation.
  await page.goto("about:blank");
  await page.goto(url);
  await page.waitForTimeout(3500);
  await expect(page.getByText(/MANGALYAM-UNIQUE/).first()).toBeVisible({ timeout: 10000 });
});
