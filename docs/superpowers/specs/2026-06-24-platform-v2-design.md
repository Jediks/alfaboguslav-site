# Alpha Boguslav Platform v2 — Product Design Spec

**Date:** 2026-06-24  
**Status:** Approved for planning  
**Goal:** Transform MVP storefront into a full B2B gift marketplace with employee tooling and client self-service.

---

## 1. Vision

| Persona | Today | Target |
|---------|-------|--------|
| **B2B Client** | Browse catalog, guest checkout, weak account | Full cabinet: orders, logos, company profile, repeat purchase, invoices |
| **Employee (Admin)** | Public `/admin`, read-only products | Secure admin: CRUD sets/packages, pricing, quotes workflow, order management |
| **Manager** | Email notifications only | Dashboard KPIs, export, audit trail (Phase 3+) |

**Non-goals (v2.0):** Payment acquiring (LiqPay/Stripe), ERP integration, multi-warehouse inventory.

---

## 2. Current State Summary

**Strong:** Marketing UI, i18n (uk/en), catalog UX, cart, guest checkout, Supabase schema + seed, OAuth plumbing.

**Critical gaps:**
- `/admin` is public; no role checks
- Products tab read-only from mocks; no package editor
- Cart/checkout pricing hardcoded to mocks (ignores DB)
- Account: no logout, profile, saved logos, invoice download
- Orders always `user_id: null`; company name not saved on register
- Catalog images missing from repo; storage bucket manual

---

## 3. Architecture

### 3.1 Data model extensions (Phase 1–2)

```
products (existing)
  + is_published boolean default true
  + sort_order int
  + updated_at, updated_by

pricing_tiers (existing) — admin CRUD

quote_requests
  + status enum: new | in_progress | quoted | closed
  + admin_notes text
  + updated_at

saved_assets (existing) — wire to UI

content_blocks (new, Phase 2)
  id, key (unique), locale, title, body jsonb, updated_at
  — for editable home sections, testimonials (optional Phase 2)
```

### 3.2 Auth & authorization

- Middleware route guards:
  - `/[locale]/account/*` → require session
  - `/[locale]/admin/*` → require session + `users.role = admin`
- Server actions validate role (never trust client)
- Replace service-role reads for user data with RLS-scoped user client where possible
- Admin actions continue using service role but only after role check in action

### 3.3 Single source of truth for catalog

- **Rule:** All pricing/product reads go through `src/lib/data/products.ts` (server) or API/route handlers (client)
- Remove direct `MOCK_PRODUCTS` imports from cart, checkout, filters, admin product tab
- Client components receive product/pricing as props or fetch `/api/catalog/*`

### 3.4 Admin module structure

```
src/app/[locale]/admin/
  page.tsx                    — dashboard shell
  products/
    page.tsx                  — list
    new/page.tsx              — create set
    [id]/edit/page.tsx        — package editor (composition, images, tiers, i18n)
  orders/...                  — existing + status filters
  quotes/...                  — list + status workflow
```

**Package editor fields:** slug id, uk/en title & description, packaging_type, weight, composition JSON editor, sweet_types, b2b_tags, image upload (Storage), pricing tiers table (min_qty, price).

### 3.5 User cabinet structure

```
src/app/[locale]/account/
  page.tsx           — dashboard: recent orders, company card
  profile/page.tsx   — company_name, contact phone, email (read-only)
  assets/page.tsx    — saved_assets list + upload
  orders/[id]/       — user-scoped detail + invoice placeholder
```

- Header: logout button, user menu
- Checkout: if logged in, prefill + set `user_id` on order

---

## 4. Phased Delivery

### Phase 1 — Foundation & Security (Week 1)
**Exit criteria:** Admin requires login; clients require login for account; pricing unified; profile works.

1. Auth middleware guards + admin role check
2. Logout + profile (company_name sync on register)
3. Link orders to `user_id`; secure order detail by ownership
4. Unify pricing: cart/checkout/filters use server-fetched tiers
5. Fix `database.ts` types; migration for quote status if needed

### Phase 2 — Admin Product & Package Editor (Week 2)
**Exit criteria:** Employee can create/edit/publish a gift set without code deploy.

1. Admin products list from Supabase
2. Create/edit product form (bilingual)
3. Composition editor (structured rows: name, weight, qty)
4. Pricing tiers inline editor
5. Image upload to `branding` or new `product-images` bucket
6. Publish/unpublish toggle

### Phase 3 — Quotes & Order Ops (Week 3)
**Exit criteria:** Quote lifecycle managed in admin; order list filterable.

1. Quote status workflow + admin notes
2. Order filters (status, date, search by company)
3. Admin shows branding logo on orders
4. Export orders CSV

### Phase 4 — Client Cabinet Polish (Week 4)
**Exit criteria:** Client self-service complete for repeat B2B buyers.

1. Saved logos (`saved_assets`) UI
2. Checkout prefill from profile
3. Repeat order from history
4. Account dashboard UX refresh
5. Invoice PDF stub (HTML print view first)

### Phase 5 — Frontend & Content (Week 5+)
**Exit criteria:** Site feels production-grade, not demo.

1. Commit or CDN strategy for catalog images
2. Wire unused home components or replace testimonials with CMS blocks
3. About / Contact pages
4. Catalog UX: compare sets, MOQ hints, mobile polish
5. Performance: image optimization audit

---

## 5. Agent Orchestration Model

```
┌─────────────────────────────────────────────────────────┐
│  MANAGER (this session)                                  │
│  • Owns plan, assigns tasks, merges reviews, unblocks   │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┼────────┬────────────┬──────────────┐
    ▼        ▼        ▼            ▼              ▼
 WORKER-A  WORKER-B WORKER-C   WORKER-D      TESTER
 Backend   Admin    Account    Frontend      Playwright
 Auth/DB   CRUD     Cabinet    Catalog UX    Smoke + e2e
             │                        │
             └──── SPEC REVIEWER ─────┘
             └──── CODE REVIEWER ─────┘
```

**Per task workflow:**
1. Manager dispatches **one implementer** with full task text (no plan file read)
2. **Spec reviewer** confirms requirements
3. **Code reviewer** confirms quality
4. **Tester** runs `npm run build` + `npm run test:e2e` on affected flows
5. Manager marks complete; next task

**Parallelism rules:**
- Phase 1 tasks sequential (auth blocks everything)
- Phase 2+: Admin CRUD ∥ Account UI only after Phase 1 merged
- Never two implementers on same files simultaneously

---

## 6. Success Metrics

- [ ] `/admin` returns 403/redirect for non-admin
- [ ] New product created in admin appears in catalog within 60s
- [ ] Logged-in checkout attaches `user_id`
- [ ] Cart total matches PDP tier calculator for same qty
- [ ] E2e: register → login → checkout → see order in account
- [ ] E2e: admin login → change order status

---

## 7. Technical Constraints

- Stack unchanged: Next.js 14, Supabase, shadcn, uk/en
- Minimal diff per task; match existing patterns
- No push without explicit user approval
- Secrets stay in `.env.local`
