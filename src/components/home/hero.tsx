"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { HeroAmbience } from "./hero-ambience";

export function Hero() {
  const t = useTranslations("home");
  const imageRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const parallaxX = useTransform(springX, [-0.5, 0.5], [-12, 12]);
  const parallaxY = useTransform(springY, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = imageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY]
  );

  const titleLines = [t("heroTitleLine1"), t("heroTitleLine2")];

  return (
    <section
      className="relative -mt-[5.75rem] overflow-hidden bg-brand-blue text-white grain md:-mt-[6.25rem]"
      onMouseMove={handleMouseMove}
    >
      <HeroAmbience />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[560px] w-[560px] rounded-full bg-gold/15 blur-[100px]" />
      </div>

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-20 pt-[calc(5.75rem+3rem)] md:px-8 md:pb-24 md:pt-[calc(6.25rem+4rem)] lg:grid-cols-[minmax(0,42%)_minmax(0,58%)] lg:gap-3 xl:gap-5">
        <div className="relative z-20 max-w-xl lg:max-w-none">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-white/50"
          >
            {t("heroBadge")}
          </motion.p>

          <div className="overflow-visible pb-1">
            {titleLines.map((line, lineIdx) => (
              <motion.h1
                key={lineIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap overflow-visible font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[1.15] tracking-tight"
              >
                {line.split(" ").map((word, wi) => (
                  <motion.span
                    key={`${lineIdx}-${wi}`}
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.75,
                      delay: 0.06 * (lineIdx * 4 + wi),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`mr-[0.25em] inline-block overflow-visible pb-[0.12em] ${
                      lineIdx === 1 ? "text-gradient-gold" : ""
                    }`}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-white/70 md:mt-8 md:text-lg"
          >
            {t("heroSubtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="mt-8 flex flex-wrap gap-3 md:mt-10 md:gap-4"
          >
            <Link href="/catalog">
              <Button
                size="lg"
                className="group h-12 gap-2 rounded-full bg-primary px-8 text-base font-semibold shadow-xl shadow-primary/30 hover:bg-primary/90 md:h-14 md:px-10"
              >
                {t("ctaCatalog")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#configurator">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/25 bg-white/5 px-8 text-base text-white backdrop-blur-sm hover:bg-white/10 hover:text-white md:h-14 md:px-10"
              >
                {t("ctaConsult")}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 md:mt-14 md:max-w-md md:gap-6"
          >
            {[
              { val: "30+", label: t("statsYears") },
              { val: "500+", label: t("statsClients") },
              { val: "98%", label: t("statsSatisfaction") },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-xl font-bold md:text-2xl">{s.val}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-white/40 md:text-xs">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          ref={imageRef}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ x: parallaxX, y: parallaxY }}
          className="hero-product-stage relative z-10 flex w-full items-center justify-center overflow-visible lg:-ml-2 lg:justify-end xl:-ml-4"
        >
          <div className="product-stage-dark pointer-events-none absolute inset-0 overflow-visible">
            <div className="product-spotlight hero-product-spotlight" aria-hidden />
          </div>
          <div className="relative h-[min(44vh,400px)] w-full sm:h-[min(48vh,440px)] lg:-mt-8 lg:mb-4 lg:h-[min(46vh,460px)]">
            <div className="hero-float-wrap relative h-full w-full">
              <Image
                src="/catalog/cutouts/hero-main.png?v=20260626e"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="hero-float !max-w-none object-contain object-center"
              />
            </div>
          </div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[6%] left-0 z-20 rounded-2xl border border-white/20 bg-white/15 px-6 py-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-7 sm:py-4 lg:bottom-[18%] lg:left-[4%]"
          >
            <p className="font-display text-2xl font-bold leading-none text-gold">VIP</p>
            <p className="mt-1.5 text-xs font-medium text-white/80 sm:text-sm">{t("vipBadge")}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
