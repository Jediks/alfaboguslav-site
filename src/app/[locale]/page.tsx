import { setRequestLocale } from "next-intl/server";
import { getProducts } from "@/lib/data/products";
import { Hero } from "@/components/home/hero";
import { B2bConfigurator } from "@/components/home/b2b-configurator";
import { HorizontalShowcase } from "@/components/home/horizontal-showcase";
import { ProcessSection } from "@/components/home/process-section";
import { DeliveryGoal } from "@/components/home/delivery-goal";
import { TestimonialsMarquee } from "@/components/home/testimonials-marquee";
import { CtaSection } from "@/components/home/cta-section";

type HomePageProps = {
  params: { locale: string };
};

export default async function HomePage({ params: { locale } }: HomePageProps) {
  setRequestLocale(locale);
  const products = await getProducts();

  return (
    <>
      <Hero />
      <B2bConfigurator products={products} />
      <HorizontalShowcase products={products} />
      <ProcessSection />
      <DeliveryGoal />
      <TestimonialsMarquee />
      <CtaSection />
    </>
  );
}
