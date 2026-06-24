import { setRequestLocale } from "next-intl/server";
import { AdminOrderDetail } from "@/components/admin/admin-order-detail";
import { fetchOrderByReference } from "@/lib/actions/orders";
import { hasSupabaseAdmin } from "@/lib/supabase/config";

type AdminOrderPageProps = {
  params: { locale: string; id: string };
};

export default async function AdminOrderPage({ params: { locale, id } }: AdminOrderPageProps) {
  setRequestLocale(locale);

  let order = null;
  if (hasSupabaseAdmin()) {
    order = await fetchOrderByReference(id);
  }

  return <AdminOrderDetail serverOrder={order} referenceId={id} />;
}
