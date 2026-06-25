"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useLocale } from "next-intl";
import { MarqueeText } from "@/components/ui/marquee-text";
import {
  DEFAULT_TESTIMONIALS_BLOCK,
  type TestimonialsBlockData,
  type TestimonialItem,
} from "@/types/content-blocks";

type TestimonialsMarqueeProps = {
  block?: TestimonialsBlockData;
};

type Review = { name: string; company: string; text: string };

function localize(item: TestimonialItem, locale: string): Review {
  return {
    name: item.name,
    company: item.company,
    text: locale === "en" ? item.text_en : item.text_uk,
  };
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="w-[min(90vw,380px)] shrink-0 rounded-2xl border border-border/50 bg-white p-6 premium-shadow">
      <div className="mb-4 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-gold text-gold" />
        ))}
      </div>
      <p className="text-sm leading-relaxed text-foreground">&ldquo;{review.text}&rdquo;</p>
      <div className="mt-6 border-t border-border/50 pt-4">
        <p className="font-semibold text-brand-blue">{review.name}</p>
        <p className="text-xs text-muted-foreground">{review.company}</p>
      </div>
    </div>
  );
}

export function TestimonialsMarquee({
  block = DEFAULT_TESTIMONIALS_BLOCK,
}: TestimonialsMarqueeProps) {
  const locale = useLocale();
  const label = locale === "en" ? block.label_en : block.label_uk;
  const title = locale === "en" ? block.title_en : block.title_uk;
  const items = (block.items?.length ? block.items : DEFAULT_TESTIMONIALS_BLOCK.items).map(
    (item) => localize(item, locale)
  );
  const brands = block.marquee_brands?.length
    ? block.marquee_brands
    : DEFAULT_TESTIMONIALS_BLOCK.marquee_brands;

  return (
    <section className="overflow-hidden bg-white py-20 md:py-24">
      <div className="mb-10 px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {label}
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-brand-blue md:text-4xl">
          {title}
        </h2>
      </div>

      <div className="mb-12 border-y border-border/50 bg-cream py-3">
        <MarqueeText items={brands} className="text-brand-blue/25" speed="slow" />
      </div>

      <div className="flex gap-5 overflow-x-auto px-4 pb-4 scrollbar-hide md:justify-center md:gap-6">
        {items.map((review, i) => (
          <motion.div
            key={`${review.name}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <ReviewCard review={review} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
