import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export async function requireAdmin(): Promise<{ userId: string; role: UserRole }> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: UserRole }>();

  const role = profile?.role ?? "client";
  if (role !== "admin") {
    throw new Error("Forbidden");
  }

  return { userId: user.id, role };
}
