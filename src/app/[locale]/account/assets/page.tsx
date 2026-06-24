import { setRequestLocale, getTranslations } from "next-intl/server";
import { AccountAssetsClient } from "@/components/account/account-assets-client";
import { listAssets } from "@/lib/actions/assets";

type AccountAssetsPageProps = {
  params: { locale: string };
};

export default async function AccountAssetsPage({ params: { locale } }: AccountAssetsPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const assets = await listAssets();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 font-display text-3xl font-bold text-brand-blue">{t("assetsTitle")}</h1>
      <p className="mb-8 text-muted-foreground">{t("assetsSubtitle")}</p>
      <AccountAssetsClient initialAssets={assets} />
    </div>
  );
}
