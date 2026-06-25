import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPageMetadata } from "@/lib/metadata/get-page-metadata";

type AccountLayoutProps = {
  children: ReactNode;
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: AccountLayoutProps): Promise<Metadata> {
  return getPageMetadata({ locale, page: "account", path: "/account", noIndex: true });
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return children;
}
