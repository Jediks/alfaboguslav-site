"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { hasSupabaseAdmin } from "@/lib/supabase/config";
import type { PackagingType, SweetCompositionItem } from "@/types/database";

export type ProductFormInput = {
  id: string;
  title_uk: string;
  title_en: string;
  desc_uk: string;
  desc_en: string;
  images: string[];
  packaging_type: PackagingType;
  composition: SweetCompositionItem[];
  weight_grams: number;
  b2b_tags: string[];
  sweet_types: string[];
  is_published: boolean;
  sort_order: number;
  tiers: { min_quantity: number; price: number }[];
};

function slugifyId(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createProduct(input: ProductFormInput): Promise<{ ok: true; id: string }> {
  await requireAdmin();
  if (!hasSupabaseAdmin()) throw new Error("Supabase admin not configured");

  const id = slugifyId(input.id);
  if (!id) throw new Error("Invalid product id");

  const supabase = createAdminClient();

  const { error } = await supabase.from("products").insert({
    id,
    title_uk: input.title_uk,
    title_en: input.title_en,
    desc_uk: input.desc_uk,
    desc_en: input.desc_en,
    images: input.images,
    packaging_type: input.packaging_type,
    composition: input.composition,
    weight_grams: input.weight_grams,
    b2b_tags: input.b2b_tags,
    sweet_types: input.sweet_types,
    is_published: input.is_published,
    sort_order: input.sort_order,
    updated_at: new Date().toISOString(),
  } as never);

  if (error) throw new Error(error.message);

  if (input.tiers.length > 0) {
    const { error: tierError } = await supabase.from("pricing_tiers").insert(
      input.tiers.map((t) => ({
        id: `${id}-tier-${t.min_quantity}`,
        product_id: id,
        min_quantity: t.min_quantity,
        price: t.price,
      })) as never
    );
    if (tierError) throw new Error(tierError.message);
  }

  revalidatePath("/uk/catalog");
  revalidatePath("/en/catalog");
  revalidatePath("/uk/admin/products");
  return { ok: true, id };
}

export async function updateProduct(input: ProductFormInput): Promise<{ ok: true }> {
  await requireAdmin();
  if (!hasSupabaseAdmin()) throw new Error("Supabase admin not configured");

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({
      title_uk: input.title_uk,
      title_en: input.title_en,
      desc_uk: input.desc_uk,
      desc_en: input.desc_en,
      images: input.images,
      packaging_type: input.packaging_type,
      composition: input.composition,
      weight_grams: input.weight_grams,
      b2b_tags: input.b2b_tags,
      sweet_types: input.sweet_types,
      is_published: input.is_published,
      sort_order: input.sort_order,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", input.id);

  if (error) throw new Error(error.message);

  await supabase.from("pricing_tiers").delete().eq("product_id", input.id);

  if (input.tiers.length > 0) {
    const { error: tierError } = await supabase.from("pricing_tiers").insert(
      input.tiers.map((t) => ({
        id: `${input.id}-tier-${t.min_quantity}`,
        product_id: input.id,
        min_quantity: t.min_quantity,
        price: t.price,
      })) as never
    );
    if (tierError) throw new Error(tierError.message);
  }

  revalidatePath("/uk/catalog");
  revalidatePath("/en/catalog");
  revalidatePath(`/uk/catalog/${input.id}`);
  revalidatePath(`/en/catalog/${input.id}`);
  revalidatePath("/uk/admin/products");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<{ ok: true }> {
  await requireAdmin();
  if (!hasSupabaseAdmin()) throw new Error("Supabase admin not configured");

  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/uk/catalog");
  revalidatePath("/uk/admin/products");
  return { ok: true };
}
