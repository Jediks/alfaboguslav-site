"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { MarqueeText } from "@/components/ui/marquee-text";

const reviews = [
  {
    name: "Олена К.",
    company: "SoftServe",
    text: "Замовили 200 наборів для IT-команди. Якість упаковки та солодощів на найвищому рівні. Менеджер супроводжував на кожному етапі.",
  },
  {
    name: "Андрій М.",
    company: "PrivatBank",
    text: "Персоналізація логотипом виглядала преміально. Рахунок для бухгалтерії — за один день. Рекомендуємо для B2B.",
  },
  {
    name: "Марія С.",
    company: "Nova Poshta",
    text: "Третій рік поспіль замовляємо корпоративні подарунки. Стабільна якість, гнучкі оптові ціни, швидка доставка.",
  },
  {
    name: "Дмитро В.",
    company: "EPAM",
    text: "Дерев'яні VIP-набори вразили партнерів. Прозоре ціноутворення за обсягом — зручно для закупівельного відділу.",
  },
];

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
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

export function TestimonialsMarquee() {
  const t = useTranslations("home");

  return (
    <section className="overflow-hidden bg-white py-20 md:py-24">
      <div className="mb-10 px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {t("testimonialsLabel")}
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-brand-blue md:text-4xl">
          {t("testimonialsTitle")}
        </h2>
      </div>

      <div className="mb-12 border-y border-border/50 bg-cream py-3">
        <MarqueeText
          items={["SoftServe", "PrivatBank", "EPAM", "Nova Poshta", "Monobank", "Genesis"]}
          className="text-brand-blue/25"
          speed="slow"
        />
      </div>

      <div className="flex gap-5 overflow-x-auto px-4 pb-4 scrollbar-hide md:justify-center md:gap-6">
        {reviews.map((review, i) => (
          <motion.div
            key={review.name}
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
