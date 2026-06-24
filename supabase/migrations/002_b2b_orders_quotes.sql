-- B2B guest checkout fields, quote requests, text product IDs (mock slugs)

alter table public.orders
  add column if not exists reference_id text unique,
  add column if not exists company_name text,
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text;

alter table public.order_items
  drop constraint if exists order_items_product_id_fkey;

alter table public.order_items
  alter column product_id type text using product_id::text;

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference_id text not null unique,
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  message text not null default '',
  created_at timestamptz not null default now()
);

alter table public.quote_requests enable row level security;

create policy "Admin read quote requests"
  on public.quote_requests for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- Guest checkout: allow authenticated users to insert own orders (existing)
-- Server actions use service role for guest inserts (bypasses RLS)

create policy "Users insert own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

create policy "Admin all order items insert"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "Admin read all order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );
