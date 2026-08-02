import { expect, test } from "@playwright/test";

test.describe("public marketing and product journeys", () => {
  test("homepage explains the offering and links onward", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page).toHaveTitle(/Zoryn/i);
    await expect(page.getByRole("link", { name: /demo/i }).first()).toBeVisible();
  });

  test("product centre renders", async ({ page }) => {
    await page.goto("/products");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("demo hub lists the four portals", async ({ page }) => {
    await page.goto("/demo");
    const body = page.locator("body");
    await expect(body).toContainText(/personal/i);
    await expect(body).toContainText(/business/i);
    await expect(body).toContainText(/merchant|zorynpay/i);
    await expect(body).toContainText(/admin/i);
  });

  test("provider readiness centre renders live provider data", async ({ page }) => {
    await page.goto("/provider-ready");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("body")).toContainText(/swan|adyen/i);
  });

  test("no console errors on the homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
});

test.describe("authentication gates", () => {
  for (const path of ["/personal", "/business", "/merchant", "/admin", "/control-room"]) {
    test(`${path} redirects anonymous visitors to sign in`, async ({ page }) => {
      await page.goto(path);
      await page.waitForURL(/\/auth/, { timeout: 15_000 });
      expect(page.url()).toContain("/auth");
    });
  }
});

test.describe("platform endpoints", () => {
  test("provider health responds with queue depth", async ({ request }) => {
    const response = await request.get("/api/public/provider-health");
    expect([200, 503]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty("commandBacklog");
    expect(body).toHaveProperty("eventBacklog");
    expect(JSON.stringify(body)).not.toMatch(/secret|service_role/i);
  });

  test("workers reject unauthenticated callers", async ({ request }) => {
    for (const path of [
      "/api/public/provider-command-worker",
      "/api/public/provider-event-processor",
      "/api/public/notification-worker",
    ]) {
      const response = await request.post(path, { data: {} });
      expect(response.status()).toBe(401);
    }
  });

  test("webhook inbox rejects an unsigned payload", async ({ request }) => {
    const response = await request.post("/api/public/platform-provider-webhooks", {
      headers: { "x-provider": "swan" },
      data: { eventId: "e2e-unsigned", eventType: "test.event" },
    });
    expect([400, 401, 503]).toContain(response.status());
  });
});
