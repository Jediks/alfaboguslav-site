"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormState = {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

const initialState: FormState = {
  company: "",
  name: "",
  email: "",
  phone: "",
  message: "",
};

export function ContactForm() {
  const t = useTranslations("contact");
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const referenceId = `Q-${Date.now().toString(36).toUpperCase()}`;
    try {
      const { submitQuote } = await import("@/lib/actions/quotes");
      await submitQuote({
        referenceId,
        company_name: form.company.trim(),
        contact_name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      setForm(initialState);
      toast.success(t("successTitle"), { description: t("successDescription") });
    } catch {
      toast.error(t("errorTitle"), { description: t("errorDescription") });
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8">
        <p className="font-display text-2xl font-semibold text-brand-blue">{t("successTitle")}</p>
        <p className="mt-2 text-muted-foreground">{t("successDescription")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-border/70 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-company">{t("form.company")}</Label>
          <Input
            id="contact-company"
            value={form.company}
            onChange={(event) => updateField("company", event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-name">{t("form.name")}</Label>
          <Input
            id="contact-name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-email">{t("form.email")}</Label>
          <Input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone">{t("form.phone")}</Label>
          <Input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">{t("form.message")}</Label>
        <Textarea
          id="contact-message"
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          rows={5}
          placeholder={t("form.messagePlaceholder")}
        />
      </div>

      <Button type="submit" size="lg" className="h-11 gap-2 rounded-full px-8" disabled={submitting}>
        <Send className="h-4 w-4" />
        {submitting ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
}
