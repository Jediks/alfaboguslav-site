"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Package, Palette, Truck, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionAmbient } from "@/components/ui/section-ambient";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STEP_KEYS = ["feature1", "feature2", "feature3", "feature4"] as const;
const STEP_ICONS: LucideIcon[] = [Palette, Package, CheckCircle2, Truck];

const STEP_VISUALS = [
  "from-primary/25 via-brand-blue/10 to-cream",
  "from-brand-blue/20 via-gold/15 to-cream",
  "from-gold/25 via-primary/10 to-cream",
  "from-brand-blue/25 via-primary/15 to-cream",
] as const;

function FeatureVisual({
  index,
  icon: Icon,
  gradient,
}: {
  index: number;
  icon: LucideIcon;
  gradient: string;
}) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br shadow-sm",
        gradient
      )}
    >
      <div className="absolute inset-0 mesh-gradient opacity-60" aria-hidden />
      <span
        className="pointer-events-none absolute left-6 top-6 font-display text-8xl font-bold leading-none text-brand-blue/[0.07]"
        aria-hidden
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-[min(42vw,320px)] w-[min(42vw,320px)] items-center justify-center rounded-[2rem] bg-white/75 shadow-md ring-1 ring-white/80 backdrop-blur-sm">
          <Icon className="h-[min(10vw,88px)] w-[min(10vw,88px)] text-brand-blue/80" aria-hidden />
        </div>
      </div>
    </div>
  );
}

function StackedFeatures() {
  const t = useTranslations("home");

  return (
    <div className="mt-12 space-y-8">
      {STEP_KEYS.map((key, index) => {
        const Icon = STEP_ICONS[index];
        return (
          <article key={key} data-testid={`why-us-panel-${index}`} className="space-y-4">
            <div className="h-[min(62vw,320px)]">
              <FeatureVisual index={index} icon={Icon} gradient={STEP_VISUALS[index]} />
            </div>
            <div className="px-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
                {String(index + 1).padStart(2, "0")} ·{" "}
                {t("featuresStepLabel", { step: index + 1, total: STEP_KEYS.length })}
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold text-brand-blue">
                {t(`${key}Title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`${key}Desc`)}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ProcessSection() {
  const t = useTranslations("home");
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const activeKey = STEP_KEYS[active];
  const scrollSectionHeight = `${STEP_KEYS.length * 100}vh` as const;

  useLayoutEffect(() => {
    if (reduceMotion) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    const sticky = stickyRef.current;
    if (!section || !track || !sticky) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const panelCount = STEP_KEYS.length;
      const getScrollDistance = () => (panelCount - 1) * window.innerHeight;

      const tween = gsap.to(track, {
        y: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          pin: sticky,
          scrub: 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              panelCount - 1,
              Math.round(self.progress * (panelCount - 1))
            );
            setActive(idx);
          },
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [reduceMotion]);

  const sectionStyle: CSSProperties | undefined = reduceMotion
    ? undefined
    : { height: scrollSectionHeight };

  return (
    <section
      ref={sectionRef}
      data-testid="why-us-section"
      className="relative border-y border-border/40"
      aria-labelledby="why-us-heading"
      style={sectionStyle}
    >
      <SectionAmbient tone="white" />

      {!reduceMotion ? (
        <div className="relative z-[2] hidden lg:block">
          <div ref={stickyRef} className="mx-auto flex h-screen max-w-7xl items-stretch px-4 md:px-6">
            <div
              data-testid="why-us-sticky"
              className="grid w-full grid-cols-2 items-center gap-10 xl:gap-16"
            >
              <div className="flex h-full max-h-[85vh] flex-col justify-center pr-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  {t("featuresLabel")}
                </p>

                <div className="mt-6 min-h-[280px]" aria-live="polite" aria-atomic="true">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeKey}
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      data-testid="why-us-detail"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {t("featuresStepLabel", {
                          step: active + 1,
                          total: STEP_KEYS.length,
                        })}
                      </p>
                      <h2
                        id="why-us-heading"
                        className="mt-3 text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight text-brand-blue xl:text-5xl 2xl:text-6xl"
                      >
                        {t(`${activeKey}Title`)}
                      </h2>
                      <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground xl:text-lg">
                        {t(`${activeKey}Desc`)}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-10 flex items-center gap-3">
                  {STEP_KEYS.map((_, index) => (
                    <span
                      key={index}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        index === active
                          ? "w-10 bg-primary"
                          : index < active
                            ? "w-4 bg-primary/40"
                            : "w-4 bg-brand-blue/10"
                      )}
                      aria-hidden
                    />
                  ))}
                  <span className="ml-2 text-xs tabular-nums text-muted-foreground">
                    {String(active + 1).padStart(2, "0")}/{String(STEP_KEYS.length).padStart(2, "0")}
                  </span>
                </div>

                <p className="mt-8 text-xs text-muted-foreground/80">{t("featuresScrollHint")}</p>
              </div>

              <div className="relative h-[min(85vh,820px)] overflow-hidden">
                <div ref={trackRef} className="will-change-transform">
                  {STEP_KEYS.map((key, index) => {
                    const Icon = STEP_ICONS[index];
                    return (
                      <div
                        key={key}
                        data-testid={`why-us-panel-${index}`}
                        className="flex h-screen items-center py-[7.5vh]"
                      >
                        <FeatureVisual
                          index={index}
                          icon={Icon}
                          gradient={STEP_VISUALS[index]}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn("relative z-[2] px-4 py-16 md:py-20", !reduceMotion && "lg:hidden")}>
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t("featuresLabel")}
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-brand-blue">
            {t("featuresTitle")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {t("featuresSubtitle")}
          </p>
        </header>
        <StackedFeatures />
      </div>
    </section>
  );
}
