"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Clock, Package, ShoppingBag, Wallet } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { formatPrice } from "@/lib/pricing";
import type { OrderStatus } from "@/types/database";

type AccountOrderKpiInput = {
  status: OrderStatus;
  total_estimated_price: number;
};

export function computeAccountKpis(orders: AccountOrderKpiInput[]) {
  let pending = 0;
  let active = 0;
  let totalSpent = 0;

  for (const order of orders) {
    totalSpent += Number(order.total_estimated_price) || 0;
    if (order.status === "pending") pending += 1;
    if (order.status === "confirmed" || order.status === "shipped") active += 1;
  }

  return {
    totalOrders: orders.length,
    pending,
    active,
    totalSpent,
  };
}

type AccountKpiCardsProps = {
  orders: AccountOrderKpiInput[];
};

export function AccountKpiCards({ orders }: AccountKpiCardsProps) {
  const t = useTranslations("account.kpi");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const kpis = useMemo(() => computeAccountKpis(orders), [orders]);

  if (orders.length === 0) return null;

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label={t("totalOrders")} value={kpis.totalOrders} icon={ShoppingBag} hero />
      <StatCard label={t("pending")} value={kpis.pending} icon={Clock} hero />
      <StatCard label={t("active")} value={kpis.active} icon={Package} hero />
      <StatCard
        label={t("totalSpent")}
        value={formatPrice(kpis.totalSpent, localeStr)}
        icon={Wallet}
        hero
      />
    </div>
  );
}
