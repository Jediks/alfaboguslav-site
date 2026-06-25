import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/supabase/config";
import { logger } from "@/lib/logger";

export type AuditEntry = {
  id: string;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

type RawAuditRow = {
  id: string;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export async function getAuditLog(limit = 50): Promise<AuditEntry[]> {
  if (!hasSupabaseAdmin()) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as RawAuditRow[]).map((r) => ({
      id: r.id,
      actor_email: r.actor_email,
      action: r.action,
      entity_type: r.entity_type,
      entity_id: r.entity_id,
      details: r.details ?? {},
      created_at: r.created_at,
    }));
  } catch (err) {
    logger.warn("getAuditLog.failed", { error: (err as Error).message });
    return [];
  }
}
