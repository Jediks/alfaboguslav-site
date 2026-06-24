import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceKey, hasSupabaseAdmin } from "./config";

export function createAdminClient(): SupabaseClient {
  if (!hasSupabaseAdmin()) {
    throw new Error("Supabase admin client is not configured");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, getSupabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
