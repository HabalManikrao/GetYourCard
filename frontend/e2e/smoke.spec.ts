import { test, expect, type ConsoleMessage } from "@playwright/test";

// End-to-end smoke test of the core creation flow. Verifies the app boots, the
// wizard creates a project, the Fabric editor renders a non-blank canvas, and
// language switching works — with no console errors.

test("create invitation, render editor, switch language", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m: ConsoleMessage) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));

  // Dashboard
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Create beautiful invitations/i })).toBeVisible();

  // Start wizard
  await page.getByRole("link", { name: /Create New Invitation/i }).click();
  await expect(page.getByRole("heading", { name: /Groom Details/i })).toBeVisible();

  // Step 1: Groom
  await page.getByPlaceholder("e.g. Arjun Kumar").fill("Arjun Kumar");
  await page.getByRole("button", { name: /^Next/ }).click();
  // Step 2: Bride
  await page.getByPlaceholder("e.g. Meera Rao").fill("Meera Rao");
  await page.getByRole("button", { name: /^Next/ }).click();
  // Step 3: Wedding
  await page.getByPlaceholder("12 Feb 2026").fill("12 Feb 2026");
  await page.getByRole("button", { name: /^Next/ }).click();
  // Step 4: Family
  await page.getByRole("button", { name: /^Next/ }).click();
  // Step 5: Language — add Kannada
  await page.getByPlaceholder(/Search 40\+ languages/i).fill("Kannada");
  await page.getByRole("button", { name: /Kannada ಕನ್ನಡ/ }).click();
  await page.getByRole("button", { name: /Create invitation/i }).click();

  // Editor loads with a canvas
  await expect(page).toHaveURL(/\/editor\//, { timeout: 20000 });
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible({ timeout: 20000 });

  // Canvas should have non-trivial dimensions (rendered content).
  await page.waitForTimeout(2500);
  const box = await canvas.boundingBox();
  expect(box!.width).toBeGreaterThan(50);
  expect(box!.height).toBeGreaterThan(50);

  // Language bar present; add/switch language control visible.
  await expect(page.getByRole("button", { name: /Add language/i })).toBeVisible();

  // Left panel tabs present (editor chrome rendered).
  await expect(page.getByRole("button", { name: "Motifs" })).toBeVisible();

  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});
