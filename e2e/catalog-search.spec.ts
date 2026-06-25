import { test, expect } from "@playwright/test";

test.describe("Catalog search (Sprint 6)", () => {
  test("filters product grid by search query", async ({ page }) => {
    await page.goto("/uk/catalog", { waitUntil: "networkidle" });
    await expect(page.locator("article").first()).toBeVisible();

    const countBefore = await page.locator("article").count();
    expect(countBefore).toBeGreaterThan(1);

    await page.getByRole("textbox", { name: "Пошук наборів" }).fill("set-3-45");
    await expect
      .poll(async () => page.locator("article").count())
      .toBeLessThan(countBefore);
    await expect(page.locator("article")).toHaveCount(1);
  });
});
