import { test, expect } from "@playwright/test";

test.describe("Catalog sort", () => {
  test("sorting by price reorders the product grid", async ({ page }) => {
    await page.goto("/uk/catalog", { waitUntil: "networkidle" });
    await expect(page.locator("article").first()).toBeVisible();

    const pickSort = async (optionName: string) => {
      await page.getByRole("combobox").first().click();
      await page.getByRole("option", { name: optionName }).click();
      await expect(page.locator("article").first()).toBeVisible();
      return page.locator("article h3").first().innerText();
    };

    const cheapestFirst = await pickSort("Ціна: за зростанням");
    const dearestFirst = await pickSort("Ціна: за спаданням");

    // Cheapest-first and most-expensive-first must differ given varied prices.
    expect(cheapestFirst).not.toBe(dearestFirst);
  });
});
