"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseAdmin } from "@/lib/supabase/config";
import { logger } from "@/lib/logger";

export type AuditEntryInput = {
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, unknown>;
};

/**
 * Best-effort audit recorder for admin mutations (Phase 10.3).
 * Never throws — failure to log must not break the underlying action.
 */
export async function recordAudit(entry: AuditEntryInput): Promise<void> {
  if (!hasSupabaseAdmin()) return;

  let actorId: string | null = null;
  let actorEmail: string | null = null;
  try {
    const scoped = await createClient();
    const {
      data: { user },
    } = await scoped.auth.getUser();
    actorId = user?.id ?? null;
    actorEmail = user?.email ?? null;
  } catch {
    /* unauthenticated context — keep actor null */
  }

  try {
    const supabase = createAdminClient();
    await supabase.from("audit_log").insert({
      actor_id: actorId,
      actor_email: actorEmail,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id ?? null,
      details: entry.details ?? {},
    });
  } catch (err) {
    logger.warn("recordAudit.failed", { error: (err as Error).message });
  }
}
