import { setRequestLocale } from "next-intl/server";
import { getPricingTiers, getProducts } from "@/lib/data/products";
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

export default async function HomePage({ params: { locale } }: HomePageProps) {
  setRequestLocale(locale);
  const products = await getProducts();
  const pricingEntries = await Promise.all(
    products.map(async (product) => [product.id, await getPricingTiers(product.id)] as const)
  );
  const pricingByProductId: Record<string, PricingTier[]> = Object.fromEntries(pricingEntries);

  return (
    <>
      <Hero />
      <B2bConfigurator products={products} pricingByProductId={pricingByProductId} />
      <HorizontalShowcase products={products} pricingByProductId={pricingByProductId} />
      <ProcessSection />
      <DeliveryGoal />
      <TestimonialsMarquee />
      <CtaSection />
    </>
  );
}
