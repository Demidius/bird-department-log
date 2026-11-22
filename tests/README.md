# Браузерные тесты

Проверяют приложение в Chromium через Playwright с поддельным Supabase (`mock_supabase.js`) и стартовым справочником видов (`seed_species.json`). Настоящая база не трогается, сеть не нужна (шрифты и Commons блокируются).

Запуск из корня репозитория:

```
pip install playwright && python -m playwright install chromium
python tests/test_v2.py /tmp/shots        # аргумент — папка для скриншотов
for t in tests/test_*.py; do python "$t" /tmp/shots || echo "FAIL $t"; done
```

Если Chromium из Playwright недоступен, укажи свой браузер: `CHROME=/usr/bin/google-chrome`.

- `test_encl.py` — общая настройка (`page()`, `add_encl()`, `add_bird()`, `esc_close()`) и сценарий вольеров/коллекции; остальные тесты берут из него настройку.
- `test_cal2.py` — календарь (список и сетка); `test_calday.py` — клик по дню календаря; `test_confirm.py` — вопрос «отменить изменения?»; `test_lang2.py` — языки; `test_lock.py` — замки и фото вида; `test_names.py` — альтернативные имена; `test_splash.py` — шторка загрузки и кнопка «назад»; `test_v2.py` — журнал изменений, версия, переводы описаний; `test_guess.py` — предположительные события (выклев, выход из гнезда, оплодотворение) и событие «Роды»; `test_group.py` — необязательное имя и группы животных; `test_kids.py` — список животных в записи, карточка потомства, родители; `test_time.py` — запись без времени; `test_pick.py` — список с поиском; `test_gaps.py` — пропущенные данные; `test_photo_fit.py` — вертикальное фото вида целиком.

Тесты печатают проверяемые значения и сохраняют скриншоты; падение = ошибка Playwright (элемент не найден и т. п.). Смотри скриншоты глазами, особенно на ширинах 390 и 1280+.
Пиши новые тесты по образцу: `exec(... test_encl.py ...)`, затем свой сценарий.

Строка `ERRORS: ['An unknown error occurred when fetching the script.']` — это service worker, которому в тестовом окружении не отдаётся `sw.js`; это не ошибка приложения.
