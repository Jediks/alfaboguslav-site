-- Phase 6.3: performance indexes for orders, quote_requests, order_items
create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_status_idx
  on public.orders (status);

create index if not exists orders_user_id_idx
  on public.orders (user_id);

create index if not exists orders_reference_id_idx
  on public.orders (reference_id);

create index if not exists orders_contact_email_idx
  on public.orders (lower(contact_email));

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create index if not exists order_items_product_id_idx
  on public.order_items (product_id);

create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);

create index if not exists quote_requests_status_idx
  on public.quote_requests (status);

create index if not exists quote_requests_reference_id_idx
  on public.quote_requests (reference_id);

-- Phase 8.1: content_blocks CMS table for hero/testimonials/etc.
create table if not exists public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  block_key text not null,
  position integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (block_key, position)
);

create index if not exists content_blocks_key_idx
  on public.content_blocks (block_key, position);

alter table public.content_blocks enable row level security;

drop policy if exists "Public read published content blocks" on public.content_blocks;
create policy "Public read published content blocks"
  on public.content_blocks for select
  using (is_published = true);

drop policy if exists "Admin all content blocks" on public.content_blocks;
create policy "Admin all content blocks"
  on public.content_blocks for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );
