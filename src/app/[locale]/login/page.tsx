import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";

type LoginPageProps = {
  params: { locale: string };
};

export default function LoginPage({ params: { locale } }: LoginPageProps) {
  setRequestLocale(locale);
  return (
    <MarketingPageShell tone="warm" maxWidth="md" className="border-b-0">
      <AuthForm mode="login" />
    </MarketingPageShell>
  );
}
