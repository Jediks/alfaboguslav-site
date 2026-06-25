"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, Users, Package, Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider, readSliderValue } from "@/components/ui/slider";
import type { PricingTier, Product } from "@/types/database";
import { getProductTitle } from "@/lib/data/product-utils";
import { formatPrice } from "@/lib/pricing";
import { ProductImage } from "@/components/catalog/product-image";
import { SectionAmbient } from "@/components/ui/section-ambient";
import { cn } from "@/lib/utils";

type B2bConfiguratorProps = {
  products: Product[];
  pricingByProductId: Record<string, PricingTier[]>;
};

const STEP_COUNT = 3;

function MobilePreview({
  product,
  locale,
  localeStr,
  minPrice,
  resultLabel,
  unitLabel,
}: {
  product: Product;
  locale: string;
  localeStr: string;
  minPrice: number;
  resultLabel: string;
  unitLabel: string;
}) {
  return (
    <div
      data-testid="config-mobile-preview"
      className="sticky top-[5.75rem] z-20 col-span-full flex items-center gap-3 rounded-xl border border-border/60 bg-white/95 p-3 shadow-sm backdrop-blur-sm lg:hidden"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-blue">
        <ProductImage
          src={product.images[0]}
          alt={getProductTitle(product, locale)}
          sizes="56px"
          variant="dark"
          size="fill"
          className="absolute inset-0"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {resultLabel}
        </p>
        <p className="truncate text-sm font-semibold text-brand-blue">
          {getProductTitle(product, locale)}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {formatPrice(minPrice, localeStr)} / {unitLabel}
        </p>
      </div>
    </div>
  );
}

export function B2bConfigurator({ products, pricingByProductId }: B2bConfiguratorProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const reduceMotion = useReducedMotion();
  const [teamSize, setTeamSize] = useState(50);
  const [budget, setBudget] = useState(50000);
  const [step, setStep] = useState(0);

  const recommendation = useMemo(() => {
    const qty = teamSize;
    const budgetPerUnit = budget / Math.max(qty, 1);

    const scored = products.map((p) => {
      const minPrice = pricingByProductId[p.id]?.[0]?.price ?? 9999;
      const priceDiff = Math.abs(minPrice - budgetPerUnit);
      const bulkBonus = p.b2b_tags.includes("Bulk") && qty > 100 ? -200 : 0;
      const vipBonus = p.b2b_tags.includes("VIP") && qty < 30 ? -100 : 0;
      return { product: p, score: priceDiff + bulkBonus + vipBonus, minPrice };
    });

    scored.sort((a, b) => a.score - b.score);
    return scored[0];
  }, [products, pricingByProductId, teamSize, budget]);

  const stepLabels = [t("configTeam"), t("configBudget"), t("configResult")];

  return (
    <section id="configurator" className="relative overflow-hidden py-16 md:py-28">
      <SectionAmbient tone="warm" />

      <div className="relative mx-auto max-w-7xl px-4">
        <header className="mb-8 max-w-2xl md:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t("configLabel")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-brand-blue md:text-5xl">
            {t("configTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("configSubtitle")}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          {recommendation ? (
            <MobilePreview
              product={recommendation.product}
              locale={locale}
              localeStr={localeStr}
              minPrice={recommendation.minPrice}
              resultLabel={t("configResult")}
              unitLabel={t("configUnit")}
            />
          ) : null}

          <div className="surface-panel rounded-2xl p-4 md:p-8">
            <div className="mb-6">
              <p className="mb-2 text-xs text-muted-foreground" aria-live="polite">
                {t("configStepOf", { current: step + 1, total: STEP_COUNT })}
              </p>
              <div className="mb-2 flex gap-1.5 sm:gap-2">
                {stepLabels.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    aria-current={i === step ? "step" : undefined}
                    onClick={() => {
                      if (i <= step) setStep(i);
                    }}
                    disabled={i > step}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-2 py-2 text-left transition-colors sm:px-3",
                      i === step
                        ? "border-primary/30 bg-primary/5"
                        : i < step
                          ? "border-border/60 bg-white cursor-pointer hover:bg-cream/80"
                          : "border-transparent bg-muted/40 cursor-not-allowed opacity-60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        i < step && "bg-brand-blue text-white",
                        i === step && "bg-primary text-white",
                        i > step && "bg-muted text-muted-foreground"
                      )}
                    >
                      {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "hidden truncate text-[10px] font-medium uppercase tracking-wide sm:block",
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
                  transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="team"
                  initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
                  transition={{ duration: reduceMotion ? 0 : 0.25 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="h-4 w-4" />
                    </div>
                    <Label className="text-sm font-semibold text-brand-blue md:text-base">
                      {t("configTeam")}
                    </Label>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-[hsl(var(--control-bg))] px-4 py-4 text-center md:px-6 md:py-5">
                    <p className="text-3xl font-semibold tabular-nums text-brand-blue md:text-4xl">
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

                  <Button onClick={() => setStep(1)} className="h-10 w-full md:h-11">
                    {t("configNext")}
                  </Button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="budget"
                  initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
                  transition={{ duration: reduceMotion ? 0 : 0.25 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <Label className="text-sm font-semibold text-brand-blue md:text-base">
                      {t("configBudget")}
                    </Label>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-[hsl(var(--control-bg))] px-4 py-4 text-center md:px-6 md:py-5">
                    <p className="text-2xl font-semibold tabular-nums text-brand-blue md:text-3xl">
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
                    <Button variant="outline" onClick={() => setStep(0)} className="h-10 flex-1 md:h-11">
                      {t("configBack")}
                    </Button>
                    <Button onClick={() => setStep(2)} className="h-10 flex-1 md:h-11">
                      {t("configSeeResult")}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && recommendation && (
                <motion.div
                  key="result"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-primary">
                    {t("configResult")}
                  </p>
                  <h3 className="font-display text-xl font-semibold text-brand-blue md:text-2xl">
                    {getProductTitle(recommendation.product, locale)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t("configResultDesc", {
                      qty: teamSize,
                      price: formatPrice(recommendation.minPrice, localeStr),
                    })}
                  </p>
                  <div className="flex gap-3 pt-1">
                    <Button variant="outline" onClick={() => setStep(1)} className="h-10 flex-1 md:h-11">
                      {t("configBack")}
                    </Button>
                    <Link href={`/catalog/${recommendation.product.id}`} className="flex-1">
                      <Button className="h-10 w-full gap-2 md:h-11">
                        {t("configViewProduct")}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative hidden lg:block lg:min-h-[640px]">
            <AnimatePresence mode="wait">
              {recommendation && (
                <motion.div
                  key={recommendation.product.id}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: reduceMotion ? 0 : 0.35 }}
                  className="sticky top-28 flex h-full min-h-[640px] flex-col overflow-visible rounded-3xl glass-dark premium-shadow"
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
                    <Package className="mb-3 h-6 w-6 text-gold" />
                    <p className="font-display text-xl font-semibold leading-snug">
                      {getProductTitle(recommendation.product, locale)}
                    </p>
                    <p className="mt-2 text-sm tabular-nums text-white/70">
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
