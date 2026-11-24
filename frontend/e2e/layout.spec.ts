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
  await page.waitForTimeout(3500);
}

// R1 regression: the default template's invite line must NOT be clipped.
test("R1: default invitation has no clip warnings", async ({ page }) => {
  await createDefault(page);
  await expect(page.locator('[data-warning-type="clip"]')).toHaveCount(0);
});

// R2: overflow detection must fire a visible clip warning for over-long text.
test("R2: long text raises a visible clip warning", async ({ page }) => {
  await createDefault(page);
  await page.getByRole("button", { name: /Add heading/i }).click();
  await page.waitForTimeout(400);
  const textarea = page.locator("textarea").first();
  await textarea.fill(
    "This is an extremely long single word line SUPERCALIFRAGILISTICEXPIALIDOCIOUSWEDDINGCELEBRATIONTITLE that cannot fit",
  );
  await page.waitForTimeout(1500);
  await expect(page.getByTestId("layout-warnings")).toBeVisible();
  await expect(page.locator('[data-warning-type="clip"]').first()).toBeVisible();
});
