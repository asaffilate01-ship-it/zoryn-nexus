import { test, expect } from "@playwright/test";

test("public homepage renders without leaking server secrets", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBeLessThan(500);
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(
    /SUPABASE_SERVICE_ROLE|SWAN_CLIENT_SECRET|ADYEN_API_KEY|stack trace/i,
  );
});

test("protected provider route responds safely", async ({ page }) => {
  const response = await page.goto("/provider-entry");
  expect(response?.status()).toBeLessThan(500);
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(
    /SUPABASE_SERVICE_ROLE|SWAN_CLIENT_SECRET|ADYEN_API_KEY/i,
  );
});

test("worker endpoints reject unauthenticated calls", async ({ request }) => {
  for (const endpoint of [
    "/api/public/provider-sandbox-fixtures",
    "/api/public/provider-reconciliation",
  ]) {
    const response = await request.post(endpoint, { data: {} });
    expect([401, 403, 404]).toContain(response.status());
  }
});
