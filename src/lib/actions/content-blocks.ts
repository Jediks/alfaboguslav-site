"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logger } from "@/lib/logger";
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
