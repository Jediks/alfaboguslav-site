# Deploy alfaboguslav.site

## 1. GitHub

Push this project to GitHub (`.env.local` is gitignored).

## 2. Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo.
2. Framework: **Next.js**. Region: **Frankfurt (fra1)**.
3. Environment variables (Production + Preview):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://alfaboguslav.site` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key |
| `SUPABASE_SECRET_KEY` | Secret key |
| `RESEND_API_KEY` | Optional |
| `MANAGER_EMAIL` | Optional |

4. Deploy and test the `*.vercel.app` URL.

## 3. Custom domain

Vercel → **Settings → Domains**: add `alfaboguslav.site` and `www.alfaboguslav.site`.

DNS at registrar:

| Type | Name | Value |
|------|------|--------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

## 4. Supabase auth

**Authentication → URL configuration:**

- Site URL: `https://alfaboguslav.site`
- Redirect URLs: `https://alfaboguslav.site/**`, `https://www.alfaboguslav.site/**`, `https://*.vercel.app/**`

## 5. Verify

- https://alfaboguslav.site/uk
- https://alfaboguslav.site/uk/catalog
- Login and test checkout
