"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import type { Product, PricingTier } from "@/types/database";
import { getProductTitle, getProductDesc } from "@/lib/data/product-utils";
import { ProductGallery } from "./product-gallery";
import { CompositionTable } from "./composition-table";
import { PricingCalculator } from "./pricing-calculator";
import { LogoUpload } from "./logo-upload";

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
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery
          images={product.images}
          title={getProductTitle(product, locale)}
        />

        <div className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {product.b2b_tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <h1 className="font-display text-3xl font-bold text-brand-blue md:text-4xl">
              {getProductTitle(product, locale)}
            </h1>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {getProductDesc(product, locale)}
            </p>
            <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
              <span>{product.weight_grams}g</span>
              <span>·</span>
              <span>
                {tProduct("packaging")}: {t(`packagingTypes.${product.packaging_type}`)}
              </span>
            </div>
          </div>

          <LogoUpload onUploaded={setLogoUrl} currentUrl={logoUrl} />

          <PricingCalculator
            productId={product.id}
            tiers={tiers}
            brandingLogoUrl={logoUrl || undefined}
          />
        </div>
      </div>

      <div className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-bold text-brand-blue">
          {tProduct("composition")}
        </h2>
        <CompositionTable composition={product.composition} />
      </div>
    </div>
  );
}
