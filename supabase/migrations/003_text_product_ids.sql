-- Use text slug IDs (set-11-65) to match mock catalog and order_items

alter table public.pricing_tiers
  drop constraint if exists pricing_tiers_product_id_fkey;

alter table public.products
  alter column id drop default;

alter table public.products
  alter column id type text using id::text;

alter table public.pricing_tiers
  alter column id drop default;

alter table public.pricing_tiers
  alter column id type text using id::text;

alter table public.pricing_tiers
  alter column product_id type text using product_id::text;

alter table public.pricing_tiers
  add constraint pricing_tiers_product_id_fkey
  foreign key (product_id) references public.products(id) on delete cascade;

-- Logged-in clients can view orders placed with their email
create policy "Users read orders by contact email"
  on public.orders for select
  using (
    contact_email is not null
    and lower(contact_email) = lower(auth.jwt() ->> 'email')
  );
