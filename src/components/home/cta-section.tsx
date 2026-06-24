"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { useTranslations } from "next-intl";
import { QuoteRequestForm } from "./quote-request-form";

export function CtaSection() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-blue grain" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-gold/10" />

      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <Gift className="h-10 w-10 text-gold" />
          </div>
          <h2 className="font-display text-4xl font-bold text-white md:text-6xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/65">
            {t("ctaSubtitle")}
          </p>
          <QuoteRequestForm />
        </motion.div>
      </div>
    </section>
  );
}
