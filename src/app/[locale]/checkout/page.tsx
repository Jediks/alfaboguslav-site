import { setRequestLocale } from "next-intl/server";
import { CheckoutClient } from "@/components/checkout/checkout-client";

type CheckoutPageProps = {
  params: { locale: string };
};

export default function CheckoutPage({ params: { locale } }: CheckoutPageProps) {
  setRequestLocale(locale);
  return <CheckoutClient />;
}
