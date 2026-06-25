import type { Metadata } from "next";
import { Award, Building2, Layers3 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutStoryCard, AboutTimeline } from "@/components/about/about-sections";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { getPageMetadata } from "@/lib/metadata/get-page-metadata";
import { getAboutBlock } from "@/lib/data/content-blocks";

type AboutPageProps = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: AboutPageProps): Promise<Metadata> {
  return getPageMetadata({ locale, page: "about", path: "/about" });
}

export default async function AboutPage({ params: { locale } }: AboutPageProps) {
  setRequestLocale(locale);
  const [t, aboutBlock] = await Promise.all([
    getTranslations({ locale, namespace: "about" }),
    getAboutBlock(),
  ]);

  const intro = locale === "en" ? aboutBlock.intro_en : aboutBlock.intro_uk;
  const missionTitle =
    locale === "en" ? aboutBlock.mission_title_en : aboutBlock.mission_title_uk;
  const missionDescription =
    locale === "en" ? aboutBlock.mission_description_en : aboutBlock.mission_description_uk;
  const values = aboutBlock.values.map((value) =>
    locale === "en" ? value.text_en : value.text_uk
  );

  const highlights = [
    {
      label: t("highlightLabels.experience"),
      value: "30+",
      hint: t("highlights.experience"),
      icon: Award,
    },
    {
      label: t("highlightLabels.assortment"),
      value: "1000+",
      hint: t("highlights.assortment"),
      icon: Layers3,
    },
    {
      label: t("highlightLabels.clients"),
      value: "500+",
      hint: t("highlights.clients"),
      icon: Building2,
    },
  ] as const;

  return (
    <MarketingPageShell tone="cream" maxWidth="5xl">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={intro}
        size="hero"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {highlights.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            hero
            hint={<p className="text-xs leading-relaxed text-muted-foreground">{item.hint}</p>}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <AboutTimeline locale={locale} />
        <AboutStoryCard locale={locale} />
      </div>

      <div className="surface-panel mt-8 rounded-2xl p-6 md:p-8">
        <h2 className="font-display text-xl font-semibold text-brand-blue md:text-2xl">
          {missionTitle}
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          {missionDescription}
        </p>
        <h3 className="ui-section-title mt-8">{t("valuesTitle")}</h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {values.map((value) => (
            <li
              key={value}
              className="rounded-xl border border-border/50 bg-[hsl(var(--control-bg))] px-4 py-3 text-sm leading-relaxed text-muted-foreground"
            >
              {value}
            </li>
          ))}
        </ul>
      </div>
    </MarketingPageShell>
  );
}
