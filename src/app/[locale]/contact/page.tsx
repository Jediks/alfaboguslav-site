import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/contact-form";

type ContactPageProps = {
  params: { locale: string };
};

export default async function ContactPage({ params: { locale } }: ContactPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const tFooter = await getTranslations({ locale, namespace: "footer" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.35fr]">
        <aside className="rounded-3xl border border-border/70 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue/70">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-brand-blue">{t("title")}</h1>
          <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>

          <div className="mt-8 space-y-4 text-sm text-muted-foreground">
            <a href={`tel:${tFooter("phone")}`} className="flex items-center gap-3 transition-colors hover:text-brand-blue">
              <Phone className="h-4 w-4" />
              <span>{tFooter("phone")}</span>
            </a>
            <a
              href={`mailto:${tFooter("email")}`}
              className="flex items-center gap-3 transition-colors hover:text-brand-blue"
            >
              <Mail className="h-4 w-4" />
              <span>{tFooter("email")}</span>
            </a>
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{tFooter("address")}</span>
            </p>
          </div>
        </aside>

        <section>
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
