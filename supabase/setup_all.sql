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
-- Auto-generated from mock-products.ts — run after 003_text_product_ids.sql
truncate public.pricing_tiers cascade;
truncate public.products cascade;

INSERT INTO public.products (
  id, title_uk, title_en, desc_uk, desc_en, images, packaging_type,
  composition, weight_grams, b2b_tags, sweet_types, created_at
) VALUES (
  'set-3-45',
  'Набір 3/45 — «Ялинкова іграшка»',
  'Set 3/45 — Christmas Ornament Tin',
  'Компактний металевий набір у формі ялинкової прикраси. 12 цукерок преміальних брендів — ідеально для невеликих корпоративних подарунків.',
  'Compact metal gift set shaped like a Christmas ornament. 12 premium branded candies — perfect for small corporate gifts.',
  ARRAY['/catalog/cutouts/set-3-45-packaging.png?v=20260625', '/catalog/sets/set-3-45-packaging.jpg?v=20260625', '/catalog/sets/set-3-45-contents.jpg?v=20260625']::text[],
  'metal',
  '[{"name_uk":"Птахи Проти Орків (Лукас)","name_en":"Birds Against Orcs (Lukas)","weight_grams":12},{"name_uk":"Патрон (Лукас)","name_en":"Patron (Lukas)","weight_grams":12},{"name_uk":"Трюфель (Августіно)","name_en":"Truffle (Augustino)","weight_grams":24},{"name_uk":"Золота лілія (Конті)","name_en":"Golden Lily (Konti)","weight_grams":24}]'::jsonb,
  140,
  ARRAY['Budget-friendly', 'Bulk']::text[],
  ARRAY['chocolate', 'praline', 'candy']::text[],
  '2024-01-01T00:00:00Z'
);

INSERT INTO public.products (
  id, title_uk, title_en, desc_uk, desc_en, images, packaging_type,
  composition, weight_grams, b2b_tags, sweet_types, created_at
) VALUES (
  'set-4-6',
  'Набір 4/6 — «Пірамідка»',
  'Set 4/6 — Pyramid Box',
  'Святкова картонна пірамідка з асорті цукерок Roshen. Елегантна форма та впізнавані смаки.',
  'Festive cardboard pyramid with Roshen candy assortment. Elegant shape and familiar flavors.',
  ARRAY['/catalog/cutouts/set-4-6-packaging.png?v=20260625', '/catalog/sets/set-4-6-packaging.jpg?v=20260625', '/catalog/sets/set-4-6-contents.jpg?v=20260625']::text[],
  'cardboard',
  '[{"name_uk":"Монблан (Рошен)","name_en":"Mont Blanc (Roshen)","weight_grams":50},{"name_uk":"Ромашка (Рошен)","name_en":"Romashka (Roshen)","weight_grams":20},{"name_uk":"CHOCO ZOO (Рошен)","name_en":"CHOCO ZOO (Roshen)","weight_grams":10},{"name_uk":"Шалена бджілка (Рошен)","name_en":"Crazy Bee (Roshen)","weight_grams":20}]'::jsonb,
  260,
  ARRAY['Premium', 'VIP']::text[],
  ARRAY['chocolate', 'praline', 'caramel']::text[],
  '2024-01-02T00:00:00Z'
);

INSERT INTO public.products (
  id, title_uk, title_en, desc_uk, desc_en, images, packaging_type,
  composition, weight_grams, b2b_tags, sweet_types, created_at
) VALUES (
  'set-5-7',
  'Набір 5/7а — «Ліхтарик жовто-блакитний»',
  'Set 5/7а — Yellow-Blue Lantern',
  'Картонний ліхтарик у кольорах прапора України. 23 цукерки від Лукас, Домінік, Августіно та ін.',
  'Cardboard lantern in Ukrainian flag colors. 23 candies from Lukas, Dominik, Augustino and more.',
  ARRAY['/catalog/cutouts/set-5-7-packaging.png?v=20260625', '/catalog/sets/set-5-7-packaging.jpg?v=20260625', '/catalog/sets/set-5-7-contents.jpg?v=20260625']::text[],
  'cardboard',
  '[{"name_uk":"Патрон (Лукас)","name_en":"Patron (Lukas)","weight_grams":24},{"name_uk":"Птахи Проти Орків (Лукас)","name_en":"Birds Against Orcs (Lukas)","weight_grams":24},{"name_uk":"Трюфель (Августіно)","name_en":"Truffle (Augustino)","weight_grams":24},{"name_uk":"Оленка 50г (Домінік)","name_en":"Olenka 50g (Dominik)","weight_grams":50}]'::jsonb,
  375,
  ARRAY['Best for IT', 'Bulk']::text[],
  ARRAY['chocolate', 'praline', 'caramel', 'jelly']::text[],
  '2024-01-03T00:00:00Z'
);

INSERT INTO public.products (
  id, title_uk, title_en, desc_uk, desc_en, images, packaging_type,
  composition, weight_grams, b2b_tags, sweet_types, created_at
) VALUES (
  'set-7-8a',
  'Набір 7/8а — «Дракон 2024»',
  'Set 7/8а — Dragon 2024',
  'Яскравий картонний набір «Дракон» з 41 цукеркою. AVK, Лукас, Конті, Nestle, Рошен.',
  'Vibrant cardboard Dragon set with 41 candies. AVK, Lukas, Konti, Nestle, Roshen.',
  ARRAY['/catalog/cutouts/set-7-8a-packaging.png?v=20260625', '/catalog/sets/set-7-8a-packaging.jpg?v=20260625', '/catalog/sets/set-7-8a-contents.jpg?v=20260625']::text[],
  'cardboard',
  '[{"name_uk":"Шарм (АВК)","name_en":"Charm (AVK)","weight_grams":36},{"name_uk":"BiFesti (Лукас)","name_en":"BiFesti (Lukas)","weight_grams":24},{"name_uk":"Lion 42г (Nestle)","name_en":"Lion 42g (Nestle)","weight_grams":42},{"name_uk":"Yogurtini (Рошен)","name_en":"Yogurtini (Roshen)","weight_grams":24}]'::jsonb,
  495,
  ARRAY['Best for IT', 'Bulk']::text[],
  ARRAY['chocolate', 'praline', 'candy', 'caramel']::text[],
  '2024-01-04T00:00:00Z'
);

INSERT INTO public.products (
  id, title_uk, title_en, desc_uk, desc_en, images, packaging_type,
  composition, weight_grams, b2b_tags, sweet_types, created_at
) VALUES (
  'set-8-21',
  'Набір 8/21 — «Ліхтарик з орнаментом»',
  'Set 8/21 — Ornament Lantern',
  'Картонний ліхтарик з вишиванкою та оленями. 25 цукерок преміум-брендів.',
  'Cardboard lantern with vyshyvanka pattern and reindeer. 25 premium branded candies.',
  ARRAY['/catalog/cutouts/set-8-21-packaging.png?v=20260625', '/catalog/sets/set-8-21-packaging.jpg?v=20260625', '/catalog/sets/set-8-21-contents.jpg?v=20260625']::text[],
  'cardboard',
  '[{"name_uk":"Молочний шоколад 90г (АВК)","name_en":"Milk Chocolate 90g (AVK)","weight_grams":90},{"name_uk":"Трюфель (АВК)","name_en":"Truffle (AVK)","weight_grams":24},{"name_uk":"Україна — це ми (Гольскі)","name_en":"Ukraine is Us (Golski)","weight_grams":24}]'::jsonb,
  510,
  ARRAY['Premium']::text[],
  ARRAY['chocolate', 'praline']::text[],
  '2024-01-05T00:00:00Z'
);

INSERT INTO public.products (
  id, title_uk, title_en, desc_uk, desc_en, images, packaging_type,
  composition, weight_grams, b2b_tags, sweet_types, created_at
) VALUES (
  'set-9-20',
  'Набір 9/20 — «Ліхтарик України»',
  'Set 9/20 — Ukraine Lantern',
  'Патріотичний картонний ліхтарик з 40 цукерками. Патрон, Рошен, Конті, Лукас.',
  'Patriotic cardboard lantern with 40 candies. Patron, Roshen, Konti, Lukas.',
  ARRAY['/catalog/cutouts/set-9-20-packaging.png?v=20260625', '/catalog/sets/set-9-20-packaging.jpg?v=20260625', '/catalog/sets/set-9-20-contents.jpg?v=20260625']::text[],
  'cardboard',
  '[{"name_uk":"Патрон 33г (Лукас)","name_en":"Patron 33g (Lukas)","weight_grams":33},{"name_uk":"Шоколапки (Рошен)","name_en":"Shokolapky (Roshen)","weight_grams":30},{"name_uk":"Золота лілія (Конті)","name_en":"Golden Lily (Konti)","weight_grams":24}]'::jsonb,
  550,
  ARRAY['Best for IT', 'Bulk']::text[],
  ARRAY['chocolate', 'praline', 'candy']::text[],
  '2024-01-06T00:00:00Z'
);

INSERT INTO public.products (
  id, title_uk, title_en, desc_uk, desc_en, images, packaging_type,
  composition, weight_grams, b2b_tags, sweet_types, created_at
) VALUES (
  'set-11-65',
  'Набір 11/65 — Zip-пакет',
  'Set 11/65 — Zip Bag',
  'Універсальний zip-пакет з 40 цукерками від AVK, Лукас, Конті, Тольскі. Оптимальний для масових замовлень.',
  'Universal zip bag with 40 candies from AVK, Lukas, Konti, Tolski. Optimal for bulk orders.',
  ARRAY['/catalog/cutouts/set-11-65-packaging.png?v=20260625', '/catalog/sets/set-11-65-packaging.jpg?v=20260625', '/catalog/sets/set-11-65-contents.jpg?v=20260625']::text[],
  'tube',
  '[{"name_uk":"Трюфелі бельгійські (АВК)","name_en":"Belgian truffles (AVK)","weight_grams":40},{"name_uk":"Праліне з фундуком (АВК)","name_en":"Hazelnut pralines (AVK)","weight_grams":30},{"name_uk":"Халва ванільна 60г (ЗВ)","name_en":"Vanilla halva 60g (ZV)","weight_grams":60}]'::jsonb,
  615,
  ARRAY['Bulk', 'Budget-friendly']::text[],
  ARRAY['chocolate', 'praline', 'marzipan', 'caramel']::text[],
  '2024-01-07T00:00:00Z'
);

INSERT INTO public.products (
  id, title_uk, title_en, desc_uk, desc_en, images, packaging_type,
  composition, weight_grams, b2b_tags, sweet_types, created_at
) VALUES (
  'set-12-2',
  'Набір 12/2 — Фольгований пакет «Дракон»',
  'Set 12/2 — Dragon Foil Bag',
  'Фольгований пакет 20×30 см з 48 цукерками. Світоч, АВК, Лукас, Домінік, Mars.',
  'Foil bag 20×30 cm with 48 candies. Svitoch, AVK, Lukas, Dominik, Mars.',
  ARRAY['/catalog/cutouts/set-12-2-packaging.png?v=20260625', '/catalog/sets/set-12-2-packaging.jpg?v=20260625', '/catalog/sets/set-12-2-contents.jpg?v=20260625']::text[],
  'tube',
  '[{"name_uk":"Трюфель (Світоч)","name_en":"Truffle (Svitoch)","weight_grams":24},{"name_uk":"Шарм (АВК)","name_en":"Charm (AVK)","weight_grams":24},{"name_uk":"Снікерс 50г (Mars)","name_en":"Snickers 50g (Mars)","weight_grams":50}]'::jsonb,
  700,
  ARRAY['Bulk', 'Best for IT']::text[],
  ARRAY['chocolate', 'praline', 'candy']::text[],
  '2024-01-08T00:00:00Z'
);

INSERT INTO public.products (
  id, title_uk, title_en, desc_uk, desc_en, images, packaging_type,
  composition, weight_grams, b2b_tags, sweet_types, created_at
) VALUES (
  'set-16-26',
  'Набір 16/26 — «Різдвяна коробка»',
  'Set 16/26 — Christmas Box',
  'Преміальна різдвяна коробка з мотузковою ручкою. 55 цукерок, 840 г — для VIP-клієнтів.',
  'Premium Christmas box with rope handle. 55 candies, 840g — for VIP clients.',
  ARRAY['/catalog/cutouts/set-16-26-packaging.png?v=20260625', '/catalog/sets/set-16-26-packaging.jpg?v=20260625', '/catalog/sets/set-16-26-contents.jpg?v=20260625']::text[],
  'cardboard',
  '[{"name_uk":"Оксамит ночі (АВК)","name_en":"Velvet Night (AVK)","weight_grams":24},{"name_uk":"Снікерс / Твікс (Mars)","name_en":"Snickers / Twix (Mars)","weight_grams":100},{"name_uk":"CHOCO ZOO (Рошен)","name_en":"CHOCO ZOO (Roshen)","weight_grams":24}]'::jsonb,
  840,
  ARRAY['VIP', 'Premium']::text[],
  ARRAY['chocolate', 'praline', 'candy', 'caramel']::text[],
  '2024-01-09T00:00:00Z'
);

INSERT INTO public.products (
  id, title_uk, title_en, desc_uk, desc_en, images, packaging_type,
  composition, weight_grams, b2b_tags, sweet_types, created_at
) VALUES (
  'set-17-17',
  'Набір 17/17 — Коробка з віконцем',
  'Set 17/17 — Window Box',
  'Картонна коробка з прозорим віконцем. 69 цукерок Roshen — максимальне різноманіття смаків.',
  'Cardboard box with transparent window. 69 Roshen candies — maximum flavor variety.',
  ARRAY['/catalog/cutouts/set-17-17-packaging.png?v=20260625', '/catalog/sets/set-17-17-packaging.jpg?v=20260625', '/catalog/sets/set-17-17-contents.jpg?v=20260625']::text[],
  'cardboard',
  '[{"name_uk":"Монблан (Рошен)","name_en":"Mont Blanc (Roshen)","weight_grams":50},{"name_uk":"Johnny Krocker (Рошен)","name_en":"Johnny Krocker (Roshen)","weight_grams":40},{"name_uk":"Candy Nut (Рошен)","name_en":"Candy Nut (Roshen)","weight_grams":40}]'::jsonb,
  870,
  ARRAY['VIP', 'Premium', 'Finance']::text[],
  ARRAY['chocolate', 'praline', 'caramel', 'jelly']::text[],
  '2024-01-10T00:00:00Z'
);

INSERT INTO public.products (
  id, title_uk, title_en, desc_uk, desc_en, images, packaging_type,
  composition, weight_grams, b2b_tags, sweet_types, created_at
) VALUES (
  'set-20-35',
  'Набір 20/35 — «Скринька зелено-червона»',
  'Set 20/35 — Green-Red Chest',
  'Найбільший набір каталогу — 1,165 г, 59 цукерок у святковій скриньці. Mars, Nestle, AVK, Рошен.',
  'Largest catalog set — 1,165g, 59 candies in a festive chest. Mars, Nestle, AVK, Roshen.',
  ARRAY['/catalog/cutouts/set-20-35-packaging.png?v=20260625', '/catalog/sets/set-20-35-packaging.jpg?v=20260625', '/catalog/sets/set-20-35-contents.jpg?v=20260625']::text[],
  'wood',
  '[{"name_uk":"MilkyWay / Snickers mini (Mars)","name_en":"MilkyWay / Snickers mini (Mars)","weight_grams":60},{"name_uk":"Монблан (Рошен)","name_en":"Mont Blanc (Roshen)","weight_grams":100},{"name_uk":"Шоколад 90г (АВК)","name_en":"Chocolate 90g (AVK)","weight_grams":90}]'::jsonb,
  1165,
  ARRAY['VIP', 'Premium', 'Partners']::text[],
  ARRAY['chocolate', 'praline', 'truffle', 'caramel']::text[],
  '2024-01-11T00:00:00Z'
);

INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-3-45-t1',
  'set-3-45',
  1,
  390
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-3-45-t2',
  'set-3-45',
  51,
  351
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-3-45-t3',
  'set-3-45',
  201,
  320
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-4-6-t1',
  'set-4-6',
  1,
  390
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-4-6-t2',
  'set-4-6',
  51,
  351
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-4-6-t3',
  'set-4-6',
  201,
  320
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-5-7-t1',
  'set-5-7',
  1,
  590
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-5-7-t2',
  'set-5-7',
  51,
  531
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-5-7-t3',
  'set-5-7',
  201,
  484
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-7-8a-t1',
  'set-7-8a',
  1,
  590
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-7-8a-t2',
  'set-7-8a',
  51,
  531
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-7-8a-t3',
  'set-7-8a',
  201,
  484
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-8-21-t1',
  'set-8-21',
  1,
  790
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-8-21-t2',
  'set-8-21',
  51,
  711
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-8-21-t3',
  'set-8-21',
  201,
  648
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-9-20-t1',
  'set-9-20',
  1,
  790
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-9-20-t2',
  'set-9-20',
  51,
  711
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-9-20-t3',
  'set-9-20',
  201,
  648
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-11-65-t1',
  'set-11-65',
  1,
  790
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-11-65-t2',
  'set-11-65',
  51,
  711
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-11-65-t3',
  'set-11-65',
  201,
  648
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-12-2-t1',
  'set-12-2',
  1,
  1190
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-12-2-t2',
  'set-12-2',
  51,
  1071
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-12-2-t3',
  'set-12-2',
  201,
  976
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-16-26-t1',
  'set-16-26',
  1,
  1190
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-16-26-t2',
  'set-16-26',
  51,
  1071
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-16-26-t3',
  'set-16-26',
  201,
  976
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-17-17-t1',
  'set-17-17',
  1,
  1190
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-17-17-t2',
  'set-17-17',
  51,
  1071
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-17-17-t3',
  'set-17-17',
  201,
  976
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-20-35-t1',
  'set-20-35',
  1,
  1890
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-20-35-t2',
  'set-20-35',
  51,
  1701
);
INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  'set-20-35-t3',
  'set-20-35',
  201,
  1550
);
