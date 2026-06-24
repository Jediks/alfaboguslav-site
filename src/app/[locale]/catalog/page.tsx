import { setRequestLocale } from "next-intl/server";
import { getProducts } from "@/lib/data/products";
import { CatalogClient } from "@/components/catalog/catalog-client";

type CatalogPageProps = {
  params: { locale: string };
};

export default async function CatalogPage({ params: { locale } }: CatalogPageProps) {
  setRequestLocale(locale);
  const products = await getProducts();
  return <CatalogClient products={products} />;
}
