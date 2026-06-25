"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { CreditCard, FileText, Truck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/stores/cart-store";
import { useQuotePrefillStore } from "@/stores/quote-prefill-store";
import { getPriceForQuantity, formatPrice } from "@/lib/pricing";
import { trackEvent } from "@/lib/analytics/track";
import type { PaymentMethod, PricingTier } from "@/types/database";

type CheckoutClientProps = {
  pricingByProductId: Record<string, PricingTier[]>;
  profilePrefill?: {
    companyName?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  remotePersistenceEnabled?: boolean;
};

export function CheckoutClient({
  pricingByProductId,
  profilePrefill,
  remotePersistenceEnabled = false,
}: CheckoutClientProps) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const router = useRouter();
  const { items, clearCart, addOrder } = useCartStore();
  const quotePrefill = useQuotePrefillStore((s) => s.active);
  const clearQuotePrefill = useQuotePrefillStore((s) => s.clear);
  const [delivery, setDelivery] = useState("");
  const [company, setCompany] = useState(profilePrefill?.companyName ?? "");
  const [contactName, setContactName] = useState(profilePrefill?.contactName ?? "");
  const [contactEmail, setContactEmail] = useState(profilePrefill?.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(profilePrefill?.contactPhone ?? "");
  const [payment, setPayment] = useState<PaymentMethod>("invoice");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !quotePrefill) return;
    setCompany((prev) => prev || quotePrefill.company_name);
    setContactName((prev) => prev || quotePrefill.contact_name);
    setContactEmail((prev) => prev || quotePrefill.email);
    setContactPhone((prev) => prev || quotePrefill.phone);
    setDelivery((prev) => {
      if (prev.trim()) return prev;
      const refLine = `[Quote ${quotePrefill.referenceId}]`;
      const msg = quotePrefill.message?.trim();
      return msg ? `${refLine}\n${msg}` : refLine;
    });
  }, [mounted, quotePrefill]);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/cart");
    }
  }, [mounted, items.length, router]);

  let total = 0;
  const orderItems = items.map((item) => {
    const tiers = pricingByProductId[item.productId] ?? [];
    const price = getPriceForQuantity(tiers, item.quantity);
    total += price * item.quantity;
    return { productId: item.productId, quantity: item.quantity, price_at_time: price };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !delivery.trim() ||
      !company.trim() ||
      !contactName.trim() ||
      !contactEmail.trim() ||
      !contactPhone.trim() ||
      items.length === 0
    )
      return;

    setSubmitting(true);
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

    let persisted: "supabase" | "local" = "local";
    let submitFailed = false;
    try {
      const { submitOrder } = await import("@/lib/actions/orders");
      const result = await submitOrder({
        referenceId: orderId,
        status: "pending",
        total_estimated_price: total,
        payment_method: payment,
        delivery_address: delivery.trim(),
        company_name: company.trim(),
        contact_name: contactName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        branding_logo_url: items[0]?.brandingLogoUrl ?? null,
        items: orderItems.map((item, idx) => ({
          ...item,
          brandingLogoUrl: items[idx]?.brandingLogoUrl,
        })),
        locale: locale === "en" ? "en" : "uk",
      });
      persisted = result.persisted;
    } catch (err) {
      if (err instanceof Error && err.name === "RateLimitError") {
        setSubmitting(false);
        const retry =
          (err as Error & { retryAfterSec?: number }).retryAfterSec ?? 60;
        toast.error(t("rateLimitTitle"), {
          description: t("rateLimitDescription", { seconds: retry }),
        });
        return;
      }
      submitFailed = true;
      console.error("[checkout] submitOrder failed", err);
    }

    if (remotePersistenceEnabled) {
      if (persisted !== "supabase") {
        setSubmitting(false);
        toast.error(t("submitFailed"));
        return;
      }
    } else if (submitFailed) {
      setSubmitting(false);
      toast.error(t("submitFailed"));
      return;
    } else if (persisted !== "supabase") {
      addOrder({
        id: orderId,
        status: "pending",
        total_estimated_price: total,
        payment_method: payment,
        delivery_address: delivery,
        company_name: company.trim(),
        contact_name: contactName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        branding_logo_url: items[0]?.brandingLogoUrl ?? null,
        created_at: new Date().toISOString(),
        items: orderItems,
      });
    }

    trackEvent("begin_checkout", { order_id: orderId, total });
    clearCart();
    clearQuotePrefill();
    setSubmitting(false);
    router.push(`/thank-you?order=${orderId}`);
  };

  if (!mounted || items.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PageHeader title={t("title")} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="surface-panel rounded-2xl p-6">
          <p className="ui-section-title mb-4">{t("companyDetails")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="company">{t("companyName")}</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">{t("contactName")}</Label>
              <Input
                id="contact"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("contactPhone")}</Label>
              <Input
                id="phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">{t("contactEmail")}</Label>
              <Input
                id="email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="surface-panel rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" aria-hidden />
            <p className="ui-section-title">{t("delivery")}</p>
          </div>
          <Textarea
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            placeholder={t("deliveryPlaceholder")}
            rows={4}
            required
            className="resize-none"
          />
        </div>

        <div className="surface-panel rounded-2xl p-6">
          <p className="ui-section-title mb-4">{t("payment")}</p>
          <RadioGroup
            value={payment}
            onValueChange={(v) => setPayment(v as PaymentMethod)}
            className="space-y-3"
          >
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <RadioGroupItem value="online" />
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span>{t("paymentOnline")}</span>
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <RadioGroupItem value="invoice" />
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>{t("paymentInvoice")}</span>
            </label>
          </RadioGroup>
        </div>

        <div className="rounded-3xl bg-brand-blue p-6 text-white">
          <div className="flex justify-between text-lg">
            <span>{tCart("estimatedTotal")}</span>
            <span className="font-bold">{formatPrice(total, localeStr)}</span>
          </div>
          <p className="mt-2 text-sm text-white/70">{t("managerNotice")}</p>
        </div>

        <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={submitting}>
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}
