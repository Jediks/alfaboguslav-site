# Supabase Setup (Free Tier)

Project: **New Year Project** — `priavzpomtzjfgkitqmv`  
Dashboard: https://supabase.com/dashboard/project/priavzpomtzjfgkitqmv

## Quick setup (automated)

### 1. Keys in `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://priavzpomtzjfgkitqmv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_DB_URL=postgresql://postgres.priavzpomtzjfgkitqmv:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

Get **Database password**: Settings → Database → Database password  
Get **Connection URI**: Settings → Database → Connection string → **Session pooler** (port 5432)  
Get **Secret key**: Settings → API → Secret keys

### 2. Run migrations (one command)

```bash
npm run supabase:migrate
```

This applies `supabase/migrations/001` … `004` (schema + 11 products).

### 3. Manual alternative (SQL Editor)

If you prefer the dashboard: open [SQL Editor](https://supabase.com/dashboard/project/priavzpomtzjfgkitqmv/sql/new), paste contents of **`supabase/setup_all.sql`**, click **Run**.

### 4. Storage (optional — logo upload)

Create a public bucket named `branding` in **Storage**.

### 5. Auth URL configuration

**Option A — script (recommended):**

1. Create a token at https://supabase.com/dashboard/account/tokens
2. Add to `.env.local`: `SUPABASE_ACCESS_TOKEN=sbp_...`
3. Run:

```bash
npm run supabase:auth-config
```

**Option B — manual:** [Auth → URL configuration](https://supabase.com/dashboard/project/priavzpomtzjfgkitqmv/auth/url-configuration)

| Field | Value |
|-------|--------|
| Site URL | `https://alfaboguslav.site` |
| Redirect URLs | `http://localhost:3000/**` |
| | `https://alfaboguslav.site/**` |
| | `https://www.alfaboguslav.site/**` |
| | `https://*.vercel.app/**` |

**Google OAuth:** [Auth → Providers → Google](https://supabase.com/dashboard/project/priavzpomtzjfgkitqmv/auth/providers) — enable and add Client ID/Secret from Google Cloud Console.

OAuth callback route in app: `/auth/callback`

### 6. Verify

```bash
npm run dev
```

1. Submit quote on home → **Admin → Quote requests**
2. Complete checkout → **Admin → Orders**

Regenerate seed after catalog changes:

```bash
npm run seed:generate
npm run supabase:migrate
```

## Tables

| Table | Purpose |
|-------|---------|
| `orders` | B2B guest checkout |
| `order_items` | Line items (`product_id` text slug) |
| `quote_requests` | CTA quote form |
| `products` / `pricing_tiers` | Catalog (seeded from mocks) |
