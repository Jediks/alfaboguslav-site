import { test, expect, loginAs } from "./fixtures/auth";

function supabaseEnvConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

test.describe("Auth — unauthenticated guards", () => {
  test("admin route redirects guests to login when Supabase is configured", async ({ page }) => {
    test.skip(
      !supabaseEnvConfigured(),
      "Supabase not configured — middleware skips auth redirects in demo mode."
    );
    await page.goto("/uk/admin", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/uk\/login/);
  });

  test("account route is protected when Supabase is configured", async ({ page }) => {
    test.skip(
      !supabaseEnvConfigured(),
      "Supabase not configured — account route is open in demo mode."
    );
    await page.goto("/uk/account", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/uk\/login/);
  });
});

test.describe("Auth — login fixtures", () => {
  test("admin can sign in", async ({ page, adminAuth }) => {
    test.skip(adminAuth.skipped, adminAuth.reason ?? "admin fixture unavailable");
    await page.goto("/uk/admin", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/uk\/admin/);
  });

  test("client can sign in and reach account", async ({ page, clientAuth }) => {
    test.skip(clientAuth.skipped, clientAuth.reason ?? "client fixture unavailable");
    await page.goto("/uk/account", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/uk\/account/);
  });

  test("loginAs helper works in non-fixture flow", async ({ page }) => {
    const result = await loginAs(page, "client", { locale: "uk" });
    test.skip(result.skipped, result.reason ?? "client login unavailable");
    await expect(page).toHaveURL(/\/uk\/account/);
  });
});
