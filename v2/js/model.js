// model.js — v2: names, record kinds and groups, what is going on now, calendar events, missing data
/* ---------- species ---------- */
const spName = s => !s ? '—' : (lang === 'ru' ? s.name_ru || s.name_pl || s.name_en : lang === 'en' ? s.name_en || s.name_pl || s.name_ru : s.name_pl || s.name_ru || s.name_en) || s.latin || '—';
const spBy = id => D.sp.get(id) || null;
const spInfo = s => (s && s.info && typeof s.info === 'object') ? s.info : {};
const isMammal = s => spInfo(s).group === 'mammal';
// translatable info text {ru,pl,en,...} or old plain string (= Russian)
const infoTx = (s, k, l = lang) => { const v = spInfo(s)[k]; if (v == null) return ''; if (typeof v !== 'object') return String(v); return v[l] || v.pl || v.ru || v.en || ''; };
const initials = s => spName(s).split(/[\s-]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

/* ---------- places (tree) ---------- */
const plName = p => { if (!p) return ''; const n = (p.names || []).find(x => x.l === lang && x.v); return n ? n.v : p.name; };
const plById = id => D.pl.find(p => p.id === id) || null;
const plByName = n => D.pl.find(p => key(p.name) === key(n)) || null;
const plKids = id => D.pl.filter(p => (p.parent_id || null) === (id || null) && p.active !== false).sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
const plDesc = id => { const out = []; const walk = i => plKids(i).forEach(k => { out.push(k); walk(k.id); }); walk(id); return out; };

/* ---------- animals ---------- */
const anActive = () => D.an.filter(a => a.status !== 'out');
const anById = id => D.an.find(a => a.id === id) || null;
const anByName = n => D.an.find(a => key(a.name) === key(n)) || null;
// current place: the newest transfer record wins over collection.encl when it is not older (same rule as the old site)
let _mv = {rec: null, n: -1, map: new Map()};
const lastMoves = () => { if (_mv.rec !== D.rec || _mv.n !== D.rec.length) { const m = new Map(); for (const r of D.rec) if (r.k === 'expo' && r.f.to) { const k = key(r.bird), o = m.get(k); if (!o || r.at >= o.at) m.set(k, {to: r.f.to, at: r.at}); } _mv = {rec: D.rec, n: D.rec.length, map: m}; } return _mv.map; };
const anEncl = a => { const m = lastMoves().get(key(a.name)), at = a.encl_at ? new Date(a.encl_at).getTime() : 0; return m && m.at >= at ? m.to : (a.encl || ''); };
const anOfPlace = p => anActive().filter(a => key(anEncl(a)) === key(p.name));
const grpTotal = g => g ? (+g.m || 0) + (+g.f || 0) + (+g.u || 0) + (+g.j || 0) : 0;
const SFX = [['samiec', 'самец', 'male'], ['samica', 'самка', 'female'], ['młode', 'молодой', 'young'], ['płeć nieznana', 'пол неизв.', 'sex unknown'], ['starsze', 'старший', 'older'], ['pisklę', 'птенец', 'chick']];
function suffix(a) {
  const s = spBy(a.species_id), pl = s ? (s.name_pl || '') : '';
  let x = pl && a.name.startsWith(pl + ' - ') ? a.name.slice(pl.length + 3) : (s && [s.name_pl, s.name_ru, s.name_en].includes(a.name) ? '' : a.name);
  if (lang !== 'pl') for (const w of SFX) x = x.replace(w[0], lang === 'ru' ? w[1] : w[2]);
  if (a.grp) x = (x ? x + ' · ' : '') + L('grupa', 'группа', 'group') + ' ×' + grpTotal(a.grp);
  return x;
}
const sexSym = s => s === 'm' ? '♂' : s === 'f' ? '♀' : '?';
const anTitle = a => spName(spBy(a.species_id));
const anLine = a => anTitle(a) + (suffix(a) ? ' · ' + suffix(a) : '');
const anInit = a => initials(spBy(a.species_id));

/* ---------- record kinds ---------- */
const GROUPS = [
  {id: 'health', ic: 'cross', n: () => L('Zdrowie', 'Здоровье', 'Health')},
  {id: 'obs', ic: 'eye', n: () => L('Obserwacja', 'Наблюдение', 'Observation')},
  {id: 'breed', ic: 'egg', n: () => L('Rozród', 'Размножение', 'Breeding')},
  {id: 'keep', ic: 'swap', n: () => L('Utrzymanie', 'Содержание', 'Husbandry')},
  {id: 'dept', ic: 'building', n: () => L('Dział', 'Отдел', 'Department')}];
const KINDS = {
  injury: ['health', 'cross', () => L('Uraz / objaw', 'Травма / симптом', 'Injury / symptom')],
  tstart: ['health', 'syringe', () => L('Nowe zlecenie', 'Новое назначение', 'New prescription')],
  tdose: ['health', 'pill', () => L('Podanie leku', 'Подача лекарства', 'Medication given')],
  tend: ['health', 'check', () => L('Koniec leczenia', 'Конец лечения', 'Treatment ended')],
  proc: ['health', 'scale', () => L('Zabieg / ważenie', 'Процедура / взвешивание', 'Procedure / weighing')],
  obs: ['obs', 'eye', () => L('Zachowanie / notatka', 'Поведение / заметка', 'Behaviour / note')],
  watch: ['obs', 'now', () => L('Pod obserwacją', 'На наблюдении', 'Under observation')],
  wend: ['obs', 'check', () => L('Koniec obserwacji', 'Конец наблюдения', 'Observation ended')],
  score: ['obs', 'list', () => L('Ocena', 'Оценка', 'Score')],
  mate: ['breed', 'star', () => L('Kopulacja', 'Копуляция', 'Mating')],
  lay: ['breed', 'egg', () => L('Jajo', 'Яйцо', 'Egg')],
  incub: ['breed', 'nest', () => L('Wysiadywanie', 'Насиживание', 'Incubation')],
  hatch: ['breed', 'egg', () => L('Wyklucie', 'Выклев', 'Hatching')],
  fledge: ['breed', 'bird', () => L('Opuszczenie gniazda', 'Выход из гнезда', 'Fledging')],
  birth: ['breed', 'plus', () => L('Poród', 'Роды', 'Birth')],
  expo: ['keep', 'swap', () => L('Przeniesienie', 'Перемещение', 'Transfer')],
  diet: ['keep', 'bowl', () => L('Dieta', 'Диета', 'Diet')],
  env: ['keep', 'home', () => L('Woliera / środowisko', 'Вольер / среда', 'Enclosure / environment')],
  enr: ['keep', 'star', () => L('Trening / wzbogacenie', 'Тренинг / обогащение', 'Training / enrichment')],
  leave: ['keep', 'x', () => L('Wyjście ze stanu', 'Выбытие', 'Departure')],
  arrive: ['keep', 'plus', () => L('Przybycie', 'Поступление', 'Arrival')],
  dept: ['dept', 'pen', () => L('Wolny wpis', 'Свободная запись', 'Free note')]};
const kGroup = k => (KINDS[k] || KINDS.obs)[0], kIcon = k => (KINDS[k] || KINDS.obs)[1], kName = k => (KINDS[k] || KINDS.obs)[2]();
// what can be recorded, in fixed order
const WHAT = {health: ['injury', 'tstart', 'tdose', 'proc'], obs: ['obs', 'watch', 'score'], breed: ['mate', 'lay', 'incub', 'hatch', 'fledge', 'birth'], keep: ['expo', 'diet', 'env', 'enr', 'leave']};

/* ---------- option lists (index is stored, text is shown in the current language) ---------- */
// The drug catalogue stores these positions. Append new routes at the end.
const MED_ROUTES = [
  ['p.o.', 'doustnie', 'внутрь', 'orally'],
  ['i.m.', 'domięśniowo', 'внутримышечно', 'intramuscularly'],
  ['s.c.', 'podskórnie', 'подкожно', 'subcutaneously'],
  ['i.v.', 'dożylnie', 'внутривенно', 'intravenously'],
  ['miejscowo', 'miejscowo', 'местно', 'topical'],
  ['do wody', 'do wody', 'в воду', 'in water'],
  ['do karmy', 'do karmy', 'в корм', 'in feed'],
  ['na skórę', 'na skórę', 'на кожу', 'on the skin']
];
function medRoute(value) {
  const k = key(value);
  return MED_ROUTES.find(route => route.includes(k));
}
function medRouteLabel(value) {
  const route = medRoute(value);
  if (!route) return value || '';
  const [code, pl, ru, en] = route, label = L(pl, ru, en);
  return code === pl ? label : `${code} (${label})`;
}

const OPT = {
  inj_what: () => LA(['Kuleje', 'Rana', 'Krwawienie', 'Nastroszony', 'Nie je', 'Przerośnięty dziób', 'Przerośnięte pazury', 'Wypadanie piór', 'Biegunka'], ['Хромает', 'Рана', 'Кровотечение', 'Нахохлился', 'Не ест', 'Перерос клюв', 'Перерос когти', 'Выпадают перья', 'Понос'], ['Limping', 'Wound', 'Bleeding', 'Fluffed up', 'Not eating', 'Overgrown beak', 'Overgrown claws', 'Feather loss', 'Diarrhoea']),
  inj_what_m: () => LA(['Kuleje', 'Rana', 'Krwawienie', 'Apatia', 'Nie je', 'Przerośnięte racice / pazury', 'Wypadanie sierści', 'Biegunka'], ['Хромает', 'Рана', 'Кровотечение', 'Вялость', 'Не ест', 'Переросли копыта / когти', 'Выпадает шерсть', 'Понос'], ['Limping', 'Wound', 'Bleeding', 'Lethargy', 'Not eating', 'Overgrown hooves / claws', 'Hair loss', 'Diarrhoea']),
  where: () => LA(['Głowa', 'Oko', 'Dziób', 'Skrzydło L', 'Skrzydło P', 'Noga L', 'Noga P', 'Tułów', 'Ogon'], ['Голова', 'Глаз', 'Клюв', 'Крыло Л', 'Крыло П', 'Нога Л', 'Нога П', 'Тело', 'Хвост'], ['Head', 'Eye', 'Beak', 'Wing L', 'Wing R', 'Leg L', 'Leg R', 'Body', 'Tail']),
  where_m: () => LA(['Głowa', 'Oko', 'Ucho', 'Noga przednia L', 'Noga przednia P', 'Noga tylna L', 'Noga tylna P', 'Tułów', 'Ogon'], ['Голова', 'Глаз', 'Ухо', 'Пер. нога Л', 'Пер. нога П', 'Задн. нога Л', 'Задн. нога П', 'Тело', 'Хвост'], ['Head', 'Eye', 'Ear', 'Front leg L', 'Front leg R', 'Hind leg L', 'Hind leg R', 'Body', 'Tail']),
  sev: () => LA(['Lekko', 'Średnio', 'Poważnie'], ['Легко', 'Средне', 'Серьёзно'], ['Mild', 'Moderate', 'Serious']),
  proc: () => LA(['Ważenie', 'Przycięcie dzioba', 'Przycięcie pazurów', 'Przycięcie lotek', 'Badanie', 'Pobranie próbek', 'Odrobaczanie', 'Szczepienie', 'Kąpiel / pielęgnacja'], ['Взвешивание', 'Подрезка клюва', 'Подрезка когтей', 'Подрезка крыльев', 'Осмотр', 'Взятие проб', 'Дегельминтизация', 'Вакцинация', 'Купание / уход'], ['Weighing', 'Beak trim', 'Claw trim', 'Wing clip', 'Check-up', 'Samples', 'Deworming', 'Vaccination', 'Bath / grooming']),
  proc_m: () => LA(['Ważenie', 'Przycięcie racic / pazurów', 'Badanie', 'Pobranie próbek', 'Odrobaczanie', 'Szczepienie', 'Pielęgnacja'], ['Взвешивание', 'Подрезка копыт / когтей', 'Осмотр', 'Взятие проб', 'Дегельминтизация', 'Вакцинация', 'Уход'], ['Weighing', 'Hoof / claw trim', 'Check-up', 'Samples', 'Deworming', 'Vaccination', 'Grooming']),
  res: () => LA(['Bez uwag', 'Do kontroli', 'Wymaga leczenia'], ['Без замечаний', 'Проверить позже', 'Требуется лечение'], ['Fine', 'Check again', 'Needs treatment']),
  beh: () => LA(['Aktywny, je dobrze', 'Apatia', 'Nastroszony', 'Agresja', 'Zaloty', 'Budowa gniazda', 'Kąpie się', 'Je nowy pokarm', 'Nowe zachowanie'], ['Активен, ест хорошо', 'Вялый', 'Нахохлился', 'Агрессия', 'Ухаживание', 'Строит гнездо', 'Купается', 'Ест новый корм', 'Новое поведение'], ['Active, eats well', 'Lethargic', 'Fluffed up', 'Aggression', 'Courtship', 'Nest building', 'Bathing', 'Eats new food', 'New behaviour']),
  tone: () => LA(['Dobrze', 'Neutralnie', 'Niepokojąco'], ['Хорошо', 'Нейтрально', 'Тревожно'], ['Good', 'Neutral', 'Worrying']),
  why_w: () => LA(['Uraz', 'Po leczeniu', 'Zmiana zachowania', 'Nowe w grupie', 'Przed / po rozrodzie', 'Inne'], ['Травма', 'После лечения', 'Изменение поведения', 'Новичок в группе', 'До / после размножения', 'Другое'], ['Injury', 'After treatment', 'Behaviour change', 'New in group', 'Before / after breeding', 'Other']),
  freq_w: () => LA(['Kilka razy dziennie', 'Rano', 'Przed zamknięciem', 'Raz dziennie', 'Co 2–3 dni', 'Raz w tygodniu'], ['Несколько раз в день', 'Утром', 'Перед закрытием', 'Раз в день', 'Раз в 2–3 дня', 'Раз в неделю'], ['Several times a day', 'Morning', 'Before closing', 'Once a day', 'Every 2–3 days', 'Once a week']),
  until: () => LA(['3 dni', '7 dni', '14 dni', 'Do odwołania'], ['3 дня', '7 дней', '14 дней', 'До отмены'], ['3 days', '7 days', '14 days', 'Until cancelled']),
  slot: () => LA(['Rano', 'W dzień', 'Wieczorem'], ['Утро', 'День', 'Вечер'], ['Morning', 'Day', 'Evening']),
  seen: () => LA(['Kopulacja', 'Próba kopulacji', 'Zaloty'], ['Копуляция', 'Попытка', 'Ухаживание'], ['Mating', 'Attempt', 'Courtship']),
  nest: () => LA(['Gniazdo', 'Podłoga', 'Budka', 'Karmnik'], ['Гнездо', 'Пол', 'Домик', 'Кормушка'], ['Nest', 'Floor', 'Nest box', 'Feeder']),
  egg: () => LA(['Całe', 'Pęknięte', 'Zabrudzone', 'Bez skorupki'], ['Целые', 'Треснули', 'Грязные', 'Без скорлупы'], ['Intact', 'Cracked', 'Dirty', 'Shell-less']),
  eggnext: () => LA(['Zostawione rodzicom', 'Do inkubatora', 'Zabrane / zamienione na sztuczne'], ['Оставили родителям', 'В инкубатор', 'Изъяли / заменили муляжами'], ['Left to parents', 'To incubator', 'Removed / replaced with dummies']),
  incwho: () => LA(['Samica', 'Samiec', 'Oboje', 'Inkubator'], ['Самка', 'Самец', 'Оба', 'Инкубатор'], ['Female', 'Male', 'Both', 'Incubator']),
  state: () => LA(['Zdrowe', 'Słabe', 'Martwe'], ['Здоровые', 'Слабые', 'Мёртвые'], ['Healthy', 'Weak', 'Dead']),
  care: () => LA(['Karmi', 'Nie karmi', 'Nie wiadomo'], ['Кормит', 'Не кормит', 'Неизвестно'], ['Feeds', 'Does not feed', 'Unknown']),
  fly: () => LA(['Lata pewnie', 'Słabo', 'Nie lata'], ['Уверенно', 'Слабо', 'Не летает'], ['Flies well', 'Weakly', 'Does not fly']),
  diet: () => LA(['Wykluczyć składnik', 'Dodać składnik', 'Inna porcja', 'Suplement', 'Dieta lecznicza'], ['Исключить', 'Добавить', 'Другая порция', 'Добавка', 'Лечебная диета'], ['Exclude item', 'Add item', 'Other portion', 'Supplement', 'Therapeutic diet']),
  dietuntil: () => LA(['3 dni', '7 dni', '14 dni', 'Na stałe'], ['3 дня', '7 дней', '14 дней', 'Постоянно'], ['3 days', '7 days', '14 days', 'Permanent']),
  dietwhy: () => LA(['Leczenie', 'Waga', 'Rozród', 'Nie je', 'Zalecenie weterynarza'], ['Лечение', 'Вес', 'Размножение', 'Не ест', 'Указание ветеринара'], ['Treatment', 'Weight', 'Breeding', 'Not eating', 'Vet advice']),
  env: () => LA(['Oświetlenie', 'Ogrzewanie', 'Podłoże / kora', 'Sprzątanie', 'Rośliny', 'Woda / basen', 'Kryjówki, grzędy', 'Naprawa'], ['Свет', 'Обогрев', 'Подстилка / кора', 'Уборка', 'Растения', 'Вода / бассейн', 'Укрытия, присады', 'Ремонт'], ['Lighting', 'Heating', 'Substrate / bark', 'Cleaning', 'Plants', 'Water / pool', 'Shelters, perches', 'Repair']),
  enrkind: () => LA(['Trening', 'Wzbogacenie'], ['Тренинг', 'Обогащение'], ['Training', 'Enrichment']),
  react: () => LA(['Zainteresowany', 'Obojętny', 'Unika', 'Zadanie wykonane'], ['Интерес', 'Безразличие', 'Избегает', 'Задание выполнено'], ['Interested', 'Indifferent', 'Avoids', 'Task done']),
  mvwhy: () => LA(['Planowe', 'Kwarantanna', 'Leczenie', 'Konflikt w grupie', 'Rozród', 'Remont woliery', 'Nowe przybycie', 'Inne'], ['Плановое', 'Карантин', 'Лечение', 'Конфликт в группе', 'Размножение', 'Ремонт вольера', 'Новое поступление', 'Другое'], ['Planned', 'Quarantine', 'Treatment', 'Group conflict', 'Breeding', 'Enclosure repair', 'New arrival', 'Other']),
  wing: () => LA(['Lewe', 'Prawe', 'Oba'], ['Левое', 'Правое', 'Оба'], ['Left', 'Right', 'Both']),
  mark: () => LA(['Obrączka', 'Chip', 'Inne'], ['Кольцо', 'Чип', 'Другое'], ['Ring', 'Chip', 'Other']),
  leave: () => LA(['Padnięcie', 'Eutanazja', 'Przekazanie do innego ZOO', 'Wypuszczenie', 'Zaginięcie', 'Inne'], ['Падёж', 'Эвтаназия', 'Передача в другой зоопарк', 'Выпуск', 'Пропажа', 'Другое'], ['Death', 'Euthanasia', 'Transfer to another zoo', 'Release', 'Missing', 'Other']),
  cause: () => LA(['Choroba', 'Uraz', 'Wiek', 'Nieznana', 'Czeka na sekcję'], ['Болезнь', 'Травма', 'Возраст', 'Неизвестна', 'Ждёт вскрытия'], ['Disease', 'Injury', 'Age', 'Unknown', 'Awaiting necropsy']),
  from: () => LA(['Inny ZOO', 'Hodowca', 'Konfiskata', 'Ratunek / ośrodek', 'Urodzone poza działem', 'Inne'], ['Другой зоопарк', 'Заводчик', 'Конфискат', 'Спасение / центр', 'Родились в другом отделе', 'Другое'], ['Another zoo', 'Breeder', 'Confiscation', 'Rescue / centre', 'Born in another department', 'Other']),
  dept: () => LA(['Gospodarka', 'Deratyzacja', 'Dostawa', 'Awaria', 'Inne'], ['Хозяйство', 'Дератизация', 'Поставка', 'Поломка', 'Прочее'], ['Facilities', 'Pest control', 'Delivery', 'Breakdown', 'Other']),
  endwhy: () => LA(['Kurs zakończony', 'Wyzdrowiał', 'Odwołane przez weterynarza', 'Zmiana leku', 'Inne'], ['Курс окончен', 'Выздоровел', 'Отменено ветеринаром', 'Смена препарата', 'Другое'], ['Course finished', 'Recovered', 'Cancelled by vet', 'Drug changed', 'Other']),
  freq: () => LA(['1× dziennie', '2× dziennie', '3× dziennie', 'co 2 dni', 'jednorazowo'], ['1× в день', '2× в день', '3× в день', 'раз в 2 дня', 'однократно'], ['1× a day', '2× a day', '3× a day', 'every 2 days', 'once']),
  days: () => LA(['3 dni', '5 dni', '7 dni', '14 dni'], ['3 дня', '5 дней', '7 дней', '14 дней'], ['3 days', '5 days', '7 days', '14 days']),
  routes: () => MED_ROUTES.map(([code]) => medRouteLabel(code))
};
const pick = (list, v) => Array.isArray(v) ? v.map(i => OPT[list]()[i]).filter(Boolean).join(', ') : v != null && OPT[list]()[v] != null ? OPT[list]()[v] : '';
const FREQ_N = [1, 2, 3, 0.5, 0], DAYS_N = [3, 5, 7, 14];

/* ---------- record title and details ---------- */
function recWho(r) {
  if (r.k === 'dept') return L('Dział', 'Отдел', 'Department');
  if (r.f.place) { const p = plByName(r.f.place); return (p ? plName(p) : r.f.place); }
  const a = anByName(r.bird); return a ? anLine(a) : (r.bird + (r.sp ? ' · ' + spName(spBy(r.sp)) : ''));
}
function recTitle(r) {
  const f = r.f, n = kName(r.k);
  switch (r.k) {
    case 'tdose': return L('Podano', 'Подано', 'Given') + (f.drug ? ': ' + [f.drug, f.dose, medRouteLabel(f.route)].filter(Boolean).join(' ') : '');
    case 'tstart': return n + (f.drug ? ': ' + [f.drug, f.dose, medRouteLabel(f.route)].filter(Boolean).join(' ') : '');
    case 'tend': return n + (f.drug ? ': ' + f.drug : '');
    case 'expo': return n + (f.from || f.to ? ': ' + [f.from && plName(plByName(f.from)) || f.from, f.to && plName(plByName(f.to)) || f.to].filter(Boolean).join(' → ') : '');
    case 'score': return n + (f.v ? ` ${f.v}/5` : '');
    case 'injury': return L('Uraz', 'Травма', 'Injury') + (f.what ? ': ' + pick(f.m ? 'inj_what_m' : 'inj_what', f.what) : '');
    case 'proc': return n + (f.kind ? ': ' + pick(f.m ? 'proc_m' : 'proc', f.kind) : '') + (f.w ? ` · ${f.w} ${f.wu || 'kg'}` : '');
    case 'lay': return n + (f.n ? ` ×${f.n}` : '');
    case 'hatch': case 'fledge': case 'birth': return n + (f.n ? ` ×${f.n}` : '');
    case 'diet': return n + (f.what ? ': ' + f.what : '');
    case 'env': return n + (f.what ? ': ' + pick('env', f.what) : '');
    case 'enr': return pick('enrkind', f.kind) || n;
    case 'leave': return n + (f.why != null ? ': ' + pick('leave', f.why) : '');
    case 'dept': return pick('dept', f.kind) || n;
    case 'watch': return n + (f.why != null ? ': ' + pick('why_w', f.why) : '');
    default: return n;
  }
}
const recsOf = name => D.rec.filter(r => key(r.bird) === key(name));
const recsOfPlace = p => { const names = new Set([key(p.name), ...anOfPlace(p).map(a => key(a.name))]); return D.rec.filter(r => names.has(key(r.bird)) || key(r.f.place) === key(p.name)); };

/* ---------- what is going on now ---------- */
const gone = name => { const a = anByName(name); return !!(a && a.status === 'out'); };
const until = (r, days) => days ? midnight(r.at) + days * DAY : null;
function activeTreatments() {
  const out = [];
  for (const r of D.rec.filter(x => x.k === 'tstart' && !gone(x.bird))) {
    const later = D.rec.filter(x => key(x.bird) === key(r.bird) && x.at > r.at);
    if (later.some(x => x.k === 'tend' || (x.k === 'tstart' && (!r.f.drug || key(x.f.drug) === key(r.f.drug)))) ) continue;
    const end = r.f.until ? new Date(r.f.until).getTime() + DAY : until(r, r.f.days);
    if (end && end <= today0()) continue;
    const doses = later.filter(x => x.k === 'tdose' && (!r.f.drug || !x.f.drug || key(x.f.drug) === key(r.f.drug)));
    const per = r.f.freq != null ? FREQ_N[r.f.freq] : 1;
    const todays = doses.filter(x => x.at >= today0());
    const due = per >= 1 ? todays.length < per : per === 0.5 ? !doses.some(x => x.at >= today0() - DAY) : per === 0 ? !doses.length : false;
    out.push({r, doses, todays, per, due, end});
  }
  return out;
}
function activeWatches() {
  const out = [];
  for (const r of D.rec.filter(x => x.k === 'watch' && !gone(x.bird))) {
    if (D.rec.some(x => x.k === 'wend' && key(x.bird) === key(r.bird) && x.at > r.at && (!x.f.of || x.f.of === r.id))) continue;
    const end = until(r, [3, 7, 14, 0][r.f.until ?? 3] || 0);
    if (end && end <= today0()) continue;
    const scores = D.rec.filter(x => x.k === 'score' && key(x.bird) === key(r.bird) && x.at >= r.at);
    const todays = scores.filter(x => x.at >= today0());
    const fq = r.f.freq ?? 3, per = fq === 0 ? 3 : 1, every = fq === 4 ? 2 : fq === 5 ? 7 : 1;
    const last = scores.length ? scores[scores.length - 1].at : r.at - every * DAY;
    const due = every > 1 ? today0() - midnight(last) >= every * DAY : todays.length < per;
    out.push({r, scores, todays, per, due});
  }
  return out;
}
function activeIncub() {
  const out = [];
  for (const r of D.rec.filter(x => x.k === 'incub' && !gone(x.bird))) {
    const s = spBy(r.sp), days = r.f.days || +spInfo(s).incub_days || 0;
    if (D.rec.some(x => key(x.bird) === key(r.bird) && x.at > r.at && ['hatch', 'tend'].includes(x.k))) continue;
    if (days && Date.now() > r.at + (days + 14) * DAY) continue;
    if (!days && Date.now() > r.at + 60 * DAY) continue;
    out.push({r, days, day: Math.floor((today0() - midnight(r.at)) / DAY) + 1});
  }
  return out;
}
function activeDiets() {
  return D.rec.filter(r => r.k === 'diet' && !gone(r.bird)).filter(r => {
    const d = [3, 7, 14, 0][r.f.until ?? 3]; if (d && until(r, d) <= today0()) return false;
    return !D.rec.some(x => x.k === 'diet' && key(x.bird) === key(r.bird) && x.at > r.at);
  });
}
function deptReminders() {
  const byKind = new Map();
  for (const r of D.rec.filter(x => x.k === 'dept' && x.f.rep)) byKind.set(r.f.kind ?? 'x', r);
  const out = [];
  for (const r of byKind.values()) {
    const last = D.rec.filter(x => x.k === 'dept' && (x.f.kind ?? 'x') === (r.f.kind ?? 'x')).pop();
    const next = midnight(last.at) + 7 * DAY;
    if (next <= today0() + DAY - 1) out.push({r, last, next});
  }
  return out;
}
function youngCount() { return D.rec.filter(r => (r.k === 'hatch' || r.k === 'birth') && r.at > Date.now() - 60 * DAY).reduce((s, r) => s + (r.f.n || 1), 0); }

/* ---------- calendar ---------- */
function calEvents() {
  const ev = new Map(), add = (ms, g, icn, it) => { const k = dayKey(ms); if (!ev.has(k)) ev.set(k, []); ev.get(k).push({g, icn, ...it}); };
  for (const r of D.rec) add(r.at, kGroup(r.k), kIcon(r.k), {r});
  for (const x of activeIncub()) if (x.days) add(x.r.at + x.days * DAY, 'breed', 'egg', {exp: 1, r: x.r, label: L('Spodziewane wyklucie', 'Ожидается выклев', 'Expected hatching')});
  for (const x of activeTreatments()) if (x.end) add(x.end - DAY, 'health', 'check', {exp: 1, r: x.r, label: L('Koniec leczenia', 'Конец лечения', 'Treatment ends')});
  for (const x of deptReminders()) add(Math.max(x.next, today0()), 'dept', 'pen', {exp: 1, r: x.r, label: pick('dept', x.r.f.kind)});
  return ev;
}

/* ---------- missing data ---------- */
function gaps() {
  const sps = [...D.sp.values()];
  return [
    [L('Gatunki bez terminu wysiadywania / ciąży', 'Виды без срока насиживания / беременности', 'Species without incubation / gestation period'), 'egg', sps.filter(s => !(isMammal(s) ? spInfo(s).gest_days : spInfo(s).incub_days)).map(s => ['sp', s.id, spName(s)])],
    [L('Gatunki bez statusu IUCN', 'Виды без статуса IUCN', 'Species without IUCN status'), 'book', sps.filter(s => !spInfo(s).iucn).map(s => ['sp', s.id, spName(s)])],
    [L('Gatunki bez opisu', 'Виды без описания', 'Species without description'), 'book', sps.filter(s => !['range', 'habitat', 'diet_zoo', 'husbandry'].some(k => infoTx(s, k))).map(s => ['sp', s.id, spName(s)])],
    [L('Zwierzęta bez płci', 'Животные без пола', 'Animals without sex'), 'bird', anActive().filter(a => !a.sex && !a.grp).map(a => ['an', a.id, anLine(a)])],
    [L('Zwierzęta bez znaku / obrączki', 'Животные без приметы / кольца', 'Animals without mark / ring'), 'tag', anActive().filter(a => !a.sex && !a.grp && false).length ? [] : anActive().filter(a => !a.ring && !a.chip && !a.grp).map(a => ['an', a.id, anLine(a)])]];
}
