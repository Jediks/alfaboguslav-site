"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Clock, Package, ShoppingBag, Wallet } from "lucide-react";
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
      <div className="glass rounded-2xl p-5 premium-shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("totalOrders")}</p>
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-2 font-display text-3xl font-bold text-brand-blue">
          {kpis.totalOrders}
        </p>
      </div>

      <div className="glass rounded-2xl p-5 premium-shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("pending")}</p>
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-2 font-display text-3xl font-bold text-brand-blue">{kpis.pending}</p>
      </div>

      <div className="glass rounded-2xl p-5 premium-shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("active")}</p>
          <Package className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-2 font-display text-3xl font-bold text-brand-blue">{kpis.active}</p>
      </div>

      <div className="glass rounded-2xl p-5 premium-shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("totalSpent")}</p>
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-2 font-display text-2xl font-bold text-brand-blue">
          {formatPrice(kpis.totalSpent, localeStr)}
        </p>
      </div>
    </div>
  );
}
