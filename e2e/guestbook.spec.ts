import { test, expect } from "@playwright/test";

// ⚡ RUN SERIALLY: We share a Rate Limit quota (5 req/min) across these tests.
// Parallel execution would cause the "Spam" test to fail unpredictably.
test.describe.configure({ mode: "serial" });

test.describe("Guestbook", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/guestbook");
  });

  test("should display the guestbook page and form", async ({ page }) => {
    // Check Header
    await expect(
      page.getByRole("heading", { name: "Guestbook" }),
    ).toBeVisible();

    // Check Form Inputs (Updated Selectors based on form.tsx)
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="message"]')).toBeVisible();

    // The button uses HackerText, so we target by type or generic role if text is dynamic
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should allow signing the guestbook (Happy Path)", async ({ page }) => {
    const uniqueMsg = `Automated Test ${Date.now()}`;
    const testUser = "E2E Bot";

    // Fill Form
    await page.locator('input[name="name"]').fill(testUser);
    await page.locator('input[name="message"]').fill(uniqueMsg);

    // Submit
    await page.locator('button[type="submit"]').click();

    // Verify Success Sound/UI State (Optional, checking list is better)
    // Verify it appears in the list (Optimistic UI or Revalidation)
    await expect(page.getByText(uniqueMsg)).toBeVisible({ timeout: 10000 });
  });

  test("should trigger rate limit protection on spam", async ({ page }) => {
    // 🛡️ SECURITY TEST: Verify the 5 req/min limit actually works
    const spamMsg = "Spam Attack";
    const testUser = "Spam Bot";

    // We already used 1 request in the previous test.
    // The limit is 5. We need to loop enough times to hit the limit.
    // We'll try up to 6 times.
    let rateLimitHit = false;

    for (let i = 0; i < 6; i++) {
      await page.locator('input[name="name"]').fill(testUser);
      await page.locator('input[name="message"]').fill(`${spamMsg} ${i}`);
      await page.locator('button[type="submit"]').click();

      // ⚡ FIX: Wait for the form submission to finish (button re-enables)
      // This ensures the Server Action has returned and the UI has updated.
      await expect(page.locator('button[type="submit"]')).not.toBeDisabled();

      // Now safely check if the error appeared
      const errorVisible = await page
        .getByText(/Rate limit exceeded/i)
        .isVisible();

      if (errorVisible) {
        rateLimitHit = true;
        break;
      }
    }

    expect(rateLimitHit).toBeTruthy();
  });
});
