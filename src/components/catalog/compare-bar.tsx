"use client";

import { useEffect, useState } from "react";
import { Scale, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/stores/compare-store";

export function CompareBar() {
  const t = useTranslations("catalog.compare");
  const ids = useCompareStore((s) => s.ids);
  const clear = useCompareStore((s) => s.clear);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted || ids.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-white/95 px-4 py-3 backdrop-blur-md premium-shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-brand-blue">
          <Scale className="h-5 w-5 text-primary" />
          {t("selected", { count: ids.length })}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            {t("clear")}
          </Button>
          <Link href="/compare">
            <Button size="sm" disabled={ids.length < 2}>
              {t("compareN", { count: ids.length })}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
