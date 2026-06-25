import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Eye } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getPreviewBlocks } from "@/lib/data/content-blocks";
import { Hero } from "@/components/home/hero";
import { TestimonialsMarquee } from "@/components/home/testimonials-marquee";

type PreviewPageProps = {
  params: { locale: string };
};

export const dynamic = "force-dynamic";

export default async function PreviewHomePage({
  params: { locale },
}: PreviewPageProps) {
  setRequestLocale(locale);

  let forbidden = false;
  try {
    await requireAdmin();
  } catch (err) {
    if ((err as Error).message === "Forbidden") {
      forbidden = true;
    } else {
      redirect(`/${locale}/login?next=/${locale}/preview/home`);
    }
  }
  if (forbidden) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations("admin.contentBlocks");
  const blocks = await getPreviewBlocks();

  return (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950">
        <Eye className="h-4 w-4" />
        {t("previewBanner")}
      </div>
      <Hero block={blocks.hero} />
      <TestimonialsMarquee block={blocks.testimonials} />
    </>
  );
}
