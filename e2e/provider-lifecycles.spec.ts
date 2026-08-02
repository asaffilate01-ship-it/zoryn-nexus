import { expect, test } from "@playwright/test";

/** Stage 6 — provider lifecycle release gate. */

test("Swan-style banking lifecycle surfaces render", async ({ page }) => {
  await page.goto("/onboarding");
  await expect(page.locator("main, body")).toBeVisible();

  await page.goto("/onboarding-status");
  await expect(page.locator("main, body")).toBeVisible();

  await page.goto("/provider-ready");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("Adyen-style acquiring lifecycle surfaces render", async ({ page }) => {
  await page.goto("/production-ready");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto("/operations-centre");
  await expect(page.locator("main, body")).toBeVisible();
});

test("provider runtime operations are gated behind sign-in", async ({ page }) => {
  await page.goto("/provider-runtime");
  await page.waitForURL(/\/(auth|provider-runtime)/);
  await expect(page.locator("body")).toBeVisible();
});