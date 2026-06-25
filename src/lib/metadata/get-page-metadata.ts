import { getTranslations } from "next-intl/server";
import { buildPageMetadata } from "./build-page-metadata";

type PageMetadataKey =
  | "home"
  | "catalog"
  | "about"
  | "contact"
  | "compare"
  | "cart"
  | "checkout"
  | "thankYou"
  | "login"
  | "register"
  | "account"
  | "admin";

type GetPageMetadataOptions = {
  locale: string;
  page: PageMetadataKey;
  path: string;
  noIndex?: boolean;
};

export async function getPageMetadata({
  locale,
  page,
  path,
  noIndex = false,
}: GetPageMetadataOptions) {
  const t = await getTranslations({ locale, namespace: "pageMetadata" });
  return buildPageMetadata({
    locale,
    path,
    title: t(`${page}.title`),
    description: t(`${page}.description`),
    noIndex,
    absoluteTitle: page === "home",
  });
}
