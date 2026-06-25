"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Package, Palette, Truck, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionAmbient } from "@/components/ui/section-ambient";

const STEP_KEYS = ["feature1", "feature2", "feature3", "feature4"] as const;
const STEP_ICONS: LucideIcon[] = [Palette, Package, CheckCircle2, Truck];

export function ProcessSection() {
  const t = useTranslations("home");
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  const activeKey = STEP_KEYS[active];
  const ActiveIcon = STEP_ICONS[active];

  return (
    <section
      data-testid="why-us-section"
      className="relative overflow-hidden border-y border-border/40"
      aria-labelledby="why-us-heading"
    >
      <SectionAmbient tone="white" />

      <div className="relative z-[2] mx-auto max-w-7xl px-4 py-24 md:py-32">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t("featuresLabel")}
          </p>
          <h2
            id="why-us-heading"
            className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight text-brand-blue md:text-5xl"
          >
            {t("featuresTitle")}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t("featuresSubtitle")}
          </p>
        </header>

        <div className="mt-14 lg:mt-16 lg:grid lg:grid-cols-[minmax(260px,320px)_1fr] lg:items-start lg:gap-12 xl:gap-16">
          <div
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0 lg:pt-2"
            role="tablist"
            aria-label={t("featuresTitle")}
          >
            {STEP_KEYS.map((key, index) => {
              const Icon = STEP_ICONS[index];
              const isActive = index === active;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`why-us-tab-${index}`}
                  aria-selected={isActive}
                  aria-controls="why-us-panel"
                  onClick={() => setActive(index)}
                  className={cn(
                    "group flex min-w-[220px] shrink-0 items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-[background-color,border-color,box-shadow] duration-200 lg:min-w-0 lg:w-full lg:rounded-l-xl lg:rounded-r-none lg:border-r-0 lg:py-4 lg:pl-5",
                    isActive
                      ? "border-border/60 bg-cream shadow-sm lg:border-l-[3px] lg:border-l-primary lg:bg-white lg:pl-[calc(1.25rem-1px)]"
                      : "border-transparent bg-cream/60 hover:bg-cream lg:border-l-[3px] lg:border-l-transparent lg:bg-transparent lg:hover:bg-cream/80"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-primary text-white"
                        : "bg-brand-blue/8 text-brand-blue/70 group-hover:bg-brand-blue/12"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-sm font-semibold leading-snug transition-colors",
                        isActive ? "text-brand-blue" : "text-brand-blue/75"
                      )}
                    >
                      {t(`${key}Title`)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="why-us-panel"
            role="tabpanel"
            aria-labelledby={`why-us-tab-${active}`}
            data-testid="why-us-detail"
            className="surface-panel relative mt-4 min-h-[320px] overflow-hidden rounded-2xl p-8 md:p-10 lg:mt-0 lg:min-h-[360px]"
          >
            <span
              className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[8rem] font-bold leading-none text-brand-blue/[0.04] md:text-[9rem]"
              aria-hidden
            >
              {String(active + 1).padStart(2, "0")}
            </span>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="relative"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ActiveIcon className="h-7 w-7" aria-hidden />
                </div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                  {t("featuresStepLabel", { step: active + 1, total: STEP_KEYS.length })}
                </p>
                <h3 className="mt-2 max-w-lg font-display text-2xl font-semibold leading-snug tracking-tight text-brand-blue md:text-3xl">
                  {t(`${activeKey}Title`)}
                </h3>
                <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground">
                  {t(`${activeKey}Desc`)}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue/5">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-gold"
                initial={false}
                animate={{ width: `${((active + 1) / STEP_KEYS.length) * 100}%` }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
