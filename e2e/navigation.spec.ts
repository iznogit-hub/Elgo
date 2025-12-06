import { test, expect } from "@playwright/test";

test.describe("Navigation & Smoke Tests", () => {
  test("should successfully load the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/t7sen/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should navigate to About page via menu", async ({ page }) => {
    // Start on Home
    await page.goto("/");

    // Click About in Navbar (assuming standard nav links or dock)
    // Adjust selector based on your actual Navbar implementation if needed
    // Using text selector for robustness
    await page.getByRole("link", { name: "About" }).click();

    await expect(page).toHaveURL("/about");
    await expect(page.getByText("Sec_Ops // Frontend")).toBeVisible();
  });

  test("should render the Custom 404 page for unknown routes", async ({
    page,
  }) => {
    await page.goto("/this-page-does-not-exist-at-all");

    // Check for unique text on your 404 page
    await expect(
      page.getByText("SYSTEM_FAILURE: ROUTE_NOT_FOUND")
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Return to Base" })
    ).toBeVisible();
  });

  test("should open the Command Menu with keyboard shortcut", async ({
    page,
  }) => {
    await page.goto("/");

    // Press Cmd+K (Meta+K) or Ctrl+K
    // Playwright handles platform differences for 'Meta' usually,
    // but explicit combinations work best.
    if (process.platform === "darwin") {
      await page.keyboard.press("Meta+k");
    } else {
      await page.keyboard.press("Control+k");
    }

    // Expect the dialog to appear
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByPlaceholder("Type a command")).toBeVisible();
  });
});
