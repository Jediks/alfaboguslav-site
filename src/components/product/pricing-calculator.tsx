"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider, readSliderValue } from "@/components/ui/slider";
import type { PricingTier } from "@/types/database";
import { getPriceForQuantity, formatPrice } from "@/lib/pricing";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

type PricingCalculatorProps = {
  productId: string;
  tiers: PricingTier[];
  brandingLogoUrl?: string;
};

export function PricingCalculator({
  productId,
  tiers,
  brandingLogoUrl,
}: PricingCalculatorProps) {
  const t = useTranslations("product");
  const tCart = useTranslations("cart");
  const locale = useLocale();
  const [quantity, setQuantity] = useState(10);
  const addItem = useCartStore((s) => s.addItem);

  const unitPrice = getPriceForQuantity(tiers, quantity);
  const total = unitPrice * quantity;
  const sortedTiers = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
  const maxQty = Math.max(sortedTiers[sortedTiers.length - 1]?.min_quantity ?? 10, 200);
  const activeTierIndex = sortedTiers.findIndex((tier, i) => {
    const next = sortedTiers[i + 1];
    return quantity >= tier.min_quantity && (!next || quantity < next.min_quantity);
  });

  const localeStr = locale === "uk" ? "uk-UA" : "en-US";

  const handleAdd = () => {
    addItem({ productId, quantity, brandingLogoUrl });
    toast.success(tCart("title"), {
      description: `${quantity} ${t("addToCart").toLowerCase()}`,
    });
  };

  return (
    <div className="rounded-3xl border border-border/50 bg-white p-6 premium-shadow">
      <h3 className="mb-5 font-display text-lg font-semibold text-brand-blue">
        {t("pricingTitle")}
      </h3>

      <div className="mb-6 space-y-2">
        {sortedTiers.map((tier, i) => (
          <div
            key={tier.id}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors duration-200",
              i === activeTierIndex
                ? "border-primary/30 bg-primary/5"
                : "border-border/50 bg-cream/50"
            )}
          >
            <span
              className={
                i === activeTierIndex
                  ? "font-semibold text-brand-blue"
                  : "text-muted-foreground"
              }
            >
              {t("tier", { min: tier.min_quantity })}
            </span>
            <span
              className={cn(
                "font-bold tabular-nums",
                i === activeTierIndex ? "text-primary" : "text-brand-blue"
              )}
            >
              {formatPrice(tier.price, localeStr)}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        <div>
          <Label className="mb-3 block text-brand-blue">{t("quantity")}</Label>

          <div className="mb-3 rounded-2xl bg-cream px-4 py-3 text-center">
            <span className="font-display text-3xl font-bold tabular-nums text-brand-blue">
              {quantity}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              {locale === "uk" ? "од." : "units"}
            </span>
          </div>

          <Slider
            min={1}
            max={maxQty}
            step={1}
            value={quantity}
            onValueChange={(v) => setQuantity(Math.max(1, readSliderValue(v)))}
          />

          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-center text-base font-semibold tabular-nums"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-blue/10 bg-brand-blue/5 p-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t("unitPrice")}</span>
            <span className="tabular-nums font-medium text-brand-blue">
              {formatPrice(unitPrice, localeStr)}
            </span>
          </div>
          <div className="mt-2 flex justify-between font-display text-xl font-bold text-brand-blue">
            <span>{t("estimatedTotal")}</span>
            <span className="tabular-nums text-primary">{formatPrice(total, localeStr)}</span>
          </div>
        </div>

        <Button
          onClick={handleAdd}
          size="lg"
          className="h-12 w-full gap-2 text-base shadow-lg shadow-primary/20"
        >
          <ShoppingBag className="h-5 w-5" />
          {t("addToCart")}
        </Button>
      </div>
    </div>
  );
}
