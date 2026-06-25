# AGENTS.md

## Cursor Cloud specific instructions

This is a single-service **Next.js 14** (App Router) app — a B2B New Year gifts
marketplace. There is no separate backend; data is served via Supabase
(PostgreSQL, Auth, Storage). See `README.md` and `docs/SUPABASE_SETUP.md` for
product/setup details.

### Environment / secrets
- Supabase and E2E credentials are provided as Cloud Agent secrets and are
  injected as environment variables (e.g. `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`, `E2E_ADMIN_*`,
  `E2E_CLIENT_*`). Next.js reads these from `process.env`, so **no `.env.local`
  is required** — do not assume one exists. If you need a local override, copy
  `.env.example` to `.env.local`.
- The app degrades gracefully when Supabase env vars are missing (see
  `src/lib/supabase/config.ts`), so a 200 home page alone does NOT prove DB
  connectivity — exercise a data flow (e.g. submit the quote form) to confirm.

### Install / run / lint / test / build
- **Install:** use `npm install`, NOT `npm ci`. The committed
  `package-lock.json` is out of sync with `package.json` (e.g. missing
  `@swc/helpers`), so `npm ci` fails. `npm install` reconciles it.
- **Run (dev):** `npm run dev` → http://localhost:3000. Routes are locale-scoped;
  use `/uk` (Ukrainian, default) or `/en` (English). Bare `/` is not a page.
- **Lint:** `npx next lint` (there is no `npm run lint` script).
- **Build:** `npm run build`.
- **E2E tests:** `npm run test:e2e` (Playwright). The Playwright config starts
  its own dev server and reuses an already-running one. Chromium must be
  installed first (`npx playwright install chromium`); the update script handles
  this. The quote-form E2E test writes a real row to the Supabase
  `quote_requests` table.

### Notes
- A known harmless build warning from `next-intl` about parsing
  `extractor/format/index.js` (`import(t)`) appears during dev/build; it does not
  affect functionality.
