import { test, expect, loginAs } from "./fixtures/auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Remove the hero DRAFT row (position 1) so the test leaves no residue.
 * Never touches the published row (position 0), so the public site is safe.
 */
async function deleteHeroDraft() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  await fetch(
    `${SUPABASE_URL}/rest/v1/content_blocks?block_key=eq.hero&position=eq.1`,
    {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    }
  ).catch(() => {});
}

test.describe("CMS draft / preview / publish (Phase 8.4)", () => {
  test("draft is previewable by admin but hidden from the public", async ({
    page,
  }) => {
    const res = await loginAs(page, "admin", { locale: "uk" });
    test.skip(res.skipped, res.reason ?? "admin login unavailable");

    const marker = `DRAFT-${Date.now()}`;
    try {
      await page.goto("/uk/admin", { waitUntil: "networkidle" });
      await page.getByRole("tab", { name: /Контент|Content/ }).click();

      await page.locator("#hero-title-uk").fill(marker);
      await page.screenshot({
        path: "/opt/cursor/artifacts/cms_editor.png",
      });

      await page
        .getByRole("button", { name: /Зберегти чернетку|Save draft/ })
        .first()
        .click();
      await expect(
        page.getByText(/Чернетку збережено|Draft saved/)
      ).toBeVisible({ timeout: 15_000 });

      // Public home must NOT show the unpublished draft.
      await page.goto("/uk", { waitUntil: "networkidle" });
      await expect(page.getByText(marker)).toHaveCount(0);

      // Admin preview MUST show the draft.
      await page.goto("/uk/preview/home", { waitUntil: "networkidle" });
      await expect(page.getByText(marker).first()).toBeVisible();
      await page.screenshot({
        path: "/opt/cursor/artifacts/cms_preview.png",
      });
    } finally {
      await deleteHeroDraft();
    }
  });

  test("preview route is gated to admins", async ({ page }) => {
    await page.goto("/uk/preview/home", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/uk\/login/);
  });
});
