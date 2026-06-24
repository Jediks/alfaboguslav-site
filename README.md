# Alpha Boguslav — B2B New Year Gifts Marketplace

Premium B2B e-commerce marketplace for corporate New Year gift sets.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript (strict)
- **Tailwind CSS** + **shadcn/ui** + Lucide React
- **Supabase** (PostgreSQL, Auth, Storage)
- **Zustand** (cart state)
- **next-intl** (Ukrainian default, English)

## Getting Started

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Fill in your Supabase project URL and anon key.

3. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

4. Open [http://localhost:3000/uk](http://localhost:3000/uk) (Ukrainian) or [http://localhost:3000/en](http://localhost:3000/en) (English).

## Project Structure

```
src/
├── app/
│   └── [locale]/          # Locale-scoped routes (uk, en)
│       ├── catalog/       # Product catalog (Step 4)
│       ├── layout.tsx
│       └── page.tsx
├── components/
│   ├── layout/            # Header, Footer (Step 3)
│   └── ui/                # shadcn/ui primitives
├── i18n/                  # next-intl routing & navigation
├── lib/
│   ├── pricing.ts         # Tiered B2B pricing helpers
│   └── supabase/          # Browser, server & middleware clients
├── stores/
│   └── cart-store.ts      # Zustand cart (Step 5)
└── types/
    └── database.ts        # Supabase TypeScript types
messages/
├── uk.json
└── en.json
```

## Implementation Roadmap

- [x] **Step 1:** Setup & Configuration
- [x] **Step 2:** Database schema (SQL migration) + Auth UI
- [x] **Step 3:** UI Shell (Header, Footer, premium design)
- [x] **Step 4:** Catalog with filters + Product page
- [x] **Step 5:** Cart & Checkout (Zustand)
- [x] **Step 6:** Account + Admin dashboards

## Pages

| Route | Description |
|-------|-------------|
| `/uk` | Premium landing page |
| `/uk/catalog` | Product grid + filters |
| `/uk/catalog/[id]` | Product detail, pricing, logo upload |
| `/uk/cart` | Shopping cart |
| `/uk/checkout` | B2B checkout |
| `/uk/thank-you` | Order confirmation |
| `/uk/login` / `/register` | Auth (Supabase-ready) |
| `/uk/account` | Order history |
| `/uk/admin` | Admin panel |
