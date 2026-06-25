import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CheckoutClient } from "@/components/checkout/checkout-client";
import { getPricingTiers, getProducts } from "@/lib/data/products";
import { getPageMetadata } from "@/lib/metadata/get-page-metadata";
import { hasSupabaseAdmin, hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { PricingTier } from "@/types/database";

type CheckoutPageProps = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: CheckoutPageProps): Promise<Metadata> {
  return getPageMetadata({ locale, page: "checkout", path: "/checkout", noIndex: true });
}

export default async function CheckoutPage({ params: { locale } }: CheckoutPageProps) {
  setRequestLocale(locale);
  const products = await getProducts();
  const pricingEntries = await Promise.all(
    products.map(async (product) => [product.id, await getPricingTiers(product.id)] as const)
  );
  const pricingByProductId: Record<string, PricingTier[]> = Object.fromEntries(pricingEntries);

  let profilePrefill:
    | {
        companyName?: string;
        contactName?: string;
        contactEmail?: string;
        contactPhone?: string;
      }
    | undefined;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("company_name")
        .eq("id", user.id)
        .maybeSingle<{ company_name: string | null }>();

      const metadata = user.user_metadata as Record<string, unknown> | null;
      const metadataName =
        metadata && typeof metadata.full_name === "string" ? metadata.full_name : "";
      const metadataPhone = metadata && typeof metadata.phone === "string" ? metadata.phone : "";

      profilePrefill = {
        companyName: profile?.company_name ?? "",
        contactName: metadataName,
        contactEmail: user.email ?? "",
        contactPhone: user.phone ?? metadataPhone,
      };
    }
  }

  return (
    <CheckoutClient
      pricingByProductId={pricingByProductId}
      profilePrefill={profilePrefill}
      remotePersistenceEnabled={hasSupabaseAdmin()}
    />
  );
}
