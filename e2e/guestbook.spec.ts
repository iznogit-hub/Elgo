import { test, expect } from "@playwright/test";

test.describe("Guestbook", () => {
  test("should display the guestbook page and form", async ({ page }) => {
    await page.goto("/guestbook");

    // Check Header
    await expect(
      page.getByRole("heading", { name: "Guestbook" })
    ).toBeVisible();

    // Check Form Inputs
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="message"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign Guestbook" })
    ).toBeVisible();
  });

  test("should allow signing the guestbook", async ({ page }) => {
    // Generate a unique message to verify
    const uniqueMsg = `Automated Test Message ${Date.now()}`;
    const testUser = "E2E Bot";

    await page.goto("/guestbook");

    // Fill Form
    await page.locator('input[name="name"]').fill(testUser);
    await page.locator('input[name="message"]').fill(uniqueMsg);

    // Submit
    await page.getByRole("button", { name: "Sign Guestbook" }).click();

    // Verify it appears in the list
    // Note: Since we use revalidatePath, it might take a moment or a refresh in some envs,
    // but Next.js usually handles this gracefully.
    await expect(page.getByText(uniqueMsg)).toBeVisible({ timeout: 10000 });
  });
});
