-- Groups without an exact count: grp may carry "unk": true (count not known) and "about" (text, e.g. "~20", "10–15").
-- Patches only the grp branch of app._ai_collection; idempotent (does nothing if already patched).
do $mig$
declare
  src text := pg_get_functiondef('app._ai_collection'::regproc);
  old text := $o$          if jsonb_typeof(v) <> 'object' or exists (select 1 from jsonb_each(v) x where x.key not in ('m','f','u','j') or x.value::text !~ '^\d+$')
            then raise exception 'grp: {"m","f","u","j"} whole numbers'; end if;
          g := jsonb_build_object('m', coalesce((v->>'m')::int, 0), 'f', coalesce((v->>'f')::int, 0), 'u', coalesce((v->>'u')::int, 0), 'j', coalesce((v->>'j')::int, 0));
          if (g->>'m')::int + (g->>'f')::int + (g->>'u')::int + (g->>'j')::int = 0 then raise exception 'grp: total is 0'; end if;$o$;
  new text := $n$          if jsonb_typeof(v) <> 'object' or exists (select 1 from jsonb_each(v) x where not (
               (x.key in ('m','f','u','j') and x.value::text ~ '^\d+$')
            or (x.key = 'unk' and x.value = 'true'::jsonb)
            or (x.key = 'about' and jsonb_typeof(x.value) = 'string' and char_length(x.value #>> '{}') <= 40)))
            then raise exception 'grp: {"m","f","u","j"} whole numbers; "unk": true if the exact count is not known; "about": text up to 40 chars'; end if;
          g := jsonb_build_object('m', coalesce((v->>'m')::int, 0), 'f', coalesce((v->>'f')::int, 0), 'u', coalesce((v->>'u')::int, 0), 'j', coalesce((v->>'j')::int, 0));
          if v ? 'unk' then
            g := jsonb_build_object('m', 0, 'f', 0, 'u', 0, 'j', 0, 'unk', true) || case when coalesce(btrim(v->>'about'), '') <> '' then jsonb_build_object('about', btrim(v->>'about')) else '{}'::jsonb end;
          elsif (g->>'m')::int + (g->>'f')::int + (g->>'u')::int + (g->>'j')::int = 0 then raise exception 'grp: total is 0 (or "unk": true)'; end if;$n$;
begin
  if position('''unk''' in src) > 0 then return; end if;
  if position(old in src) = 0 then raise exception 'grp branch of app._ai_collection not found'; end if;
  execute replace(src, old, new);
end $mig$;
