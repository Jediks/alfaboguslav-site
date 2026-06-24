"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
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
import { MOCK_PRODUCTS } from "@/lib/data/mock-products";
import { getProductTitle } from "@/lib/data/product-utils";
import { formatPrice } from "@/lib/pricing";
import type { OrderStatus } from "@/types/database";

const statusVariant: Record<OrderStatus, "default" | "secondary" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  shipped: "default",
  completed: "default",
};

type AccountClientProps = {
  supabaseOrders: OrderRecord[];
};

type DisplayOrder = {
  id: string;
  status: OrderStatus;
  company_name: string;
  payment_method: LocalOrder["payment_method"];
  total_estimated_price: number;
  items: LocalOrder["items"];
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

export function AccountClient({ supabaseOrders }: AccountClientProps) {
  const t = useTranslations("account");
  const tCheckout = useTranslations("checkout");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const localOrders = useCartStore((s) => s.orders);

  const orders = useMemo(
    () => mergeOrders(localOrders, supabaseOrders),
    [localOrders, supabaseOrders]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 font-display text-3xl font-bold text-brand-blue">{t("title")}</h1>

      <div className="glass rounded-3xl p-6 premium-shadow">
        <h2 className="mb-4 font-display text-xl font-semibold">{t("orders")}</h2>

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
                    <TableCell className="text-right font-semibold text-primary">
                      {formatPrice(order.total_estimated_price, localeStr)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {t("viewOrder")}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {orders.length > 0 && (
        <div className="mt-6 text-sm text-muted-foreground">
          {orders.map((o) => (
            <div key={o.id} className="mb-2">
              {o.items.map((item) => {
                const p = MOCK_PRODUCTS.find((pr) => pr.id === item.productId);
                return p ? (
                  <span key={item.productId} className="mr-2">
                    {getProductTitle(p, locale)} ×{item.quantity}
                  </span>
                ) : null;
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
