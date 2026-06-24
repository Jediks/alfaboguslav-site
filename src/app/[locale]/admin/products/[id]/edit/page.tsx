import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById, getPricingTiers } from "@/lib/data/products";

type EditProductPageProps = {
  params: { locale: string; id: string };
};

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params: { locale, id },
}: EditProductPageProps) {
  setRequestLocale(locale);
  const product = await getProductById(id);
  if (!product) notFound();

  const tiers = await getPricingTiers(id);
  const initialTiers = tiers.map((t) => ({
    min_quantity: t.min_quantity,
    price: t.price,
  }));

  return <ProductForm mode="edit" product={product} initialTiers={initialTiers} />;
}
