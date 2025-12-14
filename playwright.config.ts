import { defineConfig, devices } from "@playwright/test";

// Use process.env.PORT by default and fallback to port 3000
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",

  /* Shared settings for all the projects below. */
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    actionTimeout: 30000, // Increased slightly

    // --- ADD THIS LINE ---
    // Forces the "prefers-reduced-motion" media query to "reduce"
    // This triggers your GlobalAppWrapper logic to skip GSAP/CSS animations
    contextOptions: { reducedMotion: "reduce" },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    /* Mobile Viewport Tests */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      SKIP_RATE_LIMIT: "true",
    },
  },
});
