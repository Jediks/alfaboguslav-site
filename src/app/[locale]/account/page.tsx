import { setRequestLocale } from "next-intl/server";
import { AccountClient } from "@/components/account/account-client";
import { fetchOrdersByEmail } from "@/lib/actions/orders";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

type AccountPageProps = {
  params: { locale: string };
};

export default async function AccountPage({ params: { locale } }: AccountPageProps) {
  setRequestLocale(locale);

  let supabaseOrders: Awaited<ReturnType<typeof fetchOrdersByEmail>> = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      supabaseOrders = await fetchOrdersByEmail(user.email);
    }
  }

  return <AccountClient supabaseOrders={supabaseOrders} />;
}
