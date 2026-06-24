"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { notifyNewOrder } from "@/lib/email/notify";
import type { OrderRecord } from "@/lib/data/orders";
import type { OrderStatus, PaymentMethod } from "@/types/database";

export type SubmitOrderInput = {
  referenceId: string;
  status: OrderStatus;
  total_estimated_price: number;
  payment_method: PaymentMethod;
  delivery_address: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  branding_logo_url: string | null;
  items: { productId: string; quantity: number; price_at_time: number; brandingLogoUrl?: string }[];
};

export type { OrderRecord } from "@/lib/data/orders";

export async function submitOrder(
  input: SubmitOrderInput
): Promise<{ ok: true; referenceId: string; persisted: "supabase" | "local" }> {
  if (!hasSupabaseAdmin()) {
    return { ok: true, referenceId: input.referenceId, persisted: "local" };
  }

  let userId: string | null = null;
  try {
    const userScopedClient = await createClient();
    const {
      data: { user },
    } = await userScopedClient.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      reference_id: input.referenceId,
      user_id: userId,
      status: input.status,
      total_estimated_price: input.total_estimated_price,
      payment_method: input.payment_method,
      delivery_address: input.delivery_address,
      company_name: input.company_name,
      contact_name: input.contact_name,
      contact_email: input.contact_email,
      contact_phone: input.contact_phone,
      branding_logo_url: input.branding_logo_url,
    } as never)
    .select("id")
    .single<{ id: string }>();

  if (orderError || !order) {
    console.error("[submitOrder]", orderError);
    throw new Error("Failed to save order");
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_time: item.price_at_time,
      branding_logo_url: item.brandingLogoUrl ?? null,
    })) as never
  );

  if (itemsError) {
    console.error("[submitOrder items]", itemsError);
    throw new Error("Failed to save order items");
  }

  await notifyNewOrder({
    referenceId: input.referenceId,
    companyName: input.company_name,
    contactName: input.contact_name,
    contactEmail: input.contact_email,
    contactPhone: input.contact_phone,
    total: input.total_estimated_price,
    itemCount: input.items.length,
  });

  return { ok: true, referenceId: input.referenceId, persisted: "supabase" };
}

export async function fetchOrdersAdmin(): Promise<OrderRecord[]> {
  if (!hasSupabaseAdmin()) return [];

  const supabase = createAdminClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !orders) {
    console.error("[fetchOrdersAdmin]", error);
    return [];
  }

  const { data: items } = await supabase.from("order_items").select("*");

  return orders.map((o) => ({
    id: o.id,
    referenceId: o.reference_id ?? o.id,
    status: o.status,
    total_estimated_price: Number(o.total_estimated_price),
    payment_method: o.payment_method,
    delivery_address: o.delivery_address,
    company_name: o.company_name ?? "",
    contact_name: o.contact_name ?? "",
    contact_email: o.contact_email ?? "",
    contact_phone: o.contact_phone ?? "",
    branding_logo_url: o.branding_logo_url,
    created_at: o.created_at,
    items: (items ?? [])
      .filter((i) => i.order_id === o.id)
      .map((i) => ({
        productId: i.product_id,
        quantity: i.quantity,
        price_at_time: Number(i.price_at_time),
        brandingLogoUrl: i.branding_logo_url ?? undefined,
      })),
  }));
}

export async function fetchOrderByReference(referenceId: string): Promise<OrderRecord | null> {
  if (!hasSupabaseAdmin()) return null;

  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("reference_id", referenceId)
    .maybeSingle();

  if (error || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return {
    id: order.id,
    referenceId: order.reference_id ?? order.id,
    status: order.status,
    total_estimated_price: Number(order.total_estimated_price),
    payment_method: order.payment_method,
    delivery_address: order.delivery_address,
    company_name: order.company_name ?? "",
    contact_name: order.contact_name ?? "",
    contact_email: order.contact_email ?? "",
    contact_phone: order.contact_phone ?? "",
    branding_logo_url: order.branding_logo_url,
    created_at: order.created_at,
    items: (items ?? []).map((i) => ({
      productId: i.product_id,
      quantity: i.quantity,
      price_at_time: Number(i.price_at_time),
      brandingLogoUrl: i.branding_logo_url ?? undefined,
    })),
  };
}

export async function fetchOrdersByEmail(email: string): Promise<OrderRecord[]> {
  if (!hasSupabaseAdmin() || !email.trim()) return [];

  const supabase = createAdminClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .ilike("contact_email", email.trim())
    .order("created_at", { ascending: false });

  if (error || !orders) return [];

  const { data: items } = await supabase.from("order_items").select("*");

  return orders.map((o) => ({
    id: o.id,
    referenceId: o.reference_id ?? o.id,
    status: o.status,
    total_estimated_price: Number(o.total_estimated_price),
    payment_method: o.payment_method,
    delivery_address: o.delivery_address,
    company_name: o.company_name ?? "",
    contact_name: o.contact_name ?? "",
    contact_email: o.contact_email ?? "",
    contact_phone: o.contact_phone ?? "",
    branding_logo_url: o.branding_logo_url,
    created_at: o.created_at,
    items: (items ?? [])
      .filter((i) => i.order_id === o.id)
      .map((i) => ({
        productId: i.product_id,
        quantity: i.quantity,
        price_at_time: Number(i.price_at_time),
        brandingLogoUrl: i.branding_logo_url ?? undefined,
      })),
  }));
}

export async function updateOrderStatusAdmin(
  referenceId: string,
  status: OrderStatus
): Promise<{ ok: boolean }> {
  if (!hasSupabaseAdmin()) return { ok: false };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("reference_id", referenceId);

  if (error) {
    console.error("[updateOrderStatusAdmin]", error);
    return { ok: false };
  }
  return { ok: true };
}
