import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getProductById, getPricingTiers, getProducts } from "@/lib/data/products";
import { getProductTitle, getProductDesc } from "@/lib/data/product-utils";
import { buildPageMetadata } from "@/lib/metadata/build-page-metadata";
import { toAbsoluteAssetUrl } from "@/lib/site-url";
import { ProductDetailClient } from "@/components/product/product-detail-client";

type ProductPageProps = {
  params: { locale: string; id: string };
};

export async function generateStaticParams() {
  const products = await getProducts();
  return routing.locales.flatMap((locale) =>
    products.map((product) => ({ locale, id: product.id }))
  );
}

export async function generateMetadata({
  params: { locale, id },
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductById(id);
  if (!product) return {};

  const t = await getTranslations({ locale, namespace: "pageMetadata" });
  const name = getProductTitle(product, locale);
  const description = getProductDesc(product, locale);

  return buildPageMetadata({
    locale,
    path: `/catalog/${id}`,
    title: t("productTitle", { name }),
    description: t("productDescription", { description }),
    image: product.images[0] ? toAbsoluteAssetUrl(product.images[0]) : undefined,
  });
}

export default async function ProductPage({
  params: { locale, id },
}: ProductPageProps) {
  setRequestLocale(locale);
  const product = await getProductById(id);
  if (!product) notFound();

  const tiers = await getPricingTiers(id);
  return <ProductDetailClient product={product} tiers={tiers} />;
}
