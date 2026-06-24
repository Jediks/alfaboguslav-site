"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { updateQuoteStatusAdmin } from "@/lib/actions/quotes";
import { getProductTitle } from "@/lib/data/product-utils";
import { formatPrice } from "@/lib/pricing";
import type { OrderStatus, PricingTier, Product } from "@/types/database";

type AdminClientProps = {
  products: Product[];
  pricingMap: Record<string, PricingTier[]>;
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
  products,
  pricingMap,
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
  const [quoteSyncing, setQuoteSyncing] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | OrderStatus>("all");
  const [localQuoteStatuses, setLocalQuoteStatuses] = useState<
    Record<string, QuoteRecord["status"]>
  >({});

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
        referenceId: q.referenceId,
        status: q.status,
        company_name: q.company_name,
        contact_name: q.contact_name,
        email: q.email,
        phone: q.phone,
        message: q.message,
      }));
    }
    return localQuotes.map((q) => ({
      id: q.id,
      referenceId: q.id,
      status: localQuoteStatuses[q.id] ?? "new",
      company_name: q.company_name,
      contact_name: q.contact_name,
      email: q.email,
      phone: q.phone,
      message: q.message,
    }));
  }, [supabaseEnabled, supabaseQuotes, localQuotes, localQuoteStatuses]);

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesQuery =
        !query ||
        order.company_name.toLowerCase().includes(query) ||
        order.referenceId.toLowerCase().includes(query);
      const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const handleStatusChange = async (referenceId: string, status: OrderStatus) => {
    updateOrderStatus(referenceId, status);
    if (supabaseEnabled) {
      setSyncing(referenceId);
      await updateOrderStatusAdmin(referenceId, status);
      setSyncing(null);
    }
  };

  const handleQuoteStatusChange = async (referenceId: string, status: QuoteRecord["status"]) => {
    setLocalQuoteStatuses((prev) => ({ ...prev, [referenceId]: status }));
    if (supabaseEnabled) {
      setQuoteSyncing(referenceId);
      await updateQuoteStatusAdmin(referenceId, status);
      setQuoteSyncing(null);
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  value={orderSearch}
                  onChange={(event) => setOrderSearch(event.target.value)}
                  placeholder={t("orderSearchPlaceholder")}
                  className="w-72"
                />
                <Select
                  value={orderStatusFilter}
                  onValueChange={(value) => setOrderStatusFilter(value as "all" | OrderStatus)}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allStatuses")}</SelectItem>
                    {(["pending", "confirmed", "shipped", "completed"] as const).map((status) => (
                      <SelectItem key={status} value={status}>
                        {tAccount(`status.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <a href="/api/admin/export-orders" className="inline-flex">
                <Button variant="outline">{t("exportOrdersCsv")}</Button>
              </a>
            </div>
            {filteredOrders.length === 0 ? (
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
                  {filteredOrders.map((order) => (
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
                    <TableHead>{t("quoteStatus")}</TableHead>
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
                      <TableCell>
                        <Select
                          value={quote.status}
                          disabled={quoteSyncing === quote.referenceId}
                          onValueChange={(value) =>
                            handleQuoteStatusChange(quote.referenceId, value as QuoteRecord["status"])
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(["new", "in_progress", "quoted", "closed"] as const).map((status) => (
                              <SelectItem key={status} value={status}>
                                {t(`quoteStatusValues.${status}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
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
            <Link href="/admin/products/new">
              <Button>{t("addProduct")}</Button>
            </Link>
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
                {products.map((product) => (
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
                      {formatPrice(pricingMap[product.id]?.[0]?.price ?? 0, localeStr)}
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
