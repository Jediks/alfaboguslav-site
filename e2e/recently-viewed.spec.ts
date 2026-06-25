import { test, expect } from "@playwright/test";

test.describe("Recently viewed products", () => {
  test("viewing a product surfaces it in catalog recently-viewed", async ({
    page,
  }) => {
    // Visiting a product detail page records the view.
    await page.goto("/uk/catalog/set-3-45", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // The catalog should now show the "Recently viewed" section.
    await page.goto("/uk/catalog", { waitUntil: "networkidle" });
    await expect(page.getByText("Нещодавно переглянуті")).toBeVisible();
  });
});
