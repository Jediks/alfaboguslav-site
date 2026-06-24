import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { fetchOrderForUser } from "@/lib/data/orders";
import { getProducts } from "@/lib/data/products";
import { getProductTitle } from "@/lib/data/product-utils";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { formatPrice } from "@/lib/pricing";

type InvoicePageProps = {
  params: { locale: string; id: string };
};

export default async function AccountInvoicePage({ params: { locale, id } }: InvoicePageProps) {
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const products = await getProducts();

  let order = null;
  if (hasSupabaseEnv()) {
    order = await fetchOrderForUser(id);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && !order) {
      notFound();
    }
  }

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 print:px-0 print:py-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/account/orders/${id}`} className="text-sm text-primary hover:underline">
          {t("viewOrder")}
        </Link>
        <span className="rounded-lg border px-3 py-1.5 text-sm text-muted-foreground">
          {t("invoicePrintHint")}
        </span>
      </div>

      <section className="rounded-2xl border bg-white p-8 text-black print:rounded-none print:border-0 print:p-0">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold">{t("invoiceTitle")}</h1>
          <p className="mt-2 text-sm text-neutral-600">
            {t("invoiceReference")}: <span className="font-mono">{order.referenceId}</span>
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            {t("invoiceDate")}: {new Date(order.created_at).toLocaleDateString(localeStr)}
          </p>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
              {t("invoiceCompany")}
            </h2>
            <p className="mt-2 text-sm">{order.company_name || "-"}</p>
            <p className="text-sm">{order.contact_name || "-"}</p>
            <p className="text-sm">{order.contact_email || "-"}</p>
            <p className="text-sm">{order.contact_phone || "-"}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
              {t("invoiceDelivery")}
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm">{order.delivery_address || "-"}</p>
          </div>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left font-semibold">{t("invoiceItem")}</th>
              <th className="py-2 text-right font-semibold">{t("invoiceQty")}</th>
              <th className="py-2 text-right font-semibold">{t("invoiceUnitPrice")}</th>
              <th className="py-2 text-right font-semibold">{t("invoiceLineTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <tr key={item.productId} className="border-b">
                  <td className="py-2">{product ? getProductTitle(product, locale) : item.productId}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">{formatPrice(item.price_at_time, localeStr)}</td>
                  <td className="py-2 text-right">
                    {formatPrice(item.price_at_time * item.quantity, localeStr)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end border-t pt-4">
          <p className="text-lg font-bold">
            {t("total")}: {formatPrice(order.total_estimated_price, localeStr)}
          </p>
        </div>
      </section>
    </main>
  );
}
