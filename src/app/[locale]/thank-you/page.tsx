import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { getPageMetadata } from "@/lib/metadata/get-page-metadata";
import ThankYouContent from "./thank-you-content";

type ThankYouPageProps = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: ThankYouPageProps): Promise<Metadata> {
  return getPageMetadata({ locale, page: "thankYou", path: "/thank-you", noIndex: true });
}

export default function ThankYouPage({ params: { locale } }: ThankYouPageProps) {
  setRequestLocale(locale);
  return (
    <Suspense>
      <ThankYouContent />
    </Suspense>
  );
}
