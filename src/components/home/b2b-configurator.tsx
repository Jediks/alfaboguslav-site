"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Building2, Users, Package, Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider, readSliderValue } from "@/components/ui/slider";
import type { Product } from "@/types/database";
import { getProductTitle } from "@/lib/data/product-utils";
import { MOCK_PRICING } from "@/lib/data/mock-products";
import { formatPrice } from "@/lib/pricing";
import { ProductImage } from "@/components/catalog/product-image";
import { cn } from "@/lib/utils";

type B2bConfiguratorProps = {
  products: Product[];
};

const STEP_COUNT = 3;

export function B2bConfigurator({ products }: B2bConfiguratorProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const [teamSize, setTeamSize] = useState(50);
  const [budget, setBudget] = useState(50000);
  const [step, setStep] = useState(0);

  const recommendation = useMemo(() => {
    const qty = teamSize;
    const budgetPerUnit = budget / Math.max(qty, 1);

    const scored = products.map((p) => {
      const minPrice = MOCK_PRICING[p.id]?.[0]?.price ?? 9999;
      const priceDiff = Math.abs(minPrice - budgetPerUnit);
      const bulkBonus = p.b2b_tags.includes("Bulk") && qty > 100 ? -200 : 0;
      const vipBonus = p.b2b_tags.includes("VIP") && qty < 30 ? -100 : 0;
      return { product: p, score: priceDiff + bulkBonus + vipBonus, minPrice };
    });

    scored.sort((a, b) => a.score - b.score);
    return scored[0];
  }, [products, teamSize, budget]);

  const stepLabels = [t("configTeam"), t("configBudget"), t("configResult")];

  return (
    <section id="configurator" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="absolute inset-0 mesh-gradient opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-12 md:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t("configLabel")}
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-brand-blue md:text-5xl">
            {t("configTitle")}
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">{t("configSubtitle")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="rounded-[2rem] border border-border/50 bg-cream p-8 premium-shadow md:p-10">
            <div className="mb-8">
              <div className="mb-3 flex justify-between gap-2">
                {stepLabels.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1.5 text-center",
                      i <= step ? "cursor-pointer" : "cursor-default"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all",
                        i < step && "bg-brand-blue text-white",
                        i === step && "bg-primary text-white shadow-lg shadow-primary/25",
                        i > step && "bg-muted text-muted-foreground"
                      )}
                    >
                      {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "hidden text-[10px] font-medium uppercase tracking-wide sm:block",
                        i === step ? "text-brand-blue" : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-brand-blue/10">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  animate={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="team"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <Label className="text-base font-semibold text-brand-blue">
                      {t("configTeam")}
                    </Label>
                  </div>

                  <div className="rounded-2xl border border-border/40 bg-white px-6 py-5 text-center">
                    <p className="font-display text-5xl font-bold tabular-nums text-brand-blue">
                      {teamSize}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{t("configPeople")}</p>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>10</span>
                      <span>500</span>
                    </div>
                    <Slider
                      min={10}
                      max={500}
                      step={10}
                      value={teamSize}
                      onValueChange={(v) => setTeamSize(readSliderValue(v))}
                    />
                  </div>

                  <Button onClick={() => setStep(1)} className="h-12 w-full rounded-full">
                    {t("configNext")}
                  </Button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="budget"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <Label className="text-base font-semibold text-brand-blue">
                      {t("configBudget")}
                    </Label>
                  </div>

                  <div className="rounded-2xl border border-border/40 bg-white px-6 py-5 text-center">
                    <p className="font-display text-4xl font-bold tabular-nums text-brand-blue md:text-5xl">
                      {formatPrice(budget, localeStr)}
                    </p>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>{formatPrice(5000, localeStr)}</span>
                      <span>{formatPrice(200000, localeStr)}</span>
                    </div>
                    <Slider
                      min={5000}
                      max={200000}
                      step={5000}
                      value={budget}
                      onValueChange={(v) => setBudget(readSliderValue(v))}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(0)}
                      className="h-12 flex-1 rounded-full"
                    >
                      {t("configBack")}
                    </Button>
                    <Button onClick={() => setStep(2)} className="h-12 flex-1 rounded-full">
                      {t("configSeeResult")}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && recommendation && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-sm font-medium uppercase tracking-wider text-primary">
                    {t("configResult")}
                  </p>
                  <h3 className="font-display text-2xl font-bold text-brand-blue">
                    {getProductTitle(recommendation.product, locale)}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("configResultDesc", {
                      qty: teamSize,
                      price: formatPrice(recommendation.minPrice, localeStr),
                    })}
                  </p>
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="h-12 flex-1 rounded-full"
                    >
                      {t("configBack")}
                    </Button>
                    <Link href={`/catalog/${recommendation.product.id}`} className="flex-1">
                      <Button className="h-12 w-full gap-2 rounded-full">
                        {t("configViewProduct")}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative hidden lg:block lg:min-h-[720px]">
            <AnimatePresence mode="wait">
              {recommendation && (
                <motion.div
                  key={recommendation.product.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                  className="sticky top-28 flex h-full min-h-[720px] flex-col overflow-visible rounded-[2rem] glass-dark premium-shadow"
                >
                  <div className="relative min-h-0 flex-1">
                    <ProductImage
                      src={recommendation.product.images[0]}
                      alt={getProductTitle(recommendation.product, locale)}
                      sizes="50vw"
                      variant="dark"
                      size="fill"
                      className="absolute inset-0 overflow-visible"
                      imageClassName="scale-[1.42] md:scale-[1.5]"
                    />
                  </div>
                  <div className="shrink-0 border-t border-white/10 p-6 text-white">
                    <Package className="mb-3 h-7 w-7 text-gold" />
                    <p className="font-display text-xl font-bold leading-snug">
                      {getProductTitle(recommendation.product, locale)}
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      {formatPrice(recommendation.minPrice, localeStr)} / {t("configUnit")}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
