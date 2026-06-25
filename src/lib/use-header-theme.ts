"use client";

import { usePathname } from "@/i18n/navigation";

const LIGHT_PREFIXES = [
  "/cart",
  "/checkout",
  "/account",
  "/register",
  "/login",
  "/thank-you",
  "/admin",
  "/about",
  "/contact",
];

/** Pages with cream/light background where header should start in light mode. */
export function useHeaderLightPage(): boolean {
  const pathname = usePathname();
  if (LIGHT_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return /^\/catalog\/[^/]+$/.test(pathname);
}
