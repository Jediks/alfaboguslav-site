import { test, expect } from "@playwright/test";

test.describe("Product detail compare (Sprint 6)", () => {
  test("adds product to compare from detail page", async ({ page }) => {
    await page.goto("/uk/catalog/set-3-45", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.getByRole("button", { name: "Порівняти", exact: true }).click();
    await expect(page.getByText("Обрано для порівняння: 1")).toBeVisible();
  });
});
