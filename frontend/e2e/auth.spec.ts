import { test, expect } from "@playwright/test";

// Shared-mode auth UX. The backend runs in guest mode here, so register/login
// (which are always available) work; we force the SPA into shared mode by mocking
// /api/auth/config → auth_required:true to verify the redirect/login/logout flow.
// Server-side authorization (cross-user isolation) is covered by backend tests.

test("shared mode: redirect, register, persist session, logout", async ({ page }) => {
  await page.route(/\/api\/auth\/config$/, (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ auth_required: true }) }),
  );

  // Unauthenticated visit to a protected route redirects to /login.
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible();

  // Register a new account.
  await page.getByRole("link", { name: /Create an account/i }).click();
  await expect(page).toHaveURL(/\/register/);
  const email = `e2e_${Math.floor(performance.now())}_${Math.round(Math.random() * 1e6)}@example.com`;
  await page.getByLabel("Name").fill("E2E User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: /Create account/i }).click();

  // Lands on the dashboard, authenticated; account menu shows the user.
  await expect(page).toHaveURL(/\/$|\/$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: /Create beautiful invitations/i })).toBeVisible();
  await expect(page.getByTestId("account-menu")).toBeVisible();

  // Session persists across reload (token in storage).
  await page.reload();
  await expect(page.getByTestId("account-menu")).toBeVisible();
  await expect(page).not.toHaveURL(/\/login/);

  // Logout returns to /login, and protected routes are gated again.
  await page.getByRole("button", { name: /Logout/i }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
});
