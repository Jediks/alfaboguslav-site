"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useLocale } from "next-intl";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { SectionAmbient } from "@/components/ui/section-ambient";
import { getBrandMonogram, getInitials } from "@/lib/utils/initials";
import { cn } from "@/lib/utils";
import {
  DEFAULT_TESTIMONIALS_BLOCK,
  type TestimonialsBlockData,
  type TestimonialItem,
} from "@/types/content-blocks";

type TestimonialsMarqueeProps = {
  block?: TestimonialsBlockData;
};

type Review = {
  name: string;
  company: string;
  text: string;
  rating: number;
  avatarUrl?: string;
};

function clampRating(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 5;
  return Math.max(1, Math.min(5, Math.round(value)));
}

function localize(item: TestimonialItem, locale: string): Review {
  return {
    name: item.name,
    company: item.company,
    text: locale === "en" ? item.text_en : item.text_uk,
    rating: clampRating(item.rating),
    avatarUrl: item.avatar_url,
  };
}

function ReviewAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return (
      <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-primary/15">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {getInitials(name)}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="surface-panel w-[min(90vw,380px)] shrink-0 rounded-2xl p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className="flex gap-1"
          aria-label={`${review.rating}/5`}
          data-testid="review-stars"
          data-rating={review.rating}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={
                i < review.rating
                  ? "h-4 w-4 fill-gold text-gold"
                  : "h-4 w-4 text-muted-foreground/30"
              }
            />
          ))}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-blue/70">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue/5 text-[9px] font-bold text-brand-blue">
            {getBrandMonogram(review.company)}
          </span>
          {review.company}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground">&ldquo;{review.text}&rdquo;</p>
      <div className="mt-6 flex items-center gap-3 border-t border-border/50 pt-4">
        <ReviewAvatar name={review.name} avatarUrl={review.avatarUrl} />
        <div>
          <p className="font-semibold text-brand-blue">{review.name}</p>
          <p className="text-xs text-muted-foreground">{review.company}</p>
        </div>
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
    <section className="relative overflow-hidden py-20 md:py-24">
      <SectionAmbient tone="white" blobs={false} />
      <div className="relative z-[2] mb-10 px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {label}
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-brand-blue md:text-4xl">
          {title}
        </h2>
      </div>

      <div className="relative z-[2] mb-12 border-y border-border/50 bg-cream/80 py-4 backdrop-blur-sm">
        <BrandMarquee brands={brands} />
      </div>

      <div
        className={cn(
          "relative z-[2] flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 scrollbar-hide md:justify-center md:gap-6 md:snap-none"
        )}
        role="list"
      >
        {items.map((review, i) => (
          <motion.div
            key={`${review.name}-${i}`}
            role="listitem"
            className="snap-center"
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
