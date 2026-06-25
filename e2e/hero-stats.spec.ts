import { test, expect, loginAs } from "./fixtures/auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

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

test.describe("Editable hero stats (Phase 8.3)", () => {
  test("editing a hero stat value shows up in preview", async ({ page }) => {
    const res = await loginAs(page, "admin", { locale: "uk" });
    test.skip(res.skipped, res.reason ?? "admin login unavailable");

    const marker = `${Math.floor(Date.now() / 1000) % 900}+`;
    try {
      await page.goto("/uk/admin", { waitUntil: "networkidle" });
      await page.getByRole("tab", { name: /Контент|Content/ }).click();

      await page.locator("#hero-stat-value-0").fill(marker);
      await page
        .getByRole("button", { name: /Зберегти чернетку|Save draft/ })
        .first() // hero section
        .click();
      await expect(
        page.getByText(/Чернетку збережено|Draft saved/)
      ).toBeVisible({ timeout: 15_000 });

      await page.goto("/uk/preview/home", { waitUntil: "networkidle" });
      await expect(page.getByText(marker).first()).toBeVisible();
    } finally {
      await deleteHeroDraft();
    }
  });
});
