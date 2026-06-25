"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import {
  publishContentBlock,
  saveContentBlockDraft,
} from "@/lib/actions/content-blocks";
import type { AdminContentBlock } from "@/lib/data/content-blocks";
import {
  DEFAULT_HERO_BLOCK,
  DEFAULT_TESTIMONIALS_BLOCK,
  type ContentBlockKey,
  type HeroBlockData,
  type TestimonialItem,
  type TestimonialsBlockData,
} from "@/types/content-blocks";

type ContentBlocksEditorProps = {
  blocks: AdminContentBlock[];
  supabaseEnabled: boolean;
};

function findBlock<T>(
  blocks: AdminContentBlock[],
  key: ContentBlockKey,
  fallback: T
): T {
  const found = blocks.find((b) => b.block_key === key);
  return (found?.data as T) ?? fallback;
}

type BlockStatus = { hasDraft: boolean; hasPublished: boolean };

function findStatus(blocks: AdminContentBlock[], key: ContentBlockKey): BlockStatus {
  const found = blocks.find((b) => b.block_key === key);
  return {
    hasDraft: found?.has_draft ?? false,
    hasPublished: found?.has_published ?? false,
  };
}

function StatusBadge({ status }: { status: BlockStatus }) {
  const t = useTranslations("admin.contentBlocks");
  if (status.hasDraft) {
    return (
      <Badge variant="outline" className="border-amber-400 text-amber-600">
        {t("statusDraft")}
      </Badge>
    );
  }
  if (status.hasPublished) {
    return (
      <Badge variant="secondary" className="text-emerald-700">
        {t("statusLive")}
      </Badge>
    );
  }
  return <Badge variant="outline">{t("statusUnpublished")}</Badge>;
}

export function ContentBlocksEditor({
  blocks,
  supabaseEnabled,
}: ContentBlocksEditorProps) {
  const t = useTranslations("admin.contentBlocks");
  const [hero, setHero] = useState<HeroBlockData>(() =>
    findBlock(blocks, "hero", DEFAULT_HERO_BLOCK)
  );
  const [testimonials, setTestimonials] = useState<TestimonialsBlockData>(() =>
    findBlock(blocks, "testimonials", DEFAULT_TESTIMONIALS_BLOCK)
  );
  const [heroStatus, setHeroStatus] = useState<BlockStatus>(() =>
    findStatus(blocks, "hero")
  );
  const [testimonialsStatus, setTestimonialsStatus] = useState<BlockStatus>(() =>
    findStatus(blocks, "testimonials")
  );
  const [heroPending, setHeroPending] = useState<null | "draft" | "publish">(null);
  const [testimonialsPending, setTestimonialsPending] = useState<
    null | "draft" | "publish"
  >(null);

  const updateHero = (patch: Partial<HeroBlockData>) =>
    setHero((prev) => ({ ...prev, ...patch }));

  const updateTestimonials = (patch: Partial<TestimonialsBlockData>) =>
    setTestimonials((prev) => ({ ...prev, ...patch }));

  const updateTestimonialItem = (idx: number, patch: Partial<TestimonialItem>) =>
    setTestimonials((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));

  const addTestimonialItem = () =>
    setTestimonials((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", company: "", text_uk: "", text_en: "" },
      ],
    }));

  const removeTestimonialItem = (idx: number) =>
    setTestimonials((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));

  const updateMarqueeBrands = (raw: string) =>
    updateTestimonials({
      marquee_brands: raw
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean),
    });

  const runBlockAction = async (
    mode: "draft" | "publish",
    block_key: ContentBlockKey,
    data: HeroBlockData | TestimonialsBlockData,
    setPending: (v: null | "draft" | "publish") => void,
    setStatus: (updater: (prev: BlockStatus) => BlockStatus) => void
  ) => {
    if (!supabaseEnabled) {
      toast.error(t("supabaseRequired"));
      return;
    }
    setPending(mode);
    const res =
      mode === "draft"
        ? await saveContentBlockDraft({ block_key, data })
        : await publishContentBlock({ block_key, data });
    setPending(null);

    if (!res.ok) {
      toast.error(t("saveFailed"), { description: res.error });
      return;
    }
    if (mode === "draft") {
      toast.success(t("draftSaved"));
      setStatus((prev) => ({ ...prev, hasDraft: true }));
    } else {
      toast.success(t("published"));
      setStatus(() => ({ hasDraft: false, hasPublished: true }));
    }
  };

  const saveHeroDraft = () =>
    runBlockAction("draft", "hero", hero, setHeroPending, setHeroStatus);
  const publishHero = () =>
    runBlockAction("publish", "hero", hero, setHeroPending, setHeroStatus);
  const saveTestimonialsDraft = () =>
    runBlockAction(
      "draft",
      "testimonials",
      testimonials,
      setTestimonialsPending,
      setTestimonialsStatus
    );
  const publishTestimonials = () =>
    runBlockAction(
      "publish",
      "testimonials",
      testimonials,
      setTestimonialsPending,
      setTestimonialsStatus
    );

  return (
    <div className="space-y-8">
      {!supabaseEnabled && (
        <div className="rounded-2xl border border-yellow-400/50 bg-yellow-50 p-4 text-sm text-yellow-900">
          {t("supabaseRequired")}
        </div>
      )}

      <section className="glass rounded-3xl p-6 premium-shadow">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold text-brand-blue">
              {t("heroTitle")}
            </h2>
            <StatusBadge status={heroStatus} />
          </div>
          <Link
            href="/preview/home"
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Eye className="h-4 w-4" />
            {t("preview")}
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hero-badge-uk">{t("badgeUk")}</Label>
            <Input
              id="hero-badge-uk"
              value={hero.badge_uk}
              onChange={(e) => updateHero({ badge_uk: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-badge-en">{t("badgeEn")}</Label>
            <Input
              id="hero-badge-en"
              value={hero.badge_en}
              onChange={(e) => updateHero({ badge_en: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-title-uk">{t("titleUk")}</Label>
            <Input
              id="hero-title-uk"
              value={hero.title_uk}
              onChange={(e) => updateHero({ title_uk: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-title-en">{t("titleEn")}</Label>
            <Input
              id="hero-title-en"
              value={hero.title_en}
              onChange={(e) => updateHero({ title_en: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hero-subtitle-uk">{t("subtitleUk")}</Label>
            <Textarea
              id="hero-subtitle-uk"
              rows={3}
              value={hero.subtitle_uk}
              onChange={(e) => updateHero({ subtitle_uk: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hero-subtitle-en">{t("subtitleEn")}</Label>
            <Textarea
              id="hero-subtitle-en"
              rows={3}
              value={hero.subtitle_en}
              onChange={(e) => updateHero({ subtitle_en: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-cta-primary-uk">{t("ctaPrimaryUk")}</Label>
            <Input
              id="hero-cta-primary-uk"
              value={hero.cta_primary_uk}
              onChange={(e) => updateHero({ cta_primary_uk: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-cta-primary-en">{t("ctaPrimaryEn")}</Label>
            <Input
              id="hero-cta-primary-en"
              value={hero.cta_primary_en}
              onChange={(e) => updateHero({ cta_primary_en: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hero-cta-primary-href">{t("ctaPrimaryHref")}</Label>
            <Input
              id="hero-cta-primary-href"
              value={hero.cta_primary_href}
              onChange={(e) => updateHero({ cta_primary_href: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-cta-secondary-uk">{t("ctaSecondaryUk")}</Label>
            <Input
              id="hero-cta-secondary-uk"
              value={hero.cta_secondary_uk}
              onChange={(e) => updateHero({ cta_secondary_uk: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-cta-secondary-en">{t("ctaSecondaryEn")}</Label>
            <Input
              id="hero-cta-secondary-en"
              value={hero.cta_secondary_en}
              onChange={(e) => updateHero({ cta_secondary_en: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hero-cta-secondary-href">{t("ctaSecondaryHref")}</Label>
            <Input
              id="hero-cta-secondary-href"
              value={hero.cta_secondary_href}
              onChange={(e) => updateHero({ cta_secondary_href: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hero-image">{t("imageUrl")}</Label>
            <Input
              id="hero-image"
              value={hero.image_url}
              onChange={(e) => updateHero({ image_url: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-vip-uk">{t("vipBadgeUk")}</Label>
            <Input
              id="hero-vip-uk"
              value={hero.vip_badge_uk}
              onChange={(e) => updateHero({ vip_badge_uk: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-vip-en">{t("vipBadgeEn")}</Label>
            <Input
              id="hero-vip-en"
              value={hero.vip_badge_en}
              onChange={(e) => updateHero({ vip_badge_en: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={saveHeroDraft}
            disabled={heroPending !== null}
          >
            {heroPending === "draft" ? t("saving") : t("saveDraft")}
          </Button>
          <Button onClick={publishHero} disabled={heroPending !== null}>
            {heroPending === "publish" ? t("publishing") : t("publish")}
          </Button>
        </div>
      </section>

      <section className="glass rounded-3xl p-6 premium-shadow">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold text-brand-blue">
              {t("testimonialsTitle")}
            </h2>
            <StatusBadge status={testimonialsStatus} />
          </div>
          <Link
            href="/preview/home"
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Eye className="h-4 w-4" />
            {t("preview")}
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="t-label-uk">{t("labelUk")}</Label>
            <Input
              id="t-label-uk"
              value={testimonials.label_uk}
              onChange={(e) => updateTestimonials({ label_uk: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-label-en">{t("labelEn")}</Label>
            <Input
              id="t-label-en"
              value={testimonials.label_en}
              onChange={(e) => updateTestimonials({ label_en: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-title-uk">{t("titleUk")}</Label>
            <Input
              id="t-title-uk"
              value={testimonials.title_uk}
              onChange={(e) => updateTestimonials({ title_uk: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-title-en">{t("titleEn")}</Label>
            <Input
              id="t-title-en"
              value={testimonials.title_en}
              onChange={(e) => updateTestimonials({ title_en: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="t-brands">{t("marqueeBrands")}</Label>
            <Textarea
              id="t-brands"
              rows={3}
              value={testimonials.marquee_brands.join("\n")}
              onChange={(e) => updateMarqueeBrands(e.target.value)}
              placeholder={t("marqueeBrandsHint")}
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-brand-blue">{t("reviewsTitle")}</h3>
            <Button variant="outline" size="sm" onClick={addTestimonialItem}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addReview")}
            </Button>
          </div>
          {testimonials.items.map((item, idx) => (
            <div
              key={`${idx}-${item.name}`}
              className="rounded-2xl border border-border/50 p-4"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`t-name-${idx}`}>{t("reviewName")}</Label>
                  <Input
                    id={`t-name-${idx}`}
                    value={item.name}
                    onChange={(e) => updateTestimonialItem(idx, { name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`t-company-${idx}`}>{t("reviewCompany")}</Label>
                  <Input
                    id={`t-company-${idx}`}
                    value={item.company}
                    onChange={(e) =>
                      updateTestimonialItem(idx, { company: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`t-rating-${idx}`}>{t("reviewRating")}</Label>
                  <Input
                    id={`t-rating-${idx}`}
                    type="number"
                    min={1}
                    max={5}
                    value={item.rating ?? 5}
                    onChange={(e) =>
                      updateTestimonialItem(idx, {
                        rating: Math.max(
                          1,
                          Math.min(5, Number(e.target.value) || 5)
                        ),
                      })
                    }
                    className="w-24"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`t-uk-${idx}`}>{t("reviewTextUk")}</Label>
                  <Textarea
                    id={`t-uk-${idx}`}
                    rows={3}
                    value={item.text_uk}
                    onChange={(e) =>
                      updateTestimonialItem(idx, { text_uk: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`t-en-${idx}`}>{t("reviewTextEn")}</Label>
                  <Textarea
                    id={`t-en-${idx}`}
                    rows={3}
                    value={item.text_en}
                    onChange={(e) =>
                      updateTestimonialItem(idx, { text_en: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeTestimonialItem(idx)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("removeReview")}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={saveTestimonialsDraft}
            disabled={testimonialsPending !== null}
          >
            {testimonialsPending === "draft" ? t("saving") : t("saveDraft")}
          </Button>
          <Button onClick={publishTestimonials} disabled={testimonialsPending !== null}>
            {testimonialsPending === "publish" ? t("publishing") : t("publish")}
          </Button>
        </div>
      </section>
    </div>
  );
}
