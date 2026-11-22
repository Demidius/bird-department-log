{
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
  leg_dot: 'точка — событие', leg_line: 'линия — период: инкубация, курс лечения', leg_dash: 'штриховка — ещё идёт',
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
  leg_dot: 'kropka — wydarzenie', leg_line: 'linia — okres: inkubacja, kuracja', leg_dash: 'kreskowanie — jeszcze trwa',
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
  leg_dot: 'dot — event', leg_line: 'line — period: incubation, treatment', leg_dash: 'striped — still going',
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

/* ---------- housing places: screens added to the page ---------- */
{
  const add = (sel, where, html) => { const el = document.querySelector(sel); if (el) el.insertAdjacentHTML(where, html); };
  add('#view-menu [data-view=species]', 'beforebegin', `<button class="row" type="button" data-view="encls" style="margin-top:10px"><span class="tile t-amber" data-ic="home"></span><span class="rt"><b data-t="encls_t"></b><small id="encl-count"></small></span><span class="chev" data-ic="chev" data-s="20"></span></button>
`);
  add('#view-menu [data-view=species]', 'beforebegin', `<button class="row" type="button" data-view="log" style="margin-top:10px"><span class="tile t-grey" data-ic="clock"></span><span class="rt"><b data-t="log_t"></b><small id="log-count"></small></span><span class="chev" data-ic="chev" data-s="20"></span></button>
`);
  add('#view-users', 'beforebegin', `<section class="view" id="view-log" hidden>
<button class="backlink" type="button" data-tab="menu"><span data-ic="back" data-s="18" data-w="2.2"></span><span data-t="menu"></span></button>
<h1 data-t="log_t"></h1>
<p class="lead" data-t="log_lead"></p>
<div class="chips" id="lg-chips" role="group"></div>
<div class="list" id="log-body" style="margin-top:12px"></div>
</section>
`);
  add('.tab[data-tab=now]', 'afterend', `<button class="tab" type="button" data-tab="cal"><span class="ti" data-ic="calgrid" data-s="22"></span><span data-t="tab_cal"></span></button>`);
  add('#view-users', 'beforebegin', `<section class="view" id="view-cal" hidden>
<div class="cal-head"><h1 id="cal-title"></h1><div class="cal-nav"><button class="mini ghost" type="button" data-cal-nav="-1" data-ta="cal_prev"><span data-ic="chevl" data-s="18" data-w="2.4"></span></button><button class="mini ghost" type="button" data-cal-nav="0" data-t="cal_today"></button><button class="mini ghost" type="button" data-cal-nav="1" data-ta="cal_next"><span data-ic="chev" data-s="18" data-w="2.4"></span></button></div></div>
<div class="cal-box"><div class="cal-dow" id="cal-dow"></div><div id="cal-grid"></div><div class="cal-tip" id="cal-tip" role="status" hidden></div></div>
<p class="cal-legend"><span><i class="cdot k-amber"></i><span data-t="leg_dot"></span></span><span><i class="cleg k-amber"></i><span data-t="leg_line"></span></span><span><i class="cleg k-amber pend"></i><span data-t="leg_dash"></span></span></p>
<section class="nsec"><h2 class="nh"><span data-t="cal_list"></span><span class="nc" id="cal-n"></span></h2><div id="cal-list"></div></section>
</section>
`);
  add('#view-users', 'beforebegin', `<section class="view" id="view-encls" hidden>
<button class="backlink" type="button" data-tab="menu"><span data-ic="back" data-s="18" data-w="2.2"></span><span data-t="menu"></span></button>
<h1 data-t="encls_t"></h1>
<p class="lead" data-t="encls_lead"></p>
<button class="btn pri add-sp w-only" type="button" data-encl-new><span data-ic="plus" data-s="20" data-w="2.4"></span><span data-t="add_encl"></span></button>
<div class="fld"><label for="eq" data-t="eq_label"></label><input id="eq" type="search" autocomplete="off" data-tp="eq_ph"></div>
<div class="chips" id="ek-chips" role="group" data-ta="ek_aria" hidden></div>
<div class="list" id="encls-body" style="margin-top:12px"></div>
</section>

<section class="view" id="view-encl" hidden>
<div id="encl-body"></div>
</section>
`);
  add('#sheet-user', 'beforebegin', `<section class="sheet" id="sheet-encl" role="dialog" aria-modal="true" aria-labelledby="ef-title" tabindex="-1" aria-hidden="true" inert>
<div class="grip" aria-hidden="true"></div>
<div class="sh"><span class="tile t-amber" data-ic="home"></span><div><h2 id="ef-title"></h2><p id="ef-sub"></p></div><button class="x" type="button" data-close data-ta="close"><span data-ic="x" data-s="20" data-w="2.2"></span></button></div>
<form id="encl-form" novalidate>
<div id="ef-fields"></div>
<div class="fld" id="ef-ph"></div>
<p class="err" id="ef-err" role="alert"></p>
<div class="acts"><button class="btn pri" type="submit" id="ef-save" data-t="save"></button><button class="btn del" type="button" id="ef-del" hidden></button></div>
</form>
</section>
`);
}
/* ---------- config ---------- */
const SB_URL = 'https://nszeqgopzonpplfznaat.supabase.co';
const SB_KEY = 'sb_publishable_r_fN0QxiDijqW4t-Qnv9pA_SAzpKvdp';
const BUCKET = 'journal-photos';
const LOGIN_DOMAIN = 'zoo-log.invalid';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const I = {
  cross:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  egg:'<path d="M12 3c-3.6 0-6.5 5.6-6.5 10.2a6.5 6.5 0 0 0 13 0C18.5 8.6 15.6 3 12 3z"/>',
  chick:'<circle cx="14" cy="7" r="3.5"/><path d="M10.8 9C6.5 9.6 4 12.3 4 15a6.5 5.5 0 0 0 13 .5c.8-1.7.6-3.8-.6-5.3"/><path d="M17.4 5.8 20 7l-2.6 1.2"/><path d="M9 20.5V22M13 20.5V22"/>',
  swap:'<path d="M4 7h15M15 3l4 4-4 4"/><path d="M20 17H5M9 13l-4 4 4 4"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  syringe:'<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>',
  nesteggs:'<ellipse cx="9" cy="10" rx="2.6" ry="3.4"/><ellipse cx="15" cy="10.5" rx="2.6" ry="3.4"/><path d="M3 13.5c0 4 4 7 9 7s9-3 9-7z"/>',
  clip:'<rect x="5" y="4.5" width="14" height="17" rx="2"/><path d="M9 2.5h6v4H9z"/><path d="M12 10.5v6M9 13.5h6"/>',
  pill:'<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/><path d="m8.5 8.5 7 7"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8 5.7-5.8"/>',
  eggplus:'<path d="M11 4c-3.3 0-6 5.2-6 9.5a6 6 0 0 0 12 0c0-1.2-.2-2.5-.6-3.7"/><path d="M19 2.5v6M16 5.5h6"/>',
  sit:'<path d="M3 15.5c0 3 4 5.5 9 5.5s9-2.5 9-5.5z"/><path d="M5.5 15.5c0-4 2.8-6.5 6.5-6.5 1.6 0 2.8-.9 3.4-2.2"/><path d="M15.8 9.4c1.6 1.2 2.5 3.2 2.7 6.1"/><circle cx="17.6" cy="6" r="2"/><path d="M19.6 6h2"/>',
  crack:'<path d="M5.5 14a6.5 6.5 0 0 0 13 0"/><path d="M5.5 14l2.2-1.6 2 1.8 2.3-2 2.3 2 2-1.8 2.2 1.6"/><path d="M7.6 8.6C8.7 5.5 10.2 3.5 12 3.5s3.3 2 4.4 5.1l-2.1 1.3-2.3-1.6-2.3 1.6z"/>',
  out:'<path d="M3 17c0 2.5 4 4.5 9 4.5s9-2 9-4.5z"/><path d="M8 13.5 17 4.5"/><path d="M11 4.5h6v6"/>',
  chev:'<path d="m9 6 6 6-6 6"/>', x:'<path d="M18 6 6 18M6 6l12 12"/>', back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  book:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h8M8 11h6"/>',
  tag:'<path d="M12.6 2.6a2 2 0 0 0-1.4-.6H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  bird:'<path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  key:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
  person:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  tree:'<path d="M12 22v-6"/><path d="M12 2 5 12h4l-3 4h12l-3-4h4z"/>',
  leaf:'<path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-10-1 12-5 16-10 16z"/><path d="M4 21c3-6 7-9 11-11"/>',
  bowl:'<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-1.5 1-2 1-3M12 7c0-1.5 1-2 1-3M16 7c0-1.5 1-2 1-3"/>',
  home:'<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/>',
  heart:'<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/><path d="M7.5 12h2l1.5-3 2 5 1.5-2h2"/>',
  sex:'<circle cx="10" cy="14" r="5"/><path d="M10 19v3M8 21h4"/><path d="M15 3h6v6M21 3l-7 7"/>',
  ruler:'<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 7v4M10 7v3M14 7v4M18 7v3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cage:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 5v16M12 5v16M16 5v16M9 2h6M12 2v3"/>',
  building:'<path d="M4 21V7l8-4 8 4v14"/><path d="M2 21h20M9 21v-4h6v4M8 10h2M14 10h2M8 14h2M14 14h2"/>',
  calgrid:'<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><circle cx="8" cy="14" r="1"/><path d="M11 17.5h7"/>',
  chevl:'<path d="m15 6-6 6 6 6"/>',
  star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
  unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  drop:'<path d="M12 3s-6.5 7-6.5 11.5a6.5 6.5 0 0 0 13 0C18.5 10 12 3 12 3z"/>',
  paw:'<circle cx="5.5" cy="10" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M12 12c-3 0-5.5 3.5-5.5 6 0 1.7 1.3 3 3 3 1 0 1.7-.5 2.5-.5s1.5.5 2.5.5c1.7 0 3-1.3 3-3 0-2.5-2.5-6-5.5-6z"/>'
};
const ic = (n, s = 24, w = 2) => `<svg aria-hidden="true" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${I[n] || ''}</svg>`;
const paintIcons = root => $$('[data-ic]', root).forEach(e => { e.innerHTML = ic(e.dataset.ic, e.dataset.s || 24, e.dataset.w || 2); });

/* ---------- i18n ---------- */
const LOCALE = {ru: 'ru-RU', pl: 'pl-PL', en: 'en-GB'};
const LANG_FIELD = {ru: 'name', pl: 'pl', en: 'en'};
// Polish is the main language, English the second, Russian the third
const LANG_ORDER = ['pl', 'en', 'ru'];
let lang = 'pl';
try { const saved = localStorage.getItem('zoo-log-lang2'); if (DICT[saved]) lang = saved; } catch (x) {}
const t = (k, ...a) => { let v = DICT[lang][k]; for (const l of LANG_ORDER) if (v === undefined) v = DICT[l][k]; if (v === undefined) return k; return typeof v === 'function' ? v(...a) : v; };
const pIdx = n => {
  const m = n % 10, h = n % 100;
  if (lang === 'en') return n === 1 ? 0 : 1;
  if (lang === 'pl') return n === 1 ? 0 : m >= 2 && m <= 4 && (h < 12 || h > 14) ? 1 : 2;
  return m === 1 && h !== 11 ? 0 : m >= 2 && m <= 4 && (h < 12 || h > 14) ? 1 : 2;
};
const pw = (n, k) => { const f = t(k); return f[Math.min(pIdx(Math.abs(n)), f.length - 1)]; };
window.pw = pw;
let fTime, fDay, fLong, fDate;
function mkFmt() {
  const L = LOCALE[lang];
  fTime = new Intl.DateTimeFormat(L, {hour: '2-digit', minute: '2-digit'});
  fDay = new Intl.DateTimeFormat(L, {day: 'numeric', month: 'short'});
  fLong = new Intl.DateTimeFormat(L, {weekday: 'long', day: 'numeric', month: 'long'});
  fDate = new Intl.DateTimeFormat(L, {day: 'numeric', month: 'long', year: 'numeric'});
}
mkFmt();

const T = {
  expo:  {g:'expo', tone:'green', icon:'swap', fields:[{k:'from',l:'f_from',t:'text'},{k:'to',l:'f_to',t:'text',req:1}]},
  obs:   {g:'obs', tone:'grey', icon:'eye', fields:[], noteReq:1, noteLabel:'f_obs_note'},
  tstart:{g:'vet', tone:'red', icon:'clip', fields:[{k:'reason',l:'f_reason',t:'text'},{k:'drug',l:'f_drug',t:'text',req:1},{k:'days',l:'f_days',t:'number',min:1}]},
  tdose: {g:'vet', tone:'red', icon:'pill', fields:[{k:'drug',l:'f_drug',t:'text',req:1}]},
  tend:  {g:'vet', tone:'red', icon:'check', fields:[{k:'result',l:'f_result',t:'text'}]},
  lay:   {g:'breed', tone:'amber', icon:'eggplus', fields:[{k:'n',l:'f_eggs',t:'number',min:1,def:1}]},
  incub: {g:'breed', tone:'amber', icon:'sit', fields:[{k:'days',l:'f_incub_days',t:'number',min:1}]},
  hatch: {g:'breed', tone:'amber', icon:'crack', fields:[{k:'n',l:'f_chicks',t:'number',min:1,def:1}]},
  fledge:{g:'breed', tone:'amber', icon:'out', fields:[{k:'n',l:'f_chicks',t:'number',min:1,def:1}]}
};
const evLabel = type => t('ev_' + type);

/* ---------- dates ---------- */
const dayKey = ms => { const d = new Date(ms); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); };
const isToday = ms => dayKey(ms) === dayKey(Date.now());
const isYest = ms => dayKey(ms) === dayKey(Date.now() - 864e5);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const when = ms => (isToday(ms) ? t('today_l') : isYest(ms) ? t('yest_l') : fDay.format(ms)) + ', ' + fTime.format(ms);
const dayTitle = ms => isToday(ms) ? t('today_t') : isYest(ms) ? t('yest_t') : cap(fLong.format(ms));
const toInput = ms => { const d = new Date(ms), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
const fromInput = s => s ? new Date(s).getTime() : NaN;
const key = s => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const toN = v => Math.max(0, parseInt(v, 10) || 0);
const ymd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
function age(s) {
  const b = ymd(s), n = new Date();
  const mo = (n.getFullYear() - b.getFullYear()) * 12 + n.getMonth() - b.getMonth() - (n.getDate() < b.getDate() ? 1 : 0);
  if (mo < 0) return '';
  const y = Math.floor(mo / 12), m = mo % 12, parts = [];
  if (y) parts.push(y + ' ' + pw(y, 'w_year'));
  if (m || !y) parts.push(m + ' ' + t('mo'));
  return ' (' + parts.join(' ') + ')';
}
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));

/* ---------- state ---------- */
let sb = null, me = null, myProfile = null, channel = null;
let recs = [], species = [], coll = [], photos = [], profiles = new Map();
let spMap = new Map(), collMap = new Map(), collByName = new Map(), photosByOwner = new Map();
let curSp = null, editingSp = null, spDelArmed = false, sq = '', sg = 'all';
let curBird = null, editingBird = null, birdDelArmed = false, cq = '', cf = 'active', presetBird = null;
let tab = 'add', filt = 'all', q = '', curType = null, editing = null, delArmed = false, lastFocus = null, st = null;
let statusKey = '', statusKind = 'info', gateKey = 'loading', editingUser = null;
let phRec = null, phSp = null, phBird = null, phEncl = null;
let encls = [], enclMap = new Map(), enclByName = new Map(), curEncl = null, editingEncl = null, enclDelArmed = false, eq = '', ek = 'all';
let logRows = [], lgf = 'all', logDelArmed = '';
let calM = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })(), calSel = '';
const DEF_BACK = {sp: 'species', bird: 'coll', encl: 'encls'}, backOf = {sp: 'species', bird: 'coll', encl: 'encls'};
const VIEW_KEY = {add: 'tab_add', now: 'tab_now', logs: 'logs', menu: 'menu', species: 'species_t', sp: 'spf_edit', coll: 'coll', bird: 'bf_edit', users: 'users_t', encls: 'encls_t', encl: 'ef_edit', cal: 'tab_cal', log: 'log_t'};

const role = () => myProfile ? myProfile.role : null;
const canWrite = () => role() === 'admin' || role() === 'staff';
const isAdmin = () => role() === 'admin';
const canEditRec = r => isAdmin() || (canWrite() && r.by === me);
const canRmPhoto = p => isAdmin() || (canWrite() && p.by === me);

/* ---------- rows <-> app objects ---------- */
const ms = v => v ? new Date(v).getTime() : 0;
function fromRec(d) {
  if (!d || !T[d.type]) return null;
  const src = d.f && typeof d.f === 'object' ? d.f : {}, f = {};
  for (const k of ['from','to','reason','drug','result']) if (src[k] != null && src[k] !== '') f[k] = String(src[k]).slice(0, 300);
  for (const k of ['n','days']) if (src[k] != null && src[k] !== '') f[k] = toN(src[k]);
  return {id: d.id, type: d.type, sp: d.species_id || '', bird: String(d.bird || ''), at: ms(d.event_at), f, note: String(d.note || ''), by: d.created_by || null, created: ms(d.created_at)};
}
const toRec = r => ({type: r.type, species_id: r.sp || null, bird: r.bird, event_at: new Date(r.at).toISOString(), f: r.f, note: r.note});
function fromSp(d) {
  if (!d) return null;
  const info = d.info && typeof d.info === 'object' && !Array.isArray(d.info) ? d.info : {};
  return {id: d.id, name: d.name_ru || '', pl: d.name_pl || '', en: d.name_en || '', latin: d.latin || '', note: d.note || '', info, by: d.created_by || null, created: ms(d.created_at)};
}
const toSp = s => ({name_ru: s.name || '', name_pl: s.pl || '', name_en: s.en || '', latin: s.latin || '', note: s.note || '', info: s.info || {}});
function fromBird(d) {
  if (!d) return null;
  return {id: d.id, name: d.name, sp: d.species_id || '', sex: d.sex || '', ring: d.ring || '', chip: d.chip || '', born: d.born || '', arrived: d.arrived || '',
    origin: d.origin || '', encl: d.encl || '', enclAt: ms(d.encl_at), status: d.status === 'out' ? 'out' : 'active', note: d.note || '', names: Array.isArray(d.names) ? d.names : [], by: d.created_by || null};
}
const toBird = b => ({name: b.name, species_id: b.sp || null, sex: b.sex || '', ring: b.ring || '', chip: b.chip || '', born: b.born || null, arrived: b.arrived || null,
  origin: b.origin || '', encl: b.encl || '', encl_at: b.enclAt ? new Date(b.enclAt).toISOString() : null, status: b.status, note: b.note || '', names: b.names || []});
const EK = ['building', 'aviary', 'enclosure', 'cage', 'incubator', 'brooder', 'room', 'quarantine', 'pond', 'other'];
const EK_IC = {building: ['building', 'blue'], aviary: ['tree', 'green'], enclosure: ['home', 'green'], cage: ['cage', 'blue'], incubator: ['egg', 'amber'], brooder: ['chick', 'amber'],
  room: ['home', 'grey'], quarantine: ['cross', 'red'], pond: ['drop', 'blue'], other: ['tag', 'grey']};
function fromEncl(d) {
  if (!d) return null;
  return {id: d.id, name: d.name, kind: EK.includes(d.kind) ? d.kind : 'other', area: d.area || '', size: d.size || '', cap: d.capacity || 0,
    active: d.active !== false, note: d.note || '', parent: d.parent_id || '', names: Array.isArray(d.names) ? d.names : [], by: d.created_by || null};
}
const toEncl = x => ({name: x.name, kind: x.kind, area: x.area || '', size: x.size || '', capacity: x.cap || null, active: x.active, note: x.note || '', parent_id: x.parent || null, names: x.names || []});
const fromPhoto = d => ({id: d.id, ownerType: d.owner_type, ownerId: d.owner_id, path: d.path, w: d.width, h: d.height, by: d.created_by || null, created: ms(d.created_at)});
const thumbOf = p => p.replace(/\.jpg$/, '_t.jpg');
const photosOf = (type, id) => photosByOwner.get(type + ':' + id) || [];
// which photo is the main one: the chosen one if it still exists, else Wikipedia, else the first uploaded
function mainOf(st2, wk) {
  const ids = st2.keep.map(p => p.id).concat(st2.added.map(a => a.id));
  if (st2.main === 'wiki' && wk) return 'wiki';
  if (st2.main && ids.includes(st2.main)) return st2.main;
  return wk ? 'wiki' : ids[0] || '';
}

// names in several languages: the main name is the stable key, the others are shown when the app is in that language
const LANGS = ['pl', 'en', 'ru'], LANG_NAME = {ru: 'Русский', pl: 'Polski', en: 'English'};
const altNames = x => (x && Array.isArray(x.names) ? x.names : []).filter(n => n && LANGS.includes(n.l) && String(n.v || '').trim());
const dn = x => { if (!x) return ''; const a = altNames(x).find(n => n.l === lang); return a ? a.v : x.name; };
const allNames = x => [x.name].concat(altNames(x).map(n => n.v));
const otherNames = x => { const shown = dn(x); return (x.name !== shown ? [t('alt_main') + ': ' + x.name] : []).concat(altNames(x).filter(n => n.v !== shown).map(n => n.l.toUpperCase() + ': ' + n.v)).join(' · '); };
const bn = name => { const cb = collByName.get(key(name)); return cb ? dn(cb) : name; };
const enDn = name => { const x = name && enclByName.get(key(name)); return x ? dn(x) : (name || ''); };
const canonBird = v => { if (collByName.has(key(v))) return v; const cb = coll.find(x => altNames(x).some(n => key(n.v) === key(v))); return cb ? cb.name : v; };
const spById = id => (id && spMap.get(id)) || null;
const spName = s => !s ? '' : s[LANG_FIELD[lang]] || s.pl || s.en || s.name || s.latin;
const spNames = s => [s.name, s.latin, s.pl, s.en].filter(Boolean);
const spOther = s => { const main = spName(s); return [['PL', s.pl], ['EN', s.en], ['RU', s.name]].filter(([, v]) => v && v !== main).map(([c, v]) => c + ' ' + v).join(' · '); };
const bySp = (a, b) => spName(a).localeCompare(spName(b), LOCALE[lang]);
const byName = (a, b) => a.name.localeCompare(b.name, LOCALE[lang]);
const findSpByAnyName = n => species.find(x => spNames(x).some(v => key(v) === key(n)));
const spOfBird = name => { const cb = collByName.get(key(canonBird(name))); if (cb && spById(cb.sp)) return cb.sp; const b = st && st.birds.get(key(name)); return b && spById(b.sp) ? b.sp : ''; };
const nm = b => { const cb = collByName.get(key(b.name)); return cb ? `<button class="namelink" type="button" data-bc="${esc(cb.id)}">${esc(dn(cb))}</button>` : `<b>${esc(b.name)}</b>`; };
const backBtn = k => `<button class="backlink" type="button" data-view="${backOf[k]}">${ic('back', 18, 2.2)}${esc(t(VIEW_KEY[backOf[k]] || 'back'))}</button>`;
const matchQ = r => { if (key(r.bird).includes(q) || key(bn(r.bird)).includes(q)) return true; const s = spById(r.sp); return !!s && spNames(s).some(v => key(v).includes(q)); };
const spLink = b => { const s = spById(b.sp); return s ? `<button class="linkish" type="button" data-sp="${esc(s.id)}">${esc(spName(s))}</button>` : ''; };
const IUCN = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'DD'];
const spInfo = s => (s && s.info) || {};
const spGroup = s => spInfo(s).group === 'mammal' ? 'mammal' : 'bird';
const spPhoto = s => { const p = spInfo(s).photo; return p && /^https:\/\//.test(p.src || '') ? p : null; };
const spLocked = s => { const l = spInfo(s).locked; return Array.isArray(l) ? l : []; };
const lockMark = on => on ? `<span class="lk-i" title="${esc(t('lk_t'))}" aria-label="${esc(t('lk_t'))}">${ic('lock', 14, 2.2)}</span>` : '';
// the main photo of a species: {wiki} or {dept: photo row}, chosen with info.main
function spMain(s) {
  const wk = spPhoto(s), dp = photosOf('species', s.id), m = spInfo(s).main;
  if (m && m !== 'wiki') { const p = dp.find(x => x.id === m); if (p) return {dept: p}; }
  if (wk) return {wiki: wk};
  return dp[0] ? {dept: dp[0]} : null;
}
const iucnBadge = (c, long) => IUCN.includes(c) ? `<span class="iucn iucn-${c}" title="${esc(t('iucn_t') + ' ' + c + ' — ' + t('iucn_' + c))}"><b>${c}</b>${long ? `<span>${esc(t('iucn_' + c))}</span>` : ''}</span>` : '';
const SI_WILD = [['range', 'globe'], ['habitat', 'tree'], ['diet_wild', 'leaf'], ['behaviour', 'eye'], ['breeding', 'egg']];
const SI_ZOO = [['diet_zoo', 'bowl'], ['husbandry', 'home'], ['health', 'heart'], ['sex', 'sex']];
const enclTile = (x, sm) => { const [i, tone] = EK_IC[x ? x.kind : 'other']; return `<span class="tile${sm ? ' sm' : ''} t-${x && !x.active ? 'grey' : tone}">${ic(i, sm ? 18 : 24)}</span>`; };
const enclLink = n => { const x = n && enclByName.get(key(n)); return x ? `<button class="linkish" type="button" data-ec="${esc(x.id)}">${esc(dn(x))}</button>` : esc(n || ''); };
// places can sit inside other places: building › room › enclosure
const kidsOf = id => encls.filter(x => x.parent === id && x.parent !== x.id);
const pathOf = x => { const out = [], seen = new Set(); let p = x && enclMap.get(x.parent); while (p && !seen.has(p.id)) { seen.add(p.id); out.unshift(p); p = enclMap.get(p.parent); } return out; };
const descOf = x => { const out = [], seen = new Set([x.id]), stack = [x.id]; while (stack.length) { for (const c of kidsOf(stack.pop())) if (!seen.has(c.id)) { seen.add(c.id); out.push(c); stack.push(c.id); } } return out; };
const pathText = x => pathOf(x).map(p => p.name).concat(x.name).join(' › ');
const enclPath = n => { const x = n && enclByName.get(key(n)); return x ? pathOf(x).map(p => `<button class="linkish" type="button" data-ec="${esc(p.id)}">${esc(dn(p))}</button> › `).join('') + enclLink(n) : esc(n || ''); };
const INDENT = d => String.fromCharCode(160).repeat(3 * d);
const byPlace = (a, b) => EK.indexOf(a.kind) - EK.indexOf(b.kind) || a.name.localeCompare(b.name, LOCALE[lang], {numeric: true});
// places in tree order with depth; roots are places without a (shown) parent
function treeOrder(list) {
  const ids = new Set(list.map(x => x.id)), out = [], seen = new Set();
  const walk = (x, d) => { if (seen.has(x.id)) return; seen.add(x.id); out.push([x, d]); list.filter(c => c.parent === x.id).sort(byPlace).forEach(c => walk(c, d + 1)); };
  list.filter(x => !x.parent || !ids.has(x.parent)).sort(byPlace).forEach(x => walk(x, 0));
  list.filter(x => !seen.has(x.id)).forEach(x => walk(x, 0));
  return out;
}
// where an animal is now: the latest of its card's enclosure and its latest transfer record
const placeOf = cb => { const b = (st && st.birds.get(key(cb.name))) || {}; return b.encl && b.enclAt >= cb.enclAt ? {name: b.encl, at: b.enclAt} : {name: cb.encl, at: cb.enclAt}; };
const incubDays = spId => toN(spInfo(spById(spId)).incub_days);
const sexText = s => s === 'f' ? t('sex_f') : s === 'm' ? t('sex_m') : '';
const authorName = id => { const p = profiles.get(id); return p ? (p.display_name || p.login) : ''; };
const roleText = r => t('role_' + r);

function compute() {
  const birds = new Map();
  for (const r of [...recs].sort((a, b) => a.at - b.at)) {
    const k = key(r.bird);
    if (!k) continue;
    let b = birds.get(k);
    if (!b) { b = {name: r.bird.trim(), sp: '', treat: null, inc: null, eggs: 0, chicks: 0}; birds.set(k, b); }
    if (r.sp) b.sp = r.sp;
    const n = r.f.n || 1;
    switch (r.type) {
      case 'tstart': b.treat = {since: r.at, drug: r.f.drug || '', reason: r.f.reason || '', last: null}; break;
      case 'tdose': if (b.treat) b.treat.last = r.at; break;
      case 'tend': b.treat = null; break;
      case 'expo': if (r.f.to) { b.encl = r.f.to; b.enclAt = r.at; } break;
      case 'lay': b.eggs += n; break;
      case 'incub': b.inc = {since: r.at}; break;
      case 'hatch': b.inc = null; b.chicks += n; b.eggs = Math.max(0, b.eggs - n); break;
      case 'fledge': b.chicks = Math.max(0, b.chicks - n); break;
    }
  }
  for (const cb of coll) { const b = birds.get(key(cb.name)); if (b && cb.sp) b.sp = cb.sp; }
  const all = [...birds.values()];
  return {birds, treat: all.filter(b => b.treat), inc: all.filter(b => b.inc), chickBirds: all.filter(b => b.chicks > 0),
    chicks: all.reduce((s, b) => s + b.chicks, 0)};
}

function details(r) {
  const f = r.f;
  switch (r.type) {
    case 'expo': return (f.from ? enDn(f.from) + ' → ' : '→ ') + enDn(f.to || '');
    case 'tstart': return [f.reason, f.drug, f.days ? t('d_course', f.days) : ''].filter(Boolean).join(' · ');
    case 'tdose': return f.drug || '';
    case 'tend': return f.result || '';
    case 'lay': return t('d_eggs', f.n || 1);
    case 'incub': return f.days ? t('d_incub', f.days, fDay.format(r.at + f.days * 864e5)) : '';
    case 'hatch': case 'fledge': return t('d_chicks', f.n || 1);
    default: return '';
  }
}
function occupancy() {
  const occ = new Map(), add = (n, item) => { const k = key(n); if (!k) return; if (!occ.has(k)) occ.set(k, []); occ.get(k).push(item); };
  for (const cb of coll) if (cb.status !== 'out') { const pl = placeOf(cb); if (pl.name) add(pl.name, {name: cb.name, sp: cb.sp, cb, since: pl.at}); }
  for (const b of st.birds.values()) if (!collByName.has(key(b.name)) && b.encl) add(b.encl, {name: b.name, sp: b.sp, cb: null, since: b.enclAt});
  return occ;
}
const occOf = x => (st && st.occ && st.occ.get(key(x.name))) || [];
const stat = b => [b.treat ? t('c_treat') : '', b.inc ? t('st_inc') : '', b.chicks ? t('in_nest', b.chicks) : ''].filter(Boolean).join(' · ') || t('st_none');

/* ---------- photos: signed links, thumbnails, lightbox ---------- */
const urlCache = new Map();
async function ensureUrls(paths) {
  const now = Date.now(), need = [...new Set(paths)].filter(p => { const c = urlCache.get(p); return !c || c.exp < now + 60e3; });
  for (let i = 0; i < need.length; i += 100) {
    const {data, error} = await sb.storage.from(BUCKET).createSignedUrls(need.slice(i, i + 100), 3600);
    if (error || !data) continue;
    for (const d of data) if (d.signedUrl) urlCache.set(d.path, {url: d.signedUrl, exp: now + 3500e3});
  }
}
function paintPhotos(root = document) {
  if (!sb) return;
  const els = $$('img[data-path]', root).filter(e => !e.getAttribute('src'));
  if (!els.length) return;
  ensureUrls(els.map(e => e.dataset.path)).then(() => els.forEach(e => { const c = urlCache.get(e.dataset.path); if (c) e.src = c.url; })).catch(() => {});
}
const thumbImg = p => `<img data-path="${esc(thumbOf(p.path))}" alt="" loading="lazy">`;
const thumbs = list => {
  if (!list.length) return '';
  const more = list.length - 3;
  return `<span class="thumbs">${list.slice(0, 3).map(thumbImg).join('')}${more > 0 ? `<span class="more">+${more}</span>` : ''}</span>`;
};
const gallery = list => list.length ? `<div class="pgrid gallery">${list.map(p => `<div class="ph"><button type="button" class="ph-open" data-lb="${esc(p.path)}" aria-label="${esc(t('open_photo'))}">${thumbImg(p)}</button></div>`).join('')}</div>` : '';
function openLightbox(path) {
  const lb = $('#lightbox'), img = $('#lb-img');
  img.removeAttribute('src'); img.dataset.path = path;
  lb.hidden = false;
  const c = urlCache.get(path);
  if (c && c.exp > Date.now()) img.src = c.url; else paintPhotos(lb);
  setTimeout(() => $('[data-lb-close]').focus({preventScroll: true}), 30);
}
const closeLightbox = () => { $('#lightbox').hidden = true; $('#lb-img').removeAttribute('src'); };

async function shrink(file, max, quality) {
  let src = null;
  try { src = await createImageBitmap(file, {imageOrientation: 'from-image'}); }
  catch (x) {
    src = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(file); });
  }
  const w0 = src.width || src.naturalWidth, h0 = src.height || src.naturalHeight, k = Math.min(1, max / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(src, 0, 0, w, h);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', quality));
  if (!blob) throw new Error('encode');
  return {blob, w, h};
}

// a photo field inside a form: existing photos, new ones waiting to be uploaded, removals
// opts (species only): main = id of the main photo or 'wiki'; wiki() = current Wikipedia photo; onWikiRm(); lockMain() = main photo is protected
function photoBox(boxId, ownerType, ownerId, editable, opts) {
  const box = $('#' + boxId), o = opts || null;
  const st2 = {ownerType, ownerId, keep: ownerId ? photosOf(ownerType, ownerId).slice() : [], removed: [], added: [], busy: 0, main: o ? o.main || '' : ''};
  const star = id => {
    if (!o) return '';
    const on = mainOf(st2, o.wiki()) === id, can = editable && !o.lockMain();
    return on ? `<span class="ph-star on" title="${esc(t('ph_is_main'))}">${ic('star', 16, 2.2)}</span>`
      : can ? `<button type="button" class="ph-star" data-star="${esc(id)}" aria-label="${esc(t('ph_main'))}" title="${esc(t('ph_main'))}">${ic('star', 16, 2.2)}</button>` : '';
  };
  const draw = () => {
    const wk = o && o.wiki(), show = editable || st2.keep.length || wk;
    box.hidden = !show;
    if (!show) { box.innerHTML = ''; return; }
    box.innerHTML = `<span class="lbl">${esc(o ? t('ph_all') : t('photos'))}</span><div class="pgrid">`
      + (wk ? `<div class="ph"><button type="button" class="ph-open" data-lbu="${esc(wk.src)}" aria-label="${esc(t('open_photo'))}"><img src="${esc(wk.thumb || wk.src)}" alt=""></button><span class="ph-tag">${esc(t('ph_wiki'))}</span>${star('wiki')}${editable && !o.lockMain() ? `<button type="button" class="ph-x" data-rmw aria-label="${esc(t('ph_wiki_rm'))}">${ic('x', 18, 2.4)}</button>` : ''}</div>` : '')
      + st2.keep.map(p => `<div class="ph"><button type="button" class="ph-open" data-lb="${esc(p.path)}" aria-label="${esc(t('open_photo'))}">${thumbImg(p)}</button>${star(p.id)}${editable && canRmPhoto(p) && !(o && o.lockMain() && mainOf(st2, wk) === p.id) ? `<button type="button" class="ph-x" data-rmk="${esc(p.id)}" aria-label="${esc(t('rm_photo'))}">${ic('x', 18, 2.4)}</button>` : ''}</div>`).join('')
      + st2.added.map(a => `<div class="ph"><img src="${a.url}" alt="">${star(a.id)}<button type="button" class="ph-x" data-rma="${a.key}" aria-label="${esc(t('rm_photo'))}">${ic('x', 18, 2.4)}</button></div>`).join('')
      + (editable ? `<label class="ph-add"><input class="vh" type="file" accept="image/*" multiple>${ic('plus', 22, 2.2)}<span>${esc(t('add_photo'))}</span></label>` : '')
      + `</div>`;
    paintPhotos(box);
  };
  st2.redraw = draw;
  box.onclick = e => {
    const k = e.target.closest('[data-rmk]'), a = e.target.closest('[data-rma]'), sr = e.target.closest('[data-star]'), rw = e.target.closest('[data-rmw]');
    if (sr) { e.preventDefault(); st2.main = sr.dataset.star; draw(); }
    else if (rw) { if (st2.main === 'wiki') st2.main = ''; o.onWikiRm(); draw(); }
    else if (k) { const i = st2.keep.findIndex(p => p.id === k.dataset.rmk); if (i >= 0) st2.removed.push(st2.keep.splice(i, 1)[0]); draw(); }
    else if (a) { const i = st2.added.findIndex(x => x.key === a.dataset.rma); if (i >= 0) { URL.revokeObjectURL(st2.added[i].url); st2.added.splice(i, 1); } draw(); }
  };
  box.onchange = async e => {
    const inp = e.target.closest('input[type=file]');
    if (!inp || !inp.files || !inp.files.length) return;
    const files = [...inp.files];
    for (const f of files) {
      st2.busy++;
      try {
        const full = await shrink(f, 1600, 0.82), th = await shrink(full.blob, 360, 0.78);
        st2.added.push({key: uuid(), id: uuid(), full: full.blob, thumb: th.blob, w: full.w, h: full.h, url: URL.createObjectURL(th.blob)});
      } catch (x) { toast(t('e_photo_read')); }
      finally { st2.busy--; }
    }
    draw();
  };
  draw();
  return st2;
}
async function commitPhotos(st2, ownerId) {
  if (!st2) return 0;
  let failed = 0;
  for (const p of st2.removed) {
    try { await sb.storage.from(BUCKET).remove([p.path, thumbOf(p.path)]); must(await sb.from('photos').delete().eq('id', p.id)); photos = photos.filter(x => x.id !== p.id); }
    catch (x) { failed++; }
  }
  for (const a of st2.added) {
    try {
      const id = a.id || uuid(), path = me + '/' + id + '.jpg';
      must(await sb.storage.from(BUCKET).upload(path, a.full, {contentType: 'image/jpeg', upsert: false}));
      must(await sb.storage.from(BUCKET).upload(thumbOf(path), a.thumb, {contentType: 'image/jpeg', upsert: false}));
      const row = must(await sb.from('photos').insert({id, owner_type: st2.ownerType, owner_id: ownerId, path, width: a.w, height: a.h, created_by: me}).select().single());
      photos.push(fromPhoto(row));
      urlCache.set(thumbOf(path), {url: a.url, exp: Date.now() + 3600e3});
    } catch (x) { failed++; }
  }
  st2.added = []; st2.removed = [];
  return failed;
}
async function dropPhotosOf(type, id) {
  const list = photosOf(type, id).filter(canRmPhoto);
  if (!list.length) return;
  try { await sb.storage.from(BUCKET).remove(list.flatMap(p => [p.path, thumbOf(p.path)])); } catch (x) {}
}

/* ---------- render ---------- */
const card = (r, full) => {
  const tp = T[r.type], d = details(r), s = spById(r.sp), au = r.by ? authorName(r.by) : '';
  return `<button class="rec" type="button" data-edit="${esc(r.id)}"><span class="tile sm t-${tp.tone}">${ic(tp.icon, 18)}</span><span class="rb"><span class="rh"><b>${esc(evLabel(r.type))}</b><time>${full ? when(r.at) : fTime.format(r.at)}</time></span><span class="bird">${esc(bn(r.bird))}${s ? ` <span class="spn">· ${esc(spName(s))}</span>` : ''}</span>${d ? `<span class="det">${esc(d)}</span>` : ''}${r.note ? `<span class="note">${esc(r.note)}</span>` : ''}${thumbs(photosOf('record', r.id))}${au ? `<span class="by">${esc(t('author') + au)}</span>` : ''}</span></button>`;
};

function renderNow() {
  const sec = (id, tone, icon, title, items, empty) =>
    `<section class="nsec" id="${id}"><h2 class="nh"><span class="tile sm t-${tone}">${ic(icon, 18)}</span>${esc(title)}<span class="nc">${items.length}</span></h2>${items.length ? items.join('') : `<p class="empty">${esc(empty)}</p>`}</section>`;
  const b2 = (type, b, txt, ghost) => `<button class="mini w-only${ghost ? ' ghost' : ''}" type="button" data-new="${type}" data-bird="${esc(b.name)}">${esc(txt)}</button>`;
  const treat = st.treat.map(b => `<div class="ncard"><div class="nl">${nm(b)}${spLink(b)}<small>${esc([t('since', fDay.format(b.treat.since)), b.treat.drug].filter(Boolean).join(' · '))}</small><small>${esc(b.treat.last ? t('last_dose', when(b.treat.last)) : t('no_dose'))}</small></div><div class="na">${b2('tdose', b, t('b_dose'))}${b2('tend', b, t('b_end'), 1)}</div></div>`);
  const inc = st.inc.map(b => `<div class="ncard"><div class="nl">${nm(b)}${spLink(b)}<small>${esc(t('since', fDay.format(b.inc.since)) + (b.eggs ? ' · ' + t('eggs_n', b.eggs) : ''))}</small></div><div class="na">${b2('hatch', b, evLabel('hatch'))}</div></div>`);
  const ch = st.chickBirds.map(b => `<div class="ncard"><div class="nl">${nm(b)}${spLink(b)}<small>${esc(t('in_nest', b.chicks))}</small></div><div class="na">${b2('fledge', b, evLabel('fledge'))}</div></div>`);
  const today = recs.filter(r => isToday(r.at)).sort((a, b) => b.at - a.at).map(r => card(r));
  $('#now-body').innerHTML =
    sec('sec-treat', 'red', 'cross', t('n_treat'), treat, t('e_treat')) +
    sec('sec-inc', 'amber', 'egg', t('n_inc'), inc, t('e_inc')) +
    sec('sec-chick', 'blue', 'chick', t('n_chick'), ch, t('e_chick')) +
    sec('sec-today', 'green', 'book', t('n_today'), today, t('e_today'));
}

function renderLogs() {
  const list = recs.filter(r => (filt === 'all' || T[r.type].g === filt) && (!q || matchQ(r))).sort((a, b) => b.at - a.at);
  if (!list.length) { $('#logs-body').innerHTML = `<p class="empty" style="margin-top:16px">${esc(recs.length ? t('none_found') : t('logs_empty'))}</p>`; return; }
  let h = '', last = '';
  for (const r of list.slice(0, 500)) {
    const k = dayKey(r.at);
    if (k !== last) { h += `<h2 class="day">${esc(dayTitle(r.at))}</h2>`; last = k; }
    h += card(r);
  }
  $('#logs-body').innerHTML = h;
}

function fillBirds(spId) {
  const ok = sp => !spId || spId === '__new' || sp === spId, names = new Map();
  coll.filter(b => b.status !== 'out' && ok(b.sp)).forEach(b => names.set(key(b.name), dn(b)));
  if (st) for (const b of st.birds.values()) if (ok(b.sp) && !names.has(key(b.name))) names.set(key(b.name), b.name);
  $('#birds').innerHTML = [...names.values()].map(n => `<option value="${esc(n)}"></option>`).join('');
}

function renderSpecies() {
  const n = species.length;
  $('#sp-count').textContent = n ? t('sp_count', n) : t('sp_count0');
  const cnt = g => species.filter(x => g === 'all' || spGroup(x) === g).length;
  $('#sg-chips').innerHTML = ['all', 'bird', 'mammal'].filter(g => g === 'all' || cnt(g)).map(g =>
    `<button class="chip" type="button" data-sg="${g}" aria-pressed="${sg === g}">${esc(t('sg_' + g))} <span class="chip-n">${cnt(g)}</span></button>`).join('');
  $('#sg-chips').hidden = cnt('mammal') === 0 || cnt('bird') === 0;
  const list = species.filter(s => (sg === 'all' || spGroup(s) === sg)
    && (!sq || spNames(s).concat(spInfo(s).syn || []).some(v => key(v).includes(sq)))).sort(bySp);
  $('#species-body').innerHTML = list.length ? list.map(s => {
    const nb = coll.filter(b => b.sp === s.id && b.status !== 'out').length, main = spName(s), mp = spMain(s);
    const th = mp && mp.wiki ? `<img src="${esc(mp.wiki.thumb || mp.wiki.src)}" alt="" loading="lazy">` : mp ? thumbImg(mp.dept) : ic(spGroup(s) === 'mammal' ? 'paw' : 'bird', 26);
    return `<button class="row sp-row" type="button" data-sp="${esc(s.id)}"><span class="sp-thumb">${th}</span><span class="rt"><b>${esc(main)}</b>${s.latin && s.latin !== main ? `<small class="lat" lang="la">${esc(s.latin)}</small>` : ''}<small>${esc(nb ? t('in_coll', nb) : t('not_in_coll'))}</small></span>${iucnBadge(spInfo(s).iucn)}<span class="chev">${ic('chev', 20)}</span></button>`;
  }).join('') : `<p class="empty">${esc(n ? t('none_found') : t('sp_none'))}</p>`;
}

function renderSpCard() {
  const box = $('#sp-body');
  if (!curSp) { box.innerHTML = ''; return; }
  const s = spById(curSp);
  if (!s) { box.innerHTML = backBtn('sp') + `<h1>${esc(t('sp_deleted'))}</h1><p class="lead">${esc(t('sp_deleted_p'))}</p>`; return; }
  const inf = spInfo(s), ph = spPhoto(s), grp = spGroup(s);
  const birds = [...st.birds.values()].filter(b => b.sp === s.id).sort(byName);
  const nt = birds.filter(b => b.treat).length, ni = birds.filter(b => b.inc).length, nc = birds.reduce((a, b) => a + b.chicks, 0);
  const rs = recs.filter(r => r.sp === s.id).sort((a, b) => b.at - a.at);
  const cbs = coll.filter(b => b.sp === s.id).sort(byName), cnames = new Set(cbs.map(b => key(b.name)));
  const others = birds.filter(b => !cnames.has(key(b.name)));
  const bItems = cbs.map(cb => `<div class="ncard"><div class="nl"><button class="namelink" type="button" data-bc="${esc(cb.id)}">${esc(dn(cb))}</button><small>${esc([cb.status === 'out' ? t('st_out') : '', stat(st.birds.get(key(cb.name)) || {})].filter(Boolean).join(' · '))}</small></div></div>`)
    .concat(others.map(b => `<div class="ncard"><div class="nl"><b>${esc(b.name)}</b><small>${esc(stat(b) + ' · ' + t('not_in_coll_b'))}</small></div></div>`));
  const main = spName(s), txt = v => typeof v === 'string' ? v.trim() : '';
  const lk = spLocked(s), secCard = (k, icn, tone) => txt(inf[k]) ? `<article class="si-card"><h3><span class="tile sm t-${tone}">${ic(icn, 18)}</span>${esc(t('si_' + k))}${lockMark(lk.includes(k))}</h3><p>${esc(txt(inf[k]))}</p></article>` : '';
  const wild = SI_WILD.map(([k, i]) => secCard(k, i, 'green')).join('');
  const zoo = SI_ZOO.map(([k, i]) => secCard(k, i, k === 'health' ? 'red' : 'amber')).join('');
  const facts = [['si_tax', [txt(inf.order), txt(inf.family)].filter(Boolean).join(' · '), 'tag'], ['si_size', txt(inf.size), 'ruler'], ['si_life', txt(inf.life), 'clock'], ['si_incub', toN(inf.incub_days) ? t('si_incub_v', toN(inf.incub_days)) : '', 'egg']].filter(f => f[1]);
  const names = [['PL', s.pl, 'pl'], ['EN', s.en, 'en'], ['RU', s.name, 'ru']].filter(v => v[1]);
  const mp = spMain(s), dPhotos = photosOf('species', s.id);
  const wikiCap = ph && (ph.credit || ph.page) ? `<figcaption>${esc(t('si_photo_by') + (ph.credit || ''))}${ph.page ? ` · <a href="${esc(ph.page)}" target="_blank" rel="noopener">Wikimedia Commons</a>` : ''}</figcaption>` : '';
  const strip = (mp && mp.wiki ? [] : ph ? [`<button type="button" class="ph-open" data-lbu="${esc(ph.src)}" aria-label="${esc(t('open_photo'))}"><img src="${esc(ph.thumb || ph.src)}" alt=""></button>`] : [])
    .concat(dPhotos.filter(p => !(mp && mp.dept === p)).map(p => `<button type="button" class="ph-open" data-lb="${esc(p.path)}" aria-label="${esc(t('open_photo'))}">${thumbImg(p)}</button>`));
  const stripH = strip.length ? `<div class="sp-strip">${strip.join('')}</div>` : '';
  const photo = mp && mp.wiki
    ? `<figure class="sp-photo"><button type="button" class="ph-open" data-lbu="${esc(ph.src)}" aria-label="${esc(t('open_photo'))}"><img src="${esc(ph.src)}" alt="${esc(main)}"></button>${lockMark(lk.includes('photo'))}${wikiCap}${stripH}</figure>`
    : mp ? `<figure class="sp-photo"><button type="button" class="ph-open" data-lb="${esc(mp.dept.path)}" aria-label="${esc(t('open_photo'))}"><img data-path="${esc(mp.dept.path)}" alt="${esc(main)}"></button>${lockMark(lk.includes('photo'))}${stripH}</figure>`
    : `<figure class="sp-photo sp-photo-empty"><span>${ic(grp === 'mammal' ? 'paw' : 'bird', 44, 1.6)}</span><figcaption>${esc(t('si_no_photo'))}</figcaption></figure>`;
  const jump = [wild && 'si-wild', zoo && 'si-zoo', 'si-dept'].filter(Boolean);
  box.innerHTML = backBtn('sp') + `<div class="sp-head">${photo}<div class="sp-id">
<h1>${esc(main)}${lockMark(lk.includes('*'))}</h1>${s.latin && s.latin !== main ? `<p class="latin" lang="la">${esc(s.latin)}</p>` : ''}${txt(inf.syn) ? `<p class="sp-syn">${esc(t('si_syn'))}: <i lang="la">${esc(txt(inf.syn))}</i></p>` : ''}
${names.length ? `<dl class="sp-names">${names.map(([c, v, l]) => `<div><dt>${c}</dt><dd lang="${l}">${esc(v)}</dd></div>`).join('')}</dl>` : ''}
<div class="sp-badges">${iucnBadge(inf.iucn, true)}<span class="pill p-grey">${esc(t('sg_' + grp))}</span>${txt(inf.cites) ? `<span class="pill p-blue">${esc(t('si_cites') + ' ' + txt(inf.cites))}</span>` : ''}</div>
${facts.length ? `<dl class="sp-facts">${facts.map(([l, v, i]) => `<div><dt>${ic(i, 15)}${esc(t(l))}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
${lang !== 'ru' && (wild || zoo) ? `<p class="hint" style="margin-top:12px">${esc(t('si_note_lang'))}</p>` : ''}
</div></div>
${jump.length > 1 ? `<div class="chips sp-jump">${jump.map(j => `<button class="chip" type="button" data-jump="${j}">${esc(t(j.replace('-', '_')))}</button>`).join('')}</div>` : ''}
${wild ? `<section class="si-group" id="si-wild"><h2 class="si-gh">${esc(t('si_wild'))}</h2><div class="si-grid">${wild}</div></section>` : ''}
${zoo ? `<section class="si-group si-zoo" id="si-zoo"><h2 class="si-gh">${esc(t('si_zoo'))}</h2><div class="si-grid">${zoo}</div></section>` : ''}
<section class="si-group si-dept" id="si-dept"><h2 class="si-gh">${esc(t('si_dept'))}</h2>
<div class="stats"><div class="stat c-red"><b>${nt}</b><span class="l">${esc(t('c_treat'))}</span></div><div class="stat c-amber"><b>${ni}</b><span class="l">${esc(t('c_inc'))}</span></div><div class="stat c-blue"><b>${nc}</b><span class="l">${esc(pw(nc, 'chick'))}</span></div></div>
<div class="top-acts w-only"><button class="btn sec" type="button" data-sp-edit>${esc(t('edit_card'))}</button><button class="btn sec" type="button" data-bird-new>${esc(t('add_bird'))}</button></div>
${s.note ? `<article class="si-card si-notes"><h3><span class="tile sm t-blue">${ic('book', 18)}</span>${esc(t('si_notes'))}${lockMark(lk.includes('note'))}</h3><p>${esc(s.note)}</p></article>` : ''}
<section class="nsec"><h2 class="nh">${esc(t('birds_pairs'))}<span class="nc">${bItems.length}</span></h2>${bItems.length ? bItems.join('') : `<p class="empty">${esc(t('no_birds_sp'))}</p>`}</section>
<section class="nsec"><h2 class="nh">${esc(t('records'))}<span class="nc">${rs.length}</span></h2>${rs.length ? rs.slice(0, 50).map(r => card(r, true)).join('') : `<p class="empty">${esc(t('no_records'))}</p>`}</section>
</section>`;
}

function renderColl() {
  const act = coll.filter(b => b.status !== 'out').length;
  $('#coll-count').textContent = coll.length ? t('coll_count', act) : t('coll_count0');
  const sn = b => spName(spById(b.sp));
  const list = coll.filter(b => (cf === 'all' || (cf === 'out') === (b.status === 'out'))
      && (!cq || allNames(b).concat(b.ring, b.chip).concat(spById(b.sp) ? spNames(spById(b.sp)) : []).some(x => key(x).includes(cq))))
    .sort((a, b) => (sn(a) || '￿').localeCompare(sn(b) || '￿', LOCALE[lang]) || byName(a, b));
  if (!list.length) { $('#coll-body').innerHTML = `<p class="empty" style="margin-top:16px">${esc(coll.length ? t('none_found') : t('coll_empty'))}</p>`; return; }
  let h = '', last = null;
  for (const b of list) {
    const g = sn(b) || t('no_sp');
    if (g !== last) { h += `<h2 class="day">${esc(g)}</h2>`; last = g; }
    const sb2 = st.birds.get(key(b.name)) || {};
    const encl = placeOf(b).name;
    const sub = [sexText(b.sex), b.ring ? t('ring_n', b.ring) : '', enDn(encl)].filter(Boolean).join(' · ');
    const flags = [b.status === 'out' ? t('st_out') : '', sb2.treat ? t('c_treat') : '', sb2.inc ? t('st_inc') : '', sb2.chicks ? sb2.chicks + ' ' + pw(sb2.chicks, 'chick') : ''].filter(Boolean).join(' · ');
    const ph = photosOf('bird', b.id)[0];
    const tile = ph ? `<span class="tile t-green" style="overflow:hidden">${thumbImg(ph).replace('<img', '<img style="width:100%;height:100%;object-fit:cover"')}</span>` : `<span class="tile t-green">${ic('bird')}</span>`;
    h += `<button class="row" type="button" data-bc="${esc(b.id)}" style="margin-bottom:8px">${tile}<span class="rt"><b>${esc(dn(b))}</b>${sub ? `<small>${esc(sub)}</small>` : ''}${flags ? `<small>${esc(flags)}</small>` : ''}</span><span class="chev">${ic('chev', 20)}</span></button>`;
  }
  $('#coll-body').innerHTML = h;
}

function renderBirdCard() {
  const box = $('#bird-body');
  if (!curBird) { box.innerHTML = ''; return; }
  const cb = collMap.get(curBird);
  if (!cb) { box.innerHTML = backBtn('bird') + `<h1>${esc(t('bird_deleted'))}</h1><p class="lead">${esc(t('bird_deleted_p'))}</p>`; return; }
  const sb2 = st.birds.get(key(cb.name)) || {}, s = spById(cb.sp);
  const rs = recs.filter(r => key(r.bird) === key(cb.name)).sort((a, b) => b.at - a.at);
  const pl = placeOf(cb), encl = pl.name;
  const pill = (c, txt) => `<span class="pill ${c}">${esc(txt)}</span>`;
  const pills = [cb.status === 'out' ? pill('p-grey', t('st_out')) : '', sb2.treat ? pill('p-red', t('c_treat')) : '',
    sb2.inc ? pill('p-amber', t('st_inc')) : '', sb2.chicks ? pill('p-blue', t('in_nest', sb2.chicks)) : ''].join('');
  const fact = (l, v, raw) => v ? `<div><dt>${esc(t(l))}</dt><dd>${raw ? v : esc(v)}</dd></div>` : '';
  const n = esc(cb.name), main = spName(s);
  const enclDd = encl ? enclPath(encl) + (pl.at ? ` <small class="muted">· ${esc(t('en_since', fDate.format(pl.at)))}</small>` : '') : '';
  const other = otherNames(cb);
  box.innerHTML = backBtn('bird') + `<h1>${esc(dn(cb))}</h1>${other ? `<p class="sp-meta">${esc(other)}</p>` : ''}${s ? `<button class="linkish" type="button" data-sp="${esc(s.id)}">${esc(main)}${s.latin && s.latin !== main ? ' · ' + esc(s.latin) : ''}</button>` : `<p class="sp-meta">${esc(t('no_sp'))}</p>`}
${pills ? `<div class="pills">${pills}</div>` : ''}
${gallery(photosOf('bird', cb.id))}
<dl class="facts">${fact('fa_sex', cap(sexText(cb.sex)))}${fact('fa_ring', cb.ring)}${fact('fa_chip', cb.chip)}${fact('fa_encl', enclDd, 1)}${fact('fa_born', cb.born ? fDate.format(ymd(cb.born)) + age(cb.born) : '')}${fact('fa_arrived', cb.arrived ? fDate.format(ymd(cb.arrived)) : '')}${fact('fa_origin', cb.origin)}</dl>
${cb.note ? `<p class="sp-note">${esc(cb.note)}</p>` : ''}
<div class="top-acts w-only"><button class="btn sec" type="button" data-bird-edit>${esc(t('edit_card'))}</button></div>
<section class="nsec w-only"><h2 class="nh">${esc(t('add_title'))}</h2><div class="na">
<button class="mini ghost" type="button" data-new="obs" data-bird="${n}">${esc(evLabel('obs'))}</button>
<button class="mini ghost" type="button" data-new="expo" data-bird="${n}" data-from="${esc(encl || '')}">${esc(evLabel('expo'))}</button>
<button class="mini ghost" type="button" data-sheet="vet" data-preset="${n}">${esc(t('vet'))}</button>
<button class="mini ghost" type="button" data-sheet="breed" data-preset="${n}">${esc(t('breed'))}</button>
</div></section>
<section class="nsec"><h2 class="nh">${esc(t('history'))}<span class="nc">${rs.length}</span></h2>${rs.length ? rs.slice(0, 100).map(r => card(r, true)).join('') : `<p class="empty">${esc(t('no_hist'))}</p>`}</section>`;
}

function renderEncls() {
  const act = encls.filter(x => x.active);
  $('#encl-count').textContent = encls.length ? t('encl_count', act.length) : t('encl_count0');
  const cnt = k => k === 'off' ? encls.filter(x => !x.active).length : act.filter(x => k === 'all' || x.kind === k).length;
  if (ek !== 'all' && !cnt(ek)) ek = 'all';
  const chips = ['all'].concat(EK.filter(k => cnt(k)), cnt('off') ? ['off'] : []);
  $('#ek-chips').innerHTML = chips.map(k => `<button class="chip" type="button" data-ek="${k}" aria-pressed="${ek === k}">${esc(t('ek_' + k))} <span class="chip-n">${cnt(k)}</span></button>`).join('');
  $('#ek-chips').hidden = chips.length < 3;
  const list = encls.filter(x => (ek === 'off' ? !x.active : x.active && (ek === 'all' || x.kind === ek))
      && (!eq || allNames(x).concat(x.area, t('ek_' + x.kind)).concat(...pathOf(x).map(allNames)).some(v => key(v).includes(eq))))
    .sort(byPlace);
  if (!list.length) { $('#encls-body').innerHTML = `<p class="empty" style="margin-top:16px">${esc(encls.length ? t('none_found') : t('encl_empty'))}</p>`; return; }
  const tree = ek === 'all' && !eq, rows = tree ? treeOrder(list) : list.map(x => [x, 0]);
  let h = '';
  for (const [x, d] of rows) {
    const n = occOf(x).length, over = x.cap && n > x.cap, desc = descOf(x), all = n + desc.reduce((s, c) => s + occOf(c).length, 0);
    const where = tree ? '' : pathOf(x).map(dn).join(' › ');
    const sub = [t('ek_' + x.kind), where || x.area].filter(Boolean).join(' · ');
    const occ = desc.length ? [t('en_kids', kidsOf(x.id).length), t('en_total') + ': ' + t('en_n', all)].join(' · ')
      : n ? t('en_n', n) + (x.cap ? ' · ' + t('en_occ', n, x.cap) : '') : t('en_empty') + (x.cap ? ' · ' + t('en_occ', 0, x.cap) : '');
    h += `<button class="row${d ? ' en-sub' : ''}" type="button" data-ec="${esc(x.id)}" style="margin-bottom:8px${d ? `;margin-left:${Math.min(d, 4) * 20}px;width:calc(100% - ${Math.min(d, 4) * 20}px)` : ''}">${enclTile(x, d > 0)}<span class="rt"><b>${esc(dn(x))}</b>${sub ? `<small>${esc(sub)}</small>` : ''}<small${over ? ' class="warn-t"' : ''}>${esc(occ + (over ? ' · ' + t('en_full') : ''))}</small></span><span class="chev">${ic('chev', 20)}</span></button>`;
  }
  $('#encls-body').innerHTML = h;
}

function renderEnclCard() {
  const box = $('#encl-body');
  if (!curEncl) { box.innerHTML = ''; return; }
  const x = enclMap.get(curEncl);
  if (!x) { box.innerHTML = backBtn('encl') + `<h1>${esc(t('en_deleted'))}</h1><p class="lead">${esc(t('en_deleted_p'))}</p>`; return; }
  const desc = descOf(x), kids = kidsOf(x.id).sort(byPlace);
  const occ = occOf(x).concat(...desc.map(c => occOf(c).map(o => Object.assign({}, o, {at: c})))).sort((a, b) => (spName(spById(a.sp)) || '￿').localeCompare(spName(spById(b.sp)) || '￿', LOCALE[lang]) || a.name.localeCompare(b.name, LOCALE[lang]));
  const n = occ.length, over = x.cap && occOf(x).length > x.cap, k = key(x.name);
  const moves = recs.filter(r => r.type === 'expo' && (key(r.f.to) === k || key(r.f.from) === k)).sort((a, b) => b.at - a.at);
  const fact = (l, v) => v ? `<div><dt>${esc(t(l))}</dt><dd>${esc(v)}</dd></div>` : '';
  const pills = `<span class="pill p-grey">${esc(t('ek_' + x.kind))}</span>${x.active ? '' : `<span class="pill p-grey">${esc(t('en_off_pill'))}</span>`}${over ? `<span class="pill p-red">${esc(t('en_full'))}</span>` : ''}`;
  const items = occ.map(o => {
    const s = spById(o.sp), cb = o.cb;
    const nmh = cb ? `<button class="namelink" type="button" data-bc="${esc(cb.id)}">${esc(dn(cb))}</button>` : `<b>${esc(o.name)}</b>`;
    const sub = [cb ? sexText(cb.sex) : t('not_in_coll_b'), cb && cb.ring ? t('ring_n', cb.ring) : '', o.since ? t('en_since', fDay.format(o.since)) : ''].filter(Boolean).join(' · ');
    const here = o.at || x;
    return `<div class="ncard"><div class="nl">${nmh}${s ? `<button class="linkish" type="button" data-sp="${esc(s.id)}">${esc(spName(s))}</button>` : ''}${o.at ? `<small>${esc(t('en_in', ''))}<button class="linkish" type="button" data-ec="${esc(o.at.id)}">${esc(dn(o.at))}</button></small>` : ''}${sub ? `<small>${esc(sub)}</small>` : ''}</div><div class="na"><button class="mini ghost w-only" type="button" data-new="expo" data-bird="${esc(o.name)}" data-from="${esc(here.name)}">${esc(t('en_move'))}</button></div></div>`;
  });
  const crumbs = pathOf(x).map(p => `<button class="linkish" type="button" data-ec="${esc(p.id)}">${esc(dn(p))}</button>`).join(' › ');
  const kidRows = kids.map(c => { const m = occOf(c).length + descOf(c).reduce((a, z) => a + occOf(z).length, 0); return `<button class="row" type="button" data-ec="${esc(c.id)}" style="margin-bottom:8px">${enclTile(c, 1)}<span class="rt"><b>${esc(dn(c))}</b><small>${esc([t('ek_' + c.kind), kidsOf(c.id).length ? t('en_kids', kidsOf(c.id).length) : '', m ? t('en_n', m) : t('en_empty')].filter(Boolean).join(' · '))}</small></span><span class="chev">${ic('chev', 20)}</span></button>`; }).join('');
  box.innerHTML = backBtn('encl') + `${crumbs ? `<p class="en-crumbs">${crumbs} ›</p>` : ''}<div class="en-head">${enclTile(x)}<div><h1>${esc(dn(x))}</h1>${otherNames(x) ? `<p class="sp-meta">${esc(otherNames(x))}</p>` : ''}<div class="pills">${pills}</div></div></div>
${gallery(photosOf('encl', x.id))}
<dl class="facts">${fact('ef_area', x.area)}${fact('ef_size', x.size)}${fact('en_fill', x.cap ? t('en_occ', occOf(x).length, x.cap) : '')}${desc.length ? fact('en_total', t('en_n', n)) : ''}</dl>
${x.note ? `<p class="sp-note">${esc(x.note)}</p>` : ''}
<div class="top-acts w-only"><button class="btn sec" type="button" data-encl-edit>${esc(t('edit_card'))}</button>${x.active ? `<button class="btn sec" type="button" data-new="expo" data-to="${esc(x.name)}">${esc(t('en_move_here'))}</button>` : ''}</div>
${kids.length || ['building', 'room', 'aviary'].includes(x.kind) ? `<section class="nsec"><h2 class="nh">${esc(t('en_inside'))}<span class="nc">${kids.length}</span></h2>${kidRows || `<p class="empty">${esc(t('en_no_kids'))}</p>`}<button class="mini ghost w-only" type="button" data-encl-new data-parent="${esc(x.id)}" style="margin-top:4px">${esc('+ ' + t('en_add_inside'))}</button></section>` : ''}
<section class="nsec"><h2 class="nh">${esc(t('en_now'))}<span class="nc">${n}</span></h2>${n ? items.join('') : `<p class="empty">${esc(t('en_none'))}</p>`}</section>
<section class="nsec"><h2 class="nh">${esc(t('en_hist'))}<span class="nc">${moves.length}</span></h2>${moves.length ? moves.slice(0, 100).map(r => card(r, true)).join('') : `<p class="empty">${esc(t('en_nohist'))}</p>`}</section>`;
}

/* ---------- change log ---------- */
function logLine(x) {
  if (x.kind === 'dev') return x.summary;
  const what = x.entity === 'records' && x.extra && T[x.extra.type] ? evLabel(x.extra.type) + ' · ' + bn(x.label) : x.entity === 'photos' ? t('le_' + (x.extra && x.extra.owner ? 'photos' : 'photos')) : t('le_' + x.entity) + (x.label ? ' «' + (x.entity === 'collection' ? bn(x.label) : x.entity === 'enclosures' ? enDn(x.label) : x.label) + '»' : '');
  const f = (x.fields || []).map(k => t('lf_' + k) === 'lf_' + k ? k : t('lf_' + k)).filter((v, i, a) => a.indexOf(v) === i).join(', ');
  return t('lg_' + x.action) + ': ' + what + (x.action === 'update' && f ? ' — ' + f : '') + (x.summary ? ' — ' + x.summary : '');
}
function renderLog() {
  if (!$('#log-body')) return;
  $('#log-count').textContent = t('log_count', logRows.length);
  const cnt = k => logRows.filter(x => k === 'all' || x.kind === k).length;
  $('#lg-chips').innerHTML = ['all', 'user', 'dev'].map(k => `<button class="chip" type="button" data-lgf="${k}" aria-pressed="${lgf === k}">${esc(t('lg_' + k))} <span class="chip-n">${cnt(k)}</span></button>`).join('');
  const list = logRows.filter(x => lgf === 'all' || x.kind === lgf);
  if (!list.length) { $('#log-body').innerHTML = `<p class="empty">${esc(t('log_empty'))}</p>`; return; }
  let h = '', last = '';
  for (const x of list) {
    const k = dayKey(x.at);
    if (k !== last) { h += `<h2 class="day">${esc(dayTitle(x.at))}</h2>`; last = k; }
    const who = x.kind === 'dev' ? t('lg_dev_who') : x.actor ? authorName(x.actor) || '—' : t('lg_sys');
    h += `<div class="lg-row${x.kind === 'dev' ? ' dev' : ''}"><time>${esc(fTime.format(x.at))}</time><span class="lg-t"><b>${esc(who)}</b> ${esc(logLine(x))}</span>${isAdmin() ? `<button type="button" class="lg-del${logDelArmed === String(x.id) ? ' armed' : ''}" data-lg-del="${esc(x.id)}" aria-label="${esc(t('lg_del'))}">${logDelArmed === String(x.id) ? esc(t('lg_del2')) : ic('x', 16, 2.2)}</button>` : ''}</div>`;
  }
  $('#log-body').innerHTML = h;
}

/* ---------- calendar ---------- */
const DAY = 864e5;
const midnight = ms => { const d = new Date(ms); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
const dayDiff = (a, b) => Math.round((midnight(b) - midnight(a)) / DAY);
const CAL_DOT = ['lay', 'incub', 'hatch', 'fledge', 'tstart', 'tend', 'expo'];
// points are single events, bars are periods (incubation until hatching, a course of treatment)
function calItems() {
  const out = [], byBird = new Map();
  for (const r of recs) { const k = key(r.bird); if (!byBird.has(k)) byBird.set(k, []); byBird.get(k).push(r); }
  const nextOf = (r, type, until) => (byBird.get(key(r.bird)) || []).filter(x => x.type === type && x.at > r.at && x.at <= until).sort((a, b) => a.at - b.at)[0];
  for (const r of recs) {
    if (CAL_DOT.includes(r.type)) out.push({k: 'd:' + r.id, bar: 0, s: r.at, e: r.at, r, tone: T[r.type].tone, txt: bn(r.bird) + ', ' + t('cl_' + r.type)});
    if (r.type === 'incub') {
      const days = r.f.days || incubDays(r.sp);
      if (!days) continue;
      const exp = r.at + days * DAY, h = nextOf(r, 'hatch', exp + 21 * DAY), inc2 = nextOf(r, 'incub', exp);
      const end = h ? h.at : inc2 ? inc2.at : exp;
      out.push({k: 'i:' + r.id, bar: 1, s: r.at, e: end, r, tone: 'amber', pend: !h && !inc2, txt: bn(r.bird) + ', ' + (h ? t('cl_incub_done') : t('cl_incub_p', fDay.format(exp)))});
    }
    if (r.type === 'tstart' && r.f.days) {
      const exp = r.at + (r.f.days - 1) * DAY, en = nextOf(r, 'tend', exp + 60 * DAY);
      out.push({k: 't:' + r.id, bar: 1, s: r.at, e: en ? Math.min(en.at, Math.max(exp, r.at)) : exp, r, tone: 'red', pend: !en, txt: bn(r.bird) + ', ' + t('cl_treat_p') + (r.f.drug ? ' · ' + r.f.drug : '')});
    }
  }
  return out;
}
function renderCal() {
  if (!$('#cal-grid')) return;
  const L = LOCALE[lang], y = calM.getFullYear(), m = calM.getMonth();
  $('#cal-title').textContent = cap(new Intl.DateTimeFormat(L, {month: 'long', year: 'numeric'}).format(calM));
  const wd = new Intl.DateTimeFormat(L, {weekday: 'short'});
  $('#cal-dow').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(i => `<span>${esc(wd.format(new Date(2024, 0, 1 + i)))}</span>`).join('');
  const first = new Date(y, m, 1), start = new Date(y, m, 1 - (first.getDay() + 6) % 7).getTime();
  const last = new Date(y, m + 1, 0), weeks = Math.ceil((dayDiff(start, last.getTime()) + 1) / 7);
  const items = calItems(), dots = items.filter(i => !i.bar), bars = items.filter(i => i.bar), today = midnight(Date.now());
  let h = '';
  for (let w = 0; w < weeks; w++) {
    const ws = new Date(y, m, 1 - (first.getDay() + 6) % 7 + w * 7).getTime();
    const segs = bars.map(b => ({b, a: dayDiff(ws, b.s), z: dayDiff(ws, b.e)})).filter(g => g.z >= 0 && g.a <= 6).sort((p, q) => p.a - q.a || q.z - p.z);
    const lanes = [];
    for (const g of segs) { let l = lanes.findIndex(end => end < Math.max(0, g.a)); if (l < 0) { l = lanes.length; lanes.push(-1); } lanes[l] = Math.min(6, g.z); g.l = l; }
    const nl = Math.min(lanes.length, 4);
    let cells = '';
    for (let i = 0; i < 7; i++) {
      const dms = new Date(y, m, 1 - (first.getDay() + 6) % 7 + w * 7 + i).getTime(), dd = new Date(dms);
      const ds = dots.filter(x => midnight(x.s) === dms).sort((p, q) => p.s - q.s);
      const shown = ds.slice(0, ds.length > 4 ? 3 : 4);
      cells += `<div class="cd${dd.getMonth() !== m ? ' out' : ''}" style="grid-column:${i + 1};grid-row:1/span ${nl + 2}"></div><div class="cc${dd.getMonth() !== m ? ' out' : ''}${dms === today ? ' now' : ''}" style="grid-column:${i + 1};grid-row:1"><span class="cn">${dd.getDate()}</span><span class="cds">${shown.map(x => `<button type="button" class="cdot k-${x.tone}${calSel === x.k ? ' sel' : ''}" data-ci="${esc(x.k)}" aria-label="${esc(x.txt)}"></button>`).join('')}${ds.length > shown.length ? `<button type="button" class="cmore" data-ci="${esc('m:' + dms)}">${esc(t('cal_more', ds.length - shown.length))}</button>` : ''}</span></div>`;
    }
    const barsH = segs.filter(g => g.l < 4).map(g => `<button type="button" class="cbar k-${g.b.tone}${g.b.pend ? ' pend' : ''}${g.a < 0 ? ' cl' : ''}${g.z > 6 ? ' cr' : ''}${calSel === g.b.k ? ' sel' : ''}" data-ci="${esc(g.b.k)}" aria-label="${esc(g.b.txt)}" style="grid-column:${Math.max(0, g.a) + 1}/${Math.min(6, g.z) + 2};grid-row:${g.l + 2}"></button>`).join('');
    h += `<div class="cw" style="grid-template-rows:minmax(30px,auto)${' 13px'.repeat(nl)} 6px">${cells}${barsH}</div>`;
  }
  $('#cal-grid').innerHTML = h;
  const ms0 = first.getTime(), ms1 = new Date(y, m + 1, 1).getTime();
  const inMonth = items.filter(x => x.e >= ms0 && x.s < ms1).sort((p, q) => p.s - q.s || p.bar - q.bar);
  $('#cal-n').textContent = inMonth.length;
  $('#cal-list').innerHTML = inMonth.length ? inMonth.map(x => `<button class="row cal-row" type="button" data-co="${esc(x.k)}"><span class="cl-d">${esc(fDay.format(x.s))}${x.bar ? ' – ' + esc(fDay.format(x.e)) : ''}</span><span class="${x.bar ? 'cleg' : 'cdot'} k-${x.tone}${x.pend ? ' pend' : ''}"></span><span class="rt"><b>${esc(x.txt)}</b></span><span class="chev">${ic('chev', 18)}</span></button>`).join('') : `<p class="empty">${esc(t('cal_none'))}</p>`;
  const tip = $('#cal-tip'), sel = calSel && $(`#cal-grid [data-ci="${CSS.escape(calSel)}"]`);
  if (!sel) { tip.hidden = true; return; }
  const it = items.find(x => x.k === calSel);
  const txt = it ? esc(it.txt) : dots.filter(x => 'm:' + midnight(x.s) === calSel).map(x => esc(x.txt)).join('<br>');
  tip.innerHTML = `<b>${txt}</b>${it ? `<small>${esc(t('cal_tap2'))}</small>` : ''}`;
  tip.hidden = false;
  const box = $('.cal-box').getBoundingClientRect(), r = sel.getBoundingClientRect();
  tip.style.left = Math.max(4, Math.min(box.width - 244, r.left - box.left + r.width / 2 - 120)) + 'px';
  tip.style.top = (r.bottom - box.top + 6) + 'px';
}
// opens the animal card scrolled to the record (or the record itself when the animal has no card)
function openCalItem(k) {
  const it = calItems().find(x => x.k === k);
  if (!it) return;
  const r = it.r, cb = collByName.get(key(r.bird));
  calSel = '';
  if (!cb) { openForm(r.type, null, r); return; }
  openCard('bird', cb.id);
  requestAnimationFrame(() => { const el = $(`#bird-body [data-edit="${CSS.escape(r.id)}"]`); if (el) { el.scrollIntoView({block: 'center'}); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 2400); } });
}

function renderUsers() {
  const list = [...profiles.values()].sort((a, b) => (a.display_name || a.login).localeCompare(b.display_name || b.login, LOCALE[lang]));
  const act = list.filter(p => p.active).length;
  $('#users-count').textContent = t('users_count', act);
  $('#users-body').innerHTML = list.map(p => {
    const sub = [t('login_l') + ': ' + p.login, roleText(p.role), p.active ? '' : t('u_off'), p.id === me ? t('u_you') : ''].filter(Boolean).join(' · ');
    return `<button class="row" type="button" data-user="${esc(p.id)}"><span class="tile ${p.active ? 't-blue' : 't-grey'}">${ic('person')}</span><span class="rt"><b>${esc(p.display_name || p.login)}</b><small>${esc(sub)}</small></span><span class="chev">${ic('chev', 20)}</span></button>`;
  }).join('');
}

function renderAccount() {
  if (!myProfile) return;
  $('#acc-line').innerHTML = `<b>${esc(myProfile.display_name || myProfile.login)}</b><br>${esc(t('login_l') + ': ' + myProfile.login + ' · ' + roleText(myProfile.role))}`;
}

function openCard(kind, id) {
  if (tab !== kind) { if (backOf[tab] === kind) backOf[tab] = DEF_BACK[tab]; backOf[kind] = tab; }
  if (kind === 'sp') { curSp = id; renderSpCard(); } else if (kind === 'encl') { curEncl = id; renderEnclCard(); } else { curBird = id; renderBirdCard(); }
  setTab(kind);
}

function index() {
  spMap = new Map(species.map(s => [s.id, s]));
  collMap = new Map(coll.map(b => [b.id, b]));
  collByName = new Map(coll.map(b => [key(b.name), b]));
  enclMap = new Map(encls.map(x => [x.id, x]));
  enclByName = new Map(encls.map(x => [key(x.name), x]));
  photosByOwner = new Map();
  for (const p of [...photos].sort((a, b) => a.created - b.created)) {
    const k = p.ownerType + ':' + p.ownerId;
    if (!photosByOwner.has(k)) photosByOwner.set(k, []);
    photosByOwner.get(k).push(p);
  }
}

function render() {
  if (!myProfile) return;
  index();
  st = compute();
  st.occ = occupancy();
  $('#n-treat').textContent = st.treat.length;
  $('#n-inc').textContent = st.inc.length;
  $('#n-chick').textContent = st.chicks;
  $('#n-chick-l').textContent = pw(st.chicks, 'chick');
  const fs = $('#fld-sp');
  fillBirds(fs && $('#sheet-form.open') ? fs.value : '');
  renderNow();
  renderLogs();
  renderSpecies();
  renderSpCard();
  renderColl();
  renderBirdCard();
  renderEncls();
  renderEnclCard();
  renderCal();
  renderLog();
  renderUsers();
  renderAccount();
  paintPhotos();
}

/* ---------- ui ---------- */
let toastT = 0;
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600); }
function setStatus(k, kind) { statusKey = k; statusKind = kind; const s = $('#status'); s.hidden = !k; s.textContent = k ? t(k) : ''; s.className = 'status' + (kind === 'info' ? ' info' : ''); }

function applyStatic() {
  document.documentElement.lang = lang;
  document.title = t('app_title');
  $$('[data-t]').forEach(e => { e.textContent = t(e.dataset.t); });
  $$('[data-tp]').forEach(e => { e.placeholder = t(e.dataset.tp); });
  $$('[data-ta]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.ta)); });
  $$('[data-th]').forEach(e => { e.innerHTML = t(e.dataset.th); });
  $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  $('#now-date').textContent = fLong.format(Date.now());
  $('#gate-msg').textContent = t(gateKey);
  setStatus(statusKey, statusKind);
}
function setLang(l) {
  if (!DICT[l] || l === lang) return;
  lang = l;
  try { localStorage.setItem('zoo-log-lang2', l); } catch (x) {}
  $('#lg-err').textContent = ''; $('#claim-err').textContent = '';
  mkFmt(); applyStatic(); render();
}

const TAB_OF = {species: 'menu', sp: 'menu', coll: 'menu', bird: 'menu', users: 'menu', encls: 'menu', encl: 'menu', log: 'menu'};
function setTab(v) {
  tab = v;
  const hi = TAB_OF[v] || v;
  $$('.view').forEach(x => { x.hidden = x.id !== 'view-' + v; });
  $$('.tab').forEach(b => { const on = b.dataset.tab === hi; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  window.scrollTo(0, 0);
}

function hideSheet(s) { s.classList.remove('open'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('inert', ''); }
function openSheet(name) {
  const s = $('#sheet-' + name);
  if (!$('.sheet.open')) lastFocus = document.activeElement;
  $$('.sheet.open').forEach(x => { if (x !== s) hideSheet(x); });
  $('#overlay').classList.add('on');
  s.removeAttribute('inert'); s.setAttribute('aria-hidden', 'false'); s.classList.add('open'); s.scrollTop = 0;
  setTimeout(() => s.focus({preventScroll: true}), 40);
}
function closeSheets() {
  presetBird = null;
  $$('.sheet.open').forEach(hideSheet);
  $('#overlay').classList.remove('on');
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({preventScroll: true});
  lastFocus = null;
}

function field(f, val) {
  const id = f.id || 'fld-' + f.k, v = val == null ? '' : val;
  const lab = `<label for="${id}">${esc(t(f.l))}${f.req ? '&nbsp;<span class="req" aria-hidden="true">*</span>' : ''}</label>`;
  if (f.t === 'textarea') return `<div class="fld">${lab}<textarea id="${id}" name="${f.k}" rows="3"${f.req ? ' aria-required="true"' : ''}>${esc(v)}</textarea></div>`;
  return `<div class="fld">${lab}<input id="${id}" name="${f.k}" type="${f.t}"${f.list ? ` list="${f.list}" autocomplete="off"` : ''}${f.t === 'number' ? ` min="${f.min || 0}" inputmode="numeric"` : ''}${f.req ? ' aria-required="true"' : ''}${f.ph ? ` placeholder="${esc(t(f.ph))}"` : ''}${f.ac ? ` autocomplete="${f.ac}"` : ''}${f.dis ? ' disabled' : ''} value="${esc(v)}"></div>`;
}

function spSelect(val, p = 'fld') {
  const opts = species.slice().sort(bySp).map(s => `<option value="${esc(s.id)}"${s.id === val ? ' selected' : ''}>${esc(spName(s))}</option>`).join('');
  return `<div class="fld"><label for="${p}-sp">${esc(t('f_species'))}&nbsp;<span class="req" aria-hidden="true">*</span></label><select id="${p}-sp" name="sp" aria-required="true"><option value="">${esc(t('f_pick_sp'))}</option>${opts}<option value="__new">${esc(t('f_new_sp'))}</option></select></div>`
    + `<div class="fld" id="${p}-newsp-wrap" hidden><label for="${p}-newsp">${esc(t('f_new_sp_name'))}</label><input id="${p}-newsp" name="newsp" type="text" autocomplete="off"></div>`;
}

// a list of registered housing places, in tree order, with "+ new place" at the end
function enclSelect(f, val) {
  const id = f.id || 'fld-' + f.k, v = String(val || '').trim(), cur = v ? enclByName.get(key(v)) : null;
  const groups = treeOrder(encls.filter(x => x.active || x === cur)).map(([x, d]) =>
    `<option value="${esc(x.name)}"${x === cur ? ' selected' : ''}>${INDENT(d)}${esc(dn(x))} · ${esc(t('ek_' + x.kind))}</option>`).join('');
  const unreg = v && !cur ? `<option value="${esc(v)}" selected>${esc(v + t('encl_unreg'))}</option>` : '';
  return `<div class="fld"><label for="${id}">${esc(t(f.l))}${f.req ? '&nbsp;<span class="req" aria-hidden="true">*</span>' : ''}</label><select id="${id}" name="${f.k}" data-encl${f.req ? ' aria-required="true"' : ''}><option value="">${esc(t('encl_none_opt'))}</option>${unreg}${groups}<option value="__new">${esc(t('encl_new_opt'))}</option></select></div>`
    + `<div class="fld" id="${id}-new-wrap" hidden><label for="${id}-new">${esc(t('encl_new_name'))}</label><input id="${id}-new" name="${f.k}_new" type="text" autocomplete="off"></div>`;
}
function wireEnclSelects(root) {
  $$('select[data-encl]', root).forEach(sel => sel.addEventListener('change', () => {
    const w = $('#' + sel.id + '-new-wrap'); w.hidden = sel.value !== '__new'; if (!w.hidden) $('#' + sel.id + '-new').focus();
  }));
}
function setEnclSel(sel, name) {
  if (!sel || !name) return;
  if (![...sel.options].some(o => o.value === name)) { const o = document.createElement('option'); o.value = name; o.textContent = name + t('encl_unreg'); sel.insertBefore(o, sel.options[1] || null); }
  sel.value = name;
}
// reads a place picked in a form: {name} or {err}; "new" places are created on save by ensureEncl
function readEncl(fd, k) {
  const v = String(fd.get(k) || '').trim();
  if (v !== '__new') return {name: v};
  const n = String(fd.get(k + '_new') || '').trim();
  return n ? {name: n, fresh: true} : {err: t('e_new_encl')};
}
async function ensureEncl(name) {
  const ex = encls.find(x => key(x.name) === key(name));
  if (ex) return ex.name;
  const id = uuid();
  await putEncl(id, {name: name.trim(), kind: 'enclosure', area: '', size: '', cap: 0, active: true, note: ''}, true);
  return name.trim();
}

// "+ add a name" rows: a language picker and the name in that language
const nameRow = (l, v) => `<div class="nm-row"><select name="nl" aria-label="${esc(t('alt_lang'))}">${LANGS.map(o => `<option value="${o}"${o === l ? ' selected' : ''}>${LANG_NAME[o]}</option>`).join('')}</select><input name="nv" type="text" autocomplete="off" value="${esc(v || '')}" aria-label="${esc(t('alt_name'))}"><button type="button" class="x" data-nm-rm aria-label="${esc(t('alt_rm'))}">${ic('x', 18, 2.2)}</button></div>`;
const namesEditor = list => `<div class="fld nm-ed"><span class="lbl">${esc(t('alt_names'))}</span><div class="nm-rows">${(list || []).map(n => nameRow(n.l, n.v)).join('')}</div><button type="button" class="mini ghost" data-nm-add>${esc('+ ' + t('alt_add'))}</button><p class="hint">${esc(t('alt_hint'))}</p></div>`;
const readNames = fd => { const ls = fd.getAll('nl'), vs = fd.getAll('nv'), seen = new Set(); return vs.map((v, i) => ({l: String(ls[i] || ''), v: String(v || '').trim().slice(0, 120)})).filter(n => LANGS.includes(n.l) && n.v && !seen.has(n.l + key(n.v)) && seen.add(n.l + key(n.v))).slice(0, 12); };

function activeDrug(bird) { const b = st && st.birds.get(key(bird)); return b && b.treat ? b.treat.drug : ''; }

function openForm(type, pre, rec) {
  const tp = T[type];
  if (!tp) return;
  if (!rec && !canWrite()) return;
  const editable = rec ? canEditRec(rec) : true;
  curType = type; editing = rec || null; delArmed = false;
  $('#f-title').textContent = evLabel(type);
  $('#f-sub').textContent = rec ? t('f_edit') : t('f_new');
  const fi = $('#f-icon'); fi.className = 'tile t-' + tp.tone; fi.innerHTML = ic(tp.icon);
  const pre2 = Object.assign({}, pre || {});
  if (!pre2.bird && presetBird) pre2.bird = presetBird;
  if (pre2.bird) pre2.bird = bn(pre2.bird);
  const v = rec ? Object.assign({bird: bn(rec.bird), at: rec.at, note: rec.note, sp: rec.sp}, rec.f) : Object.assign({at: Date.now()}, pre2);
  if (!rec) {
    for (const f of tp.fields) if (v[f.k] == null && f.def != null) v[f.k] = f.def;
    if (type === 'tdose' && v.bird && !v.drug) v.drug = activeDrug(canonBird(v.bird));
    if (v.bird && !v.sp) v.sp = spOfBird(v.bird);
    if (type === 'incub' && v.days == null && incubDays(v.sp)) v.days = incubDays(v.sp);
    if (type === 'expo' && v.bird && !v.from) { const cb = collByName.get(key(canonBird(v.bird))); v.from = cb ? placeOf(cb).name : ((st && st.birds.get(key(v.bird))) || {}).encl || ''; }
  }
  let h = spSelect(v.sp) + field({k:'bird', l:'f_bird', t:'text', req:1, list:'birds'}, v.bird);
  for (const f of tp.fields) h += type === 'expo' ? enclSelect(f, v[f.k]) : field(f, v[f.k]);
  h += field({k:'at', l:'f_at', t:'datetime-local', req:1}, toInput(v.at));
  h += field({k:'note', l:tp.noteLabel || 'f_note', t:'textarea', req:tp.noteReq}, v.note);
  $('#f-fields').innerHTML = h;
  wireEnclSelects($('#f-fields'));
  $('#f-fs').disabled = !editable;
  $('#f-ro').hidden = editable;
  $('#f-save').hidden = !editable;
  $('#f-err').textContent = '';
  const del = $('#f-del'); del.hidden = !rec || !editable; del.textContent = t('del_rec');
  phRec = photoBox('f-ph', 'record', rec ? rec.id : null, editable);
  const bird = $('#fld-bird'), sel = $('#fld-sp'), wrap = $('#fld-newsp-wrap');
  const days = type === 'incub' && !rec ? $('#fld-days') : null;
  if (days) { days.dataset.auto = days.value ? '1' : ''; days.addEventListener('input', () => { days.dataset.auto = ''; }); }
  const autoDays = () => { if (days && (!days.value || days.dataset.auto) && incubDays(sel.value)) { days.value = incubDays(sel.value); days.dataset.auto = '1'; } };
  const syncSp = () => { wrap.hidden = sel.value !== '__new'; fillBirds(sel.value); autoDays(); };
  if (!species.length && !rec) sel.value = '__new';
  syncSp();
  sel.addEventListener('change', () => { syncSp(); if (sel.value === '__new') $('#fld-newsp').focus(); });
  bird.addEventListener('change', () => {
    const bs = spOfBird(bird.value);
    if (bs && (!sel.value || sel.value === '__new')) { sel.value = bs; syncSp(); } else autoDays();
    if (type === 'tdose') { const d = $('#fld-drug'); if (d && !d.value) d.value = activeDrug(canonBird(bird.value)); }
    if (type === 'expo') { const fr = $('#fld-from'), cb = collByName.get(key(canonBird(bird.value))); if (fr && !fr.value && cb) setEnclSel(fr, placeOf(cb).name); }
  });
  openSheet('form');
}

/* ---------- server calls ---------- */
const must = res => { if (res && res.error) throw res.error; return res ? res.data : null; };
const errMsg = e => {
  const c = e && (e.code || '');
  if (c === '42501' || c === 'PGRST301' || /row-level security|permission/i.test((e && e.message) || '')) return t('e_perm');
  if (c === '23505') return t('e_spdup');
  if (e && (e.name === 'TypeError' || /fetch|network/i.test(e.message || ''))) return t('e_net');
  return t('e_save');
};

async function fetchAll(table, order) {
  let out = [], from = 0;
  for (;;) {
    const rows = must(await sb.from(table).select('*').order(order, {ascending: true}).range(from, from + 999));
    out = out.concat(rows || []);
    if (!rows || rows.length < 1000) break;
    from += 1000;
  }
  return out;
}
const LOADERS = {
  records: async () => { recs = (await fetchAll('records', 'event_at')).map(fromRec).filter(Boolean); },
  species: async () => { species = (await fetchAll('species', 'created_at')).map(fromSp).filter(Boolean); },
  enclosures: async () => { encls = (await fetchAll('enclosures', 'created_at')).map(fromEncl).filter(Boolean); },
  collection: async () => { coll = (await fetchAll('collection', 'created_at')).map(fromBird).filter(Boolean); },
  photos: async () => { photos = (await fetchAll('photos', 'created_at')).map(fromPhoto); },
  change_log: async () => { logRows = (must(await sb.from('change_log').select('*').order('at', {ascending: false}).limit(1000)) || []).map(x => Object.assign({}, x, {at: ms(x.at)})); },
  profiles: async () => {
    const rows = await fetchAll('profiles', 'created_at');
    profiles = new Map(rows.map(p => [p.id, p]));
    const mine = profiles.get(me);
    if (mine) { myProfile = mine; applyRole(); }
    if (!mine || !mine.active) { sb.auth.signOut(); }
  }
};
async function loadAll() { await Promise.all(Object.values(LOADERS).map(f => f())); }

let pending = new Set(), reloadT = 0;
function scheduleReload(table) {
  if (!LOADERS[table]) return;
  pending.add(table);
  clearTimeout(reloadT);
  reloadT = setTimeout(async () => {
    const list = [...pending]; pending = new Set();
    try { await Promise.all(list.map(x => LOADERS[x]())); render(); } catch (x) { setStatus('e_net', 'warn'); }
  }, 400);
}
function subscribe() {
  if (channel) sb.removeChannel(channel);
  channel = sb.channel('journal')
    .on('postgres_changes', {event: '*', schema: 'public'}, p => scheduleReload(p.table))
    .subscribe(s => { if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('s_live_err', 'warn'); else if (s === 'SUBSCRIBED' && statusKey === 's_live_err') setStatus('', 'info'); });
}

async function putRec(id, r, isNew) {
  const row = isNew ? must(await sb.from('records').insert(Object.assign(toRec(r), {id, created_by: me})).select().single())
                    : must(await sb.from('records').update(toRec(r)).eq('id', id).select().single());
  const x = fromRec(row), i = recs.findIndex(y => y.id === id);
  if (i >= 0) recs[i] = x; else recs.push(x);
}
async function dropRec(id) {
  await dropPhotosOf('record', id);
  must(await sb.from('records').delete().eq('id', id));
  recs = recs.filter(x => x.id !== id); photos = photos.filter(p => !(p.ownerType === 'record' && p.ownerId === id));
}
async function putSp(id, s, isNew) {
  const row = isNew ? must(await sb.from('species').insert(Object.assign(toSp(s), {id, created_by: me})).select().single())
                    : must(await sb.from('species').update(toSp(s)).eq('id', id).select().single());
  const x = fromSp(row), i = species.findIndex(y => y.id === id);
  if (i >= 0) species[i] = x; else species.push(x);
}
async function dropSp(id) {
  await dropPhotosOf('species', id);
  must(await sb.from('species').delete().eq('id', id));
  species = species.filter(x => x.id !== id);
}
async function putBird(id, b, isNew) {
  const row = isNew ? must(await sb.from('collection').insert(Object.assign(toBird(b), {id, created_by: me})).select().single())
                    : must(await sb.from('collection').update(toBird(b)).eq('id', id).select().single());
  const x = fromBird(row), i = coll.findIndex(y => y.id === id);
  if (i >= 0) coll[i] = x; else coll.push(x);
}
async function dropBird(id) {
  await dropPhotosOf('bird', id);
  must(await sb.from('collection').delete().eq('id', id));
  coll = coll.filter(x => x.id !== id);
}
async function putEncl(id, x, isNew) {
  const row = isNew ? must(await sb.from('enclosures').insert(Object.assign(toEncl(x), {id, created_by: me})).select().single())
                    : must(await sb.from('enclosures').update(toEncl(x)).eq('id', id).select().single());
  const y = fromEncl(row), i = encls.findIndex(z => z.id === id);
  if (i >= 0) encls[i] = y; else encls.push(y);
  enclByName.set(key(y.name), y); enclMap.set(y.id, y);
}
async function dropEncl(id) {
  await dropPhotosOf('encl', id);
  must(await sb.from('enclosures').delete().eq('id', id));
  encls = encls.filter(x => x.id !== id);
}
async function ensureSpecies(newName) {
  const ex = findSpByAnyName(newName);
  if (ex) return ex.id;
  const id = uuid(), s = {name: '', latin: '', pl: '', en: '', note: ''};
  s[LANG_FIELD[lang]] = newName;
  await putSp(id, s, true);
  return id;
}
async function callAdmin(body) {
  const {data, error} = await sb.functions.invoke('admin-users', {body});
  if (error) {
    let code = 'save';
    try { const j = await error.context.json(); code = j.error || code; } catch (x) { if (/fetch|network/i.test(String(error.message))) code = 'net'; }
    throw {appCode: code};
  }
  return data;
}
const adminErr = e => ({bad_login: t('e_bad_login'), short_password: t('e_short_pass'), login_taken: t('e_login_taken'), self_lock: t('e_self_lock'),
  forbidden: t('e_perm'), unauthorized: t('e_perm'), net: t('e_net')})[e && e.appCode] || t('e_save');

async function withBusy(btn, fn) { btn.disabled = true; try { return await fn(); } finally { btn.disabled = false; } }

/* ---------- forms ---------- */
$('#form').addEventListener('submit', async e => {
  e.preventDefault();
  if (editing && !canEditRec(editing)) return;
  const tp = T[curType], fd = new FormData(e.target), err = m => { $('#f-err').textContent = m; };
  const spSel = String(fd.get('sp') || ''), newName = String(fd.get('newsp') || '').trim();
  if (!spSel) return err(t('e_pick_sp'));
  if (spSel === '__new' && !newName) return err(t('e_new_sp'));
  const bird = canonBird(String(fd.get('bird') || '').trim());
  if (!bird) return err(t('e_bird'));
  const at = fromInput(fd.get('at'));
  if (!isFinite(at)) return err(t('e_at'));
  const f = {}, fresh = [];
  for (const x of tp.fields) {
    let val = String(fd.get(x.k) || '').trim();
    if (curType === 'expo') { const pe = readEncl(fd, x.k); if (pe.err) return err(pe.err); val = pe.name; if (pe.fresh) fresh.push(x.k); }
    if (x.req && !val) return err(t('e_field', t(x.l)));
    if (val) f[x.k] = x.t === 'number' ? Math.max(x.min || 0, toN(val)) : val;
  }
  const note = String(fd.get('note') || '').trim();
  if (tp.noteReq && !note) return err(t('e_obs'));
  if (phRec && phRec.busy) return;
  await withBusy($('#f-save'), async () => {
    try {
      const r = {type: curType, sp: spSel, bird, at, f, note};
      if (spSel === '__new') r.sp = await ensureSpecies(newName);
      for (const k of fresh) r.f[k] = await ensureEncl(r.f[k]);
      const id = editing ? editing.id : uuid(), wasEdit = !!editing;
      await putRec(id, r, !wasEdit);
      if (phRec && (phRec.added.length || phRec.removed.length)) err(t('ph_saving'));
      const failed = await commitPhotos(phRec, id);
      closeSheets(); render();
      toast(failed ? t('e_photo', failed) : wasEdit ? t('t_updated') : t('t_saved'));
    } catch (x) { err(errMsg(x)); }
  });
});

$('#f-del').addEventListener('click', async () => {
  if (!editing || !canEditRec(editing)) return;
  if (!delArmed) { delArmed = true; $('#f-del').textContent = t('del_confirm'); return; }
  try { await dropRec(editing.id); closeSheets(); render(); toast(t('t_deleted')); }
  catch (x) { $('#f-err').textContent = errMsg(x); }
});

function openBirdForm(cb) {
  if (!canWrite()) return;
  editingBird = cb || null; birdDelArmed = false;
  $('#bf-title').textContent = cb ? t('bf_edit') : t('bf_new');
  $('#bf-sub').textContent = cb ? t('editing') : t('bf_sub_new');
  const v = cb || {sp: tab === 'sp' ? curSp : '', status: 'active'};
  const opt = (val, cur, label) => `<option value="${val}"${val === (cur || '') ? ' selected' : ''}>${esc(label)}</option>`;
  $('#bf-fields').innerHTML = field({k: 'name', l: 'bf_name', t: 'text', req: 1, id: 'bf-name'}, v.name) + namesEditor(v.names) + spSelect(v.sp, 'bf')
    + `<div class="fld"><label for="bf-sex">${esc(t('fa_sex'))}</label><select id="bf-sex" name="sex">${opt('', v.sex, t('sex_u'))}${opt('f', v.sex, cap(t('sex_f')))}${opt('m', v.sex, cap(t('sex_m')))}</select></div>`
    + field({k: 'ring', l: 'bf_ring', t: 'text', id: 'bf-ring'}, v.ring) + field({k: 'chip', l: 'bf_chip', t: 'text', id: 'bf-chip'}, v.chip)
    + field({k: 'born', l: 'fa_born', t: 'date', id: 'bf-born'}, v.born) + field({k: 'arrived', l: 'bf_arrived', t: 'date', id: 'bf-arrived'}, v.arrived)
    + field({k: 'origin', l: 'fa_origin', t: 'text', id: 'bf-origin', ph: 'bf_origin_ph'}, v.origin)
    + enclSelect({k: 'encl', l: 'fa_encl', id: 'bf-encl'}, cb ? placeOf(cb).name : (tab === 'encl' && enclMap.get(curEncl) ? enclMap.get(curEncl).name : ''))
    + `<div class="fld"><label for="bf-status">${esc(t('bf_status'))}</label><select id="bf-status" name="status">${opt('active', v.status, t('cf_active'))}${opt('out', v.status, t('st_out_opt'))}</select></div>`
    + field({k: 'note', l: 'bf_note', t: 'textarea', id: 'bf-note'}, v.note);
  wireEnclSelects($('#bf-fields'));
  const sel = $('#bf-sp'), wrap = $('#bf-newsp-wrap'), sync = () => { wrap.hidden = sel.value !== '__new'; };
  if (!species.length && !cb) sel.value = '__new';
  sync();
  sel.addEventListener('change', () => { sync(); if (sel.value === '__new') $('#bf-newsp').focus(); });
  $('#bf-err').textContent = '';
  const d = $('#bf-del'); d.hidden = !cb || !isAdmin(); d.textContent = t('del_card');
  phBird = photoBox('bf-ph', 'bird', cb ? cb.id : null, true);
  openSheet('bird');
}
$('#bird-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target), err = m => { $('#bf-err').textContent = m; }, g = k => String(fd.get(k) || '').trim();
  const name = g('name'), spSel = g('sp'), newName = g('newsp'), old = editingBird;
  if (!name) return err(t('e_bname'));
  if (!spSel) return err(t('e_pick_sp'));
  if (spSel === '__new' && !newName) return err(t('e_new_sp'));
  if (coll.some(x => key(x.name) === key(name) && (!old || x.id !== old.id))) return err(t('e_bdup'));
  if (phBird && phBird.busy) return;
  const pe = readEncl(fd, 'encl');
  if (pe.err) return err(pe.err);
  const date = k => /^\d{4}-\d{2}-\d{2}$/.test(g(k)) ? g(k) : '', now = Date.now(), encl = pe.name, cur = old ? placeOf(old).name : '';
  const b = {name, sp: spSel, sex: g('sex'), ring: g('ring'), chip: g('chip'), born: date('born'), arrived: date('arrived'), origin: g('origin'),
    encl: old && key(cur) === key(encl) ? old.encl : encl,
    enclAt: old && key(cur) === key(encl) ? old.enclAt : (encl ? Math.floor(now / 60000) * 60000 : 0), status: g('status') === 'out' ? 'out' : 'active', note: g('note'), names: readNames(fd)};
  await withBusy($('#bf-save'), async () => {
    try {
      if (spSel === '__new') b.sp = await ensureSpecies(newName);
      if (pe.fresh) b.encl = await ensureEncl(b.encl);
      const id = old ? old.id : uuid();
      await putBird(id, b, !old);
      if (phBird && (phBird.added.length || phBird.removed.length)) err(t('ph_saving'));
      const failed = await commitPhotos(phBird, id);
      if (old && (key(old.name) !== key(name) || old.sp !== b.sp)) await LOADERS.records();
      closeSheets();
      toast(failed ? t('e_photo', failed) : old ? t('t_card_upd') : t('t_bird_added'));
      openCard('bird', id);
      render();
    } catch (x) { err(x && x.code === '23505' ? t('e_bdup') : errMsg(x)); }
  });
});
$('#bf-del').addEventListener('click', async () => {
  if (!editingBird || !isAdmin()) return;
  if (!birdDelArmed) { birdDelArmed = true; $('#bf-del').textContent = t('del_card_confirm'); return; }
  try { await dropBird(editingBird.id); closeSheets(); render(); toast(t('t_card_del')); setTab('coll'); }
  catch (x) { $('#bf-err').textContent = errMsg(x); }
});

/* ---------- housing places ---------- */
function openEnclForm(x, parentId) {
  if (!canWrite()) return;
  editingEncl = x || null; enclDelArmed = false;
  $('#ef-title').textContent = x ? x.name : t('ef_new');
  $('#ef-sub').textContent = x ? t('editing') : t('ef_sub_new');
  const par = parentId ? enclMap.get(parentId) : null;
  const v = x || {kind: par ? ({building: 'room', room: 'enclosure'}[par.kind] || 'enclosure') : ek !== 'all' && ek !== 'off' ? ek : 'enclosure', active: true, parent: par ? par.id : ''};
  const banned = x ? new Set([x.id].concat(descOf(x).map(z => z.id))) : new Set();
  const parOpts = treeOrder(encls.filter(z => !banned.has(z.id) && (z.active || z.id === v.parent))).map(([z, d]) =>
    `<option value="${esc(z.id)}"${z.id === v.parent ? ' selected' : ''}>${INDENT(d)}${esc(dn(z))} · ${esc(t('ek_' + z.kind))}</option>`).join('');
  const opt = (val, cur, label) => `<option value="${val}"${val === cur ? ' selected' : ''}>${esc(label)}</option>`;
  $('#ef-fields').innerHTML = field({k: 'name', l: 'ef_name', t: 'text', req: 1, id: 'ef-name', ph: 'ef_name_ph', ac: 'off'}, v.name) + namesEditor(v.names)
    + `<div class="fld"><label for="ef-kind">${esc(t('ef_kind'))}</label><select id="ef-kind" name="kind">${EK.map(k => opt(k, v.kind, t('ek_' + k))).join('')}</select></div>`
    + `<div class="fld"><label for="ef-parent">${esc(t('ef_parent'))}</label><select id="ef-parent" name="parent"><option value="">${esc(t('ef_top'))}</option>${parOpts}</select></div>`
    + field({k: 'area', l: 'ef_area', t: 'text', id: 'ef-area', ph: 'ef_area_ph'}, v.area)
    + field({k: 'size', l: 'ef_size', t: 'text', id: 'ef-size', ph: 'ef_size_ph'}, v.size)
    + field({k: 'cap', l: 'ef_cap', t: 'number', id: 'ef-cap', min: 1}, v.cap || '')
    + (x ? `<div class="fld"><label for="ef-state">${esc(t('ef_state'))}</label><select id="ef-state" name="state">${opt('on', x.active ? 'on' : 'off', t('ef_on'))}${opt('off', x.active ? 'on' : 'off', t('ef_off'))}</select></div>` : '')
    + field({k: 'note', l: 'ef_note', t: 'textarea', id: 'ef-note'}, v.note);
  $('#ef-note').placeholder = t('ef_note_ph');
  $('#ef-err').textContent = '';
  const d = $('#ef-del'); d.hidden = !x || !isAdmin(); d.textContent = t('del_encl');
  phEncl = photoBox('ef-ph', 'encl', x ? x.id : null, true);
  openSheet('encl');
}
$('#encl-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target), err = m => { $('#ef-err').textContent = m; }, g = k => String(fd.get(k) || '').trim(), old = editingEncl;
  const name = g('name').replace(/\s+/g, ' ');
  if (!name) return err(t('e_ename'));
  if (encls.some(x => key(x.name) === key(name) && (!old || x.id !== old.id))) return err(t('e_edup'));
  if (phEncl && phEncl.busy) return;
  const x = {name, kind: EK.includes(g('kind')) ? g('kind') : 'other', area: g('area'), size: g('size'), cap: Math.min(10000, toN(g('cap'))),
    active: old ? g('state') !== 'off' : true, note: g('note'), parent: enclMap.has(g('parent')) ? g('parent') : '', names: readNames(fd)};
  if (old && x.parent && (x.parent === old.id || descOf(old).some(z => z.id === x.parent))) return err(t('e_cycle'));
  await withBusy($('#ef-save'), async () => {
    try {
      const id = old ? old.id : uuid();
      await putEncl(id, x, !old);
      if (phEncl && (phEncl.added.length || phEncl.removed.length)) err(t('ph_saving'));
      const failed = await commitPhotos(phEncl, id);
      if (old && old.name !== name) await Promise.all([LOADERS.collection(), LOADERS.records()]);
      closeSheets();
      toast(failed ? t('e_photo', failed) : old ? t('t_card_upd') : t('t_encl_added'));
      openCard('encl', id);
      render();
    } catch (y) { err(y && y.code === '23505' ? t('e_edup') : y && y.code === '23514' ? t('e_cycle') : errMsg(y)); }
  });
});
$('#ef-del').addEventListener('click', async () => {
  if (!editingEncl || !isAdmin()) return;
  const n = occOf(editingEncl).length, nk = kidsOf(editingEncl.id).length;
  if (!enclDelArmed) { enclDelArmed = true; $('#ef-del').textContent = n ? t('del_encl_n', n) : nk ? t('del_encl_kids', nk) : t('del_confirm'); return; }
  try { await dropEncl(editingEncl.id); if (nk) await LOADERS.enclosures(); closeSheets(); render(); toast(t('t_encl_del')); setTab('encls'); }
  catch (y) { $('#ef-err').textContent = errMsg(y); }
});

const SPF = ['name', 'latin', 'pl', 'en'];
const SIF = [['group', 'select', 'sf_group'], ['iucn', 'select', 'sf_iucn'], ['cites', 'text', 'si_cites'], ['order', 'text', 'sf_order'], ['family', 'text', 'sf_family'],
  ['syn', 'text', 'si_syn'], ['size', 'text', 'si_size'], ['life', 'text', 'si_life'], ['incub_days', 'number', 'sf_incub_days'], ['sex', 'textarea', 'si_sex'],
  ['range', 'textarea', 'si_range'], ['habitat', 'textarea', 'si_habitat'], ['diet_wild', 'textarea', 'si_diet_wild'], ['behaviour', 'textarea', 'si_behaviour'],
  ['breeding', 'textarea', 'si_breeding'], ['diet_zoo', 'textarea', 'si_diet_zoo'], ['husbandry', 'textarea', 'si_husbandry'], ['health', 'textarea', 'si_health'],
  ['photo.src', 'url', 'sf_photo'], ['photo.credit', 'text', 'sf_photo_credit'], ['photo.page', 'url', 'sf_photo_page']];
const sifId = k => 'sfi-' + k.replace('.', '-');
const dPhotoCount = () => phSp ? phSp.keep.length + phSp.added.length : 0;
const lockKey = k => k.startsWith('photo.') ? 'photo' : k;
// the "protect from AI" checkbox under a field; only an admin can tick or untick it or edit a protected field
const lockBox = (k, locked) => { const tt = esc(t(isAdmin() || !locked.includes(k) ? 'lk_one' : 'lk_ro')); return `<label class="lk" title="${tt}"><input class="vh" type="checkbox" name="lk" value="${esc(k)}" aria-label="${tt}"${locked.includes(k) ? ' checked' : ''}${isAdmin() ? '' : ' disabled'}>${ic('unlock', 18, 2.2)}${ic('lock', 18, 2.2)}</label>`; };
// the species name fields are columns, protected under these keys
const SP_LOCK = {latin: 'latin', name: 'name_ru', pl: 'name_pl', en: 'name_en'};
function infoFields(inf) {
  const opt = (val, cur, label) => `<option value="${val}"${val === (cur || '') ? ' selected' : ''}>${esc(label)}</option>`;
  const ph = inf.photo || {}, locked = Array.isArray(inf.locked) ? inf.locked : [];
  return SIF.map(([k, tp, l]) => {
    const id = sifId(k), v = k.startsWith('photo.') ? ph[k.slice(6)] : inf[k];
    let h;
    if (k === 'group') h = `<div class="fld"><label for="${id}">${esc(t(l))}</label><select id="${id}">${opt('bird', v || 'bird', t('sg_bird'))}${opt('mammal', v, t('sg_mammal'))}</select></div>`;
    else if (k === 'iucn') h = `<div class="fld"><label for="${id}">${esc(t(l))}</label><select id="${id}">${opt('', v, t('sf_iucn_none'))}${IUCN.map(c => opt(c, v, c + ' — ' + t('iucn_' + c))).join('')}</select></div>`;
    else h = field({k, l, t: tp, id, dis: !isAdmin() && locked.includes(lockKey(k))}, v == null ? '' : String(v));
    if (!isAdmin() && locked.includes(lockKey(k))) h = h.replace(/<(select|textarea) id=/, '<$1 disabled id=');
    return k.startsWith('photo.') && k !== 'photo.src' ? h : h.replace(/^<div class="fld">/, '<div class="fld has-lk">').replace(/<\/div>$/, lockBox(lockKey(k), locked) + '</div>');
  }).join('');
}
function readInfo(base) {
  const inf = JSON.parse(JSON.stringify(base || {})), ph = Object.assign({}, inf.photo || {});
  for (const [k] of SIF) {
    const v = ($('#' + sifId(k)).value || '').trim();
    if (k.startsWith('photo.')) { const pk = k.slice(6); if (pk === 'src' && v !== (ph.src || '')) delete ph.thumb; if (v) ph[pk] = v; else delete ph[pk]; }
    else if (v) inf[k] = v; else delete inf[k];
  }
  if (ph.src && /^https:\/\//.test(ph.src)) inf.photo = ph; else delete inf.photo;
  const lk = $$('#sp-form input[name=lk]:checked').map(x => x.value);
  if (lk.length) inf.locked = lk; else delete inf.locked;
  if (phSp) { const m = mainOf(phSp, inf.photo); if (m && (m !== 'wiki' || dPhotoCount() > 0)) inf.main = m; else delete inf.main; }
  return inf;
}
function openSpForm(s) {
  if (!canWrite()) return;
  editingSp = s || null; spDelArmed = false;
  $('#sp-f-title').textContent = s ? t('spf_edit') : t('spf_new');
  $('#sp-f-sub').textContent = s ? t('editing') : t('spf_sub_new');
  for (const k of SPF) $('#sp-' + k).value = s ? s[k] : '';
  $('#sp-note').value = s ? s.note : '';
  const inf0 = s ? s.info || {} : {}, locked = Array.isArray(inf0.locked) ? inf0.locked : [];
  $('#sp-info-fields').innerHTML = infoFields(inf0);
  // a lock inside each name field and the notes, plus "protect the whole card" at the top
  for (const [id, k] of Object.entries(Object.assign({note: 'note'}, SP_LOCK))) {
    const inp = $('#sp-' + id), f = inp.closest('.fld');
    $$('.lk', f).forEach(x => x.remove());
    f.classList.add('has-lk'); f.insertAdjacentHTML('beforeend', lockBox(k, locked));
    inp.disabled = !isAdmin() && locked.includes(k);
  }
  $$('#sp-form .lk-all-box').forEach(x => x.remove());
  $('#sp-form').insertAdjacentHTML('afterbegin', `<div class="lk-all-box"><label class="lk-all"><input type="checkbox" name="lk" value="*"${locked.includes('*') ? ' checked' : ''}${isAdmin() ? '' : ' disabled'}>${ic('lock', 16, 2.2)}<span>${esc(t('lk_all'))}</span></label><p class="hint">${esc(t('lk_hint'))}</p></div>`);
  const lkAll = $('#sp-form input[name=lk][value="*"]'), lkOne = () => $$('#sp-form input[name=lk]').filter(x => x !== lkAll);
  lkAll.addEventListener('change', () => lkOne().forEach(x => { x.checked = lkAll.checked; }));
  lkOne().forEach(x => x.addEventListener('change', () => { lkAll.checked = lkOne().every(y => y.checked); }));
  $('#sp-more').open = !s;
  $('#sp-err').textContent = '';
  const d = $('#sp-del'); d.hidden = !s || !isAdmin(); d.textContent = t('del_sp');
  const wikiNow = () => { const src = ($('#sfi-photo-src').value || '').trim(); return /^https:\/\//.test(src) ? {src, thumb: src === ((inf0.photo || {}).src) ? inf0.photo.thumb : ''} : null; };
  phSp = photoBox('sp-ph', 'species', s ? s.id : null, true, {main: inf0.main || '', wiki: wikiNow,
    onWikiRm: () => ['photo-src', 'photo-credit', 'photo-page'].forEach(k => { $('#sfi-' + k).value = ''; }),
    lockMain: () => !isAdmin() && locked.includes('photo')});
  $('#sfi-photo-src').addEventListener('change', () => phSp.redraw());
  openSheet('sp');
}
$('#sp-form').addEventListener('submit', async e => {
  e.preventDefault();
  const err = m => { $('#sp-err').textContent = m; };
  const v = {};
  for (const k of SPF) v[k] = $('#sp-' + k).value.trim();
  if (!SPF.some(k => v[k])) return err(t('e_spname'));
  if (species.some(x => (!editingSp || x.id !== editingSp.id) && SPF.some(k => v[k] && key(x[k]) === key(v[k])))) return err(t('e_spdup'));
  if (phSp && phSp.busy) return;
  v.note = $('#sp-note').value.trim();
  v.info = readInfo(editingSp ? editingSp.info : {});
  await withBusy($('#sp-save'), async () => {
    try {
      const wasEdit = !!editingSp, id = wasEdit ? editingSp.id : uuid();
      await putSp(id, v, !wasEdit);
      if (phSp && (phSp.added.length || phSp.removed.length)) err(t('ph_saving'));
      const failed = await commitPhotos(phSp, id);
      closeSheets();
      toast(failed ? t('e_photo', failed) : wasEdit ? t('t_card_upd') : t('t_sp_added'));
      openCard('sp', id);
      render();
    } catch (x) { err(errMsg(x)); }
  });
});
$('#sp-del').addEventListener('click', async () => {
  if (!editingSp || !isAdmin()) return;
  const n = recs.filter(r => r.sp === editingSp.id).length;
  if (!spDelArmed) { spDelArmed = true; $('#sp-del').textContent = n ? t('del_sp_n', n) : t('del_confirm'); return; }
  try { await dropSp(editingSp.id); closeSheets(); render(); toast(t('t_sp_del')); setTab('species'); }
  catch (x) { $('#sp-err').textContent = errMsg(x); }
});

/* ---------- staff accounts (admin) ---------- */
function openUserForm(p) {
  if (!isAdmin()) return;
  editingUser = p || null;
  $('#uf-title').textContent = p ? (p.display_name || p.login) : t('uf_new');
  $('#uf-sub').textContent = p ? t('uf_edit') : t('uf_hint');
  const opt = (val, cur, label) => `<option value="${val}"${val === cur ? ' selected' : ''}>${esc(label)}</option>`;
  const roleSel = `<div class="fld"><label for="uf-role">${esc(t('uf_role'))}</label><select id="uf-role" name="role">${['staff', 'viewer', 'admin'].map(r => opt(r, p ? p.role : 'staff', cap(roleText(r)))).join('')}</select></div>`;
  $('#uf-fields').innerHTML = field({k: 'name', l: 'uf_name', t: 'text', req: 1, id: 'uf-name'}, p ? p.display_name : '')
    + field({k: 'login', l: 'uf_login', t: 'text', req: !p, id: 'uf-login', dis: !!p, ac: 'off'}, p ? p.login : '')
    + (p ? '' : `<p class="hint">${esc(t('uf_login_hint'))}</p>`)
    + field({k: 'password', l: p ? 'uf_newpass' : 'uf_pass', t: 'text', req: !p, id: 'uf-pass', ac: 'new-password'}, '')
    + roleSel
    + (p ? `<div class="fld"><label for="uf-state">${esc(t('uf_state'))}</label><select id="uf-state" name="state">${opt('on', p.active ? 'on' : 'off', t('st_on'))}${opt('off', p.active ? 'on' : 'off', t('st_off'))}</select></div>` : '');
  $('#uf-err').textContent = '';
  openSheet('user');
}
$('#user-form').addEventListener('submit', async e => {
  e.preventDefault();
  const err = m => { $('#uf-err').textContent = m; }, g = id => ($('#' + id) ? $('#' + id).value.trim() : '');
  const name = g('uf-name'), login = g('uf-login').toLowerCase(), pass = $('#uf-pass').value, roleV = g('uf-role');
  if (!name) return err(t('e_name_req'));
  if (!editingUser && !/^[a-z0-9._-]{2,32}$/.test(login)) return err(t('e_bad_login'));
  if ((!editingUser || pass) && pass.length < 8) return err(t('e_short_pass'));
  await withBusy($('#uf-save'), async () => {
    try {
      if (editingUser) {
        const body = {action: 'update', id: editingUser.id, display_name: name, role: roleV, active: g('uf-state') !== 'off'};
        if (pass) body.password = pass;
        await callAdmin(body);
      } else {
        await callAdmin({action: 'create', login, password: pass, display_name: name, role: roleV});
      }
      await LOADERS.profiles();
      closeSheets(); render();
      toast(editingUser ? t('t_user_saved') : t('t_user_added'));
    } catch (x) { err(adminErr(x)); }
  });
});

$('#pass-form').addEventListener('submit', async e => {
  e.preventDefault();
  const err = m => { $('#pf-err').textContent = m; }, a = $('#pf-new').value, b = $('#pf-rep').value;
  if (a.length < 8) return err(t('e_short_pass'));
  if (a !== b) return err(t('e_pass_match'));
  await withBusy($('#pf-save'), async () => {
    const {error} = await sb.auth.updateUser({password: a});
    if (error) return err(/different|same/i.test(error.message || '') ? t('e_save') : errMsg(error));
    $('#pf-new').value = ''; $('#pf-rep').value = '';
    closeSheets(); toast(t('t_pass_changed'));
  });
});

/* ---------- clicks ---------- */
document.addEventListener('click', e => {
  const lb = e.target.closest('[data-lb]');
  if (lb) { e.preventDefault(); e.stopPropagation(); openLightbox(lb.dataset.lb); return; }
  const lbu = e.target.closest('[data-lbu]');
  if (lbu) { e.preventDefault(); const img = $('#lb-img'); delete img.dataset.path; img.src = lbu.dataset.lbu; $('#lightbox').hidden = false; setTimeout(() => $('[data-lb-close]').focus({preventScroll: true}), 30); return; }
  const jp = e.target.closest('[data-jump]');
  if (jp) { const x = $('#' + jp.dataset.jump); if (x) x.scrollIntoView({block: 'start', behavior: 'smooth'}); return; }
  const sgb = e.target.closest('[data-sg]');
  if (sgb) { sg = sgb.dataset.sg; renderSpecies(); return; }
  const lgfb = e.target.closest('[data-lgf]');
  if (lgfb) { lgf = lgfb.dataset.lgf; renderLog(); return; }
  const lgd = e.target.closest('[data-lg-del]');
  if (lgd) {
    if (!isAdmin()) return;
    if (logDelArmed !== lgd.dataset.lgDel) { logDelArmed = lgd.dataset.lgDel; renderLog(); return; }
    const id = logDelArmed; logDelArmed = '';
    sb.from('change_log').delete().eq('id', id).then(res => { if (res.error) { toast(errMsg(res.error)); return; } logRows = logRows.filter(x => String(x.id) !== id); renderLog(); toast(t('t_log_del')); });
    return;
  }
  if (logDelArmed) { logDelArmed = ''; renderLog(); }
  const nma = e.target.closest('[data-nm-add]');
  if (nma) { const box = nma.parentElement.querySelector('.nm-rows'), used = $$('select[name=nl]', box).map(x => x.value); box.insertAdjacentHTML('beforeend', nameRow(LANGS.find(l => !used.includes(l) && l !== lang) || LANGS.find(l => !used.includes(l)) || lang, '')); box.lastElementChild.querySelector('input').focus(); return; }
  const nmr = e.target.closest('[data-nm-rm]');
  if (nmr) { nmr.closest('.nm-row').remove(); return; }
  const cnav = e.target.closest('[data-cal-nav]');
  if (cnav) { const n = +cnav.dataset.calNav, d = new Date(); calM = n ? new Date(calM.getFullYear(), calM.getMonth() + n, 1) : new Date(d.getFullYear(), d.getMonth(), 1); calSel = ''; renderCal(); return; }
  const ci = e.target.closest('[data-ci],[data-co]');
  if (ci) {
    if (ci.dataset.co) openCalItem(ci.dataset.co);
    else if (calSel === ci.dataset.ci && !ci.dataset.ci.startsWith('m:')) openCalItem(ci.dataset.ci);
    else { calSel = ci.dataset.ci; renderCal(); }
    return;
  }
  if (calSel && e.target.closest('#cal-tip') && !calSel.startsWith('m:')) { openCalItem(calSel); return; }
  if (calSel && e.target.closest('#view-cal')) { calSel = ''; renderCal(); }
  const ekb = e.target.closest('[data-ek]');
  if (ekb) { ek = ekb.dataset.ek; renderEncls(); return; }
  const ecb = e.target.closest('[data-ec],[data-encl-new],[data-encl-edit]');
  if (ecb) {
    if (ecb.dataset.ec) openCard('encl', ecb.dataset.ec);
    else if (ecb.dataset.enclNew !== undefined) openEnclForm(null, ecb.dataset.parent || '');
    else { const x = enclMap.get(curEncl); if (x) openEnclForm(x); }
    return;
  }
  if (e.target.closest('[data-lb-close]') || e.target.id === 'lightbox' || e.target.id === 'lb-img') { closeLightbox(); return; }
  const el = e.target.closest('[data-new],[data-sheet],[data-tab],[data-edit],[data-close],[data-goto],[data-f],[data-view],[data-sp],[data-sp-new],[data-sp-edit],[data-bc],[data-cf],[data-bird-new],[data-bird-edit],[data-lang],[data-user],[data-user-new],[data-logout],[data-pass]');
  if (!el) return;
  const d = el.dataset;
  if (d.lang) setLang(d.lang);
  else if (d.logout !== undefined) { closeSheets(); sb && sb.auth.signOut(); }
  else if (d.pass !== undefined) { $('#pf-err').textContent = ''; openSheet('pass'); }
  else if (d.userNew !== undefined) openUserForm(null);
  else if (d.user) openUserForm(profiles.get(d.user));
  else if (d.spNew !== undefined) openSpForm(null);
  else if (d.spEdit !== undefined) { const s = spById(curSp); if (s) openSpForm(s); }
  else if (d.birdNew !== undefined) openBirdForm(null);
  else if (d.birdEdit !== undefined) { const b = collMap.get(curBird); if (b) openBirdForm(b); }
  else if (d.bc) openCard('bird', d.bc);
  else if (d.cf) { cf = d.cf; $$('#view-coll .chip').forEach(c => c.setAttribute('aria-pressed', String(c === el))); renderColl(); paintPhotos(); }
  else if (d.sp) openCard('sp', d.sp);
  else if (d.view) setTab(d.view);
  else if (d.new) { if (!canWrite()) return; const pre = {}; if (d.bird) pre.bird = d.bird; if (d.from) pre.from = d.from; if (d.to) pre.to = d.to; openForm(d.new, pre); }
  else if (d.sheet) { if (!canWrite()) return; presetBird = d.preset || null; openSheet(d.sheet); }
  else if (d.tab) setTab(d.tab);
  else if (d.edit) { const r = recs.find(x => x.id === d.edit); if (r) openForm(r.type, null, r); }
  else if (d.close !== undefined) closeSheets();
  else if (d.goto) { setTab('now'); const s = $('#' + d.goto); if (s) s.scrollIntoView({block: 'start'}); }
  else if (d.f) { filt = d.f; $$('#view-logs .chip').forEach(c => c.setAttribute('aria-pressed', String(c === el))); renderLogs(); paintPhotos(); }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#lightbox').hidden) closeLightbox(); else if ($('.sheet.open')) closeSheets();
});
[['#form', '#f-err'], ['#encl-form', '#ef-err'], ['#sp-form', '#sp-err'], ['#bird-form', '#bf-err'], ['#user-form', '#uf-err'], ['#pass-form', '#pf-err'], ['#login-form', '#lg-err']]
  .forEach(([f, er]) => $(f).addEventListener('input', () => { $(er).textContent = ''; }));
$('#q').addEventListener('input', e => { q = key(e.target.value); renderLogs(); paintPhotos(); });
$('#sq').addEventListener('input', e => { sq = key(e.target.value); renderSpecies(); });
$('#cq').addEventListener('input', e => { cq = key(e.target.value); renderColl(); paintPhotos(); });
$('#eq').addEventListener('input', e => { eq = key(e.target.value); renderEncls(); });

/* ---------- export ---------- */
function csv() {
  const rows = [t('csv_h')];
  [...recs].sort((a, b) => a.at - b.at).forEach(r => {
    const s = spById(r.sp);
    rows.push([new Date(r.at).toLocaleDateString(LOCALE[lang]), fTime.format(r.at), t('g_' + T[r.type].g), evLabel(r.type), spName(s), s ? s.latin : '', r.bird, details(r), r.note, r.by ? authorName(r.by) : '', photosOf('record', r.id).length || '']);
  });
  return rows.map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(';')).join('\r\n');
}
$('#btn-dl').addEventListener('click', () => {
  const blob = new Blob(['﻿' + csv()], {type: 'text/csv;charset=utf-8'}), a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = t('csv_file') + '-' + toInput(Date.now()).slice(0, 10) + '.csv';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
});
$('#btn-copy').addEventListener('click', async () => {
  const text = csv(), box = $('#csv-box');
  try { await navigator.clipboard.writeText(text); toast(t('t_copied')); box.hidden = true; }
  catch (x) { box.hidden = false; box.value = text; box.focus(); box.select(); toast(t('t_select')); }
});

/* ---------- sign-in gate ---------- */
function gate(mode, msgKey) {
  gateKey = msgKey || (mode === 'login' ? 'app_title' : mode === 'noacc' ? 'noacc_p' : 'loading');
  $('#gate').hidden = mode === 'off';
  $('#login-form').hidden = mode !== 'login';
  $('#noacc').hidden = mode !== 'noacc';
  $('#gate-msg').hidden = mode === 'login' || mode === 'noacc';
  $('#gate-msg').textContent = t(gateKey);
  if (mode === 'login') setTimeout(() => $('#lg-login').focus({preventScroll: true}), 30);
}
function applyRole() {
  document.body.classList.toggle('ro', !canWrite());
  document.body.classList.toggle('admin', isAdmin());
}
function resetState() {
  me = null; myProfile = null; recs = []; species = []; coll = []; encls = []; photos = []; logRows = []; profiles = new Map(); urlCache.clear();
  if (channel && sb) { sb.removeChannel(channel); channel = null; }
  document.body.classList.remove('ro', 'admin');
}

$('#login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const login = $('#lg-login').value.trim().toLowerCase(), pass = $('#lg-pass').value;
  if (!login || !pass) return void ($('#lg-err').textContent = t('e_login'));
  const email = login.includes('@') ? login : login + '@' + LOGIN_DOMAIN;
  await withBusy($('#lg-btn'), async () => {
    const {error} = await sb.auth.signInWithPassword({email, password: pass});
    if (error) { $('#lg-err').textContent = (error.status === 400 || error.code === 'invalid_credentials') ? t('e_login') : t('e_net'); return; }
    $('#lg-pass').value = '';
    await boot();
  });
});

$('#claim-btn').addEventListener('click', async () => {
  await withBusy($('#claim-btn'), async () => {
    const {data, error} = await sb.rpc('claim_first_admin', {p_name: ''});
    if (error || !data) { $('#claim-err').textContent = error ? errMsg(error) : t('e_perm'); return; }
    await boot();
  });
});

let booting = false;
async function boot() {
  if (booting) return;
  booting = true;
  try {
    const {data: {session}} = await sb.auth.getSession();
    if (!session) { resetState(); gate('login'); return; }
    me = session.user.id;
    gate('loading');
    const {data: prof, error} = await sb.from('profiles').select('*').eq('id', me).maybeSingle();
    if (error) { gate('login'); $('#lg-err').textContent = t('e_net'); return; }
    if (!prof || !prof.active) {
      let canClaim = false;
      const em = String(session.user.email || '');
      if (!prof && em && !em.endsWith('@' + LOGIN_DOMAIN) && session.user.email_confirmed_at) {
        const {data: has} = await sb.rpc('journal_has_admin');
        canClaim = has === false;
      }
      $('#claim-btn').hidden = !canClaim; $('#claim-hint').hidden = !canClaim; $('#claim-err').textContent = '';
      gate('noacc');
      return;
    }
    myProfile = prof;
    applyRole();
    await loadAll();
    if (!myProfile || !myProfile.active) return;
    setTab('add');
    render();
    gate('off');
    subscribe();
    if (!navigator.onLine) setStatus('s_offline', 'warn');
  } catch (x) {
    gate('login'); $('#lg-err').textContent = t('e_net');
  } finally { booting = false; }
}

window.addEventListener('offline', () => setStatus('s_offline', 'warn'));
window.addEventListener('online', () => { if (statusKey === 's_offline') setStatus('', 'info'); if (myProfile) Object.keys(LOADERS).forEach(scheduleReload); });
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  if (myProfile && hiddenAt && Date.now() - hiddenAt > 60e3) Object.keys(LOADERS).forEach(scheduleReload);
});

/* ---------- start ---------- */
// language buttons and species name fields in the order Polish, English, Russian
[...new Set($$('[data-lang]').map(b => b.parentElement))].forEach(box => LANG_ORDER.forEach(l => { const b = $(`[data-lang=${l}]`, box); if (b) box.appendChild(b); }));
{ const f = id => $('#' + id) && $('#' + id).closest('.fld'), ru = f('sp-name'); if (ru) { ru.before(f('sp-pl')); ru.before(f('sp-en')); } }
paintIcons(document);
$('#today').textContent = new Date().getDate();
applyStatic();
setStatus('', 'info');
if (!window.supabase || !window.supabase.createClient) {
  gate('loading', 'e_lib');
} else {
  sb = window.supabase.createClient(SB_URL, SB_KEY, {auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: false}});
  sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') { resetState(); closeSheets(); gate('login'); } });
  boot();
}
}
