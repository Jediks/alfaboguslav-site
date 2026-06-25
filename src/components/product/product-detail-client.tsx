"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import type { Product, PricingTier } from "@/types/database";
import { getProductTitle, getProductDesc } from "@/lib/data/product-utils";
import { ProductGallery } from "./product-gallery";
import { CompositionTable } from "./composition-table";
import { PricingCalculator } from "./pricing-calculator";
import { LogoUpload } from "./logo-upload";
import { CompareToggle } from "@/components/catalog/compare-toggle";
import { CompareBar } from "@/components/catalog/compare-bar";

type ProductDetailClientProps = {
  product: Product;
  tiers: PricingTier[];
};

export function ProductDetailClient({ product, tiers }: ProductDetailClientProps) {
  const locale = useLocale();
  const t = useTranslations("catalog");
  const tProduct = useTranslations("product");
  const [logoUrl, setLogoUrl] = useState("");
  const recordView = useRecentlyViewedStore((s) => s.record);

  useEffect(() => {
    recordView(product.id);
  }, [product.id, recordView]);

  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-border/40 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-blue"
          >
            <ArrowLeft className="h-4 w-4" />
            {tProduct("backToCatalog")}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
          <ProductGallery images={product.images} title={getProductTitle(product, locale)} />

          <div className="space-y-6">
            <div className="surface-panel rounded-2xl p-6 md:p-8">
              <div className="mb-3 flex flex-wrap gap-2">
                {product.b2b_tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
                {getProductTitle(product, locale)}
              </h1>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {getProductDesc(product, locale)}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="tabular-nums">{product.weight_grams}g</span>
                <span aria-hidden>·</span>
                <span>
                  {tProduct("packaging")}: {t(`packagingTypes.${product.packaging_type}`)}
                </span>
              </div>
              <div className="mt-5">
                <CompareToggle productId={product.id} variant="inline" />
              </div>
            </div>

            <LogoUpload onUploaded={setLogoUrl} currentUrl={logoUrl} />

            <div className="lg:sticky lg:top-28 lg:z-10" data-testid="product-buy-panel">
              <PricingCalculator
                productId={product.id}
                tiers={tiers}
                brandingLogoUrl={logoUrl || undefined}
              />
            </div>
          </div>
        </div>

        <div className="surface-panel mt-12 rounded-2xl p-6 md:mt-16 md:p-8">
          <h2 className="ui-section-title">{tProduct("composition")}</h2>
          <div className="mt-4">
            <CompositionTable composition={product.composition} />
          </div>
        </div>
      </div>

      <CompareBar />
    </div>
  );
}
