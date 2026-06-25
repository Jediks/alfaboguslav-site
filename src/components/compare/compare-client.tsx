"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ShoppingBag, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/catalog/product-image";
import { useCompareStore } from "@/stores/compare-store";
import { useCartStore } from "@/stores/cart-store";
import { getProductTitle } from "@/lib/data/product-utils";
import { formatPrice } from "@/lib/pricing";
import type { PricingTier, Product } from "@/types/database";

type CompareClientProps = {
  products: Product[];
  pricingByProductId: Record<string, PricingTier[]>;
};

export function CompareClient({ products, pricingByProductId }: CompareClientProps) {
  const t = useTranslations("catalog.compare");
  const tCatalog = useTranslations("catalog");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);
  const [mounted, setMounted] = useState(false);

  const addToCart = (product: Product) => {
    const minQty = pricingByProductId[product.id]?.[0]?.min_quantity ?? 1;
    addItem({ productId: product.id, quantity: minQty });
    toast.success(t("addedToCart", { name: getProductTitle(product, locale) }));
  };

  useEffect(() => setMounted(true), []);

  const selected = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  if (!mounted) return null;

  if (selected.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-brand-blue">{t("title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("empty")}</p>
        <Link href="/catalog" className="mt-8 inline-block">
          <Button>{t("browse")}</Button>
        </Link>
      </div>
    );
  }

  const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
    {
      label: tCommon("from"),
      render: (p) =>
        formatPrice(pricingByProductId[p.id]?.[0]?.price ?? 0, localeStr),
    },
    {
      label: tCatalog("packaging"),
      render: (p) => tCatalog(`packagingTypes.${p.packaging_type}`),
    },
    { label: tCatalog("weight"), render: (p) => `${p.weight_grams} г` },
    {
      label: t("tags"),
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.b2b_tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      label: t("sweetsCount"),
      render: (p) => `${p.composition.length}`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-brand-blue">{t("title")}</h1>
        <Link href="/catalog">
          <Button variant="outline">{t("browse")}</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-32" />
              {selected.map((p) => (
                <th key={p.id} className="min-w-[200px] p-3 align-top">
                  <div className="relative rounded-2xl bg-white p-3 premium-shadow">
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      title={t("remove")}
                      className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1 text-muted-foreground shadow-sm hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <Link href={`/catalog/${p.id}`}>
                      <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                        <ProductImage
                          src={p.images[0]}
                          alt={getProductTitle(p, locale)}
                          sizes="200px"
                          variant="card"
                          size="large"
                        />
                      </div>
                      <p className="mt-3 text-left font-display text-sm font-semibold leading-snug text-brand-blue">
                        {getProductTitle(p, locale)}
                      </p>
                    </Link>
                    <Button
                      size="sm"
                      className="mt-3 w-full gap-1.5"
                      onClick={() => addToCart(p)}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {t("addToCart")}
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-cream/40" : ""}>
                <td className="p-3 text-sm font-medium text-muted-foreground">
                  {row.label}
                </td>
                {selected.map((p) => (
                  <td key={p.id} className="p-3 text-sm text-foreground">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
