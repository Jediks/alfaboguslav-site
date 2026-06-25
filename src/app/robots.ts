import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

const PRIVATE_SEGMENTS = [
  "admin",
  "account",
  "checkout",
  "cart",
  "login",
  "register",
  "preview",
  "thank-you",
] as const;

function privatePaths(): string[] {
  const paths: string[] = [];
  for (const locale of routing.locales) {
    for (const segment of PRIVATE_SEGMENTS) {
      paths.push(`/${locale}/${segment}`);
      paths.push(`/${locale}/${segment}/`);
    }
  }
  return paths;
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: privatePaths(),
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
