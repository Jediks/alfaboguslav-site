import { test, expect, loginAs } from "./fixtures/auth";

test.describe("Admin quote notes (Phase 6.3)", () => {
  test("admin can save and persist internal notes on a quote", async ({
    page,
  }) => {
    const res = await loginAs(page, "admin", { locale: "uk" });
    test.skip(res.skipped, res.reason ?? "admin login unavailable");

    const openQuotes = async () => {
      await page.goto("/uk/admin", { waitUntil: "networkidle" });
      await page.getByRole("tab", { name: /Запити|Quotes/ }).click();
    };

    await openQuotes();
    const noteBox = page
      .getByPlaceholder(/Внутрішні нотатки|Internal notes/)
      .first();
    await noteBox.waitFor();
    const original = await noteBox.inputValue();
    const marker = `NOTE-${Date.now()}`;

    await noteBox.fill(marker);
    await page
      .getByRole("button", { name: /Зберегти нотатки|Save notes/ })
      .first()
      .click();
    await page.waitForTimeout(1500);

    // Reload and confirm the note persisted.
    await openQuotes();
    const reloaded = page
      .getByPlaceholder(/Внутрішні нотатки|Internal notes/)
      .first();
    await expect(reloaded).toHaveValue(marker);

    // Restore original value so the test leaves no residue.
    await reloaded.fill(original);
    await page
      .getByRole("button", { name: /Зберегти нотатки|Save notes/ })
      .first()
      .click();
    await page.waitForTimeout(1000);
  });
});
