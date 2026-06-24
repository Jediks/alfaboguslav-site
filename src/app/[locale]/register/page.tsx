import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";

type RegisterPageProps = {
  params: { locale: string };
};

export default function RegisterPage({ params: { locale } }: RegisterPageProps) {
  setRequestLocale(locale);
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <AuthForm mode="register" />
    </div>
  );
}
