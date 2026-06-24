"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider, readSliderRange } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { Product, PackagingType } from "@/types/database";
import { PACKAGING_TYPES, SWEET_TYPES } from "@/lib/data/mock-products";
import { MOCK_PRICING } from "@/lib/data/mock-products";

export type CatalogFilters = {
  weightRange: [number, number];
  priceRange: [number, number];
  packaging: PackagingType[];
  sweetTypes: string[];
};

type CatalogFiltersPanelProps = {
  products: Product[];
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
};

export function getDefaultFilters(products: Product[]): CatalogFilters {
  const weights = products.map((p) => p.weight_grams);
  const prices = products.flatMap((p) => MOCK_PRICING[p.id]?.map((t) => t.price) ?? [0]);
  return {
    weightRange: [Math.min(...weights), Math.max(...weights)],
    priceRange: [Math.min(...prices), Math.max(...prices)],
    packaging: [],
    sweetTypes: [],
  };
}

export function filterProducts(products: Product[], filters: CatalogFilters): Product[] {
  return products.filter((p) => {
    const minPrice = MOCK_PRICING[p.id]?.[0]?.price ?? 0;
    if (p.weight_grams < filters.weightRange[0] || p.weight_grams > filters.weightRange[1])
      return false;
    if (minPrice < filters.priceRange[0] || minPrice > filters.priceRange[1]) return false;
    if (filters.packaging.length && !filters.packaging.includes(p.packaging_type))
      return false;
    if (
      filters.sweetTypes.length &&
      !filters.sweetTypes.some((st) => p.sweet_types.includes(st))
    )
      return false;
    return true;
  });
}

export function CatalogFiltersPanel({
  products,
  filters,
  onChange,
}: CatalogFiltersPanelProps) {
  const t = useTranslations("catalog");
  const defaults = useMemo(() => getDefaultFilters(products), [products]);

  const togglePackaging = (type: PackagingType) => {
    const next = filters.packaging.includes(type)
      ? filters.packaging.filter((p) => p !== type)
      : [...filters.packaging, type];
    onChange({ ...filters, packaging: next });
  };

  const toggleSweet = (type: string) => {
    const next = filters.sweetTypes.includes(type)
      ? filters.sweetTypes.filter((s) => s !== type)
      : [...filters.sweetTypes, type];
    onChange({ ...filters, sweetTypes: next });
  };

  return (
    <div className="glass sticky top-24 rounded-3xl p-6 premium-shadow">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display font-semibold text-brand-blue">
          <SlidersHorizontal className="h-4 w-4" />
          {t("filters")}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(defaults)}
          className="gap-1 text-xs text-muted-foreground"
        >
          <RotateCcw className="h-3 w-3" />
          {t("resetFilters")}
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="mb-3 block text-sm">{t("weight")}</Label>
          <Slider
            min={defaults.weightRange[0]}
            max={defaults.weightRange[1]}
            step={50}
            value={filters.weightRange}
            onValueChange={(v) =>
              onChange({ ...filters, weightRange: readSliderRange(v) })
            }
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{filters.weightRange[0]}g</span>
            <span>{filters.weightRange[1]}g</span>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="mb-3 block text-sm">{t("price")}</Label>
          <Slider
            min={defaults.priceRange[0]}
            max={defaults.priceRange[1]}
            step={50}
            value={filters.priceRange}
            onValueChange={(v) =>
              onChange({ ...filters, priceRange: readSliderRange(v) })
            }
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{filters.priceRange[0]} ₴</span>
            <span>{filters.priceRange[1]} ₴</span>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="mb-3 block text-sm">{t("packaging")}</Label>
          <div className="space-y-2">
            {PACKAGING_TYPES.map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.packaging.includes(type)}
                  onCheckedChange={() => togglePackaging(type)}
                />
                {t(`packagingTypes.${type}`)}
              </label>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <Label className="mb-3 block text-sm">{t("sweetType")}</Label>
          <div className="space-y-2">
            {SWEET_TYPES.map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.sweetTypes.includes(type)}
                  onCheckedChange={() => toggleSweet(type)}
                />
                {t(`sweetTypes.${type}`)}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
