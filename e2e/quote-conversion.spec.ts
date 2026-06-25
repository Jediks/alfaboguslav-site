import { test, expect } from "./fixtures/auth";

test.describe("Quote to order conversion (Phase 9.3)", () => {
  test("admin converts quote and sees catalog banner", async ({ page, adminAuth }) => {
    test.skip(adminAuth.skipped, adminAuth.reason ?? "E2E admin credentials not configured");

    await page.goto("/uk/admin", { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: /Запити|Quotes/ }).click();

    const convertBtn = page.getByRole("button", { name: /Оформити замовлення|Create order/ }).first();
    if (!(await convertBtn.isVisible())) {
      test.skip(true, "No quotes in admin to convert");
    }

    await convertBtn.click();
    await expect(page).toHaveURL(/\/uk\/catalog/);
    await expect(page.getByText(/Запит .+ — підберіть набори|Quote .+ — pick gift sets/)).toBeVisible();
  });
});
