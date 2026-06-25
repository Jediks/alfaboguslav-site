"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ExternalLink, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useQuotePrefillStore } from "@/stores/quote-prefill-store";
import type { OrderRecord } from "@/lib/actions/orders";
import type { QuoteRecord } from "@/lib/actions/quotes";
import { updateOrderStatusAdmin } from "@/lib/actions/orders";
import { updateQuoteStatusAdmin } from "@/lib/actions/quotes";
import { getProductTitle } from "@/lib/data/product-utils";
import { formatPrice } from "@/lib/pricing";
import type { OrderStatus, PricingTier, Product } from "@/types/database";
import type { AdminContentBlock } from "@/lib/data/content-blocks";
import type { AuditEntry } from "@/lib/data/audit";
import type { KpiOrderInput } from "@/lib/data/admin-kpis";
import { ContentBlocksEditor } from "./content-blocks-editor";
import { AdminKpiCards } from "./admin-kpi-cards";

type AdminClientProps = {
  products: Product[];
  pricingMap: Record<string, PricingTier[]>;
  supabaseOrders: OrderRecord[];
  supabaseQuotes: QuoteRecord[];
  supabaseEnabled: boolean;
  contentBlocks: AdminContentBlock[];
  auditLog?: AuditEntry[];
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
  contentBlocks,
  auditLog = [],
}: AdminClientProps) {
  const t = useTranslations("admin");
  const tAccount = useTranslations("account");
  const tCheckout = useTranslations("checkout");
  const locale = useLocale();
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const router = useRouter();
  const setQuotePrefill = useQuotePrefillStore((s) => s.setFromQuote);
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
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});
  const [noteSaving, setNoteSaving] = useState<string | null>(null);
  const [auditFilter, setAuditFilter] = useState<string>("all");
  const [auditVisible, setAuditVisible] = useState(20);

  const auditEntityTypes = useMemo(
    () => Array.from(new Set(auditLog.map((e) => e.entity_type))).sort(),
    [auditLog]
  );
  const filteredAudit = useMemo(
    () =>
      auditFilter === "all"
        ? auditLog
        : auditLog.filter((e) => e.entity_type === auditFilter),
    [auditLog, auditFilter]
  );

  const orders = useMemo(() => {
    if (supabaseEnabled) {
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

  const kpiOrders = useMemo<KpiOrderInput[]>(
    () => (supabaseEnabled ? supabaseOrders : localOrders),
    [supabaseEnabled, supabaseOrders, localOrders]
  );

  const quotesThisWeek = useMemo(() => {
    if (!supabaseEnabled) return undefined;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return supabaseQuotes.filter(
      (q) => new Date(q.created_at).getTime() >= weekAgo
    ).length;
  }, [supabaseEnabled, supabaseQuotes]);

  const quotes = useMemo(() => {
    if (supabaseEnabled) {
      return supabaseQuotes.map((q) => ({
        id: q.referenceId,
        referenceId: q.referenceId,
        status: q.status,
        company_name: q.company_name,
        contact_name: q.contact_name,
        email: q.email,
        phone: q.phone,
        message: q.message,
        admin_notes: q.admin_notes ?? "",
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
      admin_notes: "",
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

  const handleSaveQuoteNotes = async (
    referenceId: string,
    status: QuoteRecord["status"],
    notes: string
  ) => {
    if (!supabaseEnabled) return;
    setNoteSaving(referenceId);
    await updateQuoteStatusAdmin(referenceId, status, notes);
    setNoteSaving(null);
  };

  const handleConvertQuoteToOrder = (quote: (typeof quotes)[number]) => {
    setQuotePrefill({
      referenceId: quote.referenceId,
      company_name: quote.company_name,
      contact_name: quote.contact_name,
      email: quote.email,
      phone: quote.phone,
      message: quote.message,
    });
    if (quote.status === "new") {
      void handleQuoteStatusChange(quote.referenceId, "in_progress");
    }
    router.push("/catalog");
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

      <AdminKpiCards
        orders={kpiOrders}
        products={products}
        quotesThisWeek={quotesThisWeek}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/products/new">
          <Button size="sm">{t("addProduct")}</Button>
        </Link>
        <Link href="/admin/products">
          <Button size="sm" variant="outline">
            {t("manageProducts")}
          </Button>
        </Link>
        {supabaseEnabled && (
          <a href="/api/admin/export-orders">
            <Button size="sm" variant="outline">
              {t("exportOrdersCsv")}
            </Button>
          </a>
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
          <TabsTrigger value="content">{t("content")}</TabsTrigger>
          <TabsTrigger value="audit">{t("audit")}</TabsTrigger>
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
                    <TableHead>{t("notes")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
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
                      <TableCell className="min-w-[220px]">
                        <div className="flex flex-col gap-1.5">
                          <Textarea
                            rows={2}
                            className="text-sm"
                            placeholder={t("notesPlaceholder")}
                            value={noteEdits[quote.referenceId] ?? quote.admin_notes}
                            onChange={(e) =>
                              setNoteEdits((prev) => ({
                                ...prev,
                                [quote.referenceId]: e.target.value,
                              }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!supabaseEnabled || noteSaving === quote.referenceId}
                            onClick={() =>
                              handleSaveQuoteNotes(
                                quote.referenceId,
                                quote.status,
                                noteEdits[quote.referenceId] ?? quote.admin_notes
                              )
                            }
                          >
                            {noteSaving === quote.referenceId ? t("savingNotes") : t("saveNotes")}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1.5 whitespace-nowrap"
                          onClick={() => handleConvertQuoteToOrder(quote)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {t("convertQuoteToOrder")}
                        </Button>
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

        <TabsContent value="content">
          <ContentBlocksEditor
            blocks={contentBlocks}
            supabaseEnabled={supabaseEnabled}
          />
        </TabsContent>

        <TabsContent value="audit">
          <div className="glass rounded-3xl p-6 premium-shadow">
            {auditLog.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                {t("auditEmpty")}
              </p>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <Select
                    value={auditFilter}
                    onValueChange={(value) => {
                      setAuditFilter(value ?? "all");
                      setAuditVisible(20);
                    }}
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("auditAllTypes")}</SelectItem>
                      {auditEntityTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    {t("auditCount", { count: filteredAudit.length })}
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("auditTime")}</TableHead>
                      <TableHead>{t("auditActor")}</TableHead>
                      <TableHead>{t("auditAction")}</TableHead>
                      <TableHead>{t("auditEntity")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAudit.slice(0, auditVisible).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleString(localeStr)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {entry.actor_email || "—"}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {entry.action}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {entry.entity_type}
                          {entry.entity_id ? ` · ${entry.entity_id}` : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {auditVisible < filteredAudit.length && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setAuditVisible((v) => v + 20)}
                    >
                      {t("auditShowMore")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
