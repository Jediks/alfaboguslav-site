"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore, type LocalOrder } from "@/stores/cart-store";
import { useQuoteStore } from "@/stores/quote-store";
import type { OrderRecord } from "@/lib/actions/orders";
import type { QuoteRecord } from "@/lib/actions/quotes";
import { updateOrderStatusAdmin } from "@/lib/actions/orders";
import { MOCK_PRODUCTS, MOCK_PRICING } from "@/lib/data/mock-products";
import { getProductTitle } from "@/lib/data/product-utils";
import { formatPrice } from "@/lib/pricing";
import type { OrderStatus } from "@/types/database";

type AdminClientProps = {
  supabaseOrders: OrderRecord[];
  supabaseQuotes: QuoteRecord[];
  supabaseEnabled: boolean;
};

function toDisplayOrder(o: LocalOrder) {
  return {
    referenceId: o.id,
    company_name: o.company_name,
    delivery_address: o.delivery_address,
    payment_method: o.payment_method,
    total_estimated_price: o.total_estimated_price,
    status: o.status,
  };
}

export function AdminClient({
  supabaseOrders,
  supabaseQuotes,
  supabaseEnabled,
}: AdminClientProps) {
  const t = useTranslations("admin");
  const tAccount = useTranslations("account");
  const tCheckout = useTranslations("checkout");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const localOrders = useCartStore((s) => s.orders);
  const updateOrderStatus = useCartStore((s) => s.updateOrderStatus);
  const localQuotes = useQuoteStore((s) => s.quotes);
  const [syncing, setSyncing] = useState<string | null>(null);

  const orders = useMemo(() => {
    if (supabaseEnabled && supabaseOrders.length > 0) {
      return supabaseOrders.map((o) => ({
        referenceId: o.referenceId,
        company_name: o.company_name,
        delivery_address: o.delivery_address,
        payment_method: o.payment_method,
        total_estimated_price: o.total_estimated_price,
        status: o.status,
      }));
    }
    return localOrders.map(toDisplayOrder);
  }, [supabaseEnabled, supabaseOrders, localOrders]);

  const quotes = useMemo(() => {
    if (supabaseEnabled && supabaseQuotes.length > 0) {
      return supabaseQuotes.map((q) => ({
        id: q.referenceId,
        company_name: q.company_name,
        contact_name: q.contact_name,
        email: q.email,
        phone: q.phone,
        message: q.message,
      }));
    }
    return localQuotes;
  }, [supabaseEnabled, supabaseQuotes, localQuotes]);

  const handleStatusChange = async (referenceId: string, status: OrderStatus) => {
    updateOrderStatus(referenceId, status);
    if (supabaseEnabled) {
      setSyncing(referenceId);
      await updateOrderStatusAdmin(referenceId, status);
      setSyncing(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-brand-blue">{t("title")}</h1>
        {supabaseEnabled ? (
          <Badge variant="secondary" className="text-xs">
            Supabase
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            localStorage
          </Badge>
        )}
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6">
          <TabsTrigger value="orders">
            {t("orders")} {orders.length > 0 && `(${orders.length})`}
          </TabsTrigger>
          <TabsTrigger value="quotes">
            {t("quotes")} {quotes.length > 0 && `(${quotes.length})`}
          </TabsTrigger>
          <TabsTrigger value="products">{t("products")}</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="glass rounded-3xl p-6 premium-shadow">
            {orders.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">{t("noOrders")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{t("company")}</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>{t("changeStatus")}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.referenceId}>
                      <TableCell className="font-mono text-xs">{order.referenceId}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm">
                        {order.company_name || "—"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {order.delivery_address}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.payment_method === "invoice"
                          ? tCheckout("paymentInvoice")
                          : tCheckout("paymentOnline")}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatPrice(order.total_estimated_price, localeStr)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          disabled={syncing === order.referenceId}
                          onValueChange={(v) =>
                            handleStatusChange(order.referenceId, v as OrderStatus)
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(["pending", "confirmed", "shipped", "completed"] as const).map(
                              (s) => (
                                <SelectItem key={s} value={s}>
                                  {tAccount(`status.${s}`)}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.referenceId}`}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          {t("orderDetails")}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quotes">
          <div className="glass rounded-3xl p-6 premium-shadow">
            {quotes.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">{t("noQuotes")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{t("company")}</TableHead>
                    <TableHead>{t("contact")}</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-mono text-xs">{quote.id}</TableCell>
                      <TableCell className="font-medium">{quote.company_name}</TableCell>
                      <TableCell>{quote.contact_name}</TableCell>
                      <TableCell className="text-sm">{quote.email}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{quote.phone}</TableCell>
                      <TableCell className="max-w-[240px] truncate text-sm text-muted-foreground">
                        {quote.message || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="mb-4 flex justify-end">
            <Button>{t("addProduct")}</Button>
          </div>
          <div className="glass rounded-3xl p-6 premium-shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Packaging</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>From</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PRODUCTS.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {getProductTitle(product, locale)}
                    </TableCell>
                    <TableCell>{product.packaging_type}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.b2b_tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {formatPrice(MOCK_PRICING[product.id]?.[0]?.price ?? 0, localeStr)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
