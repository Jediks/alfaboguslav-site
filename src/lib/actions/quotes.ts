"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/supabase/config";
import { notifyNewQuote } from "@/lib/email/notify";

export type SubmitQuoteInput = {
  referenceId: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  message: string;
};

export type QuoteRecord = {
  id: string;
  referenceId: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
};

export async function submitQuote(
  input: SubmitQuoteInput
): Promise<{ ok: true; referenceId: string; persisted: "supabase" | "local" }> {
  if (!hasSupabaseAdmin()) {
    return { ok: true, referenceId: input.referenceId, persisted: "local" };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("quote_requests").insert({
    reference_id: input.referenceId,
    company_name: input.company_name,
    contact_name: input.contact_name,
    email: input.email,
    phone: input.phone,
    message: input.message,
  } as never);

  if (error) {
    console.error("[submitQuote]", error);
    throw new Error("Failed to save quote request");
  }

  await notifyNewQuote({
    referenceId: input.referenceId,
    companyName: input.company_name,
    contactName: input.contact_name,
    email: input.email,
    phone: input.phone,
    message: input.message,
  });

  return { ok: true, referenceId: input.referenceId, persisted: "supabase" };
}

export async function fetchQuotesAdmin(): Promise<QuoteRecord[]> {
  if (!hasSupabaseAdmin()) return [];

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[fetchQuotesAdmin]", error);
    return [];
  }

  return data.map((q) => ({
    id: q.id,
    referenceId: q.reference_id,
    company_name: q.company_name,
    contact_name: q.contact_name,
    email: q.email,
    phone: q.phone,
    message: q.message,
    created_at: q.created_at,
  }));
}
