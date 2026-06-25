import { NextResponse } from "next/server";
import { fetchQuotesAdmin } from "@/lib/actions/quotes";
import { requireAdmin } from "@/lib/auth/require-admin";

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

  const quotes = await fetchQuotesAdmin();
  const header = [
    "reference_id",
    "status",
    "company_name",
    "contact_name",
    "email",
    "phone",
    "message",
    "admin_notes",
    "created_at",
  ];

  const rows = quotes.map((quote) =>
    [
      quote.referenceId,
      quote.status,
      quote.company_name,
      quote.contact_name,
      quote.email,
      quote.phone,
      quote.message,
      quote.admin_notes,
      quote.created_at,
    ]
      .map((cell) => escapeCsvCell(cell))
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");
  const filename = `quotes-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
