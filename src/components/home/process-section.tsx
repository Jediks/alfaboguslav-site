"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Package, Palette, Truck, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

const icons = [Package, Palette, Truck, CheckCircle2];
const keys = ["feature1", "feature2", "feature3", "feature4"] as const;

export function ProcessSection() {
  const t = useTranslations("home");
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion || !isDesktop) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const steps = stepRefs.current.filter(Boolean) as HTMLButtonElement[];

      const setActive = (active: number) => {
        setActiveStep(active);
        steps.forEach((step, i) => {
          step.dataset.active = i === active ? "true" : "false";
        });
      };

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * 2.5}`,
        pin: pinRef.current,
        scrub: 0.8,
        anticipatePin: 1,
        onUpdate: (self) => {
          const active = Math.min(
            steps.length - 1,
            Math.floor(self.progress * steps.length + 0.001)
          );
          setActive(active);
        },
      });

      setActive(0);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion, isDesktop]);

  const selectStep = (index: number) => {
    setActiveStep(index);
    stepRefs.current.forEach((step, i) => {
      if (step) step.dataset.active = i === index ? "true" : "false";
    });
  };

  return (
    <section ref={sectionRef} className="relative bg-cream">
      <div ref={pinRef} className="mx-auto max-w-7xl px-4 py-24 md:py-32">
        <div className="mb-12 md:flex md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              01 — 04
            </p>
            <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight text-brand-blue md:text-5xl">
              {t("featuresTitle")}
            </h2>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground md:mt-0">
            {t("featuresSubtitle")}
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {keys.map((key, i) => (
            <div key={`progress-${key}`} className="h-1 overflow-hidden rounded-full bg-brand-blue/10">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r from-primary to-gold transition-[width] duration-500 ease-out",
                  i === activeStep ? "w-full" : "w-0"
                )}
              />
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {keys.map((key, i) => {
            const Icon = icons[i];
            const isActive = i === activeStep;
            return (
              <button
                key={key}
                type="button"
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                data-active={isActive ? "true" : "false"}
                aria-pressed={isActive}
                onClick={() => selectStep(i)}
                className="process-step group relative rounded-2xl border border-border/60 bg-white p-6 text-left opacity-60 transition-[opacity,transform,box-shadow,border-color] duration-300 hover:opacity-80 data-[active=true]:scale-[1.01] data-[active=true]:border-primary/40 data-[active=true]:opacity-100 data-[active=true]:shadow-md data-[active=true]:shadow-primary/5 md:p-8"
              >
                <div className="flex items-start justify-between gap-5">
                  <span className="block font-display text-4xl font-bold leading-none text-muted-foreground/20 transition-colors duration-300 group-data-[active=true]:text-primary/25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/5 text-brand-blue/70 transition-colors duration-300 group-data-[active=true]:bg-primary group-data-[active=true]:text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                </div>
                <div className="mt-6 min-h-[3.5rem]">
                  <h3 className="font-display text-lg font-semibold leading-snug text-brand-blue/70 transition-colors duration-300 group-data-[active=true]:text-brand-blue">
                    {t(`${key}Title`)}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground/80 transition-colors duration-300 group-data-[active=true]:text-muted-foreground">
                  {t(`${key}Desc`)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
