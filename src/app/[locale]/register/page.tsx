import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { getPageMetadata } from "@/lib/metadata/get-page-metadata";

type RegisterPageProps = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: RegisterPageProps): Promise<Metadata> {
  return getPageMetadata({ locale, page: "register", path: "/register", noIndex: true });
}

export default function RegisterPage({ params: { locale } }: RegisterPageProps) {
  setRequestLocale(locale);
  return (
    <MarketingPageShell tone="warm" maxWidth="md" className="border-b-0">
      <AuthForm mode="register" />
    </MarketingPageShell>
  );
}
