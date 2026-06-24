import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { Order, OrderItem, OrderStatus, PaymentMethod } from "@/types/database";

export type OrderRecord = {
  id: string;
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
  created_at: string;
  items: { productId: string; quantity: number; price_at_time: number; brandingLogoUrl?: string }[];
};

function mapOrder(
  order: {
    id: string;
    reference_id: string | null;
    status: OrderStatus;
    total_estimated_price: number;
    payment_method: PaymentMethod;
    delivery_address: string;
    company_name: string | null;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    branding_logo_url: string | null;
    created_at: string;
  },
  items: {
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_time: number;
    branding_logo_url: string | null;
  }[]
): OrderRecord {
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
    items: items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        price_at_time: Number(item.price_at_time),
        brandingLogoUrl: item.branding_logo_url ?? undefined,
      })),
  };
}

export async function fetchOrderForUser(referenceId: string): Promise<OrderRecord | null> {
  const cleanReference = referenceId.trim();
  if (!hasSupabaseEnv() || !cleanReference) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? null;
  if (!userId) return null;

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("reference_id", cleanReference)
    .eq("user_id", userId)
    .maybeSingle<Order>();

  if (error || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return mapOrder(order, (items ?? []) as OrderItem[]);
}

export async function fetchOrdersByEmail(email: string): Promise<OrderRecord[]> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!hasSupabaseEnv() || !normalizedEmail) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? null;
  if (!userId) return [];

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .ilike("contact_email", normalizedEmail)
    .order("created_at", { ascending: false })
    .returns<Order[]>();

  if (error || !orders?.length) return [];

  const orderIds = orders.map((order) => order.id);
  const { data: items } = await supabase.from("order_items").select("*").in("order_id", orderIds);

  return orders.map((order) => mapOrder(order, items ?? []));
}
