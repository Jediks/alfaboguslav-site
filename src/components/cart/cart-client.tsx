"use client";

import { ProductImage } from "@/components/catalog/product-image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { MOCK_PRODUCTS, MOCK_PRICING } from "@/lib/data/mock-products";
import { getProductTitle } from "@/lib/data/product-utils";
import { getPriceForQuantity, formatPrice } from "@/lib/pricing";

export function CartClient() {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const { items, removeItem, updateQuantity } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-brand-blue">{t("empty")}</h1>
        <Link href="/catalog" className="mt-6">
          <Button>{t("emptyCta")}</Button>
        </Link>
      </div>
    );
  }

  let total = 0;

  const rows = items.map((item) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
    if (!product) return null;
    const tiers = MOCK_PRICING[item.productId] ?? [];
    const unitPrice = getPriceForQuantity(tiers, item.quantity);
    const lineTotal = unitPrice * item.quantity;
    total += lineTotal;
    return { item, product, unitPrice, lineTotal };
  }).filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 font-display text-3xl font-bold text-brand-blue">{t("title")}</h1>

      <div className="space-y-4">
        {rows.map((row) => {
          if (!row) return null;
          const { item, product, unitPrice, lineTotal } = row;
          return (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-border/50 bg-white p-4 premium-shadow sm:items-center"
            >
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                <ProductImage
                  src={product.images[0]}
                  alt={getProductTitle(product, locale)}
                  sizes="112px"
                  variant="card"
                  size="large"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-brand-blue truncate">
                  {getProductTitle(product, locale)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(unitPrice, localeStr)} / {tCommon("units")}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">
                  {formatPrice(lineTotal, localeStr)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.productId)}
                  className="mt-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 glass rounded-3xl p-6 premium-shadow">
        <div className="flex justify-between font-display text-xl font-bold">
          <span>{t("estimatedTotal")}</span>
          <span className="text-primary">{formatPrice(total, localeStr)}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{t("managerNotice")}</p>
        <Separator className="my-4" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/catalog" className="flex-1">
            <Button variant="outline" className="w-full">
              {t("continueShopping")}
            </Button>
          </Link>
          <Link href="/checkout" className="flex-1">
            <Button className="w-full gap-2">
              {t("checkout")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
