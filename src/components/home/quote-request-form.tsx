"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuoteStore } from "@/stores/quote-store";
import { trackEvent } from "@/lib/analytics/track";
import { SparkleBurst } from "./sparkle-burst";
import { QuoteNextSteps } from "./quote-next-steps";

export function QuoteRequestForm() {
  const t = useTranslations("home");
  const addQuote = useQuoteStore((s) => s.addQuote);
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !name.trim() || !email.trim() || !phone.trim()) return;

    setSubmitting(true);
    const id = `Q-${Date.now().toString(36).toUpperCase()}`;

    let persisted: "supabase" | "local" = "local";
    try {
      const { submitQuote } = await import("@/lib/actions/quotes");
      const result = await submitQuote({
        referenceId: id,
        company_name: company.trim(),
        contact_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });
      persisted = result.persisted;
    } catch (err) {
      if (err instanceof Error && err.name === "RateLimitError") {
        setSubmitting(false);
        const retry =
          (err as Error & { retryAfterSec?: number }).retryAfterSec ?? 60;
        toast.error(t("quoteRateLimitTitle"), {
          description: t("quoteRateLimitDescription", { seconds: retry }),
        });
        return;
      }
      console.error("[quote] submitQuote failed", err);
    }

    if (persisted !== "supabase") {
      addQuote({
        id,
        company_name: company.trim(),
        contact_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
        created_at: new Date().toISOString(),
      });
    }

    setSent(true);
    setSubmitting(false);
    trackEvent("quote_submit", { reference_id: id, persisted });
    toast.success(t("quoteSuccessTitle"), { description: t("quoteSuccessDesc") });
  };

  if (sent) {
    return (
      <div
        className="relative mx-auto mt-10 max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md"
        role="status"
        aria-live="polite"
      >
        <SparkleBurst active />
        <p className="font-display text-xl font-semibold text-white">{t("quoteSuccessTitle")}</p>
        <p className="mt-2 text-sm text-white/65">{t("quoteSuccessDesc")}</p>
        <div className="mt-6">
          <QuoteNextSteps />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 max-w-xl space-y-4 rounded-2xl border border-white/15 bg-white/10 p-6 text-left backdrop-blur-md md:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quote-company" className="text-white/80">
            {t("quoteCompany")}
          </Label>
          <Input
            id="quote-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            className="border-white/20 bg-white/95"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quote-name" className="text-white/80">
            {t("quoteName")}
          </Label>
          <Input
            id="quote-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border-white/20 bg-white/95"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quote-email" className="text-white/80">
            {t("quoteEmail")}
          </Label>
          <Input
            id="quote-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-white/20 bg-white/95"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quote-phone" className="text-white/80">
            {t("quotePhone")}
          </Label>
          <Input
            id="quote-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="border-white/20 bg-white/95"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="quote-message" className="text-white/80">
          {t("quoteMessage")}
        </Label>
        <Textarea
          id="quote-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder={t("quoteMessagePlaceholder")}
          className="resize-none border-white/20 bg-white/95"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="h-12 w-full gap-2 rounded-full bg-white text-brand-blue hover:bg-white/90"
      >
        <Send className="h-4 w-4" />
        {t("quoteSubmit")}
      </Button>
      <QuoteNextSteps />
    </form>
  );
}
