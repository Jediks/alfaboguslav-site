import { NextResponse } from "next/server";
import { fetchOrdersAdmin } from "@/lib/actions/orders";
import { requireAdmin } from "@/lib/auth/require-admin";
import { parseQuoteRefFromDelivery } from "@/lib/quote-ref";

function escapeCsvCell(value: string | number | null | undefined): string {
  const raw = String(value ?? "");
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }

  const orders = await fetchOrdersAdmin();
  const header = [
    "reference_id",
    "linked_quote_ref",
    "status",
    "company_name",
    "contact_name",
    "contact_email",
    "contact_phone",
    "delivery_address",
    "payment_method",
    "total_estimated_price",
    "branding_logo_url",
    "created_at",
  ];

  const rows = orders.map((order) =>
    [
      order.referenceId,
      parseQuoteRefFromDelivery(order.delivery_address) ?? "",
      order.status,
      order.company_name,
      order.contact_name,
      order.contact_email,
      order.contact_phone,
      order.delivery_address,
      order.payment_method,
      order.total_estimated_price,
      order.branding_logo_url ?? "",
      order.created_at,
    ]
      .map((cell) => escapeCsvCell(cell))
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");
  const filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
