import { setRequestLocale } from "next-intl/server";
import { getPricingTiers, getProducts } from "@/lib/data/products";
import { CatalogClient } from "@/components/catalog/catalog-client";
import type { PricingTier } from "@/types/database";

type CatalogPageProps = {
  params: { locale: string };
};

export default async function CatalogPage({ params: { locale } }: CatalogPageProps) {
  setRequestLocale(locale);
  const products = await getProducts();
  const pricingEntries = await Promise.all(
    products.map(async (product) => [product.id, await getPricingTiers(product.id)] as const)
  );
  const pricingByProductId: Record<string, PricingTier[]> = Object.fromEntries(pricingEntries);

  return <CatalogClient products={products} pricingByProductId={pricingByProductId} />;
}
