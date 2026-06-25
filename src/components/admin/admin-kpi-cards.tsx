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
      <div className="glass rounded-2xl p-5 premium-shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("ordersThisWeek")}</p>
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-2 font-display text-3xl font-bold text-brand-blue">
          {kpis.ordersThisWeek}
        </p>
        {delta !== null && (
          <p
            className={`mt-1 flex items-center gap-1 text-xs font-medium ${
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
        )}
      </div>

      <div className="glass rounded-2xl p-5 premium-shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("revenueThisWeek")}</p>
          <CreditCard className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-2 font-display text-3xl font-bold text-brand-blue">
          {formatPrice(kpis.revenueThisWeek, localeStr)}
        </p>
      </div>

      <div className="glass rounded-2xl p-5 premium-shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("totalOrders")}</p>
          <Package className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-2 font-display text-3xl font-bold text-brand-blue">
          {kpis.totalOrders}
        </p>
      </div>

      <div className="glass rounded-2xl p-5 premium-shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("topSet")}</p>
          <Award className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-2 text-sm font-semibold leading-snug text-brand-blue">
          {topProductLabel}
        </p>
      </div>

      {typeof quotesThisWeek === "number" && (
        <div className="glass rounded-2xl p-5 premium-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t("quotesThisWeek")}</p>
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-brand-blue">
            {quotesThisWeek}
          </p>
        </div>
      )}
    </div>
  );
}
