-- Staff passwords visible to the administrator (owner's request): a copy of the password set via the admin-users
-- Edge Function (create / change password). Only admins can read; only the Edge Function (service role) writes.
-- Passwords set before this table existed are unknown (auth keeps only a hash).
create table if not exists public.account_passwords (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  password text not null check (char_length(password) between 8 and 200),
  updated_at timestamptz not null default now()
);
alter table public.account_passwords enable row level security;
revoke all on public.account_passwords from anon, authenticated;
grant select on public.account_passwords to authenticated;
drop policy if exists account_passwords_admin_read on public.account_passwords;
create policy account_passwords_admin_read on public.account_passwords for select to authenticated using ((select app.is_admin()));
