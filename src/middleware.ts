import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // OAuth callback — skip locale prefix
  if (request.nextUrl.pathname.startsWith("/auth")) {
    if (!hasSupabase) return NextResponse.next();
    return updateSession(request, NextResponse.next({ request }));
  }

  const response = intlMiddleware(request);

  if (!hasSupabase) {
    return response;
  }

  return updateSession(request, response);
}

export const config = {
  matcher: [
    "/",
    "/(uk|en)/:path*",
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
