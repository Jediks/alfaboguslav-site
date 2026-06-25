import { setRequestLocale } from "next-intl/server";
import { AdminClient } from "@/components/admin/admin-client";
import { fetchOrdersAdmin } from "@/lib/actions/orders";
import { fetchQuotesAdmin } from "@/lib/actions/quotes";
import { getAllPricingTiers, getProductsAdmin } from "@/lib/data/products";
import { getAdminContentBlocks } from "@/lib/data/content-blocks";
import { getAuditLog } from "@/lib/data/audit";
import { hasSupabaseAdmin } from "@/lib/supabase/config";

type AdminPageProps = {
  params: { locale: string };
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ params: { locale } }: AdminPageProps) {
  setRequestLocale(locale);
  const supabaseEnabled = hasSupabaseAdmin();
  const [products, pricingMap, supabaseOrders, supabaseQuotes, contentBlocks, auditLog] =
    await Promise.all([
      getProductsAdmin(),
      getAllPricingTiers(),
      supabaseEnabled ? fetchOrdersAdmin() : Promise.resolve([]),
      supabaseEnabled ? fetchQuotesAdmin() : Promise.resolve([]),
      getAdminContentBlocks(),
      supabaseEnabled ? getAuditLog(100) : Promise.resolve([]),
    ]);

  return (
    <AdminClient
      products={products}
      pricingMap={pricingMap}
      supabaseOrders={supabaseOrders}
      supabaseQuotes={supabaseQuotes}
      supabaseEnabled={supabaseEnabled}
      contentBlocks={contentBlocks}
      auditLog={auditLog}
    />
  );
}
