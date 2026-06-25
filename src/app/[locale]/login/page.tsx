import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { getPageMetadata } from "@/lib/metadata/get-page-metadata";

type LoginPageProps = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: LoginPageProps): Promise<Metadata> {
  return getPageMetadata({ locale, page: "login", path: "/login", noIndex: true });
}

export default function LoginPage({ params: { locale } }: LoginPageProps) {
  setRequestLocale(locale);
  return (
    <MarketingPageShell tone="warm" maxWidth="md" className="border-b-0">
      <AuthForm mode="login" />
    </MarketingPageShell>
  );
}
