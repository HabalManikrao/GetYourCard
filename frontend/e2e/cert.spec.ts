import { test, expect, type Page } from "@playwright/test";

// Multilingual certification: render representative scripts in the real editor and
// capture evidence. Indic/Arabic use localized message defaults (switch primary);
// CJK uses manual text + the font-coverage auto-fix.

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
  await expect(page).toHaveURL(/\/editor\//, { timeout: 20000 });
  await page.waitForTimeout(3000);
}

async function addAndSwitch(page: Page, searchName: string, chipName: RegExp) {
  await page.getByRole("button", { name: /Add language/i }).click();
  await page.getByPlaceholder(/Search 40\+ languages/i).fill(searchName);
  await page.getByRole("button", { name: new RegExp(searchName, "i") }).first().click();
  await page.getByRole("button", { name: /^Add \d/ }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: chipName }).first().click();
  await page.waitForTimeout(2800);
}

// Indic + Arabic (localized defaults → real script in the invite line).
const PRIMARY_LANGS: { name: string; chip: RegExp; code: string }[] = [
  { name: "Tamil", chip: /^Tamil/, code: "ta" },
  { name: "Telugu", chip: /^Telugu/, code: "te" },
  { name: "Bengali", chip: /^Bengali/, code: "bn" },
  { name: "Gujarati", chip: /^Gujarati/, code: "gu" },
  { name: "Hindi", chip: /^Hindi/, code: "hi" },
  { name: "Urdu", chip: /^Urdu/, code: "ur" },
];

test("certify Indic + Arabic scripts via primary switch", async ({ page }) => {
  await createWedding(page);
  for (const l of PRIMARY_LANGS) {
    await addAndSwitch(page, l.name, l.chip);
    await expect(page.locator('[data-warning-type="clip"]')).toHaveCount(0);
    await page.screenshot({ path: `e2e-output/cert-${l.code}.png` });
  }
});

// CJK via manual heading text + coverage auto-fix.
const CJK = [
  { name: "Japanese", sample: "結婚式 おめでとう", code: "ja" },
  { name: "Chinese (Simplified)", sample: "婚礼 祝福", code: "zh" },
];

test("certify CJK via coverage auto-fix", async ({ page }) => {
  for (const c of CJK) {
    await createWedding(page);
    await page.getByRole("button", { name: /Add heading/i }).click();
    await page.waitForTimeout(400);
    // Select the new heading via the layers list, then edit its text.
    await page.getByText("“Heading”").click();
    await page.waitForTimeout(300);
    await page.locator("textarea").first().fill(c.sample);
    await page.waitForTimeout(800);
    // Coverage warning should appear; apply the compatible-font fix.
    const fix = page.getByRole("button", { name: /compatible font/i });
    await expect(fix).toBeVisible({ timeout: 5000 });
    await fix.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `e2e-output/cert-${c.code}.png` });
  }
});
