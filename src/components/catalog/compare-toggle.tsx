"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Scale } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { MAX_COMPARE, useCompareStore } from "@/stores/compare-store";

type CompareToggleProps = {
  productId: string;
  variant?: "card" | "inline";
};

export function CompareToggle({ productId, variant = "card" }: CompareToggleProps) {
  const t = useTranslations("catalog.compare");
  const ids = useCompareStore((s) => s.ids);
  const toggle = useCompareStore((s) => s.toggle);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const active = ids.includes(productId);
  const atLimit = !active && ids.length >= MAX_COMPARE;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (atLimit) return;
    toggle(productId);
  };

  if (variant === "inline") {
    return (
      <Button
        type="button"
        variant={active ? "default" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={atLimit}
        aria-pressed={active}
        title={atLimit ? t("limit", { max: MAX_COMPARE }) : active ? t("remove") : t("add")}
        className="gap-2"
      >
        {active ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
        {active ? t("added") : t("add")}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={atLimit}
      aria-pressed={active}
      title={atLimit ? t("limit", { max: MAX_COMPARE }) : active ? t("remove") : t("add")}
      className={`absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur-md transition-colors ${
        active
          ? "bg-primary text-white"
          : atLimit
            ? "cursor-not-allowed bg-white/70 text-muted-foreground"
            : "bg-white/90 text-brand-blue hover:bg-primary hover:text-white"
      }`}
    >
      {active ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      {active ? t("added") : t("add")}
    </button>
  );
}
