"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/catalog/product-image";
import { CompareToggle } from "@/components/catalog/compare-toggle";
import { Badge } from "@/components/ui/badge";
import type { PricingTier, Product } from "@/types/database";
import { getProductTitle } from "@/lib/data/product-utils";
import { formatPrice } from "@/lib/pricing";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type ProductCardProps = {
  product: Product;
  pricingByProductId: Record<string, PricingTier[]>;
  index?: number;
};

export function ProductCard({ product, pricingByProductId, index = 0 }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations("common");
  const tCatalog = useTranslations("catalog");
  const reduceMotion = useReducedMotion();
  const tiers = pricingByProductId[product.id] ?? [];
  const minPrice = tiers[0]?.price ?? 0;
  const bulkTier = tiers.length > 1 ? tiers[1] : null;
  const cardRef = useRef<HTMLElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    if (reduceMotion) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 8);
    rotateX.set(-py * 8);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const localeStr = locale === "uk" ? "uk-UA" : "en-US";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: Math.min(index * 0.06, 0.4),
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link href={`/catalog/${product.id}`} className="group block">
        <motion.article
          ref={cardRef}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={
            reduceMotion
              ? undefined
              : {
                  rotateX: springRotateX,
                  rotateY: springRotateY,
                  transformPerspective: 900,
                }
          }
          className="surface-panel overflow-hidden rounded-2xl transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand-blue/5"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-cream">
            <CompareToggle productId={product.id} />
            <ProductImage
              src={product.images[0]}
              alt={getProductTitle(product, locale)}
              sizes="(max-width: 768px) 100vw, 33vw"
              variant="card"
              size="large"
            />
            <div className="absolute left-3 top-3 flex flex-wrap gap-1">
              {product.b2b_tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={tag === "VIP" || tag === "Premium" ? "default" : "secondary"}
                  className="text-[10px] shadow-sm"
                >
                  {tag}
                </Badge>
              ))}
              <Badge variant="outline" className="border-white/80 bg-white/90 text-[10px]">
                {product.id.replace("set-", "").replace(/-/g, "/")}
              </Badge>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-display text-base font-semibold leading-snug text-brand-blue group-hover:text-primary">
              {getProductTitle(product, locale)}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {product.weight_grams}g · {product.packaging_type}
            </p>
            {bulkTier ? (
              <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {tCatalog("bulkFrom", { min: bulkTier.min_quantity })}
              </p>
            ) : null}
            <div className="mt-4 flex items-end justify-between gap-2">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  {t("from")}
                </p>
                <p className="text-xl font-semibold tabular-nums text-primary">
                  {formatPrice(minPrice, localeStr)}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}
