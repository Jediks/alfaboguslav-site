"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FileText, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useQuotePrefillStore } from "@/stores/quote-prefill-store";
import { useCartStore } from "@/stores/cart-store";

export function QuoteConversionBanner() {
  const t = useTranslations("catalog.quoteConversion");
  const active = useQuotePrefillStore((s) => s.active);
  const clear = useQuotePrefillStore((s) => s.clear);
  const itemCount = useCartStore((s) => s.items.length);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted || !active) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="font-medium text-brand-blue">
            {t("title", { reference: active.referenceId })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", { company: active.company_name })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {itemCount > 0 ? (
          <Link href="/checkout">
            <Button size="sm">{t("goCheckout")}</Button>
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">{t("pickProducts")}</span>
        )}
        <Button size="sm" variant="ghost" onClick={clear} aria-label={t("dismiss")}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
