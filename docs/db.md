# База данных: смысл полей, замки, журнал

Структура таблиц, триггеры и права — `supabase/SCHEMA.md`. Здесь — то, что нужно знать при изменениях.

## Изменение схемы
1. Файл `supabase/migrations/ГГГГММДД_кратко.sql` (идемпотентно: `if not exists`, `create or replace`).
2. Применить: MCP `apply_migration` (проект `nszeqgopzonpplfznaat`).
3. Обновить `supabase/SCHEMA.md`; если меняются форматы заполнения — `docs/data.md` и функции `app.ai_*`.
4. Новые функции для агентов: `security invoker`, `set search_path = ''`, `revoke all … from public, anon, authenticated`.

## Безопасность (жёстко)
- Не запрашивать, не хранить, не выводить `service_role` ключ. В клиенте только publishable key (`SB_KEY`, `js/core.js`).
- Роль `admin` — только кнопкой «claim first admin» (`rpc('claim_first_admin')`), никогда через SQL.
- Аккаунты — только Edge Function `admin-users` (`supabase/functions/admin-users/index.ts`).
- RLS не ослаблять. Роли: `admin`, `staff` (пишет), `viewer` (читает).

## Карточка вида `species.info`
- Переводимые поля (`TRK`): `size life order family range habitat diet_wild behaviour breeding diet_zoo husbandry health sex`.
  Формат: `{"ru","pl","en","src":"pl","auto":[…],"fix":[…]}` — `src` язык-источник, `auto` машинные переводы, `fix` машинные, исправленные человеком (не перезаписывать). Простая строка = старый формат, русский текст.
- Автоперевод — на клиенте через MyMemory (`translateDirty`, `stashTr`, `fillTr`, `trPick`, `trNote` в `js/data.js`, `js/locks.js`).
- Прочее: `incub_days`, `fledge_days` (от выклева до выхода из гнезда), `gest_days` (беременность), `incub_range` (строка), `iucn`, `cites`, `group` (`bird`|`mammal`), `syn`, `photo` `{src,thumb,page,credit}`, `main` (id главного фото или `wiki`), `locked`.
- `mature_years` — половая зрелость, лет (число): граница «молодой → взрослый» в стадиях возраста (ux3.js).
- Сроки дают «предположительные события» в календаре (считаются на лету, в базу не пишутся).

## Замки
- Вид: `species.info.locked` — массив (`latin`, `name_ru`, `name_pl`, `name_en`, `note`, ключи `info`), `'*'` = вся карточка.
- Животные и места: колонка `locked` (ключи = имена колонок, `grp`, `parents`; `BIRD_LOCK`, `ENCL_LOCK` в коде).
- Триггеры `app.species_locks`, `app.row_locks`: всё, кроме админа с сайта, не может менять закрытые поля и сами замки. Записи агента (без `auth.uid()`) замки соблюдают автоматически.
- Ручной SQL от агента (только по просьбе владельца) — шаблон:
  ```sql
  update public.species s set info = coalesce(s.info,'{}') || (patch - array(select jsonb_array_elements_text(coalesce(s.info->'locked','[]'))))
  where … and not coalesce(s.info->'locked','[]') ? '*';
  ```
- Замки должны быть везде, где пользователь вводит важные данные (требование владельца).

## Журнал изменений `change_log`
- Пишется триггером `app.log_change`. `kind`: `user` — человек, `ai` — запись без `auth.uid()` (агент), `dev` — новая версия приложения.
- После заметного изменения кода: `select app.ai_dev('Кратко по-русски, понятно пользователю')` → вернёт номер версии (`v33` …). Версия в настройках = максимальный `ver`.
