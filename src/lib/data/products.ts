import { createClient } from "@/lib/supabase/server";
import type { Product, PricingTier } from "@/types/database";
import { MOCK_PRODUCTS, MOCK_PRICING } from "./mock-products";
import { hasSupabaseEnv } from "@/lib/supabase/config";
export { getProductTitle, getProductDesc } from "./product-utils";

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabaseEnv()) return MOCK_PRODUCTS;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data?.length) return MOCK_PRODUCTS;
    return data as Product[];
  } catch {
    return MOCK_PRODUCTS;
  }
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
