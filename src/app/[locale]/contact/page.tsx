import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/contact-form";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { PageHeader } from "@/components/ui/page-header";

type ContactPageProps = {
  params: { locale: string };
};

export default async function ContactPage({ params: { locale } }: ContactPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const tFooter = await getTranslations({ locale, namespace: "footer" });

  const contactItems = [
    {
      icon: Phone,
      href: `tel:${tFooter("phone")}`,
      label: t("channels.phone"),
      value: tFooter("phone"),
    },
    {
      icon: Mail,
      href: `mailto:${tFooter("email")}`,
      label: t("channels.email"),
      value: tFooter("email"),
    },
    {
      icon: MapPin,
      href: undefined,
      label: t("channels.address"),
      value: tFooter("address"),
    },
    {
      icon: Clock,
      href: undefined,
      label: t("hoursTitle"),
      value: t("hours"),
    },
  ] as const;

  return (
    <MarketingPageShell tone="white" maxWidth="6xl" blobs={false}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-start">
        <aside className="surface-panel rounded-2xl p-6 md:p-8">
          <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />

          <div className="space-y-3">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const inner = (
                <>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-sm font-medium text-brand-blue">{item.value}</span>
                  </span>
                </>
              );

              if (item.href) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-[hsl(var(--control-bg))] px-4 py-3 transition-colors hover:border-primary/25 hover:bg-cream"
                  >
                    {inner}
                  </a>
                );
              }

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-[hsl(var(--control-bg))] px-4 py-3"
                >
                  {inner}
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{t("responseNote")}</p>
        </aside>

        <section>
          <ContactForm />
        </section>
      </div>
    </MarketingPageShell>
  );
}
