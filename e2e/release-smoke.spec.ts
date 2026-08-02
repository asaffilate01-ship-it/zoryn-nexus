import { test, expect } from "@playwright/test";

const publicRoutes = ["/", "/personal", "/business", "/pay", "/rewards"];

for (const route of publicRoutes) {
  test(`${route} renders without leaking server details`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(
      /service_role|stack trace|SWAN_CLIENT_SECRET|ADYEN_API_KEY/i,
    );
  });
}

test("provider health endpoint returns a bounded response", async ({ request }) => {
  const response = await request.get("/api/public/provider-health");
  expect([200, 503]).toContain(response.status());
  const body = JSON.stringify(await response.json());
  expect(body).not.toMatch(/client_secret|api_key|access_token|payload/i);
});
