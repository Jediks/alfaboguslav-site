import { test, expect } from "@playwright/test";

test.describe("Product compare (Phase 9.5)", () => {
  test("select two products from catalog and view comparison table", async ({
    page,
  }) => {
    await page.goto("/uk/catalog", { waitUntil: "networkidle" });

    const addButtons = page.getByRole("button", { name: "Порівняти", exact: true });
    await addButtons.first().waitFor();
    await addButtons.first().click(); // first card
    await addButtons.first().click(); // next remaining card

    const compareLink = page.getByRole("button", { name: /Порівняти \(2\)/ });
    await expect(compareLink).toBeVisible();
    await compareLink.click();

    await expect(page).toHaveURL(/\/uk\/compare/);
    await expect(
      page.getByRole("heading", { name: "Порівняння наборів" })
    ).toBeVisible();
    // comparison rows
    await expect(page.getByText("Упаковка")).toBeVisible();
    await expect(page.getByText("Кількість позицій")).toBeVisible();
  });
});
