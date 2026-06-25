import { test, expect, loginAs } from "./fixtures/auth";

test.describe("Admin KPI dashboard (Phase 10.1)", () => {
  test("shows KPI cards for an authenticated admin", async ({ page }) => {
    const res = await loginAs(page, "admin", { locale: "uk" });
    test.skip(res.skipped, res.reason ?? "admin login unavailable");

    await page.goto("/uk/admin", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/uk\/admin/);

    await expect(page.getByText("Замовлення (7 днів)")).toBeVisible();
    await expect(page.getByText("Дохід (7 днів)")).toBeVisible();
    await expect(page.getByText("Усього замовлень")).toBeVisible();
    await expect(page.getByText("Топ-набір")).toBeVisible();
    await expect(page.getByText("Запити (7 днів)")).toBeVisible();

    await page.screenshot({
      path: "/opt/cursor/artifacts/admin_kpi_dashboard.png",
    });
  });
});
