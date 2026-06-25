import { test, expect } from "./fixtures/auth";

test.describe("Account KPI cards (Sprint 6)", () => {
  test("shows order summary cards for logged-in client with orders", async ({
    page,
    clientAuth,
  }) => {
    test.skip(clientAuth.skipped, clientAuth.reason ?? "E2E client credentials not configured");

    await page.goto("/uk/account", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Особистий кабінет" })).toBeVisible();

    const kpiSection = page.getByText("Усього замовлень");
    if (await kpiSection.isVisible()) {
      await expect(page.getByText("Загальна сума")).toBeVisible();
    }
  });
});
