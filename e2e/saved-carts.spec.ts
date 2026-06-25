import { test, expect } from "@playwright/test";

test.describe("Saved carts (Phase 9.2)", () => {
  test("save the current cart and restore it", async ({ page }) => {
    await page.goto("/uk/catalog/set-3-45", { waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: /додати в кошик|add to cart/i })
      .first()
      .click();

    await page.goto("/uk/cart", { waitUntil: "networkidle" });

    const name = `Test cart ${Date.now()}`;
    await page.getByPlaceholder(/Назва кошика|Cart name/).fill(name);
    await page.getByRole("button", { name: /Зберегти кошик|Save cart/ }).click();

    await expect(page.getByText(name)).toBeVisible();
    const restore = page.getByRole("button", { name: /Відновити|Restore/ });
    await expect(restore.first()).toBeVisible();
    await page.screenshot({ path: "/opt/cursor/artifacts/saved_carts.png" });

    await restore.first().click();
    await expect(page.getByText(/Кошик відновлено|Cart restored/)).toBeVisible();
  });
});
