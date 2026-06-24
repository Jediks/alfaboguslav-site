-- Admin product management fields

alter table public.products
  add column if not exists is_published boolean not null default true;

alter table public.products
  add column if not exists sort_order integer not null default 0;

alter table public.products
  add column if not exists updated_at timestamptz not null default now();

create index if not exists products_sort_order_idx on public.products (sort_order desc, created_at desc);
