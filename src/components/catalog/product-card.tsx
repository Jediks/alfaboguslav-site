"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/catalog/product-image";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/database";
import { getProductTitle } from "@/lib/data/product-utils";
import { MOCK_PRICING } from "@/lib/data/mock-products";
import { formatPrice } from "@/lib/pricing";

type ProductCardProps = {
  product: Product;
  index?: number;
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations("common");
  const tiers = MOCK_PRICING[product.id] ?? [];
  const minPrice = tiers[0]?.price ?? 0;
  const cardRef = useRef<HTMLElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 10);
    rotateX.set(-py * 10);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: Math.min(index * 0.07, 0.45),
        duration: 0.55,
        type: "spring",
        stiffness: 120,
        damping: 18,
      }}
    >
      <Link href={`/catalog/${product.id}`}>
        <motion.article
          ref={cardRef}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            transformPerspective: 900,
          }}
          className="group overflow-hidden rounded-3xl bg-white premium-shadow transition-shadow duration-500 hover:premium-shadow-hover"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
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
            <h3 className="font-display text-base font-semibold leading-snug text-brand-blue">
              {getProductTitle(product, locale)}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {product.weight_grams}g · {product.packaging_type}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t("from")}{" "}
                <span className="text-xl font-bold text-primary">
                  {formatPrice(minPrice, locale === "uk" ? "uk-UA" : "en-US")}
                </span>
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-all group-hover:opacity-100">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}
