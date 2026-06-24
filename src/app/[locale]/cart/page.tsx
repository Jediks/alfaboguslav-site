import { setRequestLocale } from "next-intl/server";
import { CartClient } from "@/components/cart/cart-client";

type CartPageProps = {
  params: { locale: string };
};

export default function CartPage({ params: { locale } }: CartPageProps) {
  setRequestLocale(locale);
  return <CartClient />;
}
