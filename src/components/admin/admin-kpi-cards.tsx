"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ShoppingBag,
  CreditCard,
  Package,
  Award,
  ArrowUpRight,
  TrendingDown,
  FileText,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { computeAdminKpis, type KpiOrderInput } from "@/lib/data/admin-kpis";
import { getProductTitle } from "@/lib/data/product-utils";
import { formatPrice } from "@/lib/pricing";
import type { Product } from "@/types/database";

type AdminKpiCardsProps = {
  orders: KpiOrderInput[];
  products: Product[];
  quotesThisWeek?: number;
};

export function AdminKpiCards({ orders, products, quotesThisWeek }: AdminKpiCardsProps) {
  const t = useTranslations("admin.kpi");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";

  const kpis = useMemo(() => computeAdminKpis(orders), [orders]);
  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const topProduct = kpis.topProducts[0];
  const topProductLabel = topProduct
    ? (() => {
        const p = productById.get(topProduct.productId);
        const name = p ? getProductTitle(p, locale) : topProduct.productId;
        return `${name} · ${topProduct.quantity} ${t("units")}`;
      })()
    : t("noData");

  const delta = kpis.ordersDeltaPct;
  const deltaPositive = delta !== null && delta >= 0;

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label={t("ordersThisWeek")}
        value={kpis.ordersThisWeek}
        icon={ShoppingBag}
        hero
        hint={
          delta !== null ? (
            <p
              className={`flex items-center gap-1 text-xs font-medium tabular-nums ${
                deltaPositive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {deltaPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {deltaPositive ? "+" : ""}
              {delta}% {t("vsPriorWeek")}
            </p>
          ) : undefined
        }
      />
      <StatCard
        label={t("revenueThisWeek")}
        value={formatPrice(kpis.revenueThisWeek, localeStr)}
        icon={CreditCard}
        hero
      />
      <StatCard
        label={t("totalOrders")}
        value={kpis.totalOrders}
        icon={Package}
        hero
      />
      <StatCard
        label={t("topSet")}
        value={<span className="text-base font-semibold leading-snug">{topProductLabel}</span>}
        icon={Award}
      />
      {typeof quotesThisWeek === "number" && (
        <StatCard
          label={t("quotesThisWeek")}
          value={quotesThisWeek}
          icon={FileText}
          hero
        />
      )}
    </div>
  );
}
