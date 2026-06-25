"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { useTranslations } from "next-intl";

export function DeliveryGoal() {
  const t = useTranslations("home");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const target = 28;

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 60);
    return () => clearInterval(timer);
  }, [inView]);

  const stats = [
    { val: count, suffix: "", label: t("goalStatSeasons") },
    { val: 1000, suffix: "+", label: t("goalStatVariants") },
    { val: 50, suffix: "+", label: t("goalStatPackaging") },
  ];

  return (
    <section ref={ref} className="border-y border-border/50 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          {t("goalLabel")}
        </p>
        <h2 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
          {t("goalTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {t("goalSubtitle")}
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-8 sm:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-[88px]">
              <p className="font-display text-4xl font-semibold tabular-nums text-primary md:text-5xl">
                {stat.val}
                {stat.suffix}
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
