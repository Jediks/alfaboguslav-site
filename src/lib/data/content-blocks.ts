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

export type AdminContentBlock = {
  id: string | null;
  block_key: ContentBlockKey;
  position: number;
  is_published: boolean;
  data: HeroBlockData | TestimonialsBlockData;
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

export async function getAdminContentBlocks(): Promise<AdminContentBlock[]> {
  const defaults: AdminContentBlock[] = [
    {
      id: null,
      block_key: "hero",
      position: 0,
      is_published: true,
      data: DEFAULT_HERO_BLOCK,
    },
    {
      id: null,
      block_key: "testimonials",
      position: 0,
      is_published: true,
      data: DEFAULT_TESTIMONIALS_BLOCK,
    },
  ];

  if (!hasSupabaseAdmin()) return defaults;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .select("*")
      .order("block_key", { ascending: true })
      .order("position", { ascending: true });
    if (error || !data) return defaults;

    const merged = defaults.map((block) => {
      const existing = (data as RawRow[]).find(
        (row) => row.block_key === block.block_key && row.position === block.position
      );
      if (!existing) return block;
      const fallback = block.data as HeroBlockData | TestimonialsBlockData;
      return {
        id: existing.id,
        block_key: block.block_key,
        position: existing.position,
        is_published: existing.is_published,
        data: asObject(existing.data, fallback),
      };
    });

    return merged;
  } catch (err) {
    logger.warn("getAdminContentBlocks.failed", { error: (err as Error).message });
    return defaults;
  }
}
