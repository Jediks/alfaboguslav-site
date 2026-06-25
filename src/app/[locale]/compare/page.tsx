import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPricingTiers, getProducts } from "@/lib/data/products";
import { CompareClient } from "@/components/compare/compare-client";
import { getPageMetadata } from "@/lib/metadata/get-page-metadata";
import type { PricingTier } from "@/types/database";

type ComparePageProps = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: ComparePageProps): Promise<Metadata> {
  return getPageMetadata({ locale, page: "compare", path: "/compare" });
}

export default async function ComparePage({ params: { locale } }: ComparePageProps) {
  setRequestLocale(locale);
  const products = await getProducts();
  const pricingEntries = await Promise.all(
    products.map(async (product) => [product.id, await getPricingTiers(product.id)] as const)
  );
  const pricingByProductId: Record<string, PricingTier[]> = Object.fromEntries(pricingEntries);

  return (
    <div className="min-h-screen bg-cream">
      <CompareClient products={products} pricingByProductId={pricingByProductId} />
    </div>
  );
}
