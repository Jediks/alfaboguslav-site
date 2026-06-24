import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads hero and showcase", async ({ page }) => {
    await page.goto("/uk", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await page.locator(".showcase-rail").scrollIntoViewIfNeeded();
    await expect(page.locator(".showcase-rail")).toBeVisible();
  });

  test("process section with progress bar", async ({ page }) => {
    await page.goto("/uk", { waitUntil: "networkidle" });
    await page.locator(".process-step").first().scrollIntoViewIfNeeded();
    await expect(page.locator(".process-step").first()).toBeVisible();
  });
});

test.describe("Quote form", () => {
  test("submits quote and shows success", async ({ page }) => {
    await page.goto("/uk", { waitUntil: "networkidle" });
    await page.locator("#quote-company").scrollIntoViewIfNeeded();
    await page.locator("#quote-company").fill("Test Corp");
    await page.locator("#quote-name").fill("Artem");
    await page.locator("#quote-email").fill("test@example.com");
    await page.locator("#quote-phone").fill("+380971234567");
    await page.getByRole("button", { name: /заявку|quote/i }).click();
    await expect(page.getByRole("main").getByText(/надіслано|sent/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("Catalog", () => {
  test("product grid loads with cards", async ({ page }) => {
    await page.goto("/uk/catalog", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Checkout", () => {
  test("add to cart and reach checkout form", async ({ page }) => {
    await page.goto("/uk/catalog/set-11-65", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /додати в кошик|add to cart/i }).click();
    await page.goto("/uk/checkout", { waitUntil: "networkidle" });
    await expect(page.locator("#company")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
  });
});

test.describe("Admin", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/uk/admin", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/uk\/login/);
  });
});
