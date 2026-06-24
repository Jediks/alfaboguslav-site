import { setRequestLocale } from "next-intl/server";
import { AdminClient } from "@/components/admin/admin-client";
import { fetchOrdersAdmin } from "@/lib/actions/orders";
import { fetchQuotesAdmin } from "@/lib/actions/quotes";
import { hasSupabaseAdmin } from "@/lib/supabase/config";

type AdminPageProps = {
  params: { locale: string };
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ params: { locale } }: AdminPageProps) {
  setRequestLocale(locale);
  const supabaseEnabled = hasSupabaseAdmin();
  const [supabaseOrders, supabaseQuotes] = supabaseEnabled
    ? await Promise.all([fetchOrdersAdmin(), fetchQuotesAdmin()])
    : [[], []];

  return (
    <AdminClient
      supabaseOrders={supabaseOrders}
      supabaseQuotes={supabaseQuotes}
      supabaseEnabled={supabaseEnabled}
    />
  );
}
