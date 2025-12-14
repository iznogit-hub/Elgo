import { test, expect } from "@playwright/test";

// 1. HAPPY PATH SUITE
// We use a unique IP ("1.1.1.1") so this test always starts with a fresh rate limit bucket.
// This prevents "Rate limit exceeded" errors if the spam test ran previously.
test.describe("Guestbook - Functionality", () => {
  // Override the IP header for requests in this suite
  test.use({ extraHTTPHeaders: { "x-forwarded-for": "1.1.1.1" } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/guestbook");
  });

  test("should display the guestbook page and form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Guestbook" }),
    ).toBeVisible();

    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="message"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should allow signing the guestbook", async ({ page }) => {
    const uniqueMsg = `Automated Test ${Date.now()}`;
    const testUser = "E2E Bot";

    await page.locator('input[name="name"]').fill(testUser);
    await page.locator('input[name="message"]').fill(uniqueMsg);

    await page.locator('button[type="submit"]').click();

    // Verify success by checking if the message appears in the list
    // (Wait up to 10s for revalidation/optimistic UI)
    await expect(page.getByText(uniqueMsg)).toBeVisible({ timeout: 10000 });
  });
});

// 2. SECURITY SUITE
// We use a DIFFERENT IP ("6.6.6.6") specifically for spamming.
// This ensures we don't accidentally block the happy path user above,
// avoiding the infinite loop of rate limit warnings in CI.
test.describe("Guestbook - Security", () => {
  test.use({ extraHTTPHeaders: { "x-forwarded-for": "6.6.6.6" } });

  test("should trigger rate limit protection on spam", async ({ page }) => {
    await page.goto("/guestbook");

    const spamMsg = "Spam Attack";
    const testUser = "Spam Bot";
    let rateLimitHit = false;

    // Loop enough times to hit the limit.
    // Limit is 5 requests per minute. We try 7 times to guarantee a block.
    for (let i = 0; i < 7; i++) {
      await page.locator('input[name="name"]').fill(testUser);
      await page.locator('input[name="message"]').fill(`${spamMsg} ${i}`);

      const submitBtn = page.locator('button[type="submit"]');
      await submitBtn.click();

      // ⚡ WAIT for the button to re-enable (request finished).
      // This prevents a race condition where we check for the error before the server responds.
      await expect(submitBtn).not.toBeDisabled();

      // Check if the error message appeared
      const errorVisible = await page
        .getByText(/Rate limit exceeded/i)
        .isVisible();

      if (errorVisible) {
        rateLimitHit = true;
        break;
      }

      // Small cooldown to prevent UI/State race conditions
      await page.waitForTimeout(200);
    }

    expect(rateLimitHit).toBeTruthy();
  });
});
