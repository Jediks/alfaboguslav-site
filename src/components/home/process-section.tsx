"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Package, Palette, Truck, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionAmbient } from "@/components/ui/section-ambient";

const STEP_KEYS = ["feature1", "feature2", "feature3", "feature4"] as const;

const STEP_ICONS: LucideIcon[] = [Palette, Package, CheckCircle2, Truck];

const STEP_VISUALS: { gradient: string; accent: string }[] = [
  {
    gradient: "from-primary/20 via-brand-blue/5 to-cream",
    accent: "text-primary",
  },
  {
    gradient: "from-brand-blue/15 via-gold/10 to-cream",
    accent: "text-brand-blue",
  },
  {
    gradient: "from-gold/20 via-primary/5 to-cream",
    accent: "text-gold",
  },
  {
    gradient: "from-brand-blue/20 via-primary/10 to-cream",
    accent: "text-brand-blue",
  },
];

function FeatureVisual({
  index,
  icon: Icon,
  title,
  visual,
}: {
  index: number;
  icon: LucideIcon;
  title: string;
  visual: (typeof STEP_VISUALS)[number];
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br",
        visual.gradient
      )}
    >
      <span
        className="pointer-events-none absolute -right-2 -top-4 font-display text-[7rem] font-bold leading-none text-brand-blue/[0.05]"
        aria-hidden
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="absolute inset-0 mesh-gradient opacity-50" aria-hidden />
      <div
        className={cn(
          "relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white/80 shadow-sm ring-1 ring-border/50 backdrop-blur-sm md:h-28 md:w-28",
          visual.accent
        )}
      >
        <Icon className="h-10 w-10 md:h-12 md:w-12" aria-hidden />
      </div>
      <p className="absolute bottom-5 left-5 right-5 text-sm font-semibold text-brand-blue/80 md:text-base">
        {title}
      </p>
    </div>
  );
}

function StackedFeatures({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (index: number) => void;
}) {
  const t = useTranslations("home");
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-10">
      {STEP_KEYS.map((key, index) => {
        const Icon = STEP_ICONS[index];
        const isActive = index === active;
        return (
          <article
            key={key}
            data-testid={`why-us-panel-${index}`}
            className="space-y-4"
          >
            <FeatureVisual
              index={index}
              icon={Icon}
              title={t(`${key}Title`)}
              visual={STEP_VISUALS[index]}
            />
            <button
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "w-full rounded-xl border px-4 py-4 text-left transition-colors",
                isActive
                  ? "border-primary/30 bg-cream"
                  : "border-border/50 bg-white hover:bg-cream/80"
              )}
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
                {String(index + 1).padStart(2, "0")} · {t("featuresStepLabel", { step: index + 1, total: STEP_KEYS.length })}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold text-brand-blue">
                {t(`${key}Title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`${key}Desc`)}
              </p>
            </button>
          </article>
        );
      })}
      <div className="h-1 overflow-hidden rounded-full bg-brand-blue/10">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-gold"
          initial={false}
          animate={{ width: `${((active + 1) / STEP_KEYS.length) * 100}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
        />
      </div>
    </div>
  );
}

export function ProcessSection() {
  const t = useTranslations("home");
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeKey = STEP_KEYS[active];
  const ActiveIcon = STEP_ICONS[active];

  useEffect(() => {
    if (reduceMotion) return;

    const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
    if (panels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const index = panels.indexOf(visible[0].target as HTMLDivElement);
        if (index >= 0) setActive(index);
      },
      { root: null, rootMargin: "-42% 0px -42% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    panels.forEach((panel) => observer.observe(panel));
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <section
      data-testid="why-us-section"
      className="relative overflow-hidden border-y border-border/40"
      aria-labelledby="why-us-heading"
    >
      <SectionAmbient tone="white" />

      <div className="relative z-[2] mx-auto max-w-7xl px-4 py-20 md:py-28">
        <header className="max-w-2xl lg:max-w-none">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t("featuresLabel")}
          </p>
          <h2
            id="why-us-heading"
            className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight text-brand-blue md:text-5xl"
          >
            {t("featuresTitle")}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:hidden">
            {t("featuresSubtitle")}
          </p>
        </header>

        {reduceMotion ? (
          <div className="mt-12">
            <StackedFeatures active={active} onSelect={setActive} />
          </div>
        ) : (
          <>
            <div className="mt-12 lg:hidden">
              <StackedFeatures active={active} onSelect={setActive} />
            </div>

            <div className="mt-16 hidden lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 xl:gap-20">
              <div
                data-testid="why-us-sticky"
                className="sticky top-28 flex h-[min(520px,calc(100vh-8rem))] flex-col justify-between self-start"
              >
                <div aria-live="polite" aria-atomic="true">
                  <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                    {t("featuresSubtitle")}
                  </p>

                  <div className="mt-10 flex gap-2">
                    {STEP_KEYS.map((_, index) => (
                      <span
                        key={index}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors duration-300",
                          index <= active ? "bg-primary" : "bg-brand-blue/10"
                        )}
                        aria-hidden
                      />
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeKey}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                      className="mt-8"
                      data-testid="why-us-detail"
                    >
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ActiveIcon className="h-6 w-6" aria-hidden />
                      </div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                        {t("featuresStepLabel", {
                          step: active + 1,
                          total: STEP_KEYS.length,
                        })}
                      </p>
                      <h3 className="mt-2 font-display text-3xl font-semibold leading-snug tracking-tight text-brand-blue xl:text-4xl">
                        {t(`${activeKey}Title`)}
                      </h3>
                      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                        {t(`${activeKey}Desc`)}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <p className="mt-8 text-xs text-muted-foreground/80">
                  {t("featuresScrollHint")}
                </p>
              </div>

              <div className="flex flex-col gap-[18vh] pb-[18vh] pt-[6vh]">
                {STEP_KEYS.map((key, index) => {
                  const Icon = STEP_ICONS[index];
                  return (
                    <div
                      key={key}
                      ref={(el) => {
                        panelRefs.current[index] = el;
                      }}
                      data-testid={`why-us-panel-${index}`}
                      className="flex min-h-[min(52vh,440px)] items-center"
                    >
                      <FeatureVisual
                        index={index}
                        icon={Icon}
                        title={t(`${key}Title`)}
                        visual={STEP_VISUALS[index]}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
