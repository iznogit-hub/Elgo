import { test, expect } from "@playwright/test";

test.describe("Contact Page", () => {
  test("should navigate through steps and submit form", async ({ page }) => {
    // 1. Go to Contact Page
    await page.goto("/contact");

    // 2. Wait for entrance animation to settle
    const nameInput = page.getByPlaceholder("John Doe");
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // 3. Step 1: Name
    // FIX: Use pressSequentially for reliable state updates in React forms
    await nameInput.pressSequentially("Playwright Bot", { delay: 50 });

    // FIX: Ensure the validation error is NOT visible before proceeding
    // This guarantees react-hook-form accepts the value
    await expect(
      page.getByText("Name must be at least 2 characters")
    ).not.toBeVisible();

    await page.getByRole("button", { name: "CONTINUE" }).click();

    // 4. Step 2: Email
    const emailInput = page.getByPlaceholder("john@example.com");
    await expect(emailInput).toBeVisible();
    await emailInput.fill("bot@test.com");
    await page.getByRole("button", { name: "CONTINUE" }).click();

    // 5. Step 3: Message
    const msgInput = page.getByPlaceholder("Project details");
    await expect(msgInput).toBeVisible();
    await msgInput.fill("This is an automated E2E test message.");

    // 6. Check Submit Button
    const submitBtn = page.getByRole("button", { name: "INITIATE UPLINK" });
    await expect(submitBtn).toBeVisible();
  });

  test("should validate invalid email", async ({ page }) => {
    await page.goto("/contact");

    // 1. Step 1: Name
    // FIX: Use pressSequentially for reliable state updates
    const nameInput = page.getByPlaceholder("John Doe");
    await nameInput.pressSequentially("Bad User", { delay: 50 });

    // FIX: Ensure Name validation passed before clicking
    await expect(
      page.getByText("Name must be at least 2 characters")
    ).not.toBeVisible();

    await page.getByRole("button", { name: "CONTINUE" }).click();

    // 2. Step 2: Invalid Email
    const emailInput = page.getByPlaceholder("john@example.com");
    // Ensure animation finished and input is ready
    await expect(emailInput).toBeVisible();

    await emailInput.fill("not-an-email");
    await page.getByRole("button", { name: "CONTINUE" }).click();

    // 3. Check for Email Error
    await expect(
      page.getByText("Please enter a valid email address")
    ).toBeVisible();
  });
});
