"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ThankYouContent() {
  const t = useTranslations("thankYou");
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
      >
        <CheckCircle2 className="h-10 w-10 text-primary" />
      </motion.div>

      <h1 className="font-display text-3xl font-bold text-brand-blue">{t("title")}</h1>
      <p className="mt-4 max-w-lg text-muted-foreground">{t("subtitle")}</p>

      {orderId ? (
        <p className="mt-6 rounded-2xl bg-muted px-6 py-3 font-mono text-sm">
          {t("orderNumber")}: <strong>{orderId}</strong>
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button variant="outline">{t("backHome")}</Button>
        </Link>
        <Link href="/account">
          <Button>{t("viewOrders")}</Button>
        </Link>
      </div>

      <div className="surface-panel mt-10 w-full rounded-2xl p-6 text-left md:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-brand-blue">
              {t("upsellTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("upsellDescription")}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/catalog">
            <Button>{t("browseCatalog")}</Button>
          </Link>
          <Link href="/compare">
            <Button variant="outline">{t("compareSets")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
