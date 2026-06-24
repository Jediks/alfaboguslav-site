import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getProductById, getPricingTiers } from "@/lib/data/products";
import { ProductDetailClient } from "@/components/product/product-detail-client";

type ProductPageProps = {
  params: { locale: string; id: string };
};

export default async function ProductPage({
  params: { locale, id },
}: ProductPageProps) {
  setRequestLocale(locale);
  const product = await getProductById(id);
  if (!product) notFound();

  const tiers = await getPricingTiers(id);
  return <ProductDetailClient product={product} tiers={tiers} />;
}
