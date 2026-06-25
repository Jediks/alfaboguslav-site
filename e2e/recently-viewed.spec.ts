import { test, expect } from "@playwright/test";

test.describe("Recently viewed products", () => {
  test("viewing a product surfaces it in catalog recently-viewed filter", async ({
    page,
  }) => {
    await page.goto("/uk/catalog/set-3-45", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.goto("/uk/catalog", { waitUntil: "networkidle" });
    const recentFilter = page.getByRole("button", { name: "Нещодавно переглянуті" });
    await expect(recentFilter).toBeVisible();
    await recentFilter.click();
    await expect(page.getByRole("link", { name: /3\.45|3\/45/i })).toBeVisible();
  });
});
