import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CartClient } from "@/components/cart/cart-client";
import { getPricingTiers, getProducts } from "@/lib/data/products";
import { getPageMetadata } from "@/lib/metadata/get-page-metadata";
import type { PricingTier } from "@/types/database";

type CartPageProps = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: CartPageProps): Promise<Metadata> {
  return getPageMetadata({ locale, page: "cart", path: "/cart", noIndex: true });
}

export default async function CartPage({ params: { locale } }: CartPageProps) {
  setRequestLocale(locale);
  const products = await getProducts();
  const pricingEntries = await Promise.all(
    products.map(async (product) => [product.id, await getPricingTiers(product.id)] as const)
  );
  const pricingByProductId: Record<string, PricingTier[]> = Object.fromEntries(pricingEntries);

  return <CartClient products={products} pricingByProductId={pricingByProductId} />;
}
