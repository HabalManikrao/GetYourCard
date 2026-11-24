import { test, expect, type Page } from "@playwright/test";

// R6: functional image upload + crop in the real editor.
const PNG_120x80 =
  "iVBORw0KGgoAAAANSUhEUgAAAHgAAABQCAIAAABd+SbeAAAA6klEQVR4nO3doQ3DQBQFQdtKWa4j2GWknODUYZCy0kGkA54D3qFHnlaf37q/vkuut80ecBeFRgqNFBopNFJopNBIoZFCI4//z5/9IDOGPc/37Aljumik0EihkUIjhUYKjRQaKTRSaKTQSKGRQiOFRgqNFBopNFJopNBIoZFCI4VGCo0UGik0Umik0EihkUIjhUYKjRQaKTRSaKTQSKGRQiOFRgqNFBopNFJopNBIoZFCI4VGCo0UGik0Umik0EihkUIjhUYKjRQaKTRSaKTQSKGRQiNr34MYXTRSaKTQSKGRQiOFRgqNFBr5AYcgBpk04XasAAAAAElFTkSuQmCC";

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

test("R6: upload an image and crop it to square", async ({ page }) => {
  await createDefault(page);
  await page.getByRole("button", { name: "Uploads" }).click();
  const buffer = Buffer.from(PNG_120x80, "base64");
  await page.locator('input[type="file"]').first().setInputFiles({ name: "photo.png", mimeType: "image/png", buffer });
  await page.waitForTimeout(2500);
  // Select the uploaded image via the layers list (no selection → Layers panel).
  await page.getByRole("button", { name: /^image/ }).first().click();
  await page.waitForTimeout(300);
  // Crop controls appear; apply square crop.
  await page.getByRole("button", { name: "1:1" }).click();
  await page.waitForTimeout(500);
  await expect(page.getByText(/Cropped to \d+×\d+px/)).toBeVisible();
});
