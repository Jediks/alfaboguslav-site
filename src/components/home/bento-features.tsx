"use client";

import { motion } from "framer-motion";
import { Palette, TrendingDown, Award, Truck } from "lucide-react";
import { useTranslations } from "next-intl";

const icons = [Palette, TrendingDown, Award, Truck];
const keys = ["feature1", "feature2", "feature3", "feature4"] as const;

export function BentoFeatures() {
  const t = useTranslations("home");

  return (
    <section className="mx-auto max-w-7xl px-4 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 text-center font-display text-3xl font-bold text-brand-blue md:text-4xl"
      >
        {t("featuresTitle")}
      </motion.h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {keys.map((key, i) => {
          const Icon = icons[i];
          const isLarge = i === 0 || i === 3;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-white p-8 premium-shadow transition-shadow hover:premium-shadow-hover ${
                isLarge ? "lg:row-span-1" : ""
              }`}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-brand-blue/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-brand-blue">
                  {t(`${key}Title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`${key}Desc`)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
