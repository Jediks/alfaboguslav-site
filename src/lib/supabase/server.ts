import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "./config";

export async function createClient() {
  const cookieStore = await cookies();
  const url = getSupabaseUrl();
  if (!url) throw new Error("Supabase URL is not configured");

  return createServerClient<Database>(
    url,
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from Server Components where cookies cannot be set.
          }
        },
      },
    }
  );
}
