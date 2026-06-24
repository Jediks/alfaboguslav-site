import type { User } from "@supabase/supabase-js";
import { routing, type Locale } from "@/i18n/routing";
import type { UserRole } from "@/types/database";

const localeSet = new Set<string>(routing.locales);

function matchesSection(pathnameWithoutLocale: string, section: string): boolean {
  return (
    pathnameWithoutLocale === section ||
    pathnameWithoutLocale.startsWith(`${section}/`)
  );
}

export function getPathLocale(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  if (segment && localeSet.has(segment)) {
    return segment as Locale;
  }
  return null;
}

export function stripLocaleFromPath(pathname: string): string {
  const locale = getPathLocale(pathname);
  if (!locale) return pathname;

  const withoutLocale = pathname.slice(`/${locale}`.length);
  return withoutLocale || "/";
}

export function getLocaleForPath(pathname: string): Locale {
  return getPathLocale(pathname) ?? routing.defaultLocale;
}

export function isPublicAuthPath(pathname: string): boolean {
  if (pathname.startsWith("/auth/callback")) return true;

  const locale = getPathLocale(pathname);
  if (!locale) return false;

  const pathWithoutLocale = stripLocaleFromPath(pathname);
  return pathWithoutLocale === "/login" || pathWithoutLocale === "/register";
}

export function isAccountPath(pathname: string): boolean {
  const locale = getPathLocale(pathname);
  if (!locale) return false;
  return matchesSection(stripLocaleFromPath(pathname), "/account");
}

export function isAdminPath(pathname: string): boolean {
  const locale = getPathLocale(pathname);
  if (!locale) return false;
  return matchesSection(stripLocaleFromPath(pathname), "/admin");
}

export function getLoginRedirectPath(locale: Locale, nextPath: string): string {
  return `/${locale}/login?next=${encodeURIComponent(nextPath)}`;
}

export function isAdminRole(
  role: UserRole | null | undefined,
  user?: User | null
): boolean {
  if (role === "admin") return true;
  const metadataRole = user?.app_metadata?.role;
  return metadataRole === "admin";
}
