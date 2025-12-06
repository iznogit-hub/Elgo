import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES_TO_TEST = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },
  { path: "/uses", name: "Uses" },
  { path: "/contact", name: "Contact" },
  { path: "/guestbook", name: "Guestbook" },
];

test.describe("Accessibility Snapshots", () => {
  for (const pageItem of PAGES_TO_TEST) {
    test(`should not have any automatically detectable accessibility issues on ${pageItem.name}`, async ({
      page,
    }) => {
      await page.goto(pageItem.path);

      // Wait for any animations/hydration
      await page.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({ page })
        // You can exclude specific elements if they are known false positives
        // .exclude('selector')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
