"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/catalog/product-image";
import type { PricingTier, Product } from "@/types/database";
import { getProductTitle } from "@/lib/data/product-utils";
import { formatPrice } from "@/lib/pricing";

type HorizontalShowcaseProps = {
  products: Product[];
  pricingByProductId: Record<string, PricingTier[]>;
};

export function HorizontalShowcase({
  products,
  pricingByProductId,
}: HorizontalShowcaseProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const ref = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  const scrollBy = (direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("article")?.parentElement;
    const amount = card ? card.clientWidth + 20 : 320;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      const verticalIntent = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
      if (!verticalIntent) return;

      event.preventDefault();
      window.scrollBy({ top: event.deltaY, left: 0, behavior: "auto" });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section className="dark-section-ambient relative overflow-hidden border-y border-cream/10 bg-brand-blue py-20 text-white grain md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream/[0.07] via-primary/5 to-brand-blue" />

      <div className="relative mx-auto mb-8 max-w-7xl px-4 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">
          {t("showcaseLabel")}
        </p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="text-balance font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {t("featuredTitle")}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/55 md:text-right">
            {t("featuredSubtitle")}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-white/45 md:hidden">{t("showcaseScrollHint")}</p>
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 border-white/20 bg-white/5 text-white hover:bg-white/10"
              aria-label={t("showcaseScrollPrev")}
              onClick={() => scrollBy(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 border-white/20 bg-white/5 text-white hover:bg-white/10"
              aria-label={t("showcaseScrollNext")}
              onClick={() => scrollBy(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mb-4 max-w-7xl px-4 md:px-8">
        <div className="h-0.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-[width] duration-150 ease-out"
            style={{ width: `${Math.max(8, scrollProgress * 100)}%` }}
          />
        </div>
      </div>

      <div
        ref={ref}
        onScroll={handleScroll}
        role="region"
        aria-label={t("featuredTitle")}
        className="showcase-rail relative flex gap-5 overflow-x-auto px-4 pb-6 scrollbar-hide md:gap-6 md:px-8"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((product, i) => {
          const minPrice = pricingByProductId[product.id]?.[0]?.price ?? 0;
          const setCode = product.id.replace("set-", "").replace(/-/g, "/");

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.5 }}
              className="w-[min(88vw,380px)] shrink-0"
              style={{ scrollSnapAlign: "start" }}
            >
              <Link href={`/catalog/${product.id}`} className="group/showcase block">
                <article className="glass-dark rounded-2xl transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/20">
                  <div className="relative aspect-[4/5] min-h-[440px] overflow-visible rounded-t-2xl">
                    <ProductImage
                      src={product.images[0]}
                      alt={getProductTitle(product, locale)}
                      sizes="380px"
                      variant="dark"
                      size="xl"
                      className="showcase-product overflow-visible rounded-t-2xl"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tabular-nums backdrop-blur-md">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="border-t border-white/10 p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                      {product.packaging_type} · {product.weight_grams}g
                    </p>
                    <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-white">
                      {getProductTitle(product, locale)}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-white/45">{setCode}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-white/55">
                        {t("from")}{" "}
                        <span className="font-semibold tabular-nums text-gold">
                          {formatPrice(minPrice, localeStr)}
                        </span>
                      </p>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors group-hover/showcase:bg-primary">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
