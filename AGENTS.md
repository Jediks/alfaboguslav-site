# AGENTS.md

## Cursor Cloud specific instructions

Alpha Boguslav is a Next.js 14 (App Router) + TypeScript B2B gift marketplace using
Tailwind/shadcn, Supabase (Postgres/Auth/Storage), Zustand (cart), and next-intl
(Ukrainian `uk` default, English `en`). Standard commands live in `package.json`,
`README.md`, and `docs/SUPABASE_SETUP.md` — refer to those rather than duplicating.

### Running the app (demo mode is the default here)

- `npm run dev` serves on `http://localhost:3000`. Locale-prefixed routes only:
  use `/uk` or `/en` (the bare `/` redirects). Catalog at `/uk/catalog`,
  product at `/uk/catalog/<id>` (e.g. `set-3-45`), cart at `/uk/cart`.
- The app runs fully in **demo mode without any Supabase env vars**. The catalog is
  served from local mocks (`src/lib/data/mock-products.ts`); cart/checkout work
  client-side via Zustand. `src/middleware.ts` and `src/lib/supabase/config.ts`
  gate all Supabase code paths behind `hasSupabaseEnv()`, so no `.env.local` is
  required to develop or test the storefront.
- **Do NOT create a `.env.local` with placeholder/fake Supabase keys.** Setting
  `NEXT_PUBLIC_SUPABASE_URL` + a key flips the app out of demo mode, and a fake
  anon key then throws `supabase anon/publishable key is not configured` at runtime
  (breaks home/auth/checkout). To use Supabase, supply *real* values from
  `.env.example` (see `docs/SUPABASE_SETUP.md`); otherwise leave env unset.
- Next.js reads env only at startup. After changing env vars you must restart
  `npm run dev` — the running server will not pick them up via hot reload.

### Lint / build / test

- There is **no `npm run lint` script**. Run lint with `npx next lint`.
- Build: `npm run build` (also typechecks; TypeScript is strict).
- E2E: Playwright (`npx playwright test`). Requires browsers once:
  `npx playwright install chromium`. The config (`playwright.config.ts`) auto-starts
  `npm run dev` and reuses an already-running server on port 3000.
  - Caveats: `e2e/site.spec.ts` uses `waitUntil: "networkidle"` and asserts on
    framer-motion–animated elements (e.g. `scrollIntoViewIfNeeded(".showcase-rail")`);
    these are flaky/fail against the dev server even though the content renders
    (verify with curl). They are intended for a stable build / configured env.
  - The auth/admin-redirect tests in `e2e/auth.spec.ts` and the Admin test in
    `site.spec.ts` assume Supabase is configured; in demo mode middleware skips auth
    redirects, so they skip (auth.spec) or do not redirect (site.spec Admin test).
