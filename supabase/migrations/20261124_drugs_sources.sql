-- 1) Drug catalogue: table public.drugs (cards with dosage, route, use …), photos owner_type 'drug', realtime, log, locks.
-- 2) Species sources: app._ai_species accepts "sources": [{"t": title, "url": "https://…"}] (stored in species.info.sources;
--    texts reference them as "(1)", "(2)" — the number is the position in the list).
-- Idempotent.

create table if not exists public.drugs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 200),
  substance text not null default '' check (char_length(substance) <= 300),
  form smallint check (form between 0 and 7),
  conc text not null default '' check (char_length(conc) <= 200),
  routes jsonb not null default '[]'::jsonb check (jsonb_typeof(routes) = 'array' and pg_column_size(routes) <= 400),
  maker text not null default '' check (char_length(maker) <= 200),
  dose text not null default '' check (char_length(dose) <= 4000),
  use text not null default '' check (char_length(use) <= 4000),
  contra text not null default '' check (char_length(contra) <= 4000),
  storage text not null default '' check (char_length(storage) <= 2000),
  note text not null default '' check (char_length(note) <= 4000),
  locked jsonb not null default '[]'::jsonb check (jsonb_typeof(locked) = 'array'),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists drugs_name_key on public.drugs (lower(btrim(name)));
alter table public.drugs enable row level security;
-- the project does not grant table rights by default: like the other tables, signed-in users get them (RLS still decides)
grant select, insert, update, delete on public.drugs to authenticated;

do $p$ begin
  if not exists (select 1 from pg_policy where polrelid = 'public.drugs'::regclass and polname = 'drugs_read') then
    create policy drugs_read on public.drugs for select using ((select app.can_read()));
    create policy drugs_insert on public.drugs for insert with check ((select app.can_write()) and created_by = (select auth.uid()));
    create policy drugs_update on public.drugs for update using ((select app.can_write())) with check ((select app.can_write()));
    create policy drugs_delete on public.drugs for delete using ((select app.is_admin()));
  end if;
end $p$;

drop trigger if exists drugs_touch on public.drugs;
create trigger drugs_touch before update on public.drugs for each row execute function app.touch();
drop trigger if exists drugs_locks on public.drugs;
create trigger drugs_locks before update on public.drugs for each row execute function app.row_locks();
drop trigger if exists drugs_log on public.drugs;
create trigger drugs_log after insert or delete or update on public.drugs for each row execute function app.log_change();
drop trigger if exists drugs_drop_photos on public.drugs;
create trigger drugs_drop_photos after delete on public.drugs for each row execute function app.drop_owner_photos();

-- photos of a drug
alter table public.photos drop constraint if exists photos_owner_type_check;
alter table public.photos add constraint photos_owner_type_check check (owner_type = any (array['record','bird','species','encl','drug']));
create or replace function app.drop_owner_photos() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.photos p
   where p.owner_id = old.id
     and p.owner_type = case tg_table_name when 'records' then 'record' when 'collection' then 'bird' when 'enclosures' then 'encl' when 'drugs' then 'drug' else 'species' end;
  return old;
end $$;

do $r$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'drugs') then
    alter publication supabase_realtime add table public.drugs;
  end if;
end $r$;

-- species sources in app._ai_species
do $mig$
declare
  src text := pg_get_functiondef('app._ai_species'::regproc);
  old text := $o$        elsif k = 'photo' then patch := patch || jsonb_build_object('photo', app._ai_photo(v));$o$;
  new text := $n$        elsif k = 'photo' then patch := patch || jsonb_build_object('photo', app._ai_photo(v));
        elsif k = 'sources' then
          if jsonb_typeof(v) <> 'array' or jsonb_array_length(v) = 0 or jsonb_array_length(v) > 30 or exists (select 1 from jsonb_array_elements(v) x where
               jsonb_typeof(x) <> 'object' or exists (select 1 from jsonb_object_keys(x) q where q not in ('t','url'))
            or jsonb_typeof(x->'t') is distinct from 'string' or char_length(btrim(x->>'t')) not between 1 and 300
            or (x ? 'url' and (jsonb_typeof(x->'url') <> 'string' or x->>'url' !~ '^https?://[^\s]+$' or char_length(x->>'url') > 600)))
            then raise exception 'sources: [{"t": "title (1–300)", "url": "https://…"}], 1–30 items'; end if;
          patch := patch || jsonb_build_object('sources', v);$n$;
begin
  if position('''sources''' in src) > 0 then return; end if;
  if position(old in src) = 0 then raise exception 'photo branch of app._ai_species not found'; end if;
  execute replace(src, old, new);
end $mig$;
