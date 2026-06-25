"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ProductCard } from "./product-card";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import type { PricingTier, Product } from "@/types/database";

type RecentlyViewedProps = {
  products: Product[];
  pricingByProductId: Record<string, PricingTier[]>;
};

export function RecentlyViewed({ products, pricingByProductId }: RecentlyViewedProps) {
  const t = useTranslations("catalog");
  const ids = useRecentlyViewedStore((s) => s.ids);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const recent = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  if (recent.length === 0) return null;

  return (
    <section className="mb-10 border-b border-border/50 pb-10">
      <h2 className="mb-6 font-display text-xl font-semibold text-brand-blue">
        {t("recentlyViewed")}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {recent.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            pricingByProductId={pricingByProductId}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
