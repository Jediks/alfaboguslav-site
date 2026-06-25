"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrderRecord } from "@/lib/actions/orders";
import type { Product } from "@/types/database";
import { getProductTitle } from "@/lib/data/product-utils";
import { formatPrice } from "@/lib/pricing";
import { parseQuoteRefFromDelivery, stripQuoteRefLine } from "@/lib/quote-ref";
import { useCartStore } from "@/stores/cart-store";

type AdminOrderDetailProps = {
  serverOrder: OrderRecord | null;
  referenceId: string;
  products: Product[];
  showInvoiceLink?: boolean;
};

const statusVariant = {
  pending: "outline",
  confirmed: "secondary",
  shipped: "default",
  completed: "default",
} as const;

export function AdminOrderDetail({
  serverOrder,
  referenceId,
  products,
  showInvoiceLink = false,
}: AdminOrderDetailProps) {
  const t = useTranslations("admin");
  const tAccount = useTranslations("account");
  const tCheckout = useTranslations("checkout");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const localOrders = useCartStore((s) => s.orders);

  const order = useMemo(() => {
    if (serverOrder) return serverOrder;
    const local = localOrders.find((o) => o.id === referenceId);
    if (!local) return null;
    return {
      referenceId: local.id,
      status: local.status,
      company_name: local.company_name,
      contact_name: local.contact_name,
      contact_email: local.contact_email,
      contact_phone: local.contact_phone,
      delivery_address: local.delivery_address,
      payment_method: local.payment_method,
      total_estimated_price: local.total_estimated_price,
      branding_logo_url: null,
      items: local.items,
    };
  }, [serverOrder, localOrders, referenceId]);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-muted-foreground">{t("orderNotFound")}</p>
        <Link href="/admin">
          <Button variant="outline" className="mt-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("backToAdmin")}
          </Button>
        </Link>
      </div>
    );
  }

  const id = order.referenceId;
  const items = order.items;
  const linkedQuoteRef = parseQuoteRefFromDelivery(order.delivery_address);
  const deliveryNotes = stripQuoteRefLine(order.delivery_address);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-blue"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToAdmin")}
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t("orderDetails")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-brand-blue">{id}</h1>
          {linkedQuoteRef ? (
            <Badge variant="secondary" className="mt-2">
              {t("linkedQuote", { reference: linkedQuoteRef })}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {showInvoiceLink && (
            <Link
              href={`/account/orders/${id}/invoice`}
              className="text-sm text-primary hover:underline"
            >
              {tAccount("viewInvoice")}
            </Link>
          )}
          <Badge variant={statusVariant[order.status]}>{tAccount(`status.${order.status}`)}</Badge>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass rounded-3xl p-6 premium-shadow">
          <h2 className="mb-4 font-display font-semibold text-brand-blue">{t("company")}</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">{tCheckout("companyName")}</dt>
              <dd className="font-medium">{order.company_name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{tCheckout("contactName")}</dt>
              <dd className="font-medium">{order.contact_name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{tCheckout("contactEmail")}</dt>
              <dd className="font-medium">{order.contact_email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{tCheckout("contactPhone")}</dt>
              <dd className="font-medium">{order.contact_phone}</dd>
            </div>
            {order.branding_logo_url ? (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">{t("clientLogo")}</dt>
                <dd className="mt-2">
                  <a
                    href={order.branding_logo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    {order.branding_logo_url}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="glass rounded-3xl p-6 premium-shadow">
          <h2 className="mb-4 font-display font-semibold text-brand-blue">{tCheckout("delivery")}</h2>
          <p className="text-sm leading-relaxed">{deliveryNotes || order.delivery_address}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            {tCheckout("payment")}:{" "}
            {order.payment_method === "invoice"
              ? tCheckout("paymentInvoice")
              : tCheckout("paymentOnline")}
          </p>
        </div>

        <div className="glass rounded-3xl p-6 premium-shadow">
          <h2 className="mb-4 font-display font-semibold text-brand-blue">{t("orderItems")}</h2>
          <ul className="space-y-3">
            {items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <li
                  key={item.productId}
                  className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {product ? getProductTitle(product, locale) : item.productId}
                    </p>
                    <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                  </div>
                  <p className="font-semibold text-primary">
                    {formatPrice(item.price_at_time * item.quantity, localeStr)}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex justify-between border-t border-border pt-4 text-lg font-bold">
            <span>{tAccount("total")}</span>
            <span className="text-primary">
              {formatPrice(order.total_estimated_price, localeStr)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
