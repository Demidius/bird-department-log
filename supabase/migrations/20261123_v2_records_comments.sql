-- v2 (new phone interface): more record types, records about a place or the department, comments.
-- Idempotent. RLS is not loosened: comments follow the same rules as records.

-- 1. record types used by the new interface (the old site ignores unknown types)
alter table public.records drop constraint if exists records_type_check;
alter table public.records add constraint records_type_check check (type = any (array[
  'expo','obs','tstart','tdose','tend','lay','incub','hatch','fledge','birth',
  'injury','proc','watch','wend','score','mate','diet','env','enr','leave','arrive','dept']));

-- 2. a department record has no animal: bird may be empty only for type 'dept'
alter table public.records drop constraint if exists records_bird_check;
alter table public.records add constraint records_bird_check check (
  char_length(btrim(bird)) <= 120 and (char_length(btrim(bird)) >= 1 or type = 'dept'));

-- 3. records about a whole place keep the place name in bird and f.place: follow renames
create or replace function app.enclosure_sync()
 returns trigger language plpgsql security definer set search_path to ''
as $function$
begin
  if btrim(new.name) <> btrim(old.name) then
    update public.collection set encl = btrim(new.name)
     where lower(btrim(encl)) = lower(btrim(old.name));
    update public.records set f = f || jsonb_build_object('to', btrim(new.name))
     where type = 'expo' and lower(btrim(f->>'to')) = lower(btrim(old.name));
    update public.records set f = f || jsonb_build_object('from', btrim(new.name))
     where type = 'expo' and lower(btrim(f->>'from')) = lower(btrim(old.name));
    update public.records set f = f || jsonb_build_object('place', btrim(new.name)), bird = btrim(new.name)
     where f ? 'place' and lower(btrim(f->>'place')) = lower(btrim(old.name));
  end if;
  return new;
end $function$;

-- 4. comments on records (one level of replies)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.records(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists comments_record_idx on public.comments(record_id);
create index if not exists comments_parent_idx on public.comments(parent_id);
alter table public.comments enable row level security;
drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments for select using ((select app.can_read()));
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert
  with check ((select app.can_write()) and created_by = (select auth.uid()));
drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments for delete
  using ((select app.is_admin()) or ((select app.can_write()) and created_by = (select auth.uid())));
grant select, insert, delete on public.comments to authenticated;
