import { setRequestLocale } from "next-intl/server";
import { AdminOrderDetail } from "@/components/admin/admin-order-detail";
import { fetchOrderByReference } from "@/lib/actions/orders";
import { hasSupabaseAdmin } from "@/lib/supabase/config";

type AccountOrderPageProps = {
  params: { locale: string; id: string };
};

export default async function AccountOrderPage({ params: { locale, id } }: AccountOrderPageProps) {
  setRequestLocale(locale);

  let order = null;
  if (hasSupabaseAdmin()) {
    order = await fetchOrderByReference(id);
  }

  return <AdminOrderDetail serverOrder={order} referenceId={id} />;
}
