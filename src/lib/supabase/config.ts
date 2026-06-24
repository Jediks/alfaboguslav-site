function supabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

function supabaseServiceKey(): string | undefined {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  return service || secret || undefined;
}

export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseAnonKey());
}

export function hasSupabaseAdmin(): boolean {
  return hasSupabaseEnv() && Boolean(supabaseServiceKey());
}

export function getSupabaseAnonKey(): string {
  const key = supabaseAnonKey();
  if (!key) throw new Error("Supabase anon/publishable key is not configured");
  return key;
}

export function getSupabaseServiceKey(): string {
  const key = supabaseServiceKey();
  if (!key) throw new Error("Supabase service/secret key is not configured");
  return key;
}
