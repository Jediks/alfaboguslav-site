"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { publishContentBlock, saveContentBlockDraft } from "@/lib/actions/content-blocks";
import type { AdminContentBlock } from "@/lib/data/content-blocks";
import { DEFAULT_ABOUT_BLOCK, type AboutBlockData } from "@/types/content-blocks";

type AboutContentEditorProps = {
  blocks: AdminContentBlock[];
  supabaseEnabled: boolean;
};

type BlockStatus = { hasDraft: boolean; hasPublished: boolean };

function findAboutBlock(blocks: AdminContentBlock[]): AboutBlockData {
  const found = blocks.find((block) => block.block_key === "about");
  return (found?.data as AboutBlockData) ?? DEFAULT_ABOUT_BLOCK;
}

function findAboutStatus(blocks: AdminContentBlock[]): BlockStatus {
  const found = blocks.find((block) => block.block_key === "about");
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

export function AboutContentEditor({ blocks, supabaseEnabled }: AboutContentEditorProps) {
  const t = useTranslations("admin.contentBlocks");
  const [about, setAbout] = useState<AboutBlockData>(() => findAboutBlock(blocks));
  const [status, setStatus] = useState<BlockStatus>(() => findAboutStatus(blocks));
  const [pending, setPending] = useState<null | "draft" | "publish">(null);

  const updateAbout = (patch: Partial<AboutBlockData>) =>
    setAbout((prev) => ({ ...prev, ...patch }));

  const updateValue = (index: number, patch: Partial<AboutBlockData["values"][number]>) =>
    setAbout((prev) => ({
      ...prev,
      values: prev.values.map((value, i) => (i === index ? { ...value, ...patch } : value)),
    }));

  const addValue = () =>
    setAbout((prev) => ({
      ...prev,
      values: [...prev.values, { text_uk: "", text_en: "" }],
    }));

  const removeValue = (index: number) =>
    setAbout((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }));

  const saveDraft = async () => {
    setPending("draft");
    const result = await saveContentBlockDraft({ block_key: "about", data: about });
    setPending(null);
    if (!result.ok) {
      toast.error(t("saveFailed"));
      return;
    }
    setStatus((prev) => ({ ...prev, hasDraft: true }));
    toast.success(t("draftSaved"));
  };

  const publish = async () => {
    setPending("publish");
    const result = await publishContentBlock({ block_key: "about", data: about });
    setPending(null);
    if (!result.ok) {
      toast.error(t("saveFailed"));
      return;
    }
    setStatus({ hasDraft: false, hasPublished: true });
    toast.success(t("published"));
  };

  return (
    <section className="surface-panel rounded-2xl p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-semibold text-brand-blue">{t("aboutTitle")}</h2>
          <StatusBadge status={status} />
        </div>
        <Link href="/about" target="_blank" className="text-sm text-primary hover:underline">
          {t("previewAbout")}
        </Link>
      </div>

      {!supabaseEnabled ? (
        <div className="mb-4 rounded-2xl border border-yellow-400/50 bg-yellow-50 p-4 text-sm text-yellow-900">
          {t("supabaseRequired")}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="about-intro-uk">{t("introUk")}</Label>
          <Textarea
            id="about-intro-uk"
            rows={3}
            value={about.intro_uk}
            onChange={(e) => updateAbout({ intro_uk: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="about-intro-en">{t("introEn")}</Label>
          <Textarea
            id="about-intro-en"
            rows={3}
            value={about.intro_en}
            onChange={(e) => updateAbout({ intro_en: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="about-mission-title-uk">{t("missionTitleUk")}</Label>
          <Input
            id="about-mission-title-uk"
            value={about.mission_title_uk}
            onChange={(e) => updateAbout({ mission_title_uk: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="about-mission-title-en">{t("missionTitleEn")}</Label>
          <Input
            id="about-mission-title-en"
            value={about.mission_title_en}
            onChange={(e) => updateAbout({ mission_title_en: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="about-mission-desc-uk">{t("missionDescUk")}</Label>
          <Textarea
            id="about-mission-desc-uk"
            rows={3}
            value={about.mission_description_uk}
            onChange={(e) => updateAbout({ mission_description_uk: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="about-mission-desc-en">{t("missionDescEn")}</Label>
          <Textarea
            id="about-mission-desc-en"
            rows={3}
            value={about.mission_description_en}
            onChange={(e) => updateAbout({ mission_description_en: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="ui-section-title">{t("valuesTitle")}</h3>
          <Button type="button" size="sm" variant="outline" onClick={addValue}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addValue")}
          </Button>
        </div>
        {about.values.map((value, index) => (
          <div key={`value-${index}`} className="rounded-xl border border-border/50 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`about-value-uk-${index}`}>{t("valueUk")}</Label>
                <Textarea
                  id={`about-value-uk-${index}`}
                  rows={2}
                  value={value.text_uk}
                  onChange={(e) => updateValue(index, { text_uk: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`about-value-en-${index}`}>{t("valueEn")}</Label>
                <Textarea
                  id={`about-value-en-${index}`}
                  rows={2}
                  value={value.text_en}
                  onChange={(e) => updateValue(index, { text_en: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => removeValue(index)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("removeValue")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={saveDraft} disabled={pending !== null}>
          {pending === "draft" ? t("saving") : t("saveDraft")}
        </Button>
        <Button onClick={publish} disabled={pending !== null}>
          {pending === "publish" ? t("publishing") : t("publish")}
        </Button>
      </div>
    </section>
  );
}
