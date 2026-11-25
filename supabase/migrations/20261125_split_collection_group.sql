-- Update the group and insert the individual cards in one transaction.
create or replace function public.split_collection_group(
  p_id uuid, p_version timestamptz, p_counts jsonb
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  source public.collection%rowtype;
  individual public.collection%rowtype;
  remaining jsonb;
  cards jsonb := '[]';
  category text;
  requested integer;
  available integer;
  removed bigint := 0;
  left_in_group bigint := 0;
  next_status text;
  current_enclosure text;
  base_name text;
  label text;
  new_id uuid;
begin
  if auth.uid() is null or not app.can_write() then
    raise insufficient_privilege;
  end if;

  select * into source from public.collection where id = p_id for update;
  if not found or source.status <> 'active' or source.grp is null
      or source.updated_at is distinct from p_version then
    raise exception using errcode = '40001', message = 'Group has changed';
  end if;
  if source.grp->>'unk' = 'true' or jsonb_typeof(p_counts) is distinct from 'object'
      or (p_counts - array['m', 'f', 'u', 'j']) <> '{}'::jsonb then
    raise invalid_parameter_value;
  end if;

  remaining := source.grp;
  foreach category in array array['m', 'f', 'u', 'j'] loop
    if (p_counts ? category) and coalesce(p_counts->>category, '') !~ '^[0-9]+$' then
      raise invalid_parameter_value;
    end if;
    requested := coalesce((p_counts->>category)::integer, 0);
    available := coalesce((source.grp->>category)::integer, 0);
    if requested > available then
      raise invalid_parameter_value;
    end if;
    remaining := jsonb_set(remaining, array[category], to_jsonb(available - requested));
    removed := removed + requested;
    left_in_group := left_in_group + available - requested;
  end loop;
  if removed = 0 then
    raise invalid_parameter_value;
  end if;

  next_status := case when left_in_group = 0 then 'out' else 'active' end;
  update public.collection set grp = remaining, status = next_status where id = p_id returning * into source;
  -- Existing locks may restore the old values, and RLS may prevent the update.
  if not found or source.grp is distinct from remaining or source.status is distinct from next_status then
    raise insufficient_privilege;
  end if;

  select r.f->>'to' into current_enclosure
    from public.records r
    where (r.type = 'expo' or (r.type = 'obs' and r.f->>'k' = 'expo'))
      and lower(btrim(r.bird)) = lower(btrim(source.name))
      and coalesce(r.f->>'to', '') <> ''
      and r.event_at >= coalesce(source.encl_at, '1970-01-01'::timestamptz)
    order by r.event_at desc, r.id desc limit 1;

  select coalesce(nullif(s.name_pl, ''), nullif(s.name_ru, ''), nullif(s.name_en, ''), nullif(s.latin, ''))
    into base_name from public.species s where s.id = source.species_id;
  base_name := coalesce(base_name, source.name);

  foreach category in array array['m', 'f', 'u', 'j'] loop
    label := case category when 'm' then 'samiec' when 'f' then 'samica'
      when 'j' then 'młode' else 'płeć nieznana' end;
    for n in 1..coalesce((p_counts->>category)::integer, 0) loop
      new_id := gen_random_uuid();
      insert into public.collection (
        id, name, species_id, sex, encl, encl_at, born, arrived, origin, parents, age_class, age_n, age_at, created_by
      ) values (
        new_id, left(base_name, 90) || ' - ' || label || ' ' || left(new_id::text, 8),
        source.species_id, case when category in ('m', 'f') then category else '' end,
        coalesce(current_enclosure, source.encl), now(), source.born, source.arrived, source.origin, source.parents,
        case when category = 'j' then coalesce(source.age_class, 'young') else source.age_class end,
        source.age_n, source.age_at, auth.uid()
      ) returning * into individual;
      cards := cards || to_jsonb(individual);
    end loop;
  end loop;

  return jsonb_build_object('group', to_jsonb(source), 'individuals', cards);
end;
$$;

revoke all on function public.split_collection_group(uuid, timestamptz, jsonb) from public, anon, authenticated;
grant execute on function public.split_collection_group(uuid, timestamptz, jsonb) to authenticated;
