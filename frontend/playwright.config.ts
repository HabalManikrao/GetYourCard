import { defineConfig, devices } from "@playwright/test";

// Uses the system-installed Chrome (channel) since downloading Chromium is
// blocked in some environments. Start backend (:8000) and frontend (:5173) first,
// or let webServer launch the dev server.
export default defineConfig({
  testDir: "./e2e",
  // One-off font-vendoring tools (prefixed with _) are excluded from the regression suite.
  testIgnore: "**/_*.spec.ts",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:5173",
    channel: "chrome",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
  ],
});
