import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import ThankYouContent from "./thank-you-content";

type ThankYouPageProps = {
  params: { locale: string };
};

export default function ThankYouPage({ params: { locale } }: ThankYouPageProps) {
  setRequestLocale(locale);
  return (
    <Suspense>
      <ThankYouContent />
    </Suspense>
  );
}
