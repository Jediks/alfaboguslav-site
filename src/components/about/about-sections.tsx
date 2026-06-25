import { Gift } from "lucide-react";
import { getTranslations } from "next-intl/server";

type AboutTimelineProps = {
  locale: string;
};

const TIMELINE_KEYS = ["item1", "item2", "item3"] as const;

export async function AboutTimeline({ locale }: AboutTimelineProps) {
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <section className="surface-panel rounded-2xl p-6 md:p-8">
      <h2 className="font-display text-xl font-semibold text-brand-blue md:text-2xl">
        {t("timelineTitle")}
      </h2>
      <ol className="relative mt-8 space-y-8 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-border/70 md:before:left-[13px]">
        {TIMELINE_KEYS.map((key) => (
          <li key={key} className="relative pl-10 md:pl-12">
            <span
              className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary/30 bg-cream text-[10px] font-bold tabular-nums text-primary md:h-7 md:w-7 md:text-[11px]"
              aria-hidden
            >
              •
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              {t(`timeline.${key}Year`)}
            </p>
            <h3 className="mt-1 font-semibold text-brand-blue">{t(`timeline.${key}Title`)}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t(`timeline.${key}Desc`)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

type AboutStoryCardProps = {
  locale: string;
};

export async function AboutStoryCard({ locale }: AboutStoryCardProps) {
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-brand-blue p-8 text-white grain md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-gold/15" />
      <div className="relative">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          <Gift className="h-7 w-7 text-gold" aria-hidden />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
          {t("storyLabel")}
        </p>
        <p className="mt-3 font-display text-3xl font-semibold tabular-nums md:text-4xl">
          {t("storyStat")}
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">{t("storyDesc")}</p>
      </div>
    </div>
  );
}
