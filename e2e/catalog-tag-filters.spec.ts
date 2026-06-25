import { test, expect } from "@playwright/test";

test.describe("Catalog tag filters (Sprint 8)", () => {
  test("filters product grid by popular tag chip", async ({ page }) => {
    await page.goto("/uk/catalog", { waitUntil: "networkidle" });
    await expect(page.locator("article").first()).toBeVisible();

    const countBefore = await page.locator("article").count();
    expect(countBefore).toBeGreaterThan(1);

    const bulkChip = page.getByRole("button", { name: "Bulk", exact: true });
    await expect(bulkChip).toBeVisible();
    await bulkChip.click();

    await expect
      .poll(async () => page.locator("article").count())
      .toBeLessThan(countBefore);

    await page.getByRole("button", { name: "Усі теги" }).click();
    await expect(page.locator("article")).toHaveCount(countBefore);
  });
});
