"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: ErrorProps) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error("[admin.error]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="glass rounded-3xl p-8 premium-shadow text-center">
        <h2 className="font-display text-2xl font-semibold text-brand-blue">
          {t("adminTitle")}
        </h2>
        <p className="mt-3 text-muted-foreground">{t("description")}</p>
        {error.digest && (
          <p className="mt-3 text-xs font-mono text-muted-foreground/70">
            {t("reference")}: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()}>{t("retry")}</Button>
        </div>
      </div>
    </div>
  );
}
