/**
 * Pure aggregation helpers for the admin dashboard KPIs (Phase 10.1).
 * Operate on a minimal order shape so they work for both Supabase
 * `OrderRecord` and local `LocalOrder` objects.
 */

export interface KpiOrderInput {
  created_at: string;
  total_estimated_price: number;
  items: { productId: string; quantity: number }[];
}

export interface TopProduct {
  productId: string;
  quantity: number;
}

export interface AdminKpis {
  totalOrders: number;
  ordersThisWeek: number;
  ordersPriorWeek: number;
  ordersDeltaPct: number | null;
  revenueThisWeek: number;
  topProducts: TopProduct[];
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function parseTime(value: string): number {
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Compute dashboard KPIs over a rolling 7-day window.
 * @param now reference timestamp (ms) — injectable for deterministic tests.
 */
export function computeAdminKpis(
  orders: KpiOrderInput[],
  now: number = Date.now(),
  topLimit = 3
): AdminKpis {
  const weekAgo = now - WEEK_MS;
  const twoWeeksAgo = now - 2 * WEEK_MS;

  let ordersThisWeek = 0;
  let ordersPriorWeek = 0;
  let revenueThisWeek = 0;
  const quantityByProduct = new Map<string, number>();

  for (const order of orders) {
    const created = parseTime(order.created_at);
    if (created >= weekAgo && created <= now) {
      ordersThisWeek += 1;
      revenueThisWeek += Number(order.total_estimated_price) || 0;
    } else if (created >= twoWeeksAgo && created < weekAgo) {
      ordersPriorWeek += 1;
    }

    for (const item of order.items ?? []) {
      const prev = quantityByProduct.get(item.productId) ?? 0;
      quantityByProduct.set(item.productId, prev + (Number(item.quantity) || 0));
    }
  }

  const ordersDeltaPct =
    ordersPriorWeek > 0
      ? Math.round(((ordersThisWeek - ordersPriorWeek) / ordersPriorWeek) * 100)
      : ordersThisWeek > 0
        ? 100
        : null;

  const topProducts: TopProduct[] = Array.from(quantityByProduct.entries())
    .map(([productId, quantity]) => ({ productId, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, topLimit);

  return {
    totalOrders: orders.length,
    ordersThisWeek,
    ordersPriorWeek,
    ordersDeltaPct,
    revenueThisWeek,
    topProducts,
  };
}
