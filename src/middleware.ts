import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import {
  getLocaleForPath,
  getLoginRedirectPath,
  isAccountPath,
  isAdminPath,
  isAdminRole,
} from "@/lib/auth/guards";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

function copyResponseCookies(source: NextResponse, target: NextResponse): NextResponse {
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    target.cookies.set(name, value, options);
  });
  return target;
}

export async function middleware(request: NextRequest) {
  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname, search } = request.nextUrl;

  // OAuth callback — skip locale prefix
  if (pathname.startsWith("/auth")) {
    if (!hasSupabase) return NextResponse.next();
    const authResult = await updateSession(request, NextResponse.next({ request }));
    return authResult.response;
  }

  const response = intlMiddleware(request);

  if (!hasSupabase) {
    return response;
  }

  const authResult = await updateSession(request, response);

  if (!authResult.user && isAccountPath(pathname)) {
    const locale = getLocaleForPath(pathname);
    const loginUrl = new URL(
      getLoginRedirectPath(locale, `${pathname}${search}`),
      request.url
    );
    return copyResponseCookies(
      authResult.response,
      NextResponse.redirect(loginUrl)
    );
  }

  if (isAdminPath(pathname)) {
    const locale = getLocaleForPath(pathname);

    if (!authResult.user) {
      const loginUrl = new URL(
        getLoginRedirectPath(locale, `${pathname}${search}`),
        request.url
      );
      return copyResponseCookies(
        authResult.response,
        NextResponse.redirect(loginUrl)
      );
    }

    if (!isAdminRole(authResult.role, authResult.user)) {
      return copyResponseCookies(
        authResult.response,
        NextResponse.redirect(new URL(`/${locale}`, request.url))
      );
    }
  }

  return authResult.response;
}

export const config = {
  matcher: [
    "/",
    "/(uk|en)/:path*",
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
