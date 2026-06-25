# AGENTS.md

## Cursor Cloud specific instructions

Alpha Boguslav is a Next.js 14 (App Router) + TypeScript B2B gift marketplace using
Tailwind/shadcn, Supabase (Postgres/Auth/Storage), Zustand (cart), and next-intl
(Ukrainian `uk` default, English `en`). Standard commands live in `package.json`,
`README.md`, and `docs/SUPABASE_SETUP.md` — refer to those rather than duplicating.

### Running the app (demo mode vs. configured mode)

- `npm run dev` serves on `http://localhost:3000`. Locale-prefixed routes only:
  use `/uk` or `/en` (the bare `/` redirects). Catalog at `/uk/catalog`,
  product at `/uk/catalog/<id>` (e.g. `set-3-45`), cart at `/uk/cart`.
- **Demo mode (no Supabase env):** the app runs fully without any Supabase env vars.
  Catalog is served from local mocks (`src/lib/data/mock-products.ts`); cart/checkout
  work client-side via Zustand. `src/middleware.ts` and `src/lib/supabase/config.ts`
  gate all Supabase code paths behind `hasSupabaseEnv()`, so auth redirects are
  skipped (`/uk/admin` and `/uk/account` stay open).
- **Configured mode (real Supabase):** when real Supabase secrets are present,
  `hasSupabaseEnv()` is true and middleware enforces auth — `/uk/admin` and
  `/uk/account` 307-redirect to `/uk/login` for guests.
- **Getting secrets into the running server (important gotcha):** Cloud Agent secrets
  are injected as env vars at VM startup, but the long-lived `tmux`/exec-daemon server
  may have been started *before* injection, so dev servers launched in a new tmux pane
  can inherit stale env and silently run in demo mode. The reliable fix is to write a
  gitignored `.env.local` from the real secrets (Next.js loads it for dev/build/e2e
  regardless of shell inheritance). Use **real** values only — a fake anon key throws
  `supabase anon/publishable key is not configured` at runtime. Verify configured mode
  with `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" localhost:3000/uk/admin`
  (expect `307 .../uk/login`). The dev log also prints `Environments: .env.local`.
- Next.js reads env only at startup. After changing env vars (or writing `.env.local`)
  you must restart `npm run dev` — it will not pick them up via hot reload.

### Lint / build / test

- There is **no `npm run lint` script**. Run lint with `npx next lint`.
- Build: `npm run build` (also typechecks; TypeScript is strict).
- E2E: `npm run test:e2e` (or `npx playwright test`). Requires browsers once:
  `npx playwright install chromium`. The config (`playwright.config.ts`) auto-starts
  `npm run dev` and reuses an already-running server on port 3000.
  - **Warm the server first.** `e2e/site.spec.ts` uses `waitUntil: "networkidle"` and
    per-test 30s timeouts. Against a *cold* dev server the first route compile (catalog
    ~10s) can exceed the timeout and cause spurious failures. Run `npm run build` or hit
    the routes with `curl` once before the suite (or just rerun) and they pass reliably.
  - **Auth fixtures (Phase 6.1):** `e2e/fixtures/auth.ts` provides `loginAs()` +
    `adminAuth`/`clientAuth` fixtures; `e2e/auth.spec.ts` covers admin/client login and
    route guards. These RUN only when Supabase is configured **and** the
    `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` + `E2E_CLIENT_EMAIL`/`E2E_CLIENT_PASSWORD`
    secrets are set; otherwise they `test.skip`. They also require those users to exist
    in Supabase Auth (admin must have the admin role). In configured mode the full suite
    passes (11/11).
