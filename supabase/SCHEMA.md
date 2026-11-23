# Схема базы (снимок 2026-11-22)

Справка для доработок. Для заполнения данными не нужна — см. `docs/data.md`.
Если меняешь схему: миграция в `supabase/migrations/ГГГГММДД_имя.sql` (и применить через MCP `apply_migration`), затем обнови этот файл.
Тело любой функции: `select pg_get_functiondef('app.имя'::regproc);`

## Таблицы `public` (RLS везде включён)
```
profiles   (id → auth.users, login unique lower без пробелов, display_name, role admin|staff|viewer, active, created_at)
species    (id, name_ru, name_pl, name_en, latin, note, info jsonb object, created_by, created_at, updated_at)
           хоть одно из названий/латыни непустое; latin уникальна без учёта регистра (если непустая)
collection (id, name unique lower(btrim), species_id → species, sex ''|m|f, ring, chip, born date, arrived date, origin,
           encl text = ИМЯ места, encl_at, status active|out, note, names jsonb [{l,v}], locked jsonb [], grp jsonb {m,f,u,j}|null,
           parents jsonb [id карточек], created_by, created_at, updated_at)
enclosures (id, name unique lower(btrim) по всей базе, kind building|aviary|enclosure|cage|incubator|brooder|room|quarantine|pond|other,
           area, size, capacity 1..10000, active, note, parent_id → enclosures (без циклов, глубина ≤ 50), names [{l,v}], locked [], …)
records    (id, type expo|obs|tstart|tdose|tend|lay|incub|hatch|fledge|birth|injury|proc|watch|wend|score|mate|diet|env|enr|leave|arrive|dept,
           species_id, bird text = ИМЯ из collection (или имя места при f.place; пусто можно только у dept),
           event_at, f jsonb (expo: {from,to} = имена мест; nt:1 = без времени; v2 пишет новые виды как obs + f.k), note, created_by, …)
comments   (id, record_id → records on delete cascade, parent_id → comments (ответ), body 1–2000, created_by, created_at) — RLS как у records: читают все, пишут can_write, удаляет автор или admin
photos     (id, owner_type record|bird|species|encl, owner_id, path '<uid>/<uuid>.jpg', width, height, created_by, created_at)
change_log (id bigint, at, actor → profiles, kind user|ai|dev, entity, entity_id, action insert|update|delete|note, label, fields[], extra, summary ≤1000, ver)
```
Связи по **имени** (не по id): `collection.encl` → `enclosures.name`, `records.bird` → `collection.name`, `records.f.from/to` и `records.f.place` → `enclosures.name` (переименование места обновляет их триггером).
Переименование поддерживают триггеры `*_sync`. Поэтому имена мест и животных уникальны по всей базе.
Realtime (`supabase_realtime`): species, collection, enclosures, records, photos, profiles, change_log, comments — приложение слушает их и перечитывает изменённое.
Старые таблицы `birds`, `bird_events`, `department_members` (и политики bucket `bird-photos`) не используются.

## Триггеры (схема `app`)
| таблица | триггер | что делает |
|---|---|---|
| species, collection, enclosures, records, photos, profiles | `*_log` → `log_change` | пишет `change_log`; без `auth.uid()` → `kind='ai'` |
| change_log | `change_log_ver` (before insert) | у `dev` растёт `ver` = версия приложения |
| species | `species_locks` | поля из `info.locked` (`'*'` = всё) не меняются, если пишет не админ; не-админ не может менять сами замки |
| collection, enclosures | `*_locks` → `row_locks` | то же по колонке `locked` |
| collection | `collection_sync` | переименование/смена вида → обновляет `records.bird/species_id` |
| enclosures | `enclosures_sync` | переименование → `collection.encl`, `records.f.from/to`, `records.f.place` (+ `bird`) |
| enclosures | `enclosures_no_cycle` | запрет циклов вложенности |
| все с фото | `*_drop_photos` | удаляет фото владельца |
| все | `*_touch` | `updated_at` |

## Права
- Чтение: `app.can_read()`; запись: `app.can_write()` (staff, admin); удаление — админ (записи и фото — ещё и автор).
- Вставка требует `created_by = auth.uid()`.
- Storage bucket `journal-photos`: путь `<uid>/<uuid>(_t).jpg`.
- `public.claim_first_admin()` — единственный способ стать админом. `public.journal_has_admin()`.
- Аккаунты — Edge Function `admin-users` (копия кода: `supabase/functions/admin-users/index.ts`; разворачивать через MCP `deploy_edge_function`).

## Функции для агентов (только владелец БД, с сайта недоступны)
`app.ai_species`, `app.ai_enclosures`, `app.ai_collection`, `app.ai_ls`, `app.ai_dev` — см. `docs/data.md`, код в `supabase/migrations/20261122_ai_tools.sql`.
