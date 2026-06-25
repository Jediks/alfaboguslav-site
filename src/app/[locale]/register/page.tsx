import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";

type RegisterPageProps = {
  params: { locale: string };
};

export default function RegisterPage({ params: { locale } }: RegisterPageProps) {
  setRequestLocale(locale);
  return (
    <MarketingPageShell tone="warm" maxWidth="md" className="border-b-0">
      <AuthForm mode="register" />
    </MarketingPageShell>
  );
}
