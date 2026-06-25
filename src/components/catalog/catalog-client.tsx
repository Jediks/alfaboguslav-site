"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type { PricingTier, Product } from "@/types/database";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProductTitle } from "@/lib/data/product-utils";
import { ProductCard } from "./product-card";
import { CompareBar } from "./compare-bar";
import { RecentlyViewed } from "./recently-viewed";
import { QuoteConversionBanner } from "./quote-conversion-banner";
import {
  CatalogFiltersPanel,
  filterProducts,
  getDefaultFilters,
  type CatalogFilters,
} from "./catalog-filters";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

type CatalogClientProps = {
  products: Product[];
  pricingByProductId: Record<string, PricingTier[]>;
};

export function CatalogClient({ products, pricingByProductId }: CatalogClientProps) {
  const t = useTranslations("catalog");
  const locale = useLocale();
  const [filters, setFilters] = useState<CatalogFilters>(() =>
    getDefaultFilters(products, pricingByProductId)
  );
  const [sort, setSort] = useState<SortKey>("featured");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBase = useMemo(() => {
    let list = filterProducts(products, filters, pricingByProductId);
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;
    return list.filter((product) => {
      const title = getProductTitle(product, locale).toLowerCase();
      if (title.includes(query) || product.id.toLowerCase().includes(query)) return true;
      return product.b2b_tags.some((tag) => tag.toLowerCase().includes(query));
    });
  }, [products, filters, pricingByProductId, searchQuery, locale]);

  const filtered = useMemo(() => {
    const minPrice = (id: string) => pricingByProductId[id]?.[0]?.price ?? 0;
    const list = [...filteredBase];
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => minPrice(a.id) - minPrice(b.id));
      case "price-desc":
        return list.sort((a, b) => minPrice(b.id) - minPrice(a.id));
      case "name":
        return list.sort((a, b) =>
          getProductTitle(a, locale).localeCompare(getProductTitle(b, locale))
        );
      default:
        return list;
    }
  }, [filteredBase, sort, pricingByProductId, locale]);

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
          <QuoteConversionBanner />
          <RecentlyViewed
            products={products}
            pricingByProductId={pricingByProductId}
          />
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[220px] flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchLabel")}
                className="pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("results", { count: filtered.length })}
            </p>
            <Select
              value={sort}
              onValueChange={(v) => setSort((v ?? "featured") as SortKey)}
            >
              <SelectTrigger className="w-52" aria-label={t("sort.label")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t("sort.featured")}</SelectItem>
                <SelectItem value="price-asc">{t("sort.priceAsc")}</SelectItem>
                <SelectItem value="price-desc">{t("sort.priceDesc")}</SelectItem>
                <SelectItem value="name">{t("sort.name")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
      <CompareBar />
    </div>
  );
}
