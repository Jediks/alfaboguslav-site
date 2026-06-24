import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/uk/account";
  const siteUrl = getSiteUrl();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const path = next.startsWith("/") ? next : `/${next}`;
      return NextResponse.redirect(`${siteUrl}${path}`);
    }
  }

  return NextResponse.redirect(`${siteUrl}/uk/login?error=auth`);
}
