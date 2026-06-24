import { setRequestLocale } from "next-intl/server";
import { ProductForm } from "@/components/admin/product-form";

type NewProductPageProps = {
  params: { locale: string };
};

export const dynamic = "force-dynamic";

export default function NewProductPage({ params: { locale } }: NewProductPageProps) {
  setRequestLocale(locale);
  return <ProductForm mode="create" />;
}
