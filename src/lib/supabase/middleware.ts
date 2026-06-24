import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import type { NextResponse, NextRequest } from "next/server";
import type { Database } from "@/types/database";
import type { UserRole } from "@/types/database";
import { getSupabaseAnonKey } from "./config";

export interface MiddlewareSessionResult {
  response: NextResponse;
  user: User | null;
  role: UserRole | null;
}

function parseUserRole(value: unknown): UserRole | null {
  return value === "admin" || value === "client" ? value : null;
}

export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<MiddlewareSessionResult> {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  const user = error ? null : data.user;

  const metadataRole = parseUserRole(user?.app_metadata?.role);
  let role = metadataRole;

  if (user && !role) {
    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<{ role: UserRole }>();

    role = userRow?.role ?? null;
  }

  return {
    response,
    user,
    role,
  };
}
