import { setRequestLocale, getTranslations } from "next-intl/server";

type AboutPageProps = {
  params: { locale: string };
};

export default async function AboutPage({ params: { locale } }: AboutPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  const highlights = [t("highlights.experience"), t("highlights.assortment"), t("highlights.clients")];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="rounded-3xl border border-border/60 bg-white p-8 shadow-sm md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue/70">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-brand-blue md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">{t("intro")}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item} className="rounded-2xl border border-border/60 bg-white p-6 text-sm leading-relaxed">
            {item}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-border/60 bg-white p-8 shadow-sm md:p-10">
        <h2 className="font-display text-2xl font-semibold text-brand-blue">{t("missionTitle")}</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">{t("missionDescription")}</p>
        <h3 className="mt-8 font-display text-xl font-semibold text-brand-blue">{t("valuesTitle")}</h3>
        <ul className="mt-4 space-y-3 text-muted-foreground">
          <li>{t("values.quality")}</li>
          <li>{t("values.personalization")}</li>
          <li>{t("values.reliability")}</li>
        </ul>
      </div>
    </div>
  );
}
