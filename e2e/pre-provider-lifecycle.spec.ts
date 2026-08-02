import { test, expect } from "@playwright/test";

test("banking and acquiring workspaces render from persisted routes", async ({ page }) => {
  for (const route of [
    "/personal-workspace",
    "/business-workspace",
    "/zorynpay-workspace",
    "/provider-runtime",
  ]) {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/stack trace|service_role/i);
  }
});

test("launch blockers are protected", async ({ page }) => {
  await page.goto("/launch-blockers");
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/ADYEN_API_KEY|SWAN_CLIENT_SECRET/i);
});
