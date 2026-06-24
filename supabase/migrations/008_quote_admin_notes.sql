alter table public.quote_requests
  add column if not exists admin_notes text;
