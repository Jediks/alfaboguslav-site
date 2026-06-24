# Alpha Boguslav Platform v2 — Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Manager dispatches one implementer per task; Spec Reviewer → Code Reviewer → Tester after each task.

**Goal:** Evolve MVP into secure B2B marketplace with admin package editor and full client cabinet.

**Architecture:** Phase 1 secures auth + unifies data layer; Phase 2 adds admin CRUD; Phases 3–5 deepen ops and UX. See `docs/superpowers/specs/2026-06-24-platform-v2-design.md`.

**Tech Stack:** Next.js 14 App Router, Supabase (RLS), next-intl, Zustand, shadcn/ui, Playwright

**Project root:** `Site for New Year/`

---

## Agent Roster

| Agent | Role | Owns |
|-------|------|------|
| **MANAGER** | Orchestration, task dispatch, merge decisions | This chat |
| **WORKER-A** | Backend / Auth / DB | migrations, middleware, actions, RLS |
| **WORKER-B** | Admin panel | `src/app/[locale]/admin/**`, admin components |
| **WORKER-C** | User cabinet | account pages, profile, assets |
| **WORKER-D** | Storefront | catalog, cart, checkout, home |
| **SPEC-REVIEWER** | Requirements compliance | After each worker task |
| **CODE-REVIEWER** | Quality & patterns | After spec pass |
| **TESTER** | `npm run build`, `test:e2e` | After code pass |

---

## Phase 1 — Foundation & Security

### Task 1.1: Auth guards in middleware
**Agent:** WORKER-A  
**Files:**
- Modify: `src/middleware.ts`
- Create: `src/lib/auth/guards.ts`
- Modify: `src/lib/supabase/middleware.ts` (return user + role)

**Acceptance:**
- Unauthenticated `/uk/account` → redirect `/uk/login?next=/uk/account`
- Authenticated non-admin `/uk/admin` → redirect `/uk` with error toast query or 403 page
- `/uk/login`, `/uk/register`, `/auth/callback` remain public

---

### Task 1.2: User profile & logout
**Agent:** WORKER-C  
**Depends:** 1.1  
**Files:**
- Create: `src/components/layout/user-menu.tsx`
- Modify: `src/components/layout/header.tsx`
- Create: `src/app/[locale]/account/profile/page.tsx`
- Create: `src/lib/actions/profile.ts`
- Modify: `src/components/auth/auth-form.tsx` (register → save company_name via action after signup)
- Migration: `supabase/migrations/005_user_profile_trigger.sql` — extend `handle_new_user` to copy `raw_user_meta_data->company_name`

**Acceptance:**
- Logout clears session, redirects home
- Profile shows/edits company_name
- Register persists company_name in `public.users`

---

### Task 1.3: Secure orders & link user_id
**Agent:** WORKER-A  
**Depends:** 1.1  
**Files:**
- Modify: `src/lib/actions/orders.ts` — set `user_id` from session when present
- Modify: `src/app/[locale]/account/orders/[id]/page.tsx` — user-scoped fetch (RLS), not admin client
- Create: `src/lib/data/orders.ts` — `fetchOrderForUser(reference, userId)`
- Modify: `src/components/checkout/checkout-client.tsx` — prefill from profile when logged in

**Acceptance:**
- Guest checkout still works (`user_id` null)
- Logged-in user sees only own orders
- Direct URL to another user's order returns 404

---

### Task 1.4: Unify catalog/pricing data layer
**Agent:** WORKER-D  
**Depends:** none (parallel with 1.1 after plan read)  
**Files:**
- Modify: `src/components/cart/cart-client.tsx` — accept products/pricing props from page
- Modify: `src/app/[locale]/cart/page.tsx` — server fetch products + tiers
- Modify: `src/components/checkout/checkout-client.tsx` + checkout page — same pattern
- Modify: `src/components/catalog/product-card.tsx`, `catalog-filters.tsx` — use props
- Modify: `src/components/home/b2b-configurator.tsx`, `horizontal-showcase.tsx` — server data
- Modify: `src/components/admin/admin-order-detail.tsx` — product map from server
- Remove: direct `MOCK_PRODUCTS` imports from above (keep fallback inside `products.ts` only)

**Acceptance:**
- Change price in DB → reflected in cart total after refresh
- Build passes; catalog/cart/checkout pages render

---

### Task 1.5: Types & admin bootstrap
**Agent:** WORKER-A  
**Depends:** 1.1  
**Files:**
- Modify: `src/types/database.ts` — add `saved_assets`, quote status fields
- Create: `docs/ADMIN_BOOTSTRAP.md` — SQL to promote user to admin role
- Migration: `supabase/migrations/006_quote_status.sql` — optional quote status column

**Acceptance:**
- TypeScript compiles
- Documented steps to set first admin via Supabase SQL

---

### Phase 1 — Tester checklist
**Agent:** TESTER  
- [ ] `npm run build`
- [ ] `npm run test:e2e`
- [ ] Manual: anonymous blocked from `/uk/admin`
- [ ] Manual: login → account → logout

---

## Phase 2 — Admin Package Editor (summary)

| Task | Agent | Summary |
|------|-------|---------|
| 2.1 | WORKER-B | Products list from Supabase + publish badge |
| 2.2 | WORKER-B | Product create/edit form (i18n fields) |
| 2.3 | WORKER-B | Composition editor component |
| 2.4 | WORKER-B | Pricing tiers CRUD inline |
| 2.5 | WORKER-A | Storage bucket `product-images` + upload API |
| 2.6 | WORKER-B | Wire image upload in editor |
| 2.7 | WORKER-A | Server actions: `createProduct`, `updateProduct`, `deleteProduct` |

---

## Phase 3 — Quotes & Order Ops (summary)

| Task | Agent | Summary |
|------|-------|---------|
| 3.1 | WORKER-B | Quote status UI + update action |
| 3.2 | WORKER-B | Order filters + search |
| 3.3 | WORKER-B | Show branding logo in order detail |
| 3.4 | WORKER-B | Export orders CSV |

---

## Phase 4 — Client Cabinet (summary)

| Task | Agent | Summary |
|------|-------|---------|
| 4.1 | WORKER-C | Saved assets page + upload |
| 4.2 | WORKER-C | Account dashboard redesign |
| 4.3 | WORKER-C | Repeat order button |
| 4.4 | WORKER-D | Invoice print view `/account/orders/[id]/invoice` |

---

## Phase 5 — Frontend Polish (summary)

| Task | Agent | Summary |
|------|-------|---------|
| 5.1 | WORKER-D | Catalog images strategy + placeholders |
| 5.2 | WORKER-D | About + Contact pages |
| 5.3 | WORKER-D | Mobile nav + catalog polish |
| 5.4 | WORKER-D | Testimonials → DB or content_blocks |

---

## Execution Order (Manager)

```
Phase 1: 1.1 → (1.2 ∥ 1.3 ∥ 1.4 after 1.1) → 1.5 → TESTER
Phase 2: 2.5 → 2.7 → 2.1 → 2.2 → 2.3 → 2.4 → 2.6 → TESTER
Phase 3: sequential 3.1–3.4 → TESTER
Phase 4: parallel 4.1–4.2, then 4.3–4.4 → TESTER
Phase 5: as prioritized with user
```

**Branch strategy:** Feature branch `platform/v2-phase1` — merge to main after Phase 1 tester pass + user approval.

---

## Immediate Next Action

**START: Task 1.1** — dispatch WORKER-A (implementer subagent) with full acceptance criteria above.
