-- Animal age at arrival: stage (chick/young/adult/old) or age as a number of months, with the assessment date.
alter table public.collection add column if not exists age_class text check (age_class in ('chick', 'young', 'adult', 'old', 'num'));
alter table public.collection add column if not exists age_n integer check (age_n between 0 and 2400);
alter table public.collection add column if not exists age_at date;
comment on column public.collection.age_class is 'approximate age at age_at: chick | young | adult | old, or num = age_n months';
comment on column public.collection.age_n is 'age in months at age_at (when age_class = num)';
comment on column public.collection.age_at is 'date the approximate age was assessed (arrival date)';

-- Species: sexual maturity in years (info.mature_years) accepted by app.ai_species (patched in place, idempotent).
do $$ declare d text; begin
  select pg_get_functiondef('app._ai_species(jsonb)'::regprocedure) into d;
  if position('mature_years' in d) = 0 then
    d := replace(d, $q$elsif k in ('cites','syn','incub_range') then$q$, $q$elsif k = 'mature_years' then
          if jsonb_typeof(v) <> 'number' or (v #>> '{}')::numeric not between 0.1 and 100 then raise exception 'mature_years: number of years 0.1–100'; end if;
          patch := patch || jsonb_build_object(k, v);
        elsif k in ('cites','syn','incub_range') then$q$);
    execute d;
  end if;
end $$;
