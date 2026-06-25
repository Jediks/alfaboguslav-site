"use client";

import { useTranslations } from "next-intl";

export function QuoteNextSteps() {
  const t = useTranslations("home");
  const steps = [
    { title: t("quoteStep1Title"), desc: t("quoteStep1Desc") },
    { title: t("quoteStep2Title"), desc: t("quoteStep2Desc") },
    { title: t("quoteStep3Title"), desc: t("quoteStep3Desc") },
  ];

  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-4 md:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
        {t("quoteNextStepsTitle")}
      </p>
      <ol className="mt-4 grid gap-4 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="text-left">
            <span className="text-xs font-bold tabular-nums text-gold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="mt-1 text-sm font-medium text-white">{step.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-white/55">{step.desc}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
