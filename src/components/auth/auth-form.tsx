"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!hasSupabase) {
        toast.info("Demo mode", {
          description: "Configure Supabase in .env.local for real auth.",
        });
        router.push("/account");
        return;
      }

      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const normalizedCompany = companyName.trim();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { company_name: normalizedCompany } },
        });
        if (error) throw error;
      }

      router.push("/account");
    } catch {
      toast.error(t("loginError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!hasSupabase) {
      toast.info("Demo mode");
      return;
    }
    const supabase = createClient();
    const base =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      window.location.origin;
    const redirectTo = `${base}/auth/callback?next=/${locale}/account`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  return (
    <div className="mx-auto w-full">
      <div className="surface-panel rounded-2xl p-6 md:p-8">
        <h1 className="mb-6 text-center font-display text-2xl font-bold text-brand-blue">
          {mode === "login" ? t("loginTitle") : t("registerTitle")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <Label htmlFor="company">{t("companyName")}</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1.5"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {mode === "login" ? t("loginButton") : t("registerButton")}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle}>
          {t("googleLogin")}
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? t("noAccount") : t("hasAccount")}{" "}
          <Link
            href={mode === "login" ? "/register" : "/login"}
            className="font-medium text-primary hover:underline"
          >
            {mode === "login" ? tCommon("register") : tCommon("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
