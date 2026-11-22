# Проверка и публикация

## Тесты (перед каждой публикацией кода)
```
pip install playwright && python -m playwright install chromium   # или CHROME=/usr/bin/google-chrome
python3 tests/test_modules.py                                     # структура модулей, без браузера
for t in tests/test_*.py; do python3 "$t" /tmp/shots || echo "FAIL $t"; done
```
Подробности и список тестов — `tests/README.md`. Смотреть скриншоты: ширины 320–1440px и тёмная тема. Новая функция → новый тест по образцу.
Строка `ERRORS: ['An unknown error occurred when fetching the script.']` — service worker в тестах, не ошибка.

## Публикация
- Сайт: GitHub Pages, ветка `main`, корень репозитория → https://demidius.github.io/bird-department-log/
- `git -c push.negotiate=true push origin <ветка>:main`. Если 403 — GitHub API / MCP (`push_files`, или `create_or_update_file` с полным содержимым и актуальным `sha`).
- Связанные файлы (CSS + JS, `index.html` + новый модуль + `sw.js`) — **одним коммитом**, иначе на сайте полуготовое состояние.
- Проверить: `git fetch -q origin main && git diff --stat origin/main` (пусто = совпадает).
- MCP может превращать экранирования невидимых символов (`﻿`) в сами символы — функционально то же; после публикации синхронизируй локальную копию.
- После публикации: `select app.ai_dev('Кратко, по-русски, для пользователей')`.
- Телефон может до 10 минут показывать старый код (кэш GitHub Pages); service worker сверяется с сервером (`cache: 'no-cache'`). Меняя список файлов — поднимай `CACHE` в `sw.js`.

## Сеть песочницы
Wikipedia/Commons из shell недоступны — для имён файлов Commons и данных используй веб-поиск.
