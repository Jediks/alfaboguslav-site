"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logger } from "@/lib/logger";
import { recordAudit } from "@/lib/actions/audit";
import { DRAFT_POSITION, PUBLISHED_POSITION } from "@/lib/data/content-blocks";
import type {
  ContentBlockKey,
  HeroBlockData,
  TestimonialsBlockData,
} from "@/types/content-blocks";

type UpsertInput = {
  block_key: ContentBlockKey;
  position?: number;
  is_published?: boolean;
  data: HeroBlockData | TestimonialsBlockData;
};

export async function upsertContentBlock(
  input: UpsertInput
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  if (!hasSupabaseAdmin()) {
    return { ok: false, error: "supabase_not_configured" };
  }

  const supabase = createAdminClient();

  const payload = {
    block_key: input.block_key,
    position: input.position ?? 0,
    is_published: input.is_published ?? true,
    data: input.data as unknown,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("content_blocks")
    .upsert(payload as never, { onConflict: "block_key,position" });

  if (error) {
    logger.error("upsertContentBlock.failed", {
      block_key: input.block_key,
      error: error.message,
    });
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

type ContentBlockData = HeroBlockData | TestimonialsBlockData;

/**
 * Save a working DRAFT (position 1, unpublished). The public site is unaffected.
 */
export async function saveContentBlockDraft(input: {
  block_key: ContentBlockKey;
  data: ContentBlockData;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "unauthorized" };
  }
  if (!hasSupabaseAdmin()) {
    return { ok: false, error: "supabase_not_configured" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("content_blocks").upsert(
    {
      block_key: input.block_key,
      position: DRAFT_POSITION,
      is_published: false,
      data: input.data as unknown,
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "block_key,position" }
  );

  if (error) {
    logger.error("saveContentBlockDraft.failed", {
      block_key: input.block_key,
      error: error.message,
    });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Publish content to the LIVE slot (position 0) and clear any pending draft.
 */
export async function publishContentBlock(input: {
  block_key: ContentBlockKey;
  data: ContentBlockData;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "unauthorized" };
  }
  if (!hasSupabaseAdmin()) {
    return { ok: false, error: "supabase_not_configured" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("content_blocks").upsert(
    {
      block_key: input.block_key,
      position: PUBLISHED_POSITION,
      is_published: true,
      data: input.data as unknown,
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "block_key,position" }
  );

  if (error) {
    logger.error("publishContentBlock.failed", {
      block_key: input.block_key,
      error: error.message,
    });
    return { ok: false, error: error.message };
  }

  // Drop the now-consumed draft so preview matches the live version.
  await supabase
    .from("content_blocks")
    .delete()
    .eq("block_key", input.block_key)
    .eq("position", DRAFT_POSITION);

  await recordAudit({
    action: "publish",
    entity_type: "content_block",
    entity_id: input.block_key,
  });

  revalidatePath("/", "layout");
  return { ok: true };
}
