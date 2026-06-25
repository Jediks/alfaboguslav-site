import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin, hasSupabaseEnv } from "@/lib/supabase/config";
import { logger } from "@/lib/logger";
import {
  DEFAULT_HERO_BLOCK,
  DEFAULT_TESTIMONIALS_BLOCK,
  type ContentBlockKey,
  type HeroBlockData,
  type TestimonialsBlockData,
} from "@/types/content-blocks";

type RawRow = {
  id: string;
  block_key: string;
  position: number;
  data: unknown;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

function asObject<T>(value: unknown, fallback: T): T {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...fallback, ...(value as Record<string, unknown>) } as T;
  }
  return fallback;
}

/**
 * CMS draft/publish model (Phase 8.4):
 * - position 0  → the LIVE (published) version shown to the public.
 * - position 1  → the working DRAFT (never published, never shown publicly).
 */
export const PUBLISHED_POSITION = 0;
export const DRAFT_POSITION = 1;

export type AdminContentBlock = {
  block_key: ContentBlockKey;
  data: HeroBlockData | TestimonialsBlockData;
  has_draft: boolean;
  has_published: boolean;
};

export type PreviewBlocks = {
  hero: HeroBlockData;
  testimonials: TestimonialsBlockData;
};

export async function getHeroBlock(): Promise<HeroBlockData> {
  if (!hasSupabaseEnv()) return DEFAULT_HERO_BLOCK;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .select("*")
      .eq("block_key", "hero")
      .eq("is_published", true)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle<RawRow>();
    if (error || !data) return DEFAULT_HERO_BLOCK;
    return asObject(data.data, DEFAULT_HERO_BLOCK);
  } catch (err) {
    logger.warn("getHeroBlock.failed", { error: (err as Error).message });
    return DEFAULT_HERO_BLOCK;
  }
}

export async function getTestimonialsBlock(): Promise<TestimonialsBlockData> {
  if (!hasSupabaseEnv()) return DEFAULT_TESTIMONIALS_BLOCK;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .select("*")
      .eq("block_key", "testimonials")
      .eq("is_published", true)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle<RawRow>();
    if (error || !data) return DEFAULT_TESTIMONIALS_BLOCK;
    return asObject(data.data, DEFAULT_TESTIMONIALS_BLOCK);
  } catch (err) {
    logger.warn("getTestimonialsBlock.failed", { error: (err as Error).message });
    return DEFAULT_TESTIMONIALS_BLOCK;
  }
}

const BLOCK_DEFAULTS: Record<ContentBlockKey, HeroBlockData | TestimonialsBlockData> = {
  hero: DEFAULT_HERO_BLOCK,
  testimonials: DEFAULT_TESTIMONIALS_BLOCK,
};

function pickRows(rows: RawRow[], key: ContentBlockKey) {
  const forKey = rows.filter((row) => row.block_key === key);
  return {
    published: forKey.find((row) => row.position === PUBLISHED_POSITION) ?? null,
    draft: forKey.find((row) => row.position === DRAFT_POSITION) ?? null,
  };
}

export async function getAdminContentBlocks(): Promise<AdminContentBlock[]> {
  const keys: ContentBlockKey[] = ["hero", "testimonials"];
  const defaults: AdminContentBlock[] = keys.map((key) => ({
    block_key: key,
    data: BLOCK_DEFAULTS[key],
    has_draft: false,
    has_published: false,
  }));

  if (!hasSupabaseAdmin()) return defaults;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("content_blocks").select("*");
    if (error || !data) return defaults;

    const rows = data as RawRow[];
    return keys.map((key) => {
      const fallback = BLOCK_DEFAULTS[key];
      const { published, draft } = pickRows(rows, key);
      // The editor resumes the draft if one exists, otherwise the live version.
      const source = draft ?? published;
      return {
        block_key: key,
        data: source ? asObject(source.data, fallback) : fallback,
        has_draft: Boolean(draft),
        has_published: Boolean(published && published.is_published),
      };
    });
  } catch (err) {
    logger.warn("getAdminContentBlocks.failed", { error: (err as Error).message });
    return defaults;
  }
}

/**
 * Admin-only: returns what WOULD be published (draft if present, else live, else
 * default) for each block. Used by the gated `/preview/home` route. Callers MUST
 * enforce admin access before rendering the result publicly.
 */
export async function getPreviewBlocks(): Promise<PreviewBlocks> {
  const fallback: PreviewBlocks = {
    hero: DEFAULT_HERO_BLOCK,
    testimonials: DEFAULT_TESTIMONIALS_BLOCK,
  };

  if (!hasSupabaseAdmin()) return fallback;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("content_blocks").select("*");
    if (error || !data) return fallback;

    const rows = data as RawRow[];
    const hero = pickRows(rows, "hero");
    const testimonials = pickRows(rows, "testimonials");
    return {
      hero: asObject(
        (hero.draft ?? hero.published)?.data,
        DEFAULT_HERO_BLOCK
      ),
      testimonials: asObject(
        (testimonials.draft ?? testimonials.published)?.data,
        DEFAULT_TESTIMONIALS_BLOCK
      ),
    };
  } catch (err) {
    logger.warn("getPreviewBlocks.failed", { error: (err as Error).message });
    return fallback;
  }
}
