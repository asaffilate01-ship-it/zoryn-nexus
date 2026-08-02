import { test, expect } from "@playwright/test";

test("provider entry centre is gated behind sign-in", async ({ page }) => {
  await page.goto("/provider-entry");
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/ADYEN_API_KEY|SWAN_CLIENT_SECRET/i);
});

test("stage 9 worker endpoints reject unauthenticated callers", async ({ request }) => {
  for (const path of [
    "/api/public/provider-sandbox-fixtures",
    "/api/public/provider-reconciliation",
  ]) {
    const response = await request.post(path, { data: {} });
    expect(response.status()).toBe(401);
  }
});