import { test, expect, loginAs } from "./fixtures/auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

async function deleteTestimonialsDraft() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  await fetch(
    `${SUPABASE_URL}/rest/v1/content_blocks?block_key=eq.testimonials&position=eq.1`,
    {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    }
  ).catch(() => {});
}

test.describe("Testimonial star rating (Phase 8.2)", () => {
  test("custom rating propagates from editor draft to rendered stars", async ({
    page,
  }) => {
    const res = await loginAs(page, "admin", { locale: "uk" });
    test.skip(res.skipped, res.reason ?? "admin login unavailable");

    try {
      await page.goto("/uk/admin", { waitUntil: "networkidle" });
      await page.getByRole("tab", { name: /Контент|Content/ }).click();

      const ratingInput = page.locator("#t-rating-0");
      await ratingInput.fill("3");

      await page
        .getByRole("button", { name: /Зберегти чернетку|Save draft/ })
        .nth(1) // testimonials section save-draft button
        .click();
      await expect(
        page.getByText(/Чернетку збережено|Draft saved/)
      ).toBeVisible({ timeout: 15_000 });

      await page.goto("/uk/preview/home", { waitUntil: "networkidle" });
      const firstStars = page.locator("[data-testid=review-stars]").first();
      await expect(firstStars).toHaveAttribute("data-rating", "3");
    } finally {
      await deleteTestimonialsDraft();
    }
  });
});
