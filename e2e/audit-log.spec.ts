import { test, expect, loginAs } from "./fixtures/auth";

test.describe("Admin audit log (Phase 10.3)", () => {
  test("an admin mutation is recorded and shown in the audit tab", async ({
    page,
  }) => {
    const res = await loginAs(page, "admin", { locale: "uk" });
    test.skip(res.skipped, res.reason ?? "admin login unavailable");

    // Trigger an auditable admin mutation: save a note on the first quote.
    await page.goto("/uk/admin", { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: /Запити|Quotes/ }).click();
    const noteBox = page
      .getByPlaceholder(/Внутрішні нотатки|Internal notes/)
      .first();
    await noteBox.waitFor();
    const original = await noteBox.inputValue();
    await noteBox.fill(`AUDIT-${Date.now()}`);
    await page
      .getByRole("button", { name: /Зберегти нотатки|Save notes/ })
      .first()
      .click();
    await page.waitForTimeout(1500);

    // The audit tab should now list a quote mutation.
    await page.goto("/uk/admin", { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: /Журнал|Audit log/ }).click();
    await expect(page.getByText(/quote/).first()).toBeVisible();
    await page.screenshot({ path: "/opt/cursor/artifacts/admin_audit_log.png" });

    // Restore original note value.
    await page.getByRole("tab", { name: /Запити|Quotes/ }).click();
    const restore = page
      .getByPlaceholder(/Внутрішні нотатки|Internal notes/)
      .first();
    await restore.fill(original);
    await page
      .getByRole("button", { name: /Зберегти нотатки|Save notes/ })
      .first()
      .click();
    await page.waitForTimeout(1000);
  });
});
