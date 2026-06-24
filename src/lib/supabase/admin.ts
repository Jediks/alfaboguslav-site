import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceKey, getSupabaseUrl, hasSupabaseAdmin } from "./config";

export function createAdminClient(): SupabaseClient {
  if (!hasSupabaseAdmin()) {
    throw new Error("Supabase admin client is not configured");
  }

  const url = getSupabaseUrl();
  if (!url) throw new Error("Supabase URL is not configured");

  return createClient(url, getSupabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
