import { createClient } from "@/lib/supabase/server";
import type { Product, PricingTier } from "@/types/database";
import { MOCK_PRODUCTS, MOCK_PRICING } from "./mock-products";
import { hasSupabaseEnv } from "@/lib/supabase/config";
export { getProductTitle, getProductDesc } from "./product-utils";

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42703" || error.message?.includes("column") === true;
}

async function fetchProductsFromDb(publishedOnly: boolean): Promise<Product[]> {
  if (!hasSupabaseEnv()) return MOCK_PRODUCTS;

  try {
    const supabase = await createClient();

    if (publishedOnly) {
      const publishedQuery = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });

      if (!publishedQuery.error) {
        if (!publishedQuery.data?.length) return MOCK_PRODUCTS;
        return publishedQuery.data as Product[];
      }
      if (!isMissingColumnError(publishedQuery.error)) return MOCK_PRODUCTS;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data?.length) return MOCK_PRODUCTS;
    return data as Product[];
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function getProducts(): Promise<Product[]> {
  return fetchProductsFromDb(true);
}

export async function getProductsAdmin(): Promise<Product[]> {
  return fetchProductsFromDb(false);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!hasSupabaseEnv()) {
    return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
    }
    return data as Product;
  } catch {
    return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
  }
}

export async function getPricingTiers(productId: string): Promise<PricingTier[]> {
  if (!hasSupabaseEnv()) {
    return MOCK_PRICING[productId] ?? [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pricing_tiers")
      .select("*")
      .eq("product_id", productId)
      .order("min_quantity", { ascending: true });

    if (error || !data?.length) return MOCK_PRICING[productId] ?? [];
    return data as PricingTier[];
  } catch {
    return MOCK_PRICING[productId] ?? [];
  }
}

export async function getAllPricingTiers(): Promise<Record<string, PricingTier[]>> {
  if (!hasSupabaseEnv()) {
    return MOCK_PRICING;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pricing_tiers")
      .select("*")
      .order("product_id", { ascending: true })
      .order("min_quantity", { ascending: true });

    if (error || !data?.length) return MOCK_PRICING;

    const tiersByProductId: Record<string, PricingTier[]> = {};
    for (const tier of data as PricingTier[]) {
      if (!tiersByProductId[tier.product_id]) {
        tiersByProductId[tier.product_id] = [];
      }
      tiersByProductId[tier.product_id].push(tier);
    }

    return tiersByProductId;
  } catch {
    return MOCK_PRICING;
  }
}
