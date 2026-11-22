-- AI data tools (Nov 2026)
-- 1) fixes: "birth" record type, unique Latin names of species
-- 2) app.ai_species / app.ai_enclosures / app.ai_collection: fill data from a JSON list in one call
--    * all or nothing: any error -> nothing is saved, the report lists every error
--    * existing rows (same latin / same name) only get EMPTY fields filled; "replace": true overwrites
--    * locked fields are never changed (also enforced by triggers app.species_locks / app.row_locks)
--    * dry = true: check and report, save nothing
-- 3) app.ai_ls(what) — compact list of what exists; app.ai_dev(summary) — app version note
-- Run only as the database owner (SQL through the Supabase MCP); not callable from the site.

alter table public.records drop constraint if exists records_type_check;
alter table public.records add constraint records_type_check
  check (type = any (array['expo','obs','tstart','tdose','tend','lay','incub','hatch','fledge','birth']));

create unique index if not exists species_latin_uniq on public.species (lower(btrim(latin))) where btrim(latin) <> '';

-- empty value: null, "", {}, [] or a translated text with no language filled
create or replace function app._ai_empty(v jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select v is null or v = 'null'::jsonb or v = '""'::jsonb or v = '{}'::jsonb or v = '[]'::jsonb
    or (jsonb_typeof(v) = 'string' and btrim(v #>> '{}') = '')
    or (jsonb_typeof(v) = 'object' and (v ? 'ru' or v ? 'pl' or v ? 'en')
        and btrim(coalesce(v->>'pl','') || coalesce(v->>'en','') || coalesce(v->>'ru','')) = '')
$$;

-- translated text: "text" (Polish) or {"pl","en","ru"} -> {"pl","en","ru","src"}
create or replace function app._ai_tr(v jsonb, k text) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare r jsonb := '{}'; l text; x jsonb;
begin
  if jsonb_typeof(v) = 'string' then v := jsonb_build_object('pl', v); end if;
  if jsonb_typeof(v) <> 'object' then raise exception '%: text or {"pl","en","ru"}', k; end if;
  for l, x in select * from jsonb_each(v) loop
    if l not in ('pl','en','ru') then raise exception '%: unknown language "%" (pl, en, ru)', k, l; end if;
    if jsonb_typeof(x) <> 'string' then raise exception '%.%: must be text', k, l; end if;
    if btrim(x #>> '{}') <> '' then r := r || jsonb_build_object(l, btrim(x #>> '{}')); end if;
  end loop;
  if r = '{}'::jsonb then raise exception '%: empty text', k; end if;
  return r || jsonb_build_object('src', case when r ? 'pl' then 'pl' when r ? 'en' then 'en' else 'ru' end);
end $$;

-- species photo: "File name.jpg" | {"file","credit"} | {"src","thumb","page","credit"}
create or replace function app._ai_photo(v jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare f text; c text;
begin
  if jsonb_typeof(v) = 'string' then v := jsonb_build_object('file', v); end if;
  if jsonb_typeof(v) <> 'object' then raise exception 'photo: file name or object'; end if;
  if v ? 'file' then
    f := replace(regexp_replace(btrim(v->>'file'), '^(File|Plik|Файл):', '', 'i'), ' ', '_');
    if f = '' then raise exception 'photo: empty file name'; end if;
    c := coalesce(nullif(btrim(v->>'credit'), ''), 'Wikimedia Commons');
    return jsonb_build_object(
      'src',   'https://commons.wikimedia.org/wiki/Special:FilePath/' || f || '?width=960',
      'thumb', 'https://commons.wikimedia.org/wiki/Special:FilePath/' || f || '?width=330',
      'page',  'https://commons.wikimedia.org/wiki/File:' || f,
      'credit', c);
  end if;
  if coalesce(v->>'src', '') !~ '^https://' then raise exception 'photo: "file" or https "src" required'; end if;
  return jsonb_strip_nulls(jsonb_build_object('src', v->>'src', 'thumb', coalesce(v->>'thumb', v->>'src'), 'page', v->>'page', 'credit', coalesce(v->>'credit', 'Wikimedia Commons')));
end $$;

-- names on other languages: {"pl":"…","en":"…"} -> [{"l":"pl","v":"…"}]
create or replace function app._ai_names(v jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare r jsonb := '[]'; l text; x jsonb;
begin
  if jsonb_typeof(v) <> 'object' then raise exception 'names: {"pl","en","ru"}'; end if;
  for l, x in select * from jsonb_each(v) loop
    if l not in ('pl','en','ru') then raise exception 'names: unknown language "%"', l; end if;
    if btrim(coalesce(x #>> '{}', '')) <> '' then r := r || jsonb_build_array(jsonb_build_object('l', l, 'v', btrim(x #>> '{}'))); end if;
  end loop;
  return r;
end $$;

-- runs one item list; raising 'ZZ001' rolls everything back and still returns the report
create or replace function app._ai_finish(rep jsonb, dry boolean) returns jsonb
language plpgsql set search_path = '' as $$
begin
  if dry or jsonb_array_length(rep->'errors') > 0 then
    raise exception using errcode = 'ZZ001', message = 'rollback', detail = rep::text;
  end if;
  return rep;
end $$;

create or replace function app._ai_rep(rep jsonb, part text, x jsonb) returns jsonb
language sql immutable set search_path = '' as $$ select jsonb_set(rep, array[part], (rep->part) || jsonb_build_array(x)) $$;

------------------------------------------------------------------------------------------------
-- species: [{"latin" (required), "pl","en","ru","note", info keys…, "replace": false}]
-- info keys: group (bird|mammal), iucn, cites, syn, incub_days, fledge_days, gest_days, incub_range,
--            photo, and texts size life order family range habitat diet_wild behaviour breeding diet_zoo husbandry health sex
create or replace function app._ai_species(items jsonb) returns jsonb
language plpgsql set search_path = '' as $$
declare
  rep jsonb := '{"added":[],"updated":[],"same":[],"errors":[]}';
  trk constant text[] := array['size','life','order','family','range','habitat','diet_wild','behaviour','breeding','diet_zoo','husbandry','health','sex'];
  col_map constant jsonb := '{"pl":"name_pl","en":"name_en","ru":"name_ru","note":"note"}';
  it jsonb; k text; v jsonb; s public.species; lat text; rp boolean; n int := 0;
  cols jsonb; patch jsonb; setc jsonb; seti jsonb; lk jsonb; kept text[]; lkd text[]; c text;
begin
  if jsonb_typeof(items) = 'object' then items := jsonb_build_array(items); end if;
  if jsonb_typeof(items) is distinct from 'array' then raise exception 'items: JSON array expected'; end if;
  for it in select * from jsonb_array_elements(items) loop
    n := n + 1; lat := btrim(coalesce(it->>'latin', ''));
    begin
      if lat = '' then raise exception 'latin is required'; end if;
      rp := coalesce((it->>'replace')::boolean, false); cols := '{}'; patch := '{}';
      for k, v in select * from jsonb_each(it - 'latin' - 'replace') loop
        if col_map ? k then
          if jsonb_typeof(v) <> 'string' then raise exception '%: must be text', k; end if;
          cols := cols || jsonb_build_object(col_map->>k, btrim(v #>> '{}'));
        elsif k = any(trk) then patch := patch || jsonb_build_object(k, app._ai_tr(v, k));
        elsif k in ('incub_days','fledge_days','gest_days') then
          if jsonb_typeof(v) <> 'number' or v::text !~ '^\d+$' or v::text::int not between 1 and 400 then
            raise exception '%: whole number of days 1–400', k; end if;
          patch := patch || jsonb_build_object(k, v);
        elsif k = 'iucn' then
          if coalesce(v #>> '{}', '') <> all(array['LC','NT','VU','EN','CR','EW','DD']) then raise exception 'iucn: LC NT VU EN CR EW DD'; end if;
          patch := patch || jsonb_build_object(k, v);
        elsif k = 'group' then
          if coalesce(v #>> '{}', '') not in ('bird','mammal') then raise exception 'group: bird or mammal'; end if;
          patch := patch || jsonb_build_object(k, v);
        elsif k in ('cites','syn','incub_range') then
          if jsonb_typeof(v) <> 'string' then raise exception '%: must be text', k; end if;
          patch := patch || jsonb_build_object(k, btrim(v #>> '{}'));
        elsif k = 'photo' then patch := patch || jsonb_build_object('photo', app._ai_photo(v));
        else raise exception 'unknown field "%"', k;
        end if;
      end loop;

      select * into s from public.species where lower(btrim(latin)) = lower(lat);
      if not found then
        insert into public.species (latin, name_pl, name_en, name_ru, note, info)
        values (lat, coalesce(cols->>'name_pl',''), coalesce(cols->>'name_en',''), coalesce(cols->>'name_ru',''), coalesce(cols->>'note',''),
                case when patch ? 'group' then patch else patch || '{"group":"bird"}' end);
        rep := app._ai_rep(rep, 'added', to_jsonb(lat));
      else
        lk := coalesce(s.info->'locked', '[]'); setc := '{}'; seti := '{}'; kept := '{}'; lkd := '{}';
        for c, v in select * from jsonb_each(cols) loop
          if to_jsonb(s)->c = v then continue; end if;
          if lk ? '*' or lk ? c then lkd := lkd || c;
          elsif rp or btrim(coalesce(to_jsonb(s)->>c, '')) = '' then setc := setc || jsonb_build_object(c, v);
          else kept := kept || c; end if;
        end loop;
        for k, v in select * from jsonb_each(patch) loop
          if s.info->k = v then continue; end if;
          if lk ? '*' or lk ? k then lkd := lkd || k;
          elsif rp or app._ai_empty(s.info->k) then seti := seti || jsonb_build_object(k, v);
          else kept := kept || k; end if;
        end loop;
        if setc = '{}'::jsonb and seti = '{}'::jsonb then
          rep := app._ai_rep(rep, 'same', jsonb_strip_nulls(jsonb_build_object('latin', lat,
                 'kept', case when kept <> '{}' then to_jsonb(kept) end, 'locked', case when lkd <> '{}' then to_jsonb(lkd) end)));
        else
          update public.species set
            name_pl = coalesce(setc->>'name_pl', name_pl), name_en = coalesce(setc->>'name_en', name_en),
            name_ru = coalesce(setc->>'name_ru', name_ru), note = coalesce(setc->>'note', note),
            info = coalesce(info, '{}') || seti
          where id = s.id;
          rep := app._ai_rep(rep, 'updated', jsonb_strip_nulls(jsonb_build_object('latin', lat,
                 'set', (select jsonb_agg(x) from (select jsonb_object_keys(setc) x union all select jsonb_object_keys(seti)) q),
                 'kept', case when kept <> '{}' then to_jsonb(kept) end, 'locked', case when lkd <> '{}' then to_jsonb(lkd) end)));
        end if;
      end if;
    exception when others then
      rep := app._ai_rep(rep, 'errors', jsonb_build_object('n', n, 'item', nullif(lat, ''), 'error', sqlerrm));
    end;
  end loop;
  return rep;
end $$;

------------------------------------------------------------------------------------------------
-- enclosures: [{"name" (required), "kind", "parent" (name), "area","size","capacity","note","active","names":{"pl","en","ru"}, "replace"}]
-- kind: building aviary enclosure cage incubator brooder room quarantine pond other
-- names are unique in the whole base (animals and transfers refer to places by name)
create or replace function app._ai_enclosures(items jsonb) returns jsonb
language plpgsql set search_path = '' as $$
declare
  rep jsonb := '{"added":[],"updated":[],"same":[],"errors":[]}';
  kinds constant text[] := array['building','aviary','enclosure','cage','incubator','brooder','room','quarantine','pond','other'];
  it jsonb; k text; v jsonb; e public.enclosures; nm text; rp boolean; n int := 0;
  pat jsonb; setv jsonb; lk jsonb; kept text[]; lkd text[]; pid uuid;
begin
  if jsonb_typeof(items) = 'object' then items := jsonb_build_array(items); end if;
  if jsonb_typeof(items) is distinct from 'array' then raise exception 'items: JSON array expected'; end if;
  for it in select * from jsonb_array_elements(items) loop
    n := n + 1; nm := btrim(coalesce(it->>'name', ''));
    begin
      if nm = '' then raise exception 'name is required'; end if;
      rp := coalesce((it->>'replace')::boolean, false); pat := '{}';
      for k, v in select * from jsonb_each(it - 'name' - 'replace') loop
        if k = 'kind' then
          if coalesce(v #>> '{}', '') <> all(kinds) then raise exception 'kind: %', array_to_string(kinds, ' '); end if;
          pat := pat || jsonb_build_object('kind', v);
        elsif k = 'parent' then
          select id into pid from public.enclosures where lower(btrim(name)) = lower(btrim(v #>> '{}'));
          if pid is null then raise exception 'parent "%" not found (add it earlier in the list)', v #>> '{}'; end if;
          pat := pat || jsonb_build_object('parent_id', pid);
        elsif k in ('area','size','note') then
          if jsonb_typeof(v) not in ('string','number') then raise exception '%: must be text', k; end if;
          pat := pat || jsonb_build_object(k, btrim(v #>> '{}'));
        elsif k = 'capacity' then
          if v::text !~ '^\d+$' or v::text::int not between 1 and 10000 then raise exception 'capacity: whole number 1–10000'; end if;
          pat := pat || jsonb_build_object(k, v);
        elsif k = 'active' then
          if jsonb_typeof(v) <> 'boolean' then raise exception 'active: true or false'; end if;
          pat := pat || jsonb_build_object(k, v);
        elsif k = 'names' then pat := pat || jsonb_build_object('names', app._ai_names(v));
        else raise exception 'unknown field "%"', k;
        end if;
      end loop;

      select * into e from public.enclosures where lower(btrim(name)) = lower(nm);
      if not found then
        insert into public.enclosures (name, kind, parent_id, area, size, capacity, note, active, names)
        values (nm, coalesce(pat->>'kind', 'enclosure'), (pat->>'parent_id')::uuid, coalesce(pat->>'area', ''), coalesce(pat->>'size', ''),
                (pat->>'capacity')::int, coalesce(pat->>'note', ''), coalesce((pat->>'active')::boolean, true), coalesce(pat->'names', '[]'));
        rep := app._ai_rep(rep, 'added', to_jsonb(nm));
      else
        lk := coalesce(e.locked, '[]'); setv := '{}'; kept := '{}'; lkd := '{}';
        for k, v in select * from jsonb_each(pat) loop
          if to_jsonb(e)->k = v then continue; end if;
          if lk ? '*' or lk ? k then lkd := lkd || k;
          elsif rp or app._ai_empty(to_jsonb(e)->k) or (k = 'kind' and e.kind = 'enclosure') then setv := setv || jsonb_build_object(k, v);
          else kept := kept || k; end if;
        end loop;
        if setv = '{}'::jsonb then
          rep := app._ai_rep(rep, 'same', jsonb_strip_nulls(jsonb_build_object('name', nm,
                 'kept', case when kept <> '{}' then to_jsonb(kept) end, 'locked', case when lkd <> '{}' then to_jsonb(lkd) end)));
        else
          update public.enclosures set
            kind = coalesce(setv->>'kind', kind), parent_id = case when setv ? 'parent_id' then (setv->>'parent_id')::uuid else parent_id end,
            area = coalesce(setv->>'area', area), size = coalesce(setv->>'size', size),
            capacity = case when setv ? 'capacity' then (setv->>'capacity')::int else capacity end,
            note = coalesce(setv->>'note', note), active = coalesce((setv->>'active')::boolean, active), names = coalesce(setv->'names', names)
          where id = e.id;
          rep := app._ai_rep(rep, 'updated', jsonb_strip_nulls(jsonb_build_object('name', nm,
                 'set', (select jsonb_agg(x) from jsonb_object_keys(setv) x),
                 'kept', case when kept <> '{}' then to_jsonb(kept) end, 'locked', case when lkd <> '{}' then to_jsonb(lkd) end)));
        end if;
      end if;
    exception when others then
      rep := app._ai_rep(rep, 'errors', jsonb_build_object('n', n, 'item', nullif(nm, ''), 'error', sqlerrm));
    end;
  end loop;
  return rep;
end $$;

------------------------------------------------------------------------------------------------
-- collection: [{"species" (latin, required), "name" (optional: made from the Polish species name like the app does),
--   "sex": "m"|"f"|"", "ring","chip","born","arrived" (YYYY-MM-DD),"origin","encl" (place name),"status": "active"|"out",
--   "note","grp": {"m","f","u","j"} (a group: no sex/ring/chip),"parents": [names],"names": {"pl","en","ru"}, "replace"}]
create or replace function app._ai_collection(items jsonb) returns jsonb
language plpgsql set search_path = '' as $$
declare
  rep jsonb := '{"added":[],"updated":[],"same":[],"errors":[]}';
  it jsonb; k text; v jsonb; b public.collection; sp public.species; nm text; base text; rp boolean; n int := 0; i int;
  pat jsonb; setv jsonb; lk jsonb; kept text[]; lkd text[]; pid uuid; ids jsonb; g jsonb;
begin
  if jsonb_typeof(items) = 'object' then items := jsonb_build_array(items); end if;
  if jsonb_typeof(items) is distinct from 'array' then raise exception 'items: JSON array expected'; end if;
  for it in select * from jsonb_array_elements(items) loop
    n := n + 1; nm := btrim(coalesce(it->>'name', ''));
    begin
      rp := coalesce((it->>'replace')::boolean, false); pat := '{}'; sp := null;
      for k, v in select * from jsonb_each(it - 'name' - 'replace') loop
        if k = 'species' then
          select * into sp from public.species where lower(btrim(latin)) = lower(btrim(v #>> '{}'));
          if not found then raise exception 'species "%" not found (add it with app.ai_species first)', v #>> '{}'; end if;
          pat := pat || jsonb_build_object('species_id', sp.id);
        elsif k = 'sex' then
          if coalesce(v #>> '{}', '') not in ('m','f','') then raise exception 'sex: "m", "f" or ""'; end if;
          pat := pat || jsonb_build_object(k, v);
        elsif k = 'status' then
          if coalesce(v #>> '{}', '') not in ('active','out') then raise exception 'status: active or out'; end if;
          pat := pat || jsonb_build_object(k, v);
        elsif k in ('born','arrived') then
          if coalesce(v #>> '{}', '') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception '%: YYYY-MM-DD', k; end if;
          perform (v #>> '{}')::date;
          pat := pat || jsonb_build_object(k, v);
        elsif k in ('ring','chip','origin','note') then
          if jsonb_typeof(v) not in ('string','number') then raise exception '%: must be text', k; end if;
          pat := pat || jsonb_build_object(k, btrim(v #>> '{}'));
        elsif k = 'encl' then
          select name into base from public.enclosures where lower(btrim(name)) = lower(btrim(v #>> '{}'));
          if base is null then raise exception 'place "%" not found (add it with app.ai_enclosures first)', v #>> '{}'; end if;
          pat := pat || jsonb_build_object('encl', base); base := null;
        elsif k = 'grp' then
          if jsonb_typeof(v) <> 'object' or exists (select 1 from jsonb_each(v) x where x.key not in ('m','f','u','j') or x.value::text !~ '^\d+$')
            then raise exception 'grp: {"m","f","u","j"} whole numbers'; end if;
          g := jsonb_build_object('m', coalesce((v->>'m')::int, 0), 'f', coalesce((v->>'f')::int, 0), 'u', coalesce((v->>'u')::int, 0), 'j', coalesce((v->>'j')::int, 0));
          if (g->>'m')::int + (g->>'f')::int + (g->>'u')::int + (g->>'j')::int = 0 then raise exception 'grp: total is 0'; end if;
          pat := pat || jsonb_build_object('grp', g);
        elsif k = 'parents' then
          if jsonb_typeof(v) <> 'array' then raise exception 'parents: list of names'; end if;
          ids := '[]';
          for i in 0 .. jsonb_array_length(v) - 1 loop
            select id into pid from public.collection where lower(btrim(name)) = lower(btrim(v->>i));
            if pid is null then raise exception 'parent "%" not found', v->>i; end if;
            ids := ids || to_jsonb(pid::text);
          end loop;
          pat := pat || jsonb_build_object('parents', ids);
        elsif k = 'names' then pat := pat || jsonb_build_object('names', app._ai_names(v));
        else raise exception 'unknown field "%"', k;
        end if;
      end loop;
      if pat ? 'grp' and (coalesce(pat->>'sex','') <> '' or coalesce(pat->>'ring','') <> '' or coalesce(pat->>'chip','') <> '') then
        raise exception 'a group has no sex, ring or chip'; end if;

      if nm <> '' then select * into b from public.collection where lower(btrim(name)) = lower(nm); end if;
      if nm = '' or not found then
        if sp.id is null then raise exception 'species is required for a new animal'; end if;
        if nm = '' then
          base := coalesce(nullif(sp.name_pl, ''), nullif(sp.name_en, ''), nullif(sp.name_ru, ''), sp.latin);
          nm := base || case when pat ? 'grp' then ' — grupa' when coalesce(pat->>'ring', '') <> '' then ' ' || (pat->>'ring') else '' end;
          i := 2;
          while exists (select 1 from public.collection where lower(btrim(name)) = lower(nm)) loop
            nm := base || case when pat ? 'grp' then ' — grupa' else '' end || ' ' || i; i := i + 1;
          end loop;
        end if;
        insert into public.collection (name, species_id, sex, ring, chip, born, arrived, origin, encl, encl_at, status, note, grp, parents, names)
        values (nm, sp.id, coalesce(pat->>'sex', ''), coalesce(pat->>'ring', ''), coalesce(pat->>'chip', ''), (pat->>'born')::date, (pat->>'arrived')::date,
                coalesce(pat->>'origin', ''), coalesce(pat->>'encl', ''), case when coalesce(pat->>'encl', '') <> '' then now() end,
                coalesce(pat->>'status', 'active'), coalesce(pat->>'note', ''), pat->'grp', coalesce(pat->'parents', '[]'), coalesce(pat->'names', '[]'));
        rep := app._ai_rep(rep, 'added', to_jsonb(nm));
      else
        lk := coalesce(b.locked, '[]'); setv := '{}'; kept := '{}'; lkd := '{}';
        for k, v in select * from jsonb_each(pat) loop
          if to_jsonb(b)->k = v then continue; end if;
          if lk ? '*' or lk ? k then lkd := lkd || k;
          elsif rp or app._ai_empty(to_jsonb(b)->k) then setv := setv || jsonb_build_object(k, v);
          else kept := kept || k; end if;
        end loop;
        if setv = '{}'::jsonb then
          rep := app._ai_rep(rep, 'same', jsonb_strip_nulls(jsonb_build_object('name', nm,
                 'kept', case when kept <> '{}' then to_jsonb(kept) end, 'locked', case when lkd <> '{}' then to_jsonb(lkd) end)));
        else
          update public.collection set
            species_id = coalesce((setv->>'species_id')::uuid, species_id), sex = coalesce(setv->>'sex', sex), ring = coalesce(setv->>'ring', ring),
            chip = coalesce(setv->>'chip', chip), born = coalesce((setv->>'born')::date, born), arrived = coalesce((setv->>'arrived')::date, arrived),
            origin = coalesce(setv->>'origin', origin), encl = coalesce(setv->>'encl', encl),
            encl_at = case when setv ? 'encl' then now() else encl_at end, status = coalesce(setv->>'status', status),
            note = coalesce(setv->>'note', note), grp = coalesce(setv->'grp', grp), parents = coalesce(setv->'parents', parents), names = coalesce(setv->'names', names)
          where id = b.id;
          rep := app._ai_rep(rep, 'updated', jsonb_strip_nulls(jsonb_build_object('name', nm,
                 'set', (select jsonb_agg(x) from jsonb_object_keys(setv) x),
                 'kept', case when kept <> '{}' then to_jsonb(kept) end, 'locked', case when lkd <> '{}' then to_jsonb(lkd) end)));
        end if;
      end if;
    exception when others then
      rep := app._ai_rep(rep, 'errors', jsonb_build_object('n', n, 'item', nullif(coalesce(nullif(nm, ''), it->>'species'), ''), 'error', sqlerrm));
    end;
  end loop;
  return rep;
end $$;

------------------------------------------------------------------------------------------------
-- public entry points: run, save all or nothing, return a report with "saved": true|false
create or replace function app.ai_species(items jsonb, dry boolean default false) returns jsonb
language plpgsql set search_path = '' as $$
declare r jsonb; d text;
begin
  begin r := app._ai_finish(app._ai_species(items), dry);
  exception when sqlstate 'ZZ001' then get stacked diagnostics d = pg_exception_detail; return d::jsonb || '{"saved":false}'; end;
  return r || '{"saved":true}';
end $$;

create or replace function app.ai_enclosures(items jsonb, dry boolean default false) returns jsonb
language plpgsql set search_path = '' as $$
declare r jsonb; d text;
begin
  begin r := app._ai_finish(app._ai_enclosures(items), dry);
  exception when sqlstate 'ZZ001' then get stacked diagnostics d = pg_exception_detail; return d::jsonb || '{"saved":false}'; end;
  return r || '{"saved":true}';
end $$;

create or replace function app.ai_collection(items jsonb, dry boolean default false) returns jsonb
language plpgsql set search_path = '' as $$
declare r jsonb; d text;
begin
  begin r := app._ai_finish(app._ai_collection(items), dry);
  exception when sqlstate 'ZZ001' then get stacked diagnostics d = pg_exception_detail; return d::jsonb || '{"saved":false}'; end;
  return r || '{"saved":true}';
end $$;

-- compact list of what is already there (one line per row): species | enclosures | collection | gaps
create or replace function app.ai_ls(what text default 'species') returns text
language sql stable set search_path = '' as $$
  select case lower(what)
    when 'species' then (select string_agg(concat_ws(' | ', latin, nullif(name_pl,''), nullif(name_en,''), nullif(name_ru,''), info->>'group'), E'\n' order by latin) from public.species)
    when 'enclosures' then (select string_agg(concat_ws(' | ', e.name, e.kind, 'in ' || p.name, case when not e.active then 'inactive' end), E'\n' order by coalesce(p.name, e.name), e.name)
                            from public.enclosures e left join public.enclosures p on p.id = e.parent_id)
    when 'collection' then (select string_agg(concat_ws(' | ', c.name, s.latin, nullif(c.encl,''), case when c.grp is not null then 'group' end, nullif(c.status,'active')), E'\n' order by c.name)
                            from public.collection c left join public.species s on s.id = c.species_id)
    when 'gaps' then (select string_agg(q.latin || ' — ' || q.miss, E'\n' order by q.latin) from (select s.latin, array_to_string(array(
                        select k from unnest(array['name_pl','name_en','name_ru','photo','iucn','order','family','size','range','habitat','diet_wild','behaviour','breeding','diet_zoo','husbandry','health','sex',
                                                   case when coalesce(s.info->>'group','bird') = 'bird' then 'incub_days' else 'gest_days' end,
                                                   case when coalesce(s.info->>'group','bird') = 'bird' then 'fledge_days' end]) k
                        where k is not null and case k when 'name_pl' then s.name_pl = '' when 'name_en' then s.name_en = '' when 'name_ru' then s.name_ru = ''
                                                       else app._ai_empty(s.info->k) end), ' ') miss
                      from public.species s) q where q.miss <> '')
    else 'what: species | enclosures | collection | gaps' end
$$;

-- a note about a new version of the app (shown in the change log; the version number grows by itself)
create or replace function app.ai_dev(summary text) returns text
language sql set search_path = '' as $$
  insert into public.change_log (kind, entity, action, summary) values ('dev', 'app', 'note', summary) returning 'v' || ver
$$;

-- only the database owner (agents through SQL) may run these
revoke all on function app._ai_empty(jsonb), app._ai_tr(jsonb, text), app._ai_photo(jsonb), app._ai_names(jsonb), app._ai_finish(jsonb, boolean),
  app._ai_rep(jsonb, text, jsonb), app._ai_species(jsonb), app._ai_enclosures(jsonb), app._ai_collection(jsonb),
  app.ai_species(jsonb, boolean), app.ai_enclosures(jsonb, boolean), app.ai_collection(jsonb, boolean), app.ai_ls(text), app.ai_dev(text)
  from public, anon, authenticated;
