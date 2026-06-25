"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCartStore, type LocalOrder } from "@/stores/cart-store";
import type { OrderRecord } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/pricing";
import type { OrderStatus } from "@/types/database";
import { PageHeader } from "@/components/ui/page-header";
import { AccountKpiCards } from "./account-kpi-cards";

const statusVariant: Record<OrderStatus, "default" | "secondary" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  shipped: "default",
  completed: "default",
};

type AccountClientProps = {
  supabaseOrders: OrderRecord[];
  supabaseEnabled?: boolean;
};

type DisplayOrder = {
  id: string;
  status: OrderStatus;
  company_name: string;
  payment_method: LocalOrder["payment_method"];
  total_estimated_price: number;
  items: OrderRecord["items"];
};

function mergeOrders(local: LocalOrder[], remote: OrderRecord[]): DisplayOrder[] {
  const byRef = new Map<string, DisplayOrder>();

  for (const o of remote) {
    byRef.set(o.referenceId, {
      id: o.referenceId,
      status: o.status,
      company_name: o.company_name,
      payment_method: o.payment_method,
      total_estimated_price: o.total_estimated_price,
      items: o.items,
    });
  }

  for (const o of local) {
    if (!byRef.has(o.id)) {
      byRef.set(o.id, {
        id: o.id,
        status: o.status,
        company_name: o.company_name,
        payment_method: o.payment_method,
        total_estimated_price: o.total_estimated_price,
        items: o.items,
      });
    }
  }

  return Array.from(byRef.values());
}

export function AccountClient({
  supabaseOrders,
  supabaseEnabled = false,
}: AccountClientProps) {
  const t = useTranslations("account");
  const tCheckout = useTranslations("checkout");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const localOrders = useCartStore((s) => s.orders);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const orders = useMemo(
    () =>
      supabaseEnabled
        ? mergeOrders([], supabaseOrders)
        : mergeOrders(localOrders, supabaseOrders),
    [localOrders, supabaseOrders, supabaseEnabled]
  );

  const repeatOrder = (order: DisplayOrder) => {
    for (const item of order.items) {
      addItem({
        productId: item.productId,
        quantity: item.quantity,
        brandingLogoUrl: item.brandingLogoUrl,
      });
    }
    router.push("/cart");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader title={t("title")} description={t("dashboardWelcome")} />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Link href="/account/profile" className="surface-panel rounded-2xl p-4 transition-colors hover:border-border">
          <p className="font-medium">{t("profile")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("quickLinkProfile")}</p>
        </Link>
        <Link href="/account/assets" className="surface-panel rounded-2xl p-4">
          <p className="font-medium">{t("assets")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("quickLinkAssets")}</p>
        </Link>
        <Link href="/account" className="surface-panel rounded-2xl p-4">
          <p className="font-medium">{t("orders")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("quickLinkOrders")}</p>
        </Link>
      </div>

      <AccountKpiCards orders={orders} />

      <div className="surface-panel rounded-2xl p-6">
        <h2 className="ui-section-title mb-4">{t("orders")}</h2>

        {orders.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">{t("noOrders")}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("statusLabel")}</TableHead>
                  <TableHead>{tCheckout("companyName")}</TableHead>
                  <TableHead>{tCheckout("payment")}</TableHead>
                  <TableHead className="text-right">{t("total")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[order.status]}>
                        {t(`status.${order.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{order.company_name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.payment_method === "invoice"
                        ? tCheckout("paymentInvoice")
                        : tCheckout("paymentOnline")}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-primary">
                      {formatPrice(order.total_estimated_price, localeStr)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {t("viewOrder")}
                        </Link>
                        <Button size="sm" variant="outline" onClick={() => repeatOrder(order)}>
                          {t("repeatOrder")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
