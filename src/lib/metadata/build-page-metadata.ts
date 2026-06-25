import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

const OPEN_GRAPH_LOCALE: Record<Locale, string> = {
  uk: "uk_UA",
  en: "en_US",
};

export type BuildPageMetadataOptions = {
  locale: string;
  path: string;
  title: string;
  description: string;
  noIndex?: boolean;
  absoluteTitle?: boolean;
  image?: string;
};

function isLocale(value: string): value is Locale {
  return routing.locales.includes(value as Locale);
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  noIndex = false,
  absoluteTitle = false,
  image,
}: BuildPageMetadataOptions): Metadata {
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const canonical = `${siteUrl}/${locale}${normalizedPath === "/" ? "" : normalizedPath}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${siteUrl}/${loc}${normalizedPath === "/" ? "" : normalizedPath}`;
  }

  const alternateLocales = routing.locales
    .filter((loc) => loc !== locale && isLocale(loc))
    .map((loc) => OPEN_GRAPH_LOCALE[loc]);

  const ogImages = image ? [{ url: image, alt: title }] : undefined;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Alpha Boguslav",
      locale: isLocale(locale) ? OPEN_GRAPH_LOCALE[locale] : locale,
      alternateLocale: alternateLocales,
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages?.map((entry) => entry.url),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
