alter table if exists public.quote_requests
  add column if not exists status text not null default 'new';

