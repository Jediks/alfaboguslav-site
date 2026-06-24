"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { PricingTier, Product } from "@/types/database";
import { ProductCard } from "./product-card";
import {
  CatalogFiltersPanel,
  filterProducts,
  getDefaultFilters,
  type CatalogFilters,
} from "./catalog-filters";

type CatalogClientProps = {
  products: Product[];
  pricingByProductId: Record<string, PricingTier[]>;
};

export function CatalogClient({ products, pricingByProductId }: CatalogClientProps) {
  const t = useTranslations("catalog");
  const [filters, setFilters] = useState<CatalogFilters>(() =>
    getDefaultFilters(products, pricingByProductId)
  );

  const filtered = filterProducts(products, filters, pricingByProductId);

  return (
    <div className="min-h-screen">
      <div className="relative -mt-[5.75rem] overflow-hidden bg-brand-blue px-4 pb-16 pt-[calc(5.75rem+2rem)] text-white grain md:-mt-[6.25rem] md:pb-24 md:pt-[calc(6.25rem+2.5rem)]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-blue/50" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
            {t("label")}
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-7xl">{t("title")}</h1>
          <p className="mt-4 max-w-xl text-lg text-white/60">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <CatalogFiltersPanel
          products={products}
          pricingByProductId={pricingByProductId}
          filters={filters}
          onChange={setFilters}
        />

        <div>
          <p className="mb-6 text-sm text-muted-foreground">
            {t("results", { count: filtered.length })}
          </p>

          {filtered.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-border bg-white/50">
              <p className="text-muted-foreground">{t("noResults")}</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  pricingByProductId={pricingByProductId}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
