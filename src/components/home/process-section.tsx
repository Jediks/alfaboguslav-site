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
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const steps = stepRefs.current.filter(Boolean) as HTMLDivElement[];

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
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="relative bg-cream">
      <div ref={pinRef} className="mx-auto max-w-7xl px-4 py-24 md:py-32">
        <div className="mb-12 md:flex md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              01 — 04
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold text-brand-blue md:text-5xl">
              {t("featuresTitle")}
            </h2>
          </div>
          <p className="mt-4 max-w-sm text-muted-foreground md:mt-0">{t("featuresSubtitle")}</p>
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
            return (
              <div
                key={key}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                data-active={i === activeStep ? "true" : "false"}
                className="process-step group relative rounded-3xl border border-border/60 bg-white p-8 opacity-40 transition-[opacity,transform,box-shadow,border-color,background-color] duration-500 data-[active=true]:scale-[1.02] data-[active=true]:border-primary/40 data-[active=true]:bg-white data-[active=true]:opacity-100 data-[active=true]:shadow-xl data-[active=true]:shadow-primary/10 md:p-10"
              >
                <div className="flex items-start justify-between gap-5">
                  <span className="block origin-top-left font-display text-5xl font-bold leading-none text-muted-foreground/15 transition-[transform,color] duration-500 ease-out will-change-transform group-data-[active=true]:scale-110 group-data-[active=true]:text-primary/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex h-12 w-12 shrink-0 origin-top-right items-center justify-center rounded-2xl bg-brand-blue/5 text-brand-blue/60 transition-[transform,background-color,color] duration-500 ease-out will-change-transform group-data-[active=true]:scale-110 group-data-[active=true]:bg-primary group-data-[active=true]:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-8 min-h-[4.5rem]">
                  <h3 className="origin-top-left font-display text-xl font-bold leading-snug text-brand-blue/50 transition-[transform,color] duration-500 ease-out will-change-transform group-data-[active=true]:scale-110 group-data-[active=true]:text-brand-blue">
                    {t(`${key}Title`)}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground/60 transition-colors duration-500 group-data-[active=true]:text-muted-foreground">
                  {t(`${key}Desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
