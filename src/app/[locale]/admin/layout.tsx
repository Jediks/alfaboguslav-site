import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPageMetadata } from "@/lib/metadata/get-page-metadata";

type AdminLayoutProps = {
  children: ReactNode;
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: AdminLayoutProps): Promise<Metadata> {
  return getPageMetadata({ locale, page: "admin", path: "/admin", noIndex: true });
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return children;
}
