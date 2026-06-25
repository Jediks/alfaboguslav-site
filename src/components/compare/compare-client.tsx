"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ShoppingBag, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <div className="surface-panel rounded-2xl px-6 py-16">
          <h1 className="font-display text-3xl font-semibold text-brand-blue">{t("title")}</h1>
          <p className="mt-4 text-muted-foreground">{t("empty")}</p>
          <Link href="/catalog" className="mt-8 inline-block">
            <Button>{t("browse")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
    {
      label: tCommon("from"),
      render: (p) => (
        <span className="font-semibold tabular-nums text-primary">
          {formatPrice(pricingByProductId[p.id]?.[0]?.price ?? 0, localeStr)}
        </span>
      ),
    },
    {
      label: tCatalog("packaging"),
      render: (p) => tCatalog(`packagingTypes.${p.packaging_type}`),
    },
    {
      label: tCatalog("weight"),
      render: (p) => <span className="tabular-nums">{p.weight_grams}g</span>,
    },
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
      render: (p) => <span className="tabular-nums">{p.composition.length}</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-brand-blue">{t("title")}</h1>
        <Link href="/catalog">
          <Button variant="outline">{t("browse")}</Button>
        </Link>
      </div>

      <div className="surface-panel overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-36" />
              {selected.map((p) => (
                <TableHead key={p.id} className="min-w-[200px] align-top">
                  <div className="relative rounded-xl bg-cream/60 p-3">
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      title={t("remove")}
                      className="absolute right-2 top-2 z-10 rounded-full border border-border/50 bg-white p-1 text-muted-foreground shadow-sm transition-colors hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <Link href={`/catalog/${p.id}`}>
                      <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
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
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="font-medium text-muted-foreground">{row.label}</TableCell>
                {selected.map((p) => (
                  <TableCell key={p.id} className="whitespace-normal">
                    {row.render(p)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
