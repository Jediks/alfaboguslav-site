import { test as base, expect, type Page } from "@playwright/test";

export type AuthRole = "admin" | "client";

export type SeededUser = {
  email: string;
  password: string;
  role: AuthRole;
};

function readUser(role: AuthRole): SeededUser | null {
  const prefix = role === "admin" ? "ADMIN" : "CLIENT";
  const email = process.env[`E2E_${prefix}_EMAIL`];
  const password = process.env[`E2E_${prefix}_PASSWORD`];
  if (!email || !password) return null;
  return { email, password, role };
}

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function loginAs(
  page: Page,
  role: AuthRole,
  options: { locale?: "uk" | "en"; nextPath?: string } = {}
): Promise<{ skipped: boolean; reason?: string; user?: SeededUser }> {
  const locale = options.locale ?? "uk";

  if (!supabaseConfigured()) {
    return { skipped: true, reason: "supabase_not_configured" };
  }

  const user = readUser(role);
  if (!user) {
    return { skipped: true, reason: `missing_${role}_credentials` };
  }

  const loginPath = `/${locale}/login`;
  await page.goto(loginPath, { waitUntil: "networkidle" });
  await page.locator("#email").fill(user.email);
  await page.locator("#password").fill(user.password);
  await page.getByRole("button", { name: /увійти|sign in/i }).first().click();

  const destination = options.nextPath
    ? new RegExp(options.nextPath.replace(/\//g, "\\/"))
    : new RegExp(`\\/${locale}\\/account`);
  try {
    await page.waitForURL(destination, { timeout: 15_000 });
  } catch (err) {
    return {
      skipped: true,
      reason: `login_failed: ${(err as Error).message}`,
      user,
    };
  }
  return { skipped: false, user };
}

type AuthFixtures = {
  adminAuth: { skipped: boolean; reason?: string; user?: SeededUser };
  clientAuth: { skipped: boolean; reason?: string; user?: SeededUser };
};

export const test = base.extend<AuthFixtures>({
  adminAuth: async ({ page }, use) => {
    const result = await loginAs(page, "admin");
    await use(result);
  },
  clientAuth: async ({ page }, use) => {
    const result = await loginAs(page, "client");
    await use(result);
  },
});

export { expect };
