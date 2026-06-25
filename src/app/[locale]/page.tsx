import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getPricingTiers, getProducts } from "@/lib/data/products";
import { getHeroBlock, getTestimonialsBlock } from "@/lib/data/content-blocks";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { getPageMetadata } from "@/lib/metadata/get-page-metadata";
import { Hero } from "@/components/home/hero";
import { B2bConfigurator } from "@/components/home/b2b-configurator";
import { HorizontalShowcase } from "@/components/home/horizontal-showcase";
import { ProcessSection } from "@/components/home/process-section";
import { DeliveryGoal } from "@/components/home/delivery-goal";
import { TestimonialsMarquee } from "@/components/home/testimonials-marquee";
import { CtaSection } from "@/components/home/cta-section";
import type { PricingTier } from "@/types/database";

type HomePageProps = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: HomePageProps): Promise<Metadata> {
  return getPageMetadata({ locale, page: "home", path: "/" });
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "metadata" });
  const [products, heroBlock, testimonialsBlock] = await Promise.all([
    getProducts(),
    getHeroBlock(),
    getTestimonialsBlock(),
  ]);
  const pricingEntries = await Promise.all(
    products.map(async (product) => [product.id, await getPricingTiers(product.id)] as const)
  );
  const pricingByProductId: Record<string, PricingTier[]> = Object.fromEntries(pricingEntries);

  return (
    <>
      <OrganizationJsonLd
        name="Alpha Boguslav"
        description={t("description")}
        locale={locale}
      />
      <Hero block={heroBlock} />
      <B2bConfigurator products={products} pricingByProductId={pricingByProductId} />
      <HorizontalShowcase products={products} pricingByProductId={pricingByProductId} />
      <ProcessSection />
      <DeliveryGoal />
      <TestimonialsMarquee block={testimonialsBlock} />
      <CtaSection />
    </>
  );
}
