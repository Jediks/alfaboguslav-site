import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getProducts } from "@/lib/data/products";
import { getSiteUrl } from "@/lib/site-url";

const PUBLIC_PATHS = ["", "/catalog", "/about", "/contact", "/compare"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const products = await getProducts();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of PUBLIC_PATHS) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "weekly",
        priority: path === "" ? 1 : path === "/catalog" ? 0.9 : 0.7,
      });
    }

    for (const product of products) {
      entries.push({
        url: `${siteUrl}/${locale}/catalog/${product.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
