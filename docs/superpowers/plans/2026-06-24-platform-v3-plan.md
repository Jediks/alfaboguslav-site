# Alpha Boguslav Platform v3 — Implementation Plan

> **Goal:** Production-hardening, payments, content CMS, and employee workflows beyond MVP editor.

**Prerequisite:** Run migrations 005–007, set admin role, deploy Phase 1–2 code.

---

## Phase 6 — Production Hardening (Priority 1)

| Task | Description |
|------|-------------|
| 6.1 | E2e: auth fixtures (admin login, client login) |
| 6.2 | Remove localStorage order fallback when Supabase enabled |
| 6.3 | Migration: `quote_requests.admin_notes`, index on orders |
| 6.4 | Rate limiting on quote/checkout server actions |
| 6.5 | Error boundaries + Sentry-free logging (console + Vercel) |

---

## Phase 7 — Payments & Invoicing (Priority 2)

| Task | Description |
|------|-------------|
| 7.1 | LiqPay or Monobank acquiring for `payment_method: online` |
| 7.2 | PDF invoice generation (react-pdf or @react-pdf/renderer) |
| 7.3 | Email order confirmation to client (Resend) |
| 7.4 | Webhook handler for payment status → order status |

---

## Phase 8 — Content CMS (Priority 3)

| Task | Description |
|------|-------------|
| 8.1 | `content_blocks` table + admin UI for home sections |
| 8.2 | Editable testimonials (replace hardcoded marquee) |
| 8.3 | Hero image / CTA text editor |
| 8.4 | Preview mode before publish |

---

## Phase 9 — Advanced B2B (Priority 4)

| Task | Description |
|------|-------------|
| 9.1 | Company accounts: multiple users per company |
| 9.2 | Saved carts / draft orders |
| 9.3 | Custom quote → cart conversion in admin |
| 9.4 | MOQ rules + volume discount automation |
| 9.5 | Product compare (2–3 sets side by side) |

---

## Phase 10 — Analytics & Ops (Priority 5)

| Task | Description |
|------|-------------|
| 10.1 | Admin dashboard KPIs (orders/week, top sets) |
| 10.2 | Vercel Analytics + optional Plausible |
| 10.3 | Audit log for admin product/order changes |

---

## Execution Notes

- Start Phase 6 immediately after deploy + migrate
- Phases 7–10 require business decisions (payment provider, invoice legal fields)
- Keep uk/en for all new UI strings
