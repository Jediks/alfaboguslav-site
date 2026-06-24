"use client";

import { ProductImage } from "@/components/catalog/product-image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/database";
import { getProductTitle } from "@/lib/data/product-utils";
import { MOCK_PRICING } from "@/lib/data/mock-products";
import { formatPrice } from "@/lib/pricing";

type FeaturedProductsProps = {
  products: Product[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <section className="bg-gradient-to-b from-cream to-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-brand-blue md:text-4xl">
            {t("featuredTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("featuredSubtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((product, i) => {
            const tiers = MOCK_PRICING[product.id] ?? [];
            const minPrice = tiers[0]?.price ?? 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Link href={`/catalog/${product.id}`}>
                  <article className="group overflow-hidden rounded-3xl border border-border/50 bg-white premium-shadow transition-all duration-300 hover:-translate-y-2 hover:premium-shadow-hover">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <ProductImage
                        src={product.images[0]}
                        alt={getProductTitle(product, locale)}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        variant="card"
                        size="large"
                      />
                      <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
                        {product.b2b_tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            className="bg-white/90 text-brand-blue backdrop-blur-sm"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-lg font-semibold text-brand-blue group-hover:text-primary transition-colors">
                        {getProductTitle(product, locale)}
                      </h3>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {tCommon("from")}{" "}
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(minPrice, locale === "uk" ? "uk-UA" : "en-US")}
                          </span>
                        </p>
                        <ArrowRight className="h-5 w-5 text-primary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
