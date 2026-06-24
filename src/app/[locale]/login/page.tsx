import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";

type LoginPageProps = {
  params: { locale: string };
};

export default function LoginPage({ params: { locale } }: LoginPageProps) {
  setRequestLocale(locale);
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <AuthForm mode="login" />
    </div>
  );
}
