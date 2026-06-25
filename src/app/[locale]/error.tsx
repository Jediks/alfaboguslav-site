"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: ErrorProps) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error("[locale.error]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold text-brand-blue md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">{t("description")}</p>
      {error.digest && (
        <p className="mt-3 text-xs font-mono text-muted-foreground/70">
          {t("reference")}: {error.digest}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()}>{t("retry")}</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          {t("home")}
        </Button>
      </div>
    </div>
  );
}
