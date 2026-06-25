import { getSiteUrl } from "@/lib/site-url";

type OrganizationJsonLdProps = {
  name: string;
  description: string;
  locale: string;
};

export function OrganizationJsonLd({ name, description, locale }: OrganizationJsonLdProps) {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description,
    url: `${siteUrl}/${locale}`,
    logo: `${siteUrl}/brand/logo-mark.svg`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
