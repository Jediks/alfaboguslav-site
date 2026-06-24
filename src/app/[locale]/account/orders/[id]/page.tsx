import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminOrderDetail } from "@/components/admin/admin-order-detail";
import { fetchOrderForUser } from "@/lib/data/orders";
import { getProducts } from "@/lib/data/products";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type AccountOrderPageProps = {
  params: { locale: string; id: string };
};

export default async function AccountOrderPage({ params: { locale, id } }: AccountOrderPageProps) {
  setRequestLocale(locale);
  const products = await getProducts();

  let order = null;
  if (hasSupabaseEnv()) {
    order = await fetchOrderForUser(id);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && !order) {
      notFound();
    }
  }

  return (
    <AdminOrderDetail
      serverOrder={order}
      referenceId={id}
      products={products}
      showInvoiceLink
    />
  );
}
