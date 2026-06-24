## Admin Bootstrap

Use this SQL in Supabase SQL Editor to promote an existing user to admin by email.

```sql
update public.users
set role = 'admin'
where lower(email) = lower('admin@example.com');
```

Optional verification:

```sql
select id, email, role
from public.users
where lower(email) = lower('admin@example.com');
```

