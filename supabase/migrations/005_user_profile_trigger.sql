create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role, company_name)
  values (
    new.id,
    new.email,
    'client',
    nullif(trim(new.raw_user_meta_data ->> 'company_name'), '')
  );
  return new;
end;
$$ language plpgsql security definer;
