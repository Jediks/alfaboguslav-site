import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfilePageProps = {
  params: { locale: string };
  searchParams?: { status?: string | string[] };
};

export default async function ProfilePage({
  params: { locale },
  searchParams,
}: ProfilePageProps) {
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("users")
        .select("company_name")
        .eq("id", user.id)
        .maybeSingle<{ company_name: string | null }>()
    : { data: null };

  const status = Array.isArray(searchParams?.status)
    ? searchParams?.status[0]
    : searchParams?.status;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 font-display text-3xl font-bold text-brand-blue">
        {t("profileTitle")}
      </h1>

      <div className="glass rounded-3xl p-6 premium-shadow">
        <form action={updateProfile} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />

          <div>
            <Label htmlFor="company_name">{t("companyName")}</Label>
            <Input
              id="company_name"
              name="company_name"
              defaultValue={profile?.company_name ?? ""}
              className="mt-1.5"
              maxLength={255}
            />
          </div>

          {status === "saved" && (
            <p className="text-sm text-emerald-700">{t("profileSaved")}</p>
          )}
          {status === "error" && <p className="text-sm text-destructive">{t("profileError")}</p>}

          <Button type="submit">{t("saveProfile")}</Button>
        </form>
      </div>
    </div>
  );
}
