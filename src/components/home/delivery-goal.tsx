"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { CalendarRange, Layers, Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { StatCard } from "@/components/ui/stat-card";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

const SEASONS_TARGET = 28;

export function DeliveryGoal() {
  const t = useTranslations("home");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(reduceMotion ? SEASONS_TARGET : 0);

  useEffect(() => {
    if (!inView || reduceMotion) {
      if (inView) setCount(SEASONS_TARGET);
      return;
    }
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      if (current >= SEASONS_TARGET) {
        setCount(SEASONS_TARGET);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 60);
    return () => clearInterval(timer);
  }, [inView, reduceMotion]);

  const stats = [
    {
      value: count,
      suffix: "",
      label: t("goalStatSeasons"),
      icon: CalendarRange,
    },
    {
      value: 1000,
      suffix: "+",
      label: t("goalStatVariants"),
      icon: Layers,
    },
    {
      value: 50,
      suffix: "+",
      label: t("goalStatPackaging"),
      icon: Package,
    },
  ] as const;

  return (
    <section
      ref={ref}
      data-testid="delivery-goal"
      className="border-y border-border/40 bg-cream py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t("goalLabel")}
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
            {t("goalTitle")}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {t("goalSubtitle")}
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              icon={stat.icon}
              hero
              value={
                <>
                  {stat.value}
                  {stat.suffix}
                </>
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
