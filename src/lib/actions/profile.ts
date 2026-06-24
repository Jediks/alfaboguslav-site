"use server";

import { redirect } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

function asText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function updateProfile(formData: FormData): Promise<void> {
  const companyName = asText(formData.get("company_name"));
  const localeInput = asText(formData.get("locale"));
  const locale: Locale = routing.locales.includes(localeInput as Locale)
    ? (localeInput as Locale)
    : routing.defaultLocale;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
    return;
  }

  const { error } = await supabase
    .from("users")
    .update({ company_name: companyName || null } as never)
    .eq("id", user.id);

  if (error) {
    redirect({ href: "/account/profile?status=error", locale });
  }

  redirect({ href: "/account/profile?status=saved", locale });
}
