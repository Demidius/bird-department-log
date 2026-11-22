// texts.js — extra interface texts (ru/pl/en) added to DICT
// Texts for enclosures and other housing places (Russian, Polish, English)
Object.assign(DICT.ru, {
  log_t: 'Журнал изменений', log_lead: 'Всё, что меняли на сайте, и изменения в самом приложении. Удалять записи может только администратор.',
  log_count: n => n + ' ' + pw(n, 'w_entry'), w_entry: ['запись', 'записи', 'записей'], log_empty: 'Изменений пока нет.',
  lg_all: 'Все', lg_user: 'На сайте', lg_dev: 'Разработка', lg_insert: 'Добавлено', lg_update: 'Изменено', lg_delete: 'Удалено', lg_dev_who: 'Разработка', lg_sys: 'Система',
  le_species: 'вид', le_collection: 'животное', le_records: 'запись', le_enclosures: 'место', le_photos: 'фото', le_profiles: 'сотрудник',
  lg_del: 'Удалить запись журнала', lg_del2: 'Удалить?', t_log_del: 'Запись журнала удалена',
  lf_name: 'название', lf_names: 'названия на языках', lf_encl: 'место', lf_encl_at: 'место', lf_parent_id: 'находится в', lf_capacity: 'вместимость', lf_active: 'состояние', lf_note: 'заметки',
  lf_info: 'данные вида', lf_f: 'данные записи', lf_event_at: 'время', lf_bird: 'животное', lf_status: 'статус', lf_species_id: 'вид', lf_sex: 'пол', lf_ring: 'кольцо', lf_chip: 'чип',
  lf_born: 'дата рождения', lf_arrived: 'дата поступления', lf_origin: 'происхождение', lf_kind: 'тип', lf_area: 'расположение', lf_size: 'размеры', lf_role: 'роль', lf_display_name: 'имя',
  lf_name_ru: 'название RU', lf_name_pl: 'название PL', lf_name_en: 'название EN', lf_latin: 'латынь', lf_type: 'тип записи', lf_login: 'логин',
  alt_names: 'Названия на других языках', alt_add: 'Добавить название', alt_lang: 'Язык', alt_name: 'Название', alt_rm: 'Убрать название', alt_hint: 'Показывается, когда приложение открыто на этом языке. Если названия на языке нет — показывается основное.', alt_main: 'основное',
  tab_cal: 'Календарь', cal_today: 'Сегодня', cal_prev: 'Предыдущий месяц', cal_next: 'Следующий месяц',
  cal_tap2: 'Нажмите ещё раз, чтобы открыть запись', cal_list: 'События месяца', cal_none: 'В этом месяце событий нет.',
  cl_lay: 'снесла яйцо', cl_incub: 'старт инкубации', cl_hatch: 'выклев', cl_fledge: 'вылет из гнезда', cl_tstart: 'начало лечения', cl_tend: 'конец лечения', cl_expo: 'перевод',
  cl_incub_p: d => 'инкубация, выклев ≈ ' + d, cl_incub_done: 'инкубация (выклев был)', cl_treat_p: 'курс лечения',
  leg_dot: 'значок — событие', leg_line: 'линия — период: инкубация, курс лечения', leg_dash: 'штриховка — ещё идёт',
  f_incub_days: 'Инкубация, дней', sf_incub_days: 'Инкубация, дней (для расчёта выклева)', si_incub: 'Инкубация', si_incub_v: n => n + ' дн.',
  d_incub: (n, d) => 'инкубация ' + n + ' дн., выклев ≈ ' + d, cal_more: n => '+' + n,
  fa_encl: 'Место содержания', ev_expo_sub: 'Перевод между вольерами, клетками и другими местами',
  encls_t: 'Вольеры и помещения', encls_lead: 'Места содержания отдела: авиарии, вольеры, клетки, инкубаторы и другие',
  add_encl: 'Добавить место', eq_label: 'Поиск по названию или расположению', eq_ph: 'Например: авиарий 2', ek_aria: 'Тип места',
  w_place: ['место', 'места', 'мест'], w_animal: ['животное', 'животных', 'животных'],
  encl_count: n => n + ' ' + pw(n, 'w_place') + ' содержания', encl_count0: 'Мест пока нет — добавьте первое',
  encl_empty: 'Мест содержания пока нет. Нажмите «Добавить место».',
  ek_aviary: 'Авиарий', ek_enclosure: 'Вольер', ek_cage: 'Клетка', ek_incubator: 'Инкубатор', ek_brooder: 'Брудер',
  ek_room: 'Помещение', ek_quarantine: 'Карантин', ek_pond: 'Водоём', ek_other: 'Другое', ek_all: 'Все', ek_off: 'Не используются',
  ef_name: 'Название', ef_name_ph: 'Например: Авиарий 2 или Клетка К-14', ef_kind: 'Тип', ef_area: 'Расположение', ef_area_ph: 'Корпус, зона, этаж',
  ef_size: 'Размеры', ef_size_ph: 'Например: 4 × 3 × 2,5 м', ef_cap: 'Вместимость (животных)', ef_state: 'Состояние', ef_on: 'Используется', ef_off: 'Не используется',
  ef_note: 'Заметки', ef_note_ph: 'Оборудование, режим, особенности', ef_new: 'Новое место содержания', ef_sub_new: 'Его можно будет выбрать в карточке животного и при переводе',
  ef_edit: 'Место содержания',
  en_now: 'Сейчас содержатся', en_none: 'Сейчас здесь никого нет.', en_hist: 'Перемещения', en_nohist: 'Переводов сюда и отсюда ещё не было.',
  en_move_here: 'Перевести сюда', en_move: 'Перевести', en_since: d => 'здесь с ' + d, en_occ: (n, c) => c ? n + ' из ' + c : String(n),
  en_full: 'переполнен', en_empty: 'пусто', en_n: n => n + ' ' + pw(n, 'w_animal'), en_off_pill: 'не используется', en_fill: 'Занято',
  en_deleted: 'Место удалено', en_deleted_p: 'Это место содержания удалили. Вернитесь к списку.',
  encl_none_opt: '— не указано —', encl_new_opt: '+ Новое место…', encl_new_name: 'Название нового места', encl_unreg: ' (нет в списке мест)',
  del_encl: 'Удалить место', del_encl_n: n => 'Сейчас здесь ' + n + ' ' + pw(n, 'w_animal') + '. Удалить всё равно?',
  e_ename: 'Укажите название места.', e_edup: 'Место с таким названием уже есть.', e_new_encl: 'Укажите название нового места.',
  t_encl_added: 'Место добавлено', t_encl_del: 'Место удалено',
  ek_building: 'Здание', ef_parent: 'Находится в', ef_top: '— отдельно (верхний уровень) —', en_inside: 'Внутри', en_add_inside: 'Добавить внутрь',
  en_total: 'Всего внутри', en_in: p => 'в: ' + p, en_kids: n => n + ' ' + pw(n, 'w_sub'), w_sub: ['место внутри', 'места внутри', 'мест внутри'],
  en_no_kids: 'Внутри пока ничего нет.', del_encl_kids: n => 'Внутри ' + n + ' ' + pw(n, 'w_place') + ' — они станут отдельными. Удалить?', e_cycle: 'Нельзя поместить место внутрь самого себя.'
});
Object.assign(DICT.pl, {
  log_t: 'Dziennik zmian', log_lead: 'Wszystko, co zmieniano w aplikacji, oraz zmiany w samej aplikacji. Wpisy może usuwać tylko administrator.',
  log_count: n => n + ' ' + pw(n, 'w_entry'), w_entry: ['wpis', 'wpisy', 'wpisów'], log_empty: 'Nie ma jeszcze zmian.',
  lg_all: 'Wszystkie', lg_user: 'W aplikacji', lg_dev: 'Rozwój', lg_insert: 'Dodano', lg_update: 'Zmieniono', lg_delete: 'Usunięto', lg_dev_who: 'Rozwój', lg_sys: 'System',
  le_species: 'gatunek', le_collection: 'zwierzę', le_records: 'wpis', le_enclosures: 'miejsce', le_photos: 'zdjęcie', le_profiles: 'pracownik',
  lg_del: 'Usuń wpis dziennika', lg_del2: 'Usunąć?', t_log_del: 'Wpis dziennika usunięty',
  lf_name: 'nazwa', lf_names: 'nazwy w językach', lf_encl: 'miejsce', lf_encl_at: 'miejsce', lf_parent_id: 'znajduje się w', lf_capacity: 'pojemność', lf_active: 'stan', lf_note: 'notatki',
  lf_info: 'dane gatunku', lf_f: 'dane wpisu', lf_event_at: 'czas', lf_bird: 'zwierzę', lf_status: 'status', lf_species_id: 'gatunek', lf_sex: 'płeć', lf_ring: 'obrączka', lf_chip: 'chip',
  lf_born: 'data urodzenia', lf_arrived: 'data przybycia', lf_origin: 'pochodzenie', lf_kind: 'rodzaj', lf_area: 'lokalizacja', lf_size: 'wymiary', lf_role: 'rola', lf_display_name: 'imię',
  lf_name_ru: 'nazwa RU', lf_name_pl: 'nazwa PL', lf_name_en: 'nazwa EN', lf_latin: 'łacina', lf_type: 'rodzaj wpisu', lf_login: 'login',
  alt_names: 'Nazwy w innych językach', alt_add: 'Dodaj nazwę', alt_lang: 'Język', alt_name: 'Nazwa', alt_rm: 'Usuń nazwę', alt_hint: 'Wyświetlana, gdy aplikacja jest otwarta w tym języku. Jeśli brak — wyświetlana jest nazwa główna.', alt_main: 'główna',
  tab_cal: 'Kalendarz', cal_today: 'Dziś', cal_prev: 'Poprzedni miesiąc', cal_next: 'Następny miesiąc',
  cal_tap2: 'Naciśnij ponownie, aby otworzyć wpis', cal_list: 'Wydarzenia miesiąca', cal_none: 'W tym miesiącu nie ma wydarzeń.',
  cl_lay: 'zniesienie jaja', cl_incub: 'początek inkubacji', cl_hatch: 'klucie', cl_fledge: 'opuszczenie gniazda', cl_tstart: 'początek leczenia', cl_tend: 'koniec leczenia', cl_expo: 'przeniesienie',
  cl_incub_p: d => 'inkubacja, klucie ≈ ' + d, cl_incub_done: 'inkubacja (klucie było)', cl_treat_p: 'kuracja',
  leg_dot: 'ikona — wydarzenie', leg_line: 'linia — okres: inkubacja, kuracja', leg_dash: 'kreskowanie — jeszcze trwa',
  f_incub_days: 'Inkubacja, dni', sf_incub_days: 'Inkubacja, dni (do wyliczenia klucia)', si_incub: 'Inkubacja', si_incub_v: n => n + ' dni',
  d_incub: (n, d) => 'inkubacja ' + n + ' dni, klucie ≈ ' + d, cal_more: n => '+' + n,
  fa_encl: 'Miejsce przetrzymywania', ev_expo_sub: 'Przeniesienie między wolierami, klatkami i innymi miejscami',
  encls_t: 'Woliery i pomieszczenia', encls_lead: 'Miejsca przetrzymywania działu: ptaszarnie, woliery, klatki, inkubatory i inne',
  add_encl: 'Dodaj miejsce', eq_label: 'Szukaj po nazwie lub lokalizacji', eq_ph: 'Np.: ptaszarnia 2', ek_aria: 'Rodzaj miejsca',
  w_place: ['miejsce', 'miejsca', 'miejsc'], w_animal: ['zwierzę', 'zwierzęta', 'zwierząt'],
  encl_count: n => n + ' ' + pw(n, 'w_place') + ' przetrzymywania', encl_count0: 'Nie ma jeszcze miejsc — dodaj pierwsze',
  encl_empty: 'Nie ma jeszcze miejsc przetrzymywania. Naciśnij „Dodaj miejsce”.',
  ek_aviary: 'Ptaszarnia', ek_enclosure: 'Woliera', ek_cage: 'Klatka', ek_incubator: 'Inkubator', ek_brooder: 'Odchowalnia',
  ek_room: 'Pomieszczenie', ek_quarantine: 'Kwarantanna', ek_pond: 'Zbiornik wodny', ek_other: 'Inne', ek_all: 'Wszystkie', ek_off: 'Nieużywane',
  ef_name: 'Nazwa', ef_name_ph: 'Np.: Ptaszarnia 2 lub Klatka K-14', ef_kind: 'Rodzaj', ef_area: 'Lokalizacja', ef_area_ph: 'Budynek, strefa, piętro',
  ef_size: 'Wymiary', ef_size_ph: 'Np.: 4 × 3 × 2,5 m', ef_cap: 'Pojemność (zwierząt)', ef_state: 'Stan', ef_on: 'Używane', ef_off: 'Nieużywane',
  ef_note: 'Notatki', ef_note_ph: 'Wyposażenie, tryb, szczególne cechy', ef_new: 'Nowe miejsce przetrzymywania', ef_sub_new: 'Będzie można je wybrać w karcie zwierzęcia i przy przeniesieniu',
  ef_edit: 'Miejsce przetrzymywania',
  en_now: 'Obecnie przebywają', en_none: 'Obecnie nikogo tu nie ma.', en_hist: 'Przeniesienia', en_nohist: 'Nie było jeszcze przeniesień tu ani stąd.',
  en_move_here: 'Przenieś tutaj', en_move: 'Przenieś', en_since: d => 'tutaj od ' + d, en_occ: (n, c) => c ? n + ' z ' + c : String(n),
  en_full: 'przepełnione', en_empty: 'puste', en_n: n => n + ' ' + pw(n, 'w_animal'), en_off_pill: 'nieużywane', en_fill: 'Zajęte',
  en_deleted: 'Miejsce usunięte', en_deleted_p: 'To miejsce przetrzymywania zostało usunięte. Wróć do listy.',
  encl_none_opt: '— nie podano —', encl_new_opt: '+ Nowe miejsce…', encl_new_name: 'Nazwa nowego miejsca', encl_unreg: ' (poza listą miejsc)',
  del_encl: 'Usuń miejsce', del_encl_n: n => 'Obecnie przebywa tu ' + n + ' ' + pw(n, 'w_animal') + '. Usunąć mimo to?',
  e_ename: 'Podaj nazwę miejsca.', e_edup: 'Miejsce o tej nazwie już istnieje.', e_new_encl: 'Podaj nazwę nowego miejsca.',
  t_encl_added: 'Miejsce dodane', t_encl_del: 'Miejsce usunięte',
  ek_building: 'Budynek', ef_parent: 'Znajduje się w', ef_top: '— osobno (najwyższy poziom) —', en_inside: 'W środku', en_add_inside: 'Dodaj w środku',
  en_total: 'Razem w środku', en_in: p => 'w: ' + p, en_kids: n => n + ' ' + pw(n, 'w_sub'), w_sub: ['miejsce w środku', 'miejsca w środku', 'miejsc w środku'],
  en_no_kids: 'W środku nie ma jeszcze nic.', del_encl_kids: n => 'W środku jest ' + n + ' ' + pw(n, 'w_place') + ' — staną się osobne. Usunąć?', e_cycle: 'Nie można umieścić miejsca w nim samym.'
});
Object.assign(DICT.en, {
  log_t: 'Change log', log_lead: 'Everything changed in the app, and changes to the app itself. Only an admin can delete entries.',
  log_count: n => n + ' ' + pw(n, 'w_entry'), w_entry: ['entry', 'entries'], log_empty: 'No changes yet.',
  lg_all: 'All', lg_user: 'In the app', lg_dev: 'Development', lg_insert: 'Added', lg_update: 'Changed', lg_delete: 'Deleted', lg_dev_who: 'Development', lg_sys: 'System',
  le_species: 'species', le_collection: 'animal', le_records: 'record', le_enclosures: 'place', le_photos: 'photo', le_profiles: 'staff member',
  lg_del: 'Delete log entry', lg_del2: 'Delete?', t_log_del: 'Log entry deleted',
  lf_name: 'name', lf_names: 'names in languages', lf_encl: 'place', lf_encl_at: 'place', lf_parent_id: 'located in', lf_capacity: 'capacity', lf_active: 'state', lf_note: 'notes',
  lf_info: 'species details', lf_f: 'record details', lf_event_at: 'time', lf_bird: 'animal', lf_status: 'status', lf_species_id: 'species', lf_sex: 'sex', lf_ring: 'ring', lf_chip: 'chip',
  lf_born: 'birth date', lf_arrived: 'arrival date', lf_origin: 'origin', lf_kind: 'type', lf_area: 'location', lf_size: 'dimensions', lf_role: 'role', lf_display_name: 'name',
  lf_name_ru: 'name RU', lf_name_pl: 'name PL', lf_name_en: 'name EN', lf_latin: 'Latin', lf_type: 'record type', lf_login: 'login',
  alt_names: 'Names in other languages', alt_add: 'Add a name', alt_lang: 'Language', alt_name: 'Name', alt_rm: 'Remove name', alt_hint: 'Shown when the app is open in that language. Without one, the main name is shown.', alt_main: 'main',
  tab_cal: 'Calendar', cal_today: 'Today', cal_prev: 'Previous month', cal_next: 'Next month',
  cal_tap2: 'Tap again to open the record', cal_list: 'This month', cal_none: 'No events this month.',
  cl_lay: 'egg laid', cl_incub: 'incubation start', cl_hatch: 'hatching', cl_fledge: 'left the nest', cl_tstart: 'treatment start', cl_tend: 'treatment end', cl_expo: 'move',
  cl_incub_p: d => 'incubation, hatching ≈ ' + d, cl_incub_done: 'incubation (hatched)', cl_treat_p: 'treatment course',
  leg_dot: 'icon — event', leg_line: 'line — period: incubation, treatment', leg_dash: 'striped — still going',
  f_incub_days: 'Incubation, days', sf_incub_days: 'Incubation, days (to predict hatching)', si_incub: 'Incubation', si_incub_v: n => n + ' days',
  d_incub: (n, d) => 'incubation ' + n + ' days, hatching ≈ ' + d, cal_more: n => '+' + n,
  fa_encl: 'Housing', ev_expo_sub: 'Moving between enclosures, cages and other places',
  encls_t: 'Enclosures and rooms', encls_lead: 'Where the department keeps its animals: aviaries, enclosures, cages, incubators and more',
  add_encl: 'Add place', eq_label: 'Search by name or location', eq_ph: 'E.g. aviary 2', ek_aria: 'Type of place',
  w_place: ['place', 'places'], w_animal: ['animal', 'animals'],
  encl_count: n => n + ' housing ' + pw(n, 'w_place'), encl_count0: 'No places yet — add the first one',
  encl_empty: 'No housing places yet. Tap “Add place”.',
  ek_aviary: 'Aviary', ek_enclosure: 'Enclosure', ek_cage: 'Cage', ek_incubator: 'Incubator', ek_brooder: 'Brooder',
  ek_room: 'Room', ek_quarantine: 'Quarantine', ek_pond: 'Pond', ek_other: 'Other', ek_all: 'All', ek_off: 'Not in use',
  ef_name: 'Name', ef_name_ph: 'E.g. Aviary 2 or Cage K-14', ef_kind: 'Type', ef_area: 'Location', ef_area_ph: 'Building, zone, floor',
  ef_size: 'Dimensions', ef_size_ph: 'E.g. 4 × 3 × 2.5 m', ef_cap: 'Capacity (animals)', ef_state: 'State', ef_on: 'In use', ef_off: 'Not in use',
  ef_note: 'Notes', ef_note_ph: 'Equipment, routine, special features', ef_new: 'New housing place', ef_sub_new: 'You can then pick it in an animal card and when moving animals',
  ef_edit: 'Housing place',
  en_now: 'Kept here now', en_none: 'Nobody is kept here right now.', en_hist: 'Moves', en_nohist: 'No moves to or from here yet.',
  en_move_here: 'Move here', en_move: 'Move', en_since: d => 'here since ' + d, en_occ: (n, c) => c ? n + ' of ' + c : String(n),
  en_full: 'over capacity', en_empty: 'empty', en_n: n => n + ' ' + pw(n, 'w_animal'), en_off_pill: 'not in use', en_fill: 'Occupied',
  en_deleted: 'Place deleted', en_deleted_p: 'This housing place was deleted. Go back to the list.',
  encl_none_opt: '— not set —', encl_new_opt: '+ New place…', encl_new_name: 'Name of the new place', encl_unreg: ' (not in the list of places)',
  del_encl: 'Delete place', del_encl_n: n => n + ' ' + pw(n, 'w_animal') + ' are kept here now. Delete anyway?',
  e_ename: 'Enter the name of the place.', e_edup: 'A place with this name already exists.', e_new_encl: 'Enter the name of the new place.',
  t_encl_added: 'Place added', t_encl_del: 'Place deleted',
  ek_building: 'Building', ef_parent: 'Located in', ef_top: '— on its own (top level) —', en_inside: 'Inside', en_add_inside: 'Add inside',
  en_total: 'Total inside', en_in: p => 'in: ' + p, en_kids: n => n + ' ' + pw(n, 'w_sub'), w_sub: ['place inside', 'places inside'],
  en_no_kids: 'Nothing inside yet.', del_encl_kids: n => n + ' ' + pw(n, 'w_place') + ' inside will become separate. Delete?', e_cycle: 'A place cannot be inside itself.'
});

// protected (locked) texts and species photos
Object.assign(DICT.ru, {lk_l: 'Защитить от ИИ', lk_t: 'Защищено: нейросеть это не изменит, менять может только администратор', lk_ro: 'Защищено — менять может только администратор',
  lk_hint: 'Замок справа в поле защищает только это поле (например, только кормление). Защищённый текст не изменит никто, кроме администратора, — ни нейросеть, ни другие сотрудники. Поля с описанием вида — в разделе «Справочная информация».',
  lk_all: 'Защитить всю карточку от ИИ', lk_one: 'Защитить это поле от ИИ',
  ph_main: 'Сделать главным', ph_is_main: 'Главное фото', ph_wiki: 'Википедия', ph_all: 'Фотографии', ph_wiki_rm: 'Убрать фото из Википедии'});
Object.assign(DICT.pl, {lk_l: 'Chroń przed AI', lk_t: 'Chronione: AI tego nie zmieni, zmienić może tylko administrator', lk_ro: 'Chronione — zmienić może tylko administrator',
  lk_hint: 'Kłódka po prawej w polu chroni tylko to pole (np. tylko karmienie). Chronionego tekstu nie zmieni nikt poza administratorem — ani AI, ani inni pracownicy. Pola z opisem gatunku są w sekcji „Informacje o gatunku”.',
  lk_all: 'Chroń całą kartę przed AI', lk_one: 'Chroń to pole przed AI',
  ph_main: 'Ustaw jako główne', ph_is_main: 'Główne zdjęcie', ph_wiki: 'Wikipedia', ph_all: 'Zdjęcia', ph_wiki_rm: 'Usuń zdjęcie z Wikipedii'});
Object.assign(DICT.en, {lk_l: 'Protect from AI', lk_t: 'Protected: AI will not change this, only an admin can', lk_ro: 'Protected — only an admin can change this',
  lk_hint: 'The lock on the right of a field protects just that field (for example only feeding). Nobody but an admin can change protected text — neither AI nor other staff. Species description fields are under “Species information”.',
  lk_all: 'Protect the whole card from AI', lk_one: 'Protect this field from AI',
  ph_main: 'Make main', ph_is_main: 'Main photo', ph_wiki: 'Wikipedia', ph_all: 'Photos', ph_wiki_rm: 'Remove the Wikipedia photo'});

// calendar view modes: a list of events or month grids one under another
Object.assign(DICT.ru, {cal_m_list: 'Список', cal_m_grid: 'Месяцы', cal_modes: 'Вид календаря', cal_earlier: 'Более ранние месяцы'});
Object.assign(DICT.pl, {cal_m_list: 'Lista', cal_m_grid: 'Miesiące', cal_modes: 'Widok kalendarza', cal_earlier: 'Wcześniejsze miesiące'});
Object.assign(DICT.en, {cal_m_list: 'List', cal_m_grid: 'Months', cal_modes: 'Calendar view', cal_earlier: 'Earlier months'});
// a day of the calendar: its records and adding a record on that date
Object.assign(DICT.ru, {cal_day_open: 'Открыть день', cal_day_recs: 'Записи', cal_day_per: 'Идёт в этот день', cal_day_none: 'В этот день записей нет.', cal_day_add: 'Добавить запись'});
Object.assign(DICT.pl, {cal_day_open: 'Otwórz dzień', cal_day_recs: 'Wpisy', cal_day_per: 'Trwa tego dnia', cal_day_none: 'Tego dnia nie ma wpisów.', cal_day_add: 'Dodaj wpis'});
Object.assign(DICT.en, {cal_day_open: 'Open the day', cal_day_recs: 'Records', cal_day_per: 'Ongoing on this day', cal_day_none: 'No records on this day.', cal_day_add: 'Add a record'});

// change log tabs and version, three-language species texts, locks for animals and places
Object.assign(DICT.ru, {lg_user: 'Пользователи', lg_ai: 'ИИ: данные', lg_dev: 'ИИ: разработка', lg_ai_who: 'ИИ', lg_dev_who: 'ИИ-разработка',
  app_ver: v => 'Версия приложения: v' + v, lg_n: n => '№' + n,
  tr_lang: 'Язык описаний', tr_hint: 'Пишите на любом языке: при сохранении остальные языки переведутся автоматически. Исправленный вручную перевод больше не перезаписывается.',
  tr_from: l => 'Автоперевод ' + {pl: 'с польского', en: 'с английского', ru: 'с русского'}[l], tr_orig: l => 'Текст есть только ' + {pl: 'на польском', en: 'на английском', ru: 'на русском'}[l],
  tr_busy: 'Перевожу описания…', tr_fail: 'Автоперевод сейчас недоступен — текст сохранён без перевода',
  lk_hint_g: 'Замок справа в поле защищает только это поле. Защищённое поле не изменит никто, кроме администратора, — ни нейросеть, ни другие сотрудники.'});
Object.assign(DICT.pl, {lg_user: 'Użytkownicy', lg_ai: 'AI: dane', lg_dev: 'AI: rozwój', lg_ai_who: 'AI', lg_dev_who: 'AI – rozwój',
  app_ver: v => 'Wersja aplikacji: v' + v, lg_n: n => 'nr ' + n,
  tr_lang: 'Język opisów', tr_hint: 'Pisz w dowolnym języku: przy zapisie pozostałe języki zostaną przetłumaczone automatycznie. Tłumaczenie poprawione ręcznie nie jest już nadpisywane.',
  tr_from: l => 'Tłumaczenie automatyczne ' + {pl: 'z polskiego', en: 'z angielskiego', ru: 'z rosyjskiego'}[l], tr_orig: l => 'Tekst dostępny tylko ' + {pl: 'po polsku', en: 'po angielsku', ru: 'po rosyjsku'}[l],
  tr_busy: 'Tłumaczę opisy…', tr_fail: 'Tłumaczenie automatyczne jest teraz niedostępne — tekst zapisano bez tłumaczenia',
  lk_hint_g: 'Kłódka po prawej w polu chroni tylko to pole. Chronionego pola nie zmieni nikt poza administratorem — ani AI, ani inni pracownicy.'});
Object.assign(DICT.en, {lg_user: 'Users', lg_ai: 'AI: data', lg_dev: 'AI: development', lg_ai_who: 'AI', lg_dev_who: 'AI development',
  app_ver: v => 'App version: v' + v, lg_n: n => '#' + n,
  tr_lang: 'Description language', tr_hint: 'Write in any language: the other languages are translated automatically when you save. A translation you corrected by hand is never overwritten.',
  tr_from: l => 'Machine-translated ' + {pl: 'from Polish', en: 'from English', ru: 'from Russian'}[l], tr_orig: l => 'Only available ' + {pl: 'in Polish', en: 'in English', ru: 'in Russian'}[l],
  tr_busy: 'Translating descriptions…', tr_fail: 'Machine translation is unavailable right now — the text was saved untranslated',
  lk_hint_g: 'The lock on the right of a field protects just that field. Nobody but an administrator can change a protected field — neither AI nor other staff.'});
// leaving the app with the phone's Back button
Object.assign(DICT.ru, {cf_exit: 'Выйти из приложения?', cf_exit_p: 'Вы на главном экране. Ещё раз «Назад» закроет приложение.', cf_exit_ok: 'Выйти'});
Object.assign(DICT.pl, {cf_exit: 'Zamknąć aplikację?', cf_exit_p: 'Jesteś na ekranie głównym. Kolejne „Wstecz” zamknie aplikację.', cf_exit_ok: 'Zamknij'});
Object.assign(DICT.en, {cf_exit: 'Leave the app?', cf_exit_p: 'This is the home screen. Going back again closes the app.', cf_exit_ok: 'Leave'});
// confirmations before signing out and before closing a card with unsaved changes
Object.assign(DICT.ru, {cf_logout: 'Выйти из аккаунта?', cf_logout_p: 'Чтобы снова работать с журналом, нужно будет войти заново.',
  cf_leave: 'Закрыть без сохранения?', cf_leave_p: 'Изменения в этой карточке не сохранятся.', cf_leave_ok: 'Закрыть без сохранения', cf_stay: 'Остаться', cf_cancel: 'Отмена'});
Object.assign(DICT.pl, {cf_logout: 'Wylogować się?', cf_logout_p: 'Aby znów pracować z dziennikiem, trzeba będzie zalogować się ponownie.',
  cf_leave: 'Zamknąć bez zapisywania?', cf_leave_p: 'Zmiany w tej karcie nie zostaną zapisane.', cf_leave_ok: 'Zamknij bez zapisywania', cf_stay: 'Zostań', cf_cancel: 'Anuluj'});
Object.assign(DICT.en, {cf_logout: 'Sign out?', cf_logout_p: 'You will need to sign in again to use the log.',
  cf_leave: 'Close without saving?', cf_leave_p: 'Changes to this card will not be saved.', cf_leave_ok: 'Close without saving', cf_stay: 'Stay', cf_cancel: 'Cancel'});
