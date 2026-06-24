-- Alpha Boguslav B2B Marketplace Schema

create type user_role as enum ('client', 'admin');
create type order_status as enum ('pending', 'confirmed', 'shipped', 'completed');
create type payment_method as enum ('online', 'invoice');
create type packaging_type as enum ('cardboard', 'tube', 'wood', 'metal');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role user_role not null default 'client',
  company_name text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title_uk text not null,
  title_en text not null,
  desc_uk text not null,
  desc_en text not null,
  images text[] not null default '{}',
  packaging_type packaging_type not null,
  composition jsonb not null default '[]',
  weight_grams integer not null,
  b2b_tags text[] not null default '{}',
  sweet_types text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  min_quantity integer not null,
  price numeric(10,2) not null,
  unique (product_id, min_quantity)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  status order_status not null default 'pending',
  total_estimated_price numeric(10,2) not null,
  payment_method payment_method not null,
  delivery_address text not null,
  branding_logo_url text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null,
  price_at_time numeric(10,2) not null,
  branding_logo_url text
);

create table public.saved_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.pricing_tiers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.saved_assets enable row level security;

create policy "Public read products" on public.products for select using (true);
create policy "Public read pricing" on public.pricing_tiers for select using (true);

create policy "Users read own profile" on public.users for select using (auth.uid() = id);
create policy "Users update own profile" on public.users for update using (auth.uid() = id);

create policy "Users read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users create own orders" on public.orders for insert with check (auth.uid() = user_id);

create policy "Users read own order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create policy "Users read own assets" on public.saved_assets for select using (auth.uid() = user_id);
create policy "Users manage own assets" on public.saved_assets for all using (auth.uid() = user_id);

create policy "Admin all products" on public.products for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy "Admin all pricing" on public.pricing_tiers for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy "Admin all orders" on public.orders for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy "Admin all order items" on public.order_items for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'client');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
