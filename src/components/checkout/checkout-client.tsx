"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CreditCard, FileText, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/stores/cart-store";
import { MOCK_PRICING } from "@/lib/data/mock-products";
import { getPriceForQuantity, formatPrice } from "@/lib/pricing";
import type { PaymentMethod } from "@/types/database";

export function CheckoutClient() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const router = useRouter();
  const { items, clearCart, addOrder } = useCartStore();
  const [delivery, setDelivery] = useState("");
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("invoice");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/cart");
    }
  }, [mounted, items.length, router]);

  let total = 0;
  const orderItems = items.map((item) => {
    const tiers = MOCK_PRICING[item.productId] ?? [];
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

    try {
      const { submitOrder } = await import("@/lib/actions/orders");
      await submitOrder({
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
      });
    } catch {
      // Still save locally if Supabase fails
    }

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

    clearCart();
    router.push(`/thank-you?order=${orderId}`);
  };

  if (!mounted || items.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 font-display text-3xl font-bold text-brand-blue">{t("title")}</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass rounded-3xl p-6 premium-shadow">
          <Label className="mb-4 block font-display font-semibold text-brand-blue">
            {t("companyDetails")}
          </Label>
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

        <div className="glass rounded-3xl p-6 premium-shadow">
          <div className="mb-4 flex items-center gap-2 font-display font-semibold text-brand-blue">
            <Truck className="h-5 w-5" />
            {t("delivery")}
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

        <div className="glass rounded-3xl p-6 premium-shadow">
          <Label className="mb-4 block font-display font-semibold text-brand-blue">
            {t("payment")}
          </Label>
          <RadioGroup
            value={payment}
            onValueChange={(v) => setPayment(v as PaymentMethod)}
            className="space-y-3"
          >
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <RadioGroupItem value="online" />
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span>{t("paymentOnline")}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
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
