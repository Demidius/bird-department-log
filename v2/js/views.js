// views.js — v2: screens (Now, Journal, Calendar, More), cards (animal, place, species, record), photos, login
const badge = (g, i, c = '') => `<span class="bl-badge ${c} g-${g}">${ic(i, c ? 16 : 22)}</span>`;
const head = (title, sub, extra = '') => `<div class="hd"><h1>${title}</h1>${sub ? `<span class="sub">${sub}</span>` : '<span class="sub"></span>'}${extra}<button class="me" data-scr="more" aria-label="${L('Konto', 'Аккаунт', 'Account')}">${esc(((myProfile && (myProfile.display_name || myProfile.login)) || '?').slice(0, 2).toUpperCase())}</button></div>`;
const offlineBar = () => navigator.onLine ? '' : `<div class="offbar">${ic('clock', 16, 2.4)}<span><b>${L('Brak sieci', 'Нет сети', 'No network')}</b> · ${L('dane mogą być nieaktualne, zapis wymaga sieci', 'данные могут быть устаревшими, для записи нужна сеть', 'data may be out of date, saving needs network')}</span></div>`;
const emptyBox = (icn, title, text, btn = '') => `<div class="emptyx">${ic(icn, 34, 1.8)}<b>${title}</b><p>${text}</p>${btn}</div>`;
const topbar = (label, edit) => `<div class="topbar"><button class="bl-x" data-back="1" aria-label="${L('Wstecz', 'Назад', 'Back')}">${ic('back', 18)}</button><span>${label}</span>${edit || '<span style="width:40px"></span>'}</div>`;

/* ---------- Now ---------- */
function taskCards() {
  const T = [];
  for (const x of activeTreatments()) {
    const a = anByName(x.r.bird), f = x.r.f;
    const times = x.todays.map(d => fTime(d.at) + ' ✓').join(' · ');
    T.push({id: 't' + x.r.id, g: 'health', i: 'pill', a, bird: x.r.bird, sp: x.r.sp, rx: x.r,
      what: [f.drug, f.dose, f.route].filter(Boolean).join(' ') + (f.freq != null ? ' · ' + pick('freq', f.freq) : ''),
      meta: [times, x.end ? L('do ', 'до ', 'until ') + fDate(x.end - DAY) : ''].filter(Boolean).join(' · ') || L('od ', 'с ', 'since ') + fDate(x.r.at),
      when: x.due ? L('dziś', 'сегодня', 'today') : '', act: x.due ? 'dose' : 'dosed', last: x.todays[x.todays.length - 1], need: x.due});
  }
  for (const x of activeWatches()) {
    const a = anByName(x.r.bird), last = x.scores[x.scores.length - 1];
    T.push({id: 'w' + x.r.id, g: 'obs', i: 'eye', a, bird: x.r.bird, sp: x.r.sp, watch: x.r,
      what: (x.r.note || pick('why_w', x.r.f.why) || kName('watch')) + ' · ' + pick('freq_w', x.r.f.freq ?? 3),
      meta: last ? L('ostatnio ', 'последняя ', 'last ') + `${last.f.v}/5 · ${relDay(last.at)}` : L('jeszcze bez oceny', 'ещё без оценки', 'no score yet'),
      when: x.due ? L('dziś', 'сегодня', 'today') : '', act: x.due ? 'score' : '', need: x.due});
  }
  for (const x of deptReminders()) T.push({id: 'd' + x.r.id, g: 'dept', i: 'pen', who: L('Dział', 'Отдел', 'Department'), dept: x.r,
    what: pick('dept', x.r.f.kind) + (x.r.note ? ': ' + x.r.note : ''), meta: L('co tydzień · ostatnio ', 'каждую неделю · последний раз ', 'weekly · last ') + relDay(x.last.at), when: L('dziś', 'сегодня', 'today'), act: 'done', need: 1});
  for (const x of activeIncub()) T.push({id: 'i' + x.r.id, g: 'breed', i: 'nest', a: anByName(x.r.bird), bird: x.r.bird, sp: x.r.sp,
    what: kName('incub') + ': ' + L('dzień ', 'день ', 'day ') + x.day + (x.days ? L(' z ', ' из ', ' of ') + x.days : ''),
    meta: x.days ? L('spodziewane wyklucie ≈ ', 'ожидаемый выклев ≈ ', 'expected hatching ≈ ') + fDate(x.r.at + x.days * DAY) : '', prog: x.days ? Math.min(1, x.day / x.days) : null});
  for (const r of activeDiets()) T.push({id: 'e' + r.id, g: 'keep', i: 'bowl', a: anByName(r.bird), bird: r.bird, sp: r.sp,
    what: [r.f.what, pick('diet', r.f.kind)].filter(Boolean).join(' · ') || kName('diet'), meta: [3, 7, 14, 0][r.f.until ?? 3] ? L('do ', 'до ', 'until ') + fDate(until(r, [3, 7, 14][r.f.until]) - DAY) : L('na stałe', 'постоянно', 'permanent')});
  return T;
}
function taskHTML(x) {
  const who = x.a ? `${esc(anTitle(x.a))} <small>· ${esc(suffix(x.a) || sexSym(x.a.sex))}</small>` : esc(x.who || x.bird || '');
  let acts = '';
  if (canWrite()) {
    if (x.act === 'dose') acts = `<div class="acts"><button class="bl-btn solid grow" data-dose="${x.rx.id}">${ic('check', 18, 2.4)}${L('Podaj', 'Подать', 'Give')}</button><button class="bl-btn icon" data-tmenu="${x.rx.id}" aria-label="${L('Więcej', 'Ещё', 'More')}">${ic('more', 18)}</button></div>`;
    if (x.act === 'dosed') acts = `<div class="acts"><span class="doneln">${ic('check', 14, 3)} ${L('dziś podane', 'сегодня подано', 'given today')}${x.last ? ' ' + fTime(x.last.at) + ' · ' + esc(nameOf(x.last.by)) : ''}${x.last && canEditRec(x.last) ? `<button data-undorec="${x.last.id}">${L('Cofnij', 'Отменить', 'Undo')}</button>` : ''}</span><button class="bl-btn icon" data-tmenu="${x.rx.id}">${ic('more', 18)}</button></div>`;
    if (x.act === 'score') acts = `<div class="acts"><div class="bl-score">${[1, 2, 3, 4, 5].map(n => `<button data-score="${x.watch.id}" data-n="${n}">${n}</button>`).join('')}</div><button class="bl-btn icon" data-wmenu="${x.watch.id}" aria-label="${L('Więcej', 'Ещё', 'More')}">${ic('more', 18)}</button></div>`;
    if (x.act === 'done') acts = `<div class="acts"><button class="bl-btn tint grow" data-deptdone="${x.dept.id}">${ic('check', 18, 2.4)}${L('Zrobione', 'Сделано', 'Done')}</button></div>`;
  }
  return `<div class="bl-task g-${x.g}" ${x.a ? `data-ani="${x.a.id}"` : ''}>${badge(x.g, x.i)}<div class="tt"><span class="who">${who}</span><span class="what">${esc(x.what)}</span>${x.meta ? `<span class="meta">${esc(x.meta)}</span>` : ''}${x.prog != null ? `<div class="bl-prog"><i style="width:${x.prog * 100}%"></i></div>` : ''}</div><span class="when">${x.when || ''}</span>${acts}</div>`;
}
const counters = () => `<div class="bl-counters">${[['health', 'cross', activeTreatments().length, L('w leczeniu', 'в лечении', 'treated')], ['obs', 'eye', activeWatches().length, L('obserwacja', 'наблюдение', 'watched')], ['breed', 'nest', activeIncub().length, L('wysiadują', 'насиживают', 'incubating')], ['breed', 'egg', youngCount(), L('młode', 'молодые', 'young')]]
  .map(([g, i, n, l]) => `<button class="bl-counter g-${g}" data-flt="${g}"><span class="t">${ic(i, 17)}<b>${n}</b></span><span class="l">${l}</span></button>`).join('')}</div>`;
function nowScreen() {
  const T = taskCards(), need = T.filter(x => x.need), going = T.filter(x => !x.need);
  const body = !T.length ? emptyBox('check', L('Na dziś wszystko zrobione', 'На сегодня всё сделано', 'All done for today'), L('Nowe zadania pojawią się tu same: leczenie, obserwacje, gniazda.', 'Новые задачи появятся здесь сами: лечение, наблюдения, гнёзда.', 'New tasks will appear here: treatments, observations, nests.'))
    : `${need.length ? `<div class="sec"><span>${L('Wymaga działania', 'Требует действия', 'Needs action')}</span><span>${need.length}</span></div><div class="stack">${need.map(taskHTML).join('')}</div>` : ''}${going.length ? `<div class="sec"><span>${L('Trwa teraz', 'Идёт сейчас', 'Ongoing')}</span><span>${going.length}</span></div><div class="stack">${going.map(taskHTML).join('')}</div>` : ''}`;
  return `${head(L('Teraz', 'Сейчас', 'Now'), fWeekday(Date.now()))}${offlineBar()}${counters()}<div class="scroll">${body}</div>`;
}

/* ---------- Journal ---------- */
const seen = () => { try { return JSON.parse(store.get('v2seen-' + me) || '{}'); } catch (x) { return {}; } };
const markSeen = id => { const s = seen(); s[id] = Date.now(); store.set('v2seen-' + me, JSON.stringify(s)); };
function recHTML(r) {
  const cm = D.com.get(r.id) || [], s = seen()[r.id] || 0, nn = cm.filter(c => c.created_by !== me && new Date(c.created_at).getTime() > s).length;
  return `<button class="bl-rec g-${kGroup(r.k)} recbtn" data-rec="${r.id}">${badge(kGroup(r.k), kIcon(r.k), 'sm')}<div><b>${esc(recTitle(r))}</b><span>${esc(recWho(r))}</span>${r.note ? `<small class="nt">${esc(r.note.slice(0, 140))}</small>` : ''}<small>${esc(nameOf(r.by))}</small></div><span class="rside"><time>${r.f.nt ? '—' : fTime(r.at)}</time>${cm.length ? `<span class="cc ${nn ? 'hasnew' : ''}">${ic('chat', 12, 2.4)}${cm.length}${nn ? `<i>+${nn}</i>` : ''}</span>` : ''}</span></button>`;
}
function recsByDay(list) { let d = '', h = ''; for (const r of list) { const k = dayKey(r.at); if (k !== d) { d = k; h += `<div class="bl-day">${relDay(r.at)}</div>`; } h += recHTML(r); } return h; }
function logsScreen() {
  const q = key(st.q);
  let list = D.rec.filter(r => st.flt === 'all' || kGroup(r.k) === st.flt);
  if (q) list = list.filter(r => key(recTitle(r) + ' ' + recWho(r) + ' ' + r.note + ' ' + r.bird).includes(q));
  list = list.slice().sort((a, b) => b.at - a.at).slice(0, st.lim || 150);
  const chips = `<div class="chiprow"><div class="bl-chips nowrap"><button class="bl-chip" data-flt="all" aria-pressed="${st.flt === 'all'}">${L('Wszystkie', 'Все', 'All')}</button>${GROUPS.map(g => `<button class="bl-chip g-${g.id}" data-flt="${g.id}" aria-pressed="${st.flt === g.id}">${ic(g.ic, 15)}${g.n()}</button>`).join('')}</div></div>`;
  return `${head(L('Dziennik', 'Журнал', 'Journal'))}${offlineBar()}${chips}<div class="scroll"><label class="bl-search">${ic('search', 18)}<input id="q" type="search" value="${esc(st.q || '')}" placeholder="${L('Szukaj w dzienniku…', 'Поиск по журналу…', 'Search the journal…')}" autocomplete="off"></label>
  ${list.length ? `<div class="stack">${recsByDay(list)}</div>${list.length >= (st.lim || 150) ? `<button class="bl-btn wide" data-more="1" style="margin-top:8px">${L('Pokaż więcej', 'Показать ещё', 'Show more')}</button>` : ''}` : emptyBox('list', L('Brak wpisów', 'Записей нет', 'No records'), L('Naciśnij „+”, aby dodać wpis.', 'Нажми «+», чтобы добавить запись.', 'Tap “+” to add a record.'))}</div>`;
}

/* ---------- Calendar ---------- */
function calScreen() {
  const now = new Date(), y = st.cy ?? now.getFullYear(), m = st.cm ?? now.getMonth(), isNow = y === now.getFullYear() && m === now.getMonth();
  const EV = calEvents(), first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(), cells = Math.ceil((first + days) / 7) * 7;
  const dows = [0, 1, 2, 3, 4, 5, 6].map(i => new Date(2024, 0, 1 + i).toLocaleDateString(LOC(), {weekday: 'short'}).replace('.', ''));
  const sel = st.dk || dayKey(Date.now());
  let grid = dows.map(x => `<span class="dw">${x}</span>`).join('');
  for (let i = 0; i < cells; i++) {
    const n = i - first + 1; if (n < 1 || n > days) { grid += '<span class="cd out"></span>'; continue; }
    const k = `${y}-${m}-${n}`, ev = (EV.get(k) || []), fut = new Date(y, m, n).getTime() > today0();
    const groups = [...new Set(ev.map(e => e.g + (e.exp || fut ? ':x' : '')))].slice(0, 5);
    grid += `<button class="cd ${isNow && n === now.getDate() ? 'today' : ''} ${sel === k ? 'on' : ''}" data-day="${k}"><span class="n">${n}</span><span class="evs">${groups.map(g => { const [gg, x] = g.split(':'); return x ? `<i class="dot guess" style="border-color:var(--${gg})"></i>` : `<i class="dot" style="background:var(--${gg})"></i>`; }).join('')}</span></button>`;
  }
  const dayItems = k => (EV.get(k) || []).sort((a, b) => (a.exp ? 1 : 0) - (b.exp ? 1 : 0) || a.r.at - b.r.at).map(e => e.exp ? `<button class="bl-rec g-${e.g} guessrow recbtn" data-rec="${e.r.id}">${badge(e.g, e.icn, 'sm')}<div><b>${L('Spodziewane: ', 'Ожидается: ', 'Expected: ')}${esc(e.label)}</b><span>${esc(recWho(e.r))}</span></div><time></time></button>` : recHTML(e.r)).join('');
  const mn = new Date(y, m, 1).toLocaleDateString(LOC(), {month: 'long', year: 'numeric'});
  let body;
  if (st.calMode === 'list') {
    const ks = [...EV.keys()].filter(k => k.startsWith(`${y}-${m}-`)).sort((a, b) => +b.split('-')[2] - +a.split('-')[2]);
    body = ks.length ? `<div class="stack">${ks.map(k => `<div class="bl-day">${fDay(new Date(y, m, +k.split('-')[2]).getTime())}</div>${dayItems(k)}`).join('')}</div>` : emptyBox('cal', L('Brak zdarzeń', 'Событий нет', 'No events'), '');
  } else {
    const [sy, sm, sd] = sel.split('-').map(Number);
    body = `<div class="mgrid" id="mgrid">${grid}</div><div class="bl-day">${fDay(new Date(sy, sm, sd).getTime())}</div><div class="stack">${dayItems(sel) || `<p class="empty">${L('Brak zdarzeń', 'Событий нет', 'No events')}</p>`}</div>`;
  }
  const todayB = `<button class="bl-btn todayb ${isNow ? 'is' : ''}" data-mon="0">${ic('cal', 17)}${L('Dziś', 'Сегодня', 'Today')}</button>`;
  return `${head(L('Kalendarz', 'Календарь', 'Calendar'), '', todayB)}<div class="scroll"><div class="calhead"><button class="bl-btn icon" data-mon="-1" aria-label="${L('Poprzedni miesiąc', 'Предыдущий месяц', 'Previous month')}">${ic('back', 20, 2.4)}</button><h2>${mn.charAt(0).toUpperCase() + mn.slice(1)}</h2><button class="bl-btn icon" data-mon="1" aria-label="${L('Następny miesiąc', 'Следующий месяц', 'Next month')}">${ic('chev', 20, 2.4)}</button></div>
  <div class="calsub"><div class="bl-seg two"><button data-cal="month" aria-pressed="${st.calMode !== 'list'}">${L('Miesiąc', 'Месяц', 'Month')}</button><button data-cal="list" aria-pressed="${st.calMode === 'list'}">${L('Lista', 'Список', 'List')}</button></div></div>${body}</div>`;
}

/* ---------- More ---------- */
function moreScreen() {
  const row = (attr, i, l, sub, n, cls = '') => `<button class="mrow ${cls}" ${attr}><span class="mic2">${ic(i, 20)}</span><span class="mt"><b>${l}</b>${sub ? `<small>${sub}</small>` : ''}</span>${n != null ? `<em>${n}</em>` : ''}<span class="chev">${ic('chev', 16, 2.4)}</span></button>`;
  const g = gaps(), gn = g.reduce((s, x) => s + x[2].length, 0), th = store.get('v2theme') || 'auto';
  return `${head(L('Więcej', 'Ещё', 'More'))}<div class="scroll">
  <div class="msec">${L('Katalog', 'Справочник', 'Catalogue')}</div><div class="mgrp">
   ${row('data-scr="animals"', 'bird', L('Zwierzęta', 'Животные', 'Animals'), L('karty zwierząt i grup', 'карточки животных и групп', 'animal and group cards'), anActive().length)}
   ${row('data-scr="places"', 'home', L('Woliery', 'Вольеры', 'Enclosures'), L('budynki, woliery, klatki', 'здания, вольеры, клетки', 'buildings, enclosures, cages'), D.pl.filter(p => p.active !== false).length)}
   ${row('data-scr="species"', 'book', L('Gatunki', 'Виды', 'Species'), L('opisy, terminy, zdjęcia', 'описания, сроки, фото', 'descriptions, periods, photos'), D.sp.size)}</div>
  <div class="msec">${L('Praca', 'Работа', 'Work')}</div><div class="mgrp">
   ${row('data-scr="gaps"', 'pen', L('Brakujące dane', 'Пропущенные данные', 'Missing data'), '', gn, 'warn')}
   ${row('data-scr="clog"', 'clock', L('Dziennik zmian', 'Журнал изменений', 'Change log'), L('kto, co i kiedy zmienił', 'кто, что и когда изменил', 'who changed what and when'))}
   ${row('data-msheet="csv"', 'list', L('Eksport CSV', 'Экспорт CSV', 'CSV export'), L('dziennik do Excela', 'журнал для Excel', 'journal for Excel'))}</div>
  <div class="msec">${L('Ustawienia', 'Настройки', 'Settings')}</div><div class="mgrp pad">
   <div class="mline"><span>${L('Motyw', 'Тема', 'Theme')}</span><div class="bl-seg three">${[['auto', L('Auto', 'Авто', 'Auto')], ['light', L('Jasny', 'Светлая', 'Light')], ['dark', L('Ciemny', 'Тёмная', 'Dark')]].map(([k, l]) => `<button data-thm="${k}" aria-pressed="${th === k}">${l}</button>`).join('')}</div></div>
   <div class="mline"><span>${L('Język', 'Язык', 'Language')}</span><div class="bl-seg three">${[['pl', 'Polski'], ['en', 'English'], ['ru', 'Русский']].map(([k, l]) => `<button data-lang="${k}" lang="${k}" aria-pressed="${lang === k}">${l}</button>`).join('')}</div></div>
   ${row('data-old="1"', 'back', L('Stara wersja strony', 'Старая версия сайта', 'Old version of the site'), L('na czas przejścia', 'на время перехода', 'during the transition'))}</div>
  <div class="msec">${L('Konto', 'Аккаунт', 'Account')}</div><div class="mgrp">
   <div class="acct"><span class="bl-av">${esc(((myProfile && (myProfile.display_name || myProfile.login)) || '?').slice(0, 2).toUpperCase())}</span><span><b>${esc(myProfile ? myProfile.display_name || myProfile.login : '')}</b><small>${esc(myProfile ? myProfile.login : '')} · ${roleName(role())}</small></span></div>
   ${isAdmin() ? row('data-scr="users"', 'users', L('Użytkownicy', 'Пользователи', 'Users'), L('konta pracowników działu', 'аккаунты сотрудников', 'staff accounts'), D.prof.size) : ''}
   ${row('data-msheet="pass"', 'lock', L('Zmień hasło', 'Сменить пароль', 'Change password'), '')}
   <button class="mrow out" data-logout="1"><span class="mic2">${ic('back', 20)}</span><span class="mt"><b>${L('Wyloguj', 'Выйти', 'Sign out')}</b></span></button></div>
  <p class="ver">${L('Dziennik działu ptaków', 'Журнал отдела птиц', 'Bird department log')} · v2 (${L('wersja próbna', 'пробная версия', 'trial version')})</p></div>`;
}
const roleName = r => ({admin: L('administrator', 'администратор', 'administrator'), staff: L('zapis', 'запись', 'write'), viewer: L('tylko odczyt', 'только чтение', 'read only')})[r] || '—';

/* ---------- lists ---------- */
function animalRows(list, checks) {
  const sel = st.multi;
  return list.map(a => `<div class="wrow"><button class="bl-who" data-ani="${a.id}"><span class="bl-av">${esc(anInit(a))}</span><span><b>${esc(anTitle(a))} <i>${a.grp ? '' : sexSym(a.sex)}</i></b><small>${esc([suffix(a), a.ring].filter(Boolean).join(' · ')) || '&nbsp;'}</small></span></button>${checks ? `<button class="ck ${sel.has(a.id) ? 'on' : ''}" data-ck="${a.id}" aria-pressed="${sel.has(a.id)}" aria-label="${L('Zaznacz', 'Отметить', 'Select')}">${sel.has(a.id) ? ic('check', 16, 3) : ''}</button>` : ''}</div>`).join('');
}
function animalsByPlace(checks, q) {
  const all = anActive().filter(a => !q || key(anLine(a) + ' ' + a.name + ' ' + a.ring + ' ' + anEncl(a) + ' ' + ((spBy(a.species_id) || {}).latin || '')).includes(q));
  const groups = new Map(); for (const a of all) { const k = anEncl(a) || ''; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(a); }
  const order = [...groups.keys()].sort((a, b) => (plName(plByName(a)) || 'zz').localeCompare(plName(plByName(b)) || 'zz', undefined, {numeric: true}));
  return order.map(k => { const list = groups.get(k).sort((a, b) => anLine(a).localeCompare(anLine(b), undefined, {numeric: true})); const all = list.every(a => st.multi.has(a.id));
    return `<div class="bl-pg pgck"><span>${esc(k ? plName(plByName(k)) || k : L('Bez woliery', 'Без вольера', 'No enclosure'))}</span><span class="pgr">${list.length}${checks ? `<button class="ck ${all ? 'on' : ''}" data-ckall="${esc(k)}" aria-pressed="${all}" aria-label="${L('Zaznacz wszystkie', 'Выбрать всех', 'Select all')}">${all ? ic('check', 16, 3) : ''}</button>` : ''}</span></div>${animalRows(list, checks)}`; }).join('') || `<p class="empty">${L('Nic nie znaleziono', 'Ничего не найдено', 'Nothing found')}</p>`;
}
function placeTree(openAttr = 'data-plc') {
  const row = (p, d) => { const kids = plKids(p.id), n = anOfPlace(p), sps = [...new Set(n.map(a => anTitle(a)))], open = !st.folded.has(p.id);
    return `<div class="trow" style="--d:${d}">${kids.length ? `<button class="tgl" data-fold="${p.id}" aria-expanded="${open}">${ic('chev', 18)}</button>` : '<span class="tgl"></span>'}<button class="bl-who" ${openAttr}="${p.id}"><span class="bl-av">${ic(p.kind === 'building' ? 'building' : 'home', 20)}</span><span><b>${esc(plName(p))}</b><small>${esc(kids.length && !n.length ? kids.length + ' ' + L('miejsc', 'мест', 'places') : sps.slice(0, 3).join(', ') + (sps.length > 3 ? ' +' + (sps.length - 3) : ''))}</small></span><span class="sx">${n.length + plDesc(p.id).reduce((s, k) => s + anOfPlace(k).length, 0) || ''}</span></button></div>${open ? kids.map(k => row(k, d + 1)).join('') : ''}`; };
  return `<div class="tree">${plKids(null).map(p => row(p, 0)).join('')}</div>`;
}
function listScreen(kind) {
  const q = key(st.lq);
  const search = ph => `<label class="bl-search" style="margin-bottom:8px">${ic('search', 18)}<input id="lq" type="search" value="${esc(st.lq || '')}" placeholder="${ph}" autocomplete="off"></label>`;
  const newBtn = (attr, t1, t2) => canWrite() ? `<button class="bl-who newani" ${attr}><span class="bl-av">${ic('plus', 20, 2.4)}</span><span><b>${t1}</b><small>${t2}</small></span><span class="sx">${ic('chev', 18)}</span></button>` : '';
  if (kind === 'species') {
    const list = [...D.sp.values()].filter(s => !q || key([s.name_pl, s.name_ru, s.name_en, s.latin].join(' ')).includes(q)).sort((a, b) => spName(a).localeCompare(spName(b)));
    return `${head(L('Gatunki', 'Виды', 'Species'))}<div class="scroll">${newBtn('data-edform="sp" data-new="1"', L('Nowy gatunek', 'Новый вид', 'New species'), L('AI może uzupełnić opis', 'нейросеть может дополнить описание', 'AI can fill in the description'))}${search(L('Nazwa, łacina…', 'Название, латынь…', 'Name, Latin…'))}<div class="stack">${list.map(s => { const n = anActive().filter(a => a.species_id === s.id).length, iu = spInfo(s).iucn;
      return `<button class="bl-who flat2" data-sp="${s.id}"><span class="bl-av">${esc(initials(s))}</span><span><b>${esc(spName(s))}</b><small><i>${esc(s.latin || '')}</i></small></span><span class="sx">${iu ? `<span class="iub" style="background:${IUCNC[iu] || '#ccc'}">${iu}</span>` : ''}${n || ''}</span></button>`; }).join('')}</div></div>`;
  }
  if (kind === 'places') return `${head(L('Woliery', 'Вольеры', 'Enclosures'))}<div class="scroll">${newBtn('data-edform="pl" data-new="1"', L('Nowe miejsce', 'Новое место', 'New place'), L('budynek, woliera, klatka, inkubator…', 'здание, вольер, клетка, инкубатор…', 'building, enclosure, cage, incubator…'))}${placeTree()}</div>`;
  return `${head(L('Zwierzęta', 'Животные', 'Animals'))}<div class="scroll">${newBtn('data-arrive="1"', L('Nowe zwierzę', 'Новое животное', 'New animal'), L('przybycie: inny ZOO, ratunek, konfiskata…', 'поступление: из другого зоопарка, спасение, конфискат…', 'arrival: another zoo, rescue, confiscation…'))}${search(L('Gatunek, imię, obrączka, woliera…', 'Вид, кличка, кольцо, вольер…', 'Species, name, ring, enclosure…'))}${anActive().length ? animalsByPlace(false, q) : emptyBox('bird', L('Brak zwierząt', 'Животных пока нет', 'No animals yet'), '')}</div>`;
}

/* ---------- photos ---------- */
const IUCNC = {LC: '#60C659', NT: '#CCE226', VU: '#F9E814', EN: '#FC7F3F', CR: '#D81E05', EW: '#542344', DD: '#D1D1C6'};
const IUCNN = () => ({LC: L('Najmniejszej troski', 'Вызывает наименьшие опасения', 'Least concern'), NT: L('Bliski zagrożenia', 'Близок к уязвимому', 'Near threatened'), VU: L('Narażony', 'Уязвимый', 'Vulnerable'), EN: L('Zagrożony', 'Под угрозой', 'Endangered'), CR: L('Krytycznie zagrożony', 'На грани исчезновения', 'Critically endangered'), EW: L('Wymarły na wolności', 'Исчез в дикой природе', 'Extinct in the wild'), DD: L('Brak danych', 'Недостаточно данных', 'Data deficient')});
const phOf = (type, id) => D.ph.filter(p => p.owner_type === type && p.owner_id === id);
function photosFor(kind, id) {
  const out = [], tag = (src, g, label, d) => ({src, g, label, d});
  const recPh = names => D.rec.filter(r => names.has(key(r.bird))).flatMap(r => phOf('record', r.id).map(p => Object.assign(tag('rec', kGroup(r.k), kName(r.k), r.at), {p})));
  if (kind === 'an') { const a = anById(id); if (!a) return []; out.push(...phOf('bird', a.id).map(p => Object.assign(tag('animal', '', L('Karta', 'Карта', 'Card'), new Date(p.created_at).getTime()), {p}))); out.push(...recPh(new Set([key(a.name)]))); const pl = plByName(anEncl(a)); if (pl) out.push(...phOf('encl', pl.id).map(p => Object.assign(tag('place', '', L('Woliera', 'Вольер', 'Enclosure'), new Date(p.created_at).getTime()), {p}))); }
  if (kind === 'pl') { const p0 = plById(id); if (!p0) return []; out.push(...phOf('encl', id).map(p => Object.assign(tag('place', '', L('Woliera', 'Вольер', 'Enclosure'), new Date(p.created_at).getTime()), {p}))); const an = anOfPlace(p0); out.push(...an.flatMap(a => phOf('bird', a.id).map(p => Object.assign(tag('animal', '', suffix(a) || anTitle(a), new Date(p.created_at).getTime()), {p})))); out.push(...recPh(new Set([key(p0.name), ...an.map(a => key(a.name))]))); }
  if (kind === 'sp') { const s = spBy(id); if (!s) return []; const w = spInfo(s).photo; if (w && w.src) out.push({src: 'species', g: '', label: 'Commons', d: 0, url: w.thumb || w.src, full: w.src}); out.push(...phOf('species', id).map(p => Object.assign(tag('species', '', L('Gatunek', 'Вид', 'Species'), new Date(p.created_at).getTime()), {p}))); const an = D.an.filter(a => a.species_id === id); out.push(...an.flatMap(a => phOf('bird', a.id).map(p => Object.assign(tag('animal', '', suffix(a) || anTitle(a), new Date(p.created_at).getTime()), {p})))); out.push(...recPh(new Set(an.map(a => key(a.name))))); }
  return out.sort((a, b) => b.d - a.d);
}
const phUrl = (x, full) => x.url ? (full ? x.full : x.url) : x.p ? urls.get(full ? x.p.path : thumbOf(x.p.path)) : '';
const thumb = (x, i) => { const u = phUrl(x); return `<button class="ph ${x.g ? 'g-' + x.g : ''}" data-ph="${i}">${u ? `<img src="${esc(u)}" alt="" loading="lazy">` : `<span class="pic">${ic(x.src === 'rec' ? kIcon('obs') : 'cam', 24)}</span>`}<span class="ptag ${x.g ? '' : 'n'}">${esc(x.label)}</span>${x.d ? `<span class="pd">${fDate(x.d)}</span>` : ''}</button>`; };
function photoBlock(kind, id, ownerType) {
  const all = photosFor(kind, id);
  const add = canWrite() && ownerType ? `<label class="secadd">${ic('cam', 15)}${L('Dodaj', 'Добавить', 'Add')}<input type="file" accept="image/*" multiple hidden data-upload="${ownerType}:${id}"></label>` : '';
  return `<div class="sec"><span>${L('Zdjęcia', 'Фотографии', 'Photos')} · ${all.length}</span>${add}</div>${all.length ? `<div class="pgrid four">${all.slice(0, 3).map(thumb).join('')}${all.length > 3 ? `<button class="ph more" data-gal="1"><span>+${all.length - 3}</span><small>${L('więcej', 'ещё', 'more')}</small></button>` : ''}</div>` : `<p class="empty">${L('Brak zdjęć', 'Фото пока нет', 'No photos yet')}</p>`}`;
}
function gallery(kind, id, ownerType) {
  const all = photosFor(kind, id), f = st.phf || 'all', cnt = k => all.filter(x => x.src === k).length;
  const tabs = [['all', L('Wszystkie', 'Все', 'All'), all.length], ...(kind === 'sp' ? [['species', L('Gatunek', 'Вид', 'Species'), cnt('species')]] : []), ['animal', kind === 'pl' ? L('Mieszkańcy', 'Жители', 'Residents') : kind === 'sp' ? L('Zwierzęta', 'Животные', 'Animals') : L('Karta', 'Карта', 'Card'), cnt('animal')], ['rec', L('Z wpisów', 'Из записей', 'From records'), cnt('rec')], ...(kind !== 'sp' ? [['place', L('Woliera', 'Вольер', 'Enclosure'), cnt('place')]] : [])];
  return `<div class="scrim" data-gal="0"></div><div class="bl-sheet full"><div class="grip"></div><div class="head"><h3>${L('Zdjęcia', 'Фотографии', 'Photos')}</h3><button class="bl-x" data-gal="0">${ic('x', 18)}</button></div><div class="shbody">
  <div class="bl-chips nowrap phch">${tabs.map(([k, l, n]) => `<button class="bl-chip" data-phf="${k}" aria-pressed="${f === k}">${l} <span class="cn">${n}</span></button>`).join('')}</div>
  <div class="pgrid">${canWrite() && ownerType ? `<label class="ph add">${ic('cam', 22)}<span>${L('Dodaj', 'Добавить', 'Add')}</span><input type="file" accept="image/*" multiple hidden data-upload="${ownerType}:${id}"></label>` : ''}${all.map((x, i) => f === 'all' || x.src === f ? thumb(x, i) : '').join('')}</div></div></div>`;
}
function lightbox(kind, id) { const x = photosFor(kind, id)[st.ph]; if (!x) return ''; const u = phUrl(x, true) || phUrl(x);
  return `<div class="lbx"><button class="bl-x lbc" data-ph="-1" aria-label="×">${ic('x', 18)}</button><div class="lbimg">${u ? `<img src="${esc(u)}" alt="">` : ic('cam', 48)}</div><div class="lbcap"><b>${esc(x.label)}</b><small>${x.d ? fDay(x.d) : ''}</small></div></div>`; }

/* ---------- cards ---------- */
function animalCard() {
  const a = anById(st.ani); if (!a) return `${topbar(L('Zwierzęta', 'Животные', 'Animals'))}<div class="scroll"><p class="empty">${L('Karta usunięta', 'Карточка удалена', 'Card deleted')}</p></div>`;
  const s = spBy(a.species_id), plc = plByName(anEncl(a));
  const facts = [[L('Płeć', 'Пол', 'Sex'), a.grp ? `♂ ${a.grp.m || 0} · ♀ ${a.grp.f || 0} · ? ${a.grp.u || 0}${a.grp.j ? ' · ' + L('młode ', 'мол. ', 'young ') + a.grp.j : ''}` : ({m: L('samiec', 'самец', 'male'), f: L('samica', 'самка', 'female')})[a.sex] || L('nieznana', 'неизвестен', 'unknown')],
    [L('Woliera', 'Вольер', 'Enclosure'), plc ? plName(plc) : anEncl(a) || '—'], [L('Znak / obrączka', 'Примета / кольцо', 'Mark / ring'), [a.ring, a.chip].filter(Boolean).join(' · ') || '—'], ['IUCN', spInfo(s).iucn || '—']];
  if (a.born) facts.push([L('Urodzony', 'Родился', 'Born'), fDate(new Date(a.born).getTime())]);
  if (a.arrived) facts.push([L('Przybył', 'Поступил', 'Arrived'), fDate(new Date(a.arrived).getTime())]);
  const going = taskCards().filter(x => x.a && x.a.id === a.id), mates = plc ? anOfPlace(plc).filter(x => x.id !== a.id) : [];
  const recs = recsOf(a.name).slice().sort((x, y) => y.at - x.at);
  const par = (a.parents || []).map(anById).filter(Boolean);
  return `<div class="cardscr">${topbar(L('Zwierzęta', 'Животные', 'Animals'), canWrite() ? `<button class="bl-x" data-edform="an" aria-label="${L('Edytuj', 'Редактировать', 'Edit')}">${ic('pen', 18)}</button>` : '')}
  <div class="scroll"><div class="ahero"><span class="bl-av big">${esc(anInit(a))}</span><div>${s ? `<button class="splink" data-sp="${s.id}"><h1>${esc(spName(s))}</h1><span class="lat"><i>${esc(s.latin || '')}</i> ${ic('chev', 14, 2.6)}</span></button>` : `<h1>${esc(a.name)}</h1>`}<p class="sfx">${esc(suffix(a) || a.name)}</p></div></div>
  <dl class="bl-facts">${facts.map(([x, y]) => `<div><dt>${x}</dt><dd>${esc(y)}</dd></div>`).join('')}</dl>
  ${a.note ? `<div class="note">${esc(a.note)}</div>` : ''}${par.length ? `<p class="tip" style="margin:8px 2px 0">${L('Rodzice: ', 'Родители: ', 'Parents: ')}${par.map(p => `<button class="lnkb" data-ani="${p.id}">${esc(suffix(p) || p.name)}</button>`).join(', ')}</p>` : ''}
  ${canWrite() ? `<button class="bl-btn addrec" data-add="an">${ic('plus', 20, 2.6)}${L('Dodaj wpis', 'Добавить запись', 'Add record')}</button>` : ''}
  ${going.length ? `<div class="sec"><span>${L('Trwa teraz', 'Идёт сейчас', 'Ongoing')}</span><span>${going.length}</span></div><div class="stack">${going.map(taskHTML).join('')}</div>` : ''}
  ${mates.length ? `<div class="sec"><span>${L('W tej samej wolierze', 'В том же вольере', 'In the same enclosure')}</span><span>${mates.length}</span></div><div class="stack">${mates.map(m => `<button class="bl-who flat2" data-ani="${m.id}"><span class="bl-av">${esc(anInit(m))}</span><span><b>${esc(anTitle(m))}</b><small>${esc(suffix(m)) || '&nbsp;'}</small></span><span class="sx">${m.grp ? '' : sexSym(m.sex)}</span></button>`).join('')}</div>` : ''}
  ${photoBlock('an', a.id, 'bird')}
  <div class="sec"><span>${L('Dziennik', 'Журнал', 'Journal')}</span><span>${recs.length}</span></div><div class="stack">${recs.length ? recsByDay(recs.slice(0, 60)) : `<p class="empty">${L('Brak wpisów', 'Записей пока нет', 'No records yet')}</p>`}</div>
  </div>${st.gal ? gallery('an', a.id, 'bird') : ''}${st.ph >= 0 ? lightbox('an', a.id) : ''}</div>`;
}
function placeCard() {
  const p = plById(st.plc); if (!p) return `${topbar(L('Woliery', 'Вольеры', 'Enclosures'))}`;
  const kids = plKids(p.id), res = anOfPlace(p), parent = plById(p.parent_id);
  const sps = [...new Set(res.map(a => a.species_id))];
  const KIND = {building: L('Budynek', 'Здание', 'Building'), aviary: L('Woliera', 'Вольера', 'Aviary'), enclosure: L('Wybieg', 'Выгул', 'Enclosure'), cage: L('Klatka', 'Клетка', 'Cage'), incubator: L('Inkubator', 'Инкубатор', 'Incubator'), brooder: L('Odchowalnia', 'Брудер', 'Brooder'), room: L('Pomieszczenie', 'Помещение', 'Room'), quarantine: L('Kwarantanna', 'Карантин', 'Quarantine'), pond: L('Basen', 'Водоём', 'Pond'), other: L('Inne', 'Другое', 'Other')};
  const facts = [[L('Typ', 'Тип', 'Type'), KIND[p.kind] || p.kind], [L('Wchodzi w skład', 'Входит в', 'Part of'), parent ? plName(parent) : '—'], [L('Zwierzęta', 'Животные', 'Animals'), res.length], [L('Gatunki', 'Виды', 'Species'), sps.length]];
  if (p.area) facts.push([L('Powierzchnia', 'Площадь', 'Area'), p.area]); if (p.capacity) facts.push([L('Pojemność', 'Вместимость', 'Capacity'), p.capacity]);
  const recs = recsOfPlace(p).sort((x, y) => y.at - x.at);
  return `<div class="cardscr">${topbar(L('Woliery', 'Вольеры', 'Enclosures'), canWrite() ? `<button class="bl-x" data-edform="pl" aria-label="${L('Edytuj', 'Редактировать', 'Edit')}">${ic('pen', 18)}</button>` : '')}
  <div class="scroll"><div class="ahero"><span class="bl-av big">${ic(p.kind === 'building' ? 'building' : 'home', 32)}</span><div><h1>${esc(plName(p))}</h1><p class="sfx">${esc(parent ? plName(parent) : KIND[p.kind] || '')}</p></div></div>
  <dl class="bl-facts">${facts.map(([x, y]) => `<div><dt>${x}</dt><dd>${esc(y)}</dd></div>`).join('')}</dl>
  ${canWrite() ? `<button class="bl-btn addrec" data-add="pl">${ic('plus', 20, 2.6)}${L('Dodaj wpis', 'Добавить запись', 'Add record')}</button>` : ''}
  ${p.note ? `<div class="note">${esc(p.note)}</div>` : ''}
  ${kids.length ? `<div class="sec"><span>${L('Miejsca w środku', 'Места внутри', 'Places inside')}</span><span>${kids.length}</span></div><div class="stack">${kids.map(k => `<button class="bl-who flat2" data-plc="${k.id}"><span class="bl-av">${ic('home', 20)}</span><span><b>${esc(plName(k))}</b><small>${[...new Set(anOfPlace(k).map(anTitle))].slice(0, 2).join(', ')}</small></span><span class="sx">${anOfPlace(k).length}</span></button>`).join('')}</div>` : ''}
  ${res.length ? `<div class="sec"><span>${L('Mieszkańcy', 'Жители', 'Residents')}</span><span>${res.length}</span></div><div class="stack">${sps.map(sid => { const n = res.filter(a => a.species_id === sid); return `<div class="spgrp"><div class="sph">${esc(spName(spBy(sid)))} <span>${n.length}</span></div>${n.map(a => `<button class="bl-who flat2" data-ani="${a.id}"><span class="bl-av">${esc(anInit(a))}</span><span><b>${esc(suffix(a) || anTitle(a))}</b>${a.ring ? `<small>${esc(a.ring)}</small>` : ''}</span><span class="sx">${a.grp ? '' : sexSym(a.sex)}</span></button>`).join('')}</div>`; }).join('')}</div>` : ''}
  ${photoBlock('pl', p.id, 'encl')}
  <div class="sec"><span>${L('Dziennik', 'Журнал', 'Journal')}</span><span>${recs.length}</span></div><div class="stack">${recs.length ? recsByDay(recs.slice(0, 60)) : `<p class="empty">${L('Brak wpisów', 'Записей пока нет', 'No records yet')}</p>`}</div>
  </div>${st.gal ? gallery('pl', p.id, 'encl') : ''}${st.ph >= 0 ? lightbox('pl', p.id) : ''}</div>`;
}
function speciesCard() {
  const s = spBy(st.sp); if (!s) return topbar(L('Gatunki', 'Виды', 'Species'));
  const inf = spInfo(s), mam = isMammal(s), list = anActive().filter(a => a.species_id === s.id), pls = [...new Set(list.map(a => anEncl(a)))];
  const sx = k => list.filter(a => !a.grp && a.sex === k).length + list.filter(a => a.grp).reduce((n, a) => n + (+a.grp[{m: 'm', f: 'f', '': 'u'}[k]] || 0), 0);
  const dd = v => v ? `${v} ${L('dni', 'дн.', 'days')}` : '';
  const facts = [[L('Systematyka', 'Систематика', 'Taxonomy'), 'tag', [infoTx(s, 'order'), infoTx(s, 'family')].filter(Boolean).join(' · ')], [L('Wielkość', 'Размер', 'Size'), 'scale', infoTx(s, 'size')], [L('Długość życia', 'Продолжительность жизни', 'Lifespan'), 'clock', infoTx(s, 'life')],
    mam ? [L('Ciąża', 'Беременность', 'Gestation'), 'plus', dd(inf.gest_days)] : [L('Wysiadywanie', 'Насиживание', 'Incubation'), 'egg', dd(inf.incub_days) + (inf.incub_range && inf.incub_range != inf.incub_days ? ` (${inf.incub_range})` : '')],
    mam ? null : [L('Do opuszczenia gniazda', 'До вылета из гнезда', 'Until fledging'), 'nest', dd(inf.fledge_days)]].filter(Boolean);
  const filled = facts.filter(f => f[2]), missing = facts.length - filled.length, tab = st.spTab || 'wild';
  const SEC = {wild: [['range', 'home', L('Zasięg', 'Ареал', 'Range')], ['habitat', 'home', L('Siedlisko', 'Местообитание', 'Habitat')], ['diet_wild', 'bowl', L('Pokarm w naturze', 'Питание в природе', 'Diet in the wild')], ['behaviour', 'eye', L('Zachowanie', 'Поведение', 'Behaviour')], ['breeding', 'egg', L('Rozród', 'Размножение', 'Breeding')]],
    zoo: [['diet_zoo', 'bowl', L('Żywienie w ZOO', 'Кормление в зоопарке', 'Diet in the zoo')], ['husbandry', 'home', L('Utrzymanie', 'Содержание', 'Husbandry')], ['health', 'cross', L('Zdrowie', 'Здоровье', 'Health')], ['sex', 'bird', L('Różnice płci', 'Половые различия', 'Sex differences')]]};
  const acc = SEC[tab].map(([k, i, l]) => { const v = infoTx(s, k), open = st.acc.has(k); return `<div class="acc ${open ? 'open' : ''}"><button class="acch" data-acc="${k}">${ic(i, 17)}<span>${l}</span>${v ? '' : `<em>${L('brak danych', 'нет данных', 'no data')}</em>`}<span class="chev">${ic('chev', 16, 2.4)}</span></button>${open ? `<div class="accb">${v ? esc(v) : `<span class="muted">${L('Uzupełnij w edycji karty lub poproś AI.', 'Заполни в правке карточки или попроси нейросеть.', 'Fill in when editing or ask the AI.')}</span>`}</div>` : ''}</div>`; }).join('');
  const recs = D.rec.filter(r => r.sp === s.id).sort((a, b) => b.at - a.at), w = inf.photo;
  const iu = inf.iucn;
  return `<div class="cardscr">${topbar(L('Gatunki', 'Виды', 'Species'), canWrite() ? `<button class="bl-x" data-edform="sp" aria-label="${L('Edytuj', 'Редактировать', 'Edit')}">${ic('pen', 18)}</button>` : '')}
  <div class="scroll"><div class="sphero">${w && w.src ? `<img src="${esc(w.thumb || w.src)}" alt="">` : ic(mam ? 'bird' : 'bird', 40)}<span class="phn">${w && w.credit ? esc(w.credit) + ' · ' : ''}${w && w.src ? 'Wikimedia Commons' : L('brak zdjęcia', 'нет фото', 'no photo')}</span><span class="grpb">${mam ? L('Ssak', 'Млекопитающее', 'Mammal') : L('Ptak', 'Птица', 'Bird')}</span></div>
  <h1 class="sph1">${esc(spName(s))}</h1><p class="lat" style="margin:2px 2px 0"><i>${esc(s.latin || '')}</i></p>
  ${iu ? `<div class="spbadges"><span class="iucn"><b style="background:${IUCNC[iu] || '#ccc'};color:${['CR', 'EW'].includes(iu) ? '#fff' : '#13201A'}">${iu}</b>${IUCNN()[iu] || ''}</span>${infoTx(s, 'cites') ? `<span class="iucn">CITES ${esc(infoTx(s, 'cites'))}</span>` : ''}</div>` : ''}
  <div class="spbadges">${[['PL', s.name_pl], ['RU', s.name_ru], ['EN', s.name_en]].filter(x => x[1]).map(([l, v]) => `<span class="nm"><em>${l}</em>${esc(v)}</span>`).join('')}</div>
  ${filled.length ? `<dl class="ffacts">${filled.map(([l, i, v]) => `<div><dt>${ic(i, 14)}${l}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
  ${missing && canWrite() ? `<button class="gaps" data-edform="sp">${ic('pen', 14)}${L('Brakuje danych: ', 'Не хватает данных: ', 'Missing data: ')}${missing} — ${L('uzupełnij', 'дополнить', 'fill in')}</button>` : ''}
  <div class="sec"><span>${L('W dziale', 'В отделе', 'In the department')}</span><span></span></div>
  <div class="deptbox"><div class="dstats"><div><b>${list.reduce((n, a) => n + (a.grp ? grpTotal(a.grp) : 1), 0)}</b><span>${L('w kolekcji', 'в коллекции', 'in collection')}</span></div><div><b>♂${sx('m')} ♀${sx('f')} ?${sx('')}</b><span>${L('skład', 'состав', 'composition')}</span></div><div><b>${pls.length}</b><span>${L('woliery', 'вольеры', 'enclosures')}</span></div></div>
  <div class="dlist">${pls.map(pn => `<div class="sph">${esc(plName(plByName(pn)) || pn || '—')} <span>${list.filter(a => anEncl(a) === pn).length}</span></div>${list.filter(a => anEncl(a) === pn).map(a => `<button class="bl-who flat2" data-ani="${a.id}"><span class="bl-av">${esc(anInit(a))}</span><span><b>${esc(suffix(a) || anTitle(a))}</b>${a.ring ? `<small>${esc(a.ring)}</small>` : ''}</span><span class="sx">${a.grp ? '' : sexSym(a.sex)}</span></button>`).join('')}`).join('') || `<p class="empty">${L('Brak w kolekcji', 'Нет в коллекции', 'Not in the collection')}</p>`}</div></div>
  ${photoBlock('sp', s.id, 'species')}
  <div class="sec"><span>${L('Opis gatunku', 'Описание вида', 'Description')}</span><span></span></div>
  <div class="bl-seg two" style="margin-bottom:8px"><button data-sptab="wild" aria-pressed="${tab === 'wild'}">${L('W naturze', 'В природе', 'In the wild')}</button><button data-sptab="zoo" aria-pressed="${tab === 'zoo'}">${L('W ZOO', 'В зоопарке', 'In the zoo')}</button></div>
  <div class="accs">${acc}</div>
  <div class="sec"><span>${L('Notatki działu', 'Заметки отдела', 'Department notes')}</span><span></span></div>
  ${s.note ? `<div class="note">${esc(s.note)}</div>` : canWrite() ? `<button class="notebox" data-edform="sp">${ic('pen', 16)}<span>${L('Dodaj notatkę działu', 'Добавить заметку отдела', 'Add a department note')}</span></button>` : ''}
  <div class="sec"><span>${L('Ostatnie wpisy', 'Последние записи', 'Latest records')}</span><span>${recs.length}</span></div><div class="stack">${recs.slice(0, 5).map(recHTML).join('') || `<p class="empty">${L('Brak wpisów', 'Записей пока нет', 'No records yet')}</p>`}</div>
  </div>${st.gal ? gallery('sp', s.id, 'species') : ''}${st.ph >= 0 ? lightbox('sp', s.id) : ''}</div>`;
}
function recCard() {
  const r = D.rec.find(x => x.id === st.rec); if (!r) return `${topbar(L('Dziennik', 'Журнал', 'Journal'))}<div class="scroll"><p class="empty">${L('Wpis usunięty', 'Запись удалена', 'Record deleted')}</p></div>`;
  const g = kGroup(r.k), a = anByName(r.bird), mine = canEditRec(r), com = commentsOn ? (D.com.get(r.id) || []) : [];
  const ph = phOf('record', r.id);
  const s = seen()[r.id] || 0, roots = com.filter(c => !c.parent_id), kids = id => com.filter(c => c.parent_id === id);
  const ini = n => String(n || '?').split(/[ .]/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const cH = (c, reply) => { const isNew = c.created_by !== me && new Date(c.created_at).getTime() > s; return `<div class="cmt ${reply ? 'reply' : ''}"><span class="bl-av sm2">${ini(nameOf(c.created_by))}</span><div><p class="ch"><b>${esc(nameOf(c.created_by))}</b> <span>${relDay(new Date(c.created_at).getTime())} ${fTime(new Date(c.created_at).getTime())}</span>${isNew ? `<em class="nw">${L('nowy', 'новый', 'new')}</em>` : ''}</p><p class="ct">${esc(c.body)}</p>${!reply && canWrite() ? `<button class="rpl" data-reply="${c.id}">${L('Odpowiedz', 'Ответить', 'Reply')}</button>` : ''}${(c.created_by === me || isAdmin()) ? `<button class="rpl del" data-delcom="${c.id}">${L('Usuń', 'Удалить', 'Delete')}</button>` : ''}</div></div>`; };
  const replyTo = st.replyTo ? com.find(c => c.id === st.replyTo) : null;
  const details = recDetails(r);
  return `<div class="cardscr g-${g}">${topbar(L('Dziennik', 'Журнал', 'Journal'), mine ? `<button class="bl-x" data-editrec="1" aria-label="${L('Edytuj', 'Редактировать', 'Edit')}">${ic('pen', 18)}</button>` : '')}
  <div class="scroll"><div class="rhero">${badge(g, kIcon(r.k))}<div><p class="rgrp">${GROUPS.find(x => x.id === g).n()}</p><h1>${esc(recTitle(r))}</h1></div></div>
  ${a ? `<button class="bl-whochip" data-ani="${a.id}"><span class="bl-av">${esc(anInit(a))}</span><span><b>${esc(anLine(a))}</b><small>${a.grp ? '' : sexSym(a.sex) + ' · '}${esc(plName(plByName(anEncl(a))) || anEncl(a))}</small></span><em>${ic('chev', 18)}</em></button>` : `<div class="bl-whochip"><span class="bl-av">${ic(r.f.place ? 'home' : 'building', 20)}</span><span><b>${esc(recWho(r))}</b></span></div>`}
  <dl class="bl-facts" style="margin-top:10px"><div><dt>${L('Kiedy', 'Когда', 'When')}</dt><dd>${relDay(r.at)}${r.f.nt ? '' : ' ' + fTime(r.at)}</dd></div><div><dt>${L('Autor', 'Автор', 'Author')}</dt><dd>${esc(nameOf(r.by))}</dd></div>${details.map(([x, y]) => `<div><dt>${x}</dt><dd>${esc(y)}</dd></div>`).join('')}</dl>
  ${r.note ? `<div class="rnote">${esc(r.note)}</div>` : ''}
  ${ph.length ? `<div class="pgrid" style="margin-top:10px">${ph.map(p => `<button class="ph" data-open="${esc(p.path)}">${urls.get(thumbOf(p.path)) ? `<img src="${esc(urls.get(thumbOf(p.path)))}" alt="">` : `<span class="pic">${ic('cam', 22)}</span>`}</button>`).join('')}</div>` : ''}
  ${mine ? `<div class="bl-row" style="gap:6px;margin-top:10px"><button class="bl-btn" style="flex:1" data-editrec="1">${ic('pen', 17)}${L('Edytuj wpis', 'Редактировать запись', 'Edit record')}</button><button class="bl-btn" data-delrec="1" style="color:var(--health)">${ic('x', 17)}${L('Usuń', 'Удалить', 'Delete')}</button></div>` : `<p class="ro">${ic('lock', 15)} ${L('Edytować może autor lub administrator — możesz dodać komentarz.', 'Редактировать может автор или администратор — можно добавить комментарий.', 'Only the author or an admin can edit — you can comment.')}</p>`}
  ${commentsOn ? `<div class="sec"><span>${L('Komentarze', 'Комментарии', 'Comments')}</span><span>${com.length}</span></div><div class="stack">${roots.map(c => cH(c) + kids(c.id).map(k => cH(k, 1)).join('')).join('') || `<p class="empty">${L('Brak komentarzy', 'Комментариев пока нет', 'No comments yet')}</p>`}</div>` : ''}
  </div>${commentsOn && canWrite() ? `<div class="cbar">${replyTo ? `<div class="rto">${L('Odpowiedź dla', 'Ответ для', 'Reply to')} <b>${esc(nameOf(replyTo.created_by))}</b><button data-reply="">${ic('x', 14, 2.6)}</button></div>` : ''}<div class="cin"><div class="bl-text"><textarea id="cin" rows="1" placeholder="${L('Dodaj komentarz…', 'Добавить комментарий…', 'Add a comment…')}">${esc(st.cin || '')}</textarea>${micBtn('cin')}</div><button class="bl-btn solid send" data-send="1" aria-label="${L('Wyślij', 'Отправить', 'Send')}">${ic('chev', 20, 2.6)}</button></div></div>` : ''}${st.lbx ? `<div class="lbx"><button class="bl-x lbc" data-open="" aria-label="×">${ic('x', 18)}</button><div class="lbimg"><img src="${esc(urls.get(st.lbx) || '')}" alt=""></div></div>` : ''}</div>`;
}
function recDetails(r) {
  const f = r.f, out = [], P = (k, v) => v !== '' && v != null && out.push([k, v]);
  if (r.k === 'arrive') { P(L('Skąd', 'Откуда', 'From'), f.from != null ? pick('from', f.from) : ''); P(L('Instytucja', 'Организация', 'Institution'), f.org); P(L('Dokąd', 'Куда', 'To'), plName(plByName(f.to)) || f.to); }
  else if (f.from || f.to) { P(L('Skąd', 'Откуда', 'From'), plName(plByName(f.from)) || f.from); P(L('Dokąd', 'Куда', 'To'), plName(plByName(f.to)) || f.to); }
  if (f.why != null && r.k === 'expo') P(L('Przyczyna', 'Причина', 'Reason'), pick('mvwhy', f.why));
  if (f.reason) P(L('Powód', 'Причина', 'Reason'), f.reason);
  if (f.freq != null) P(L('Jak często', 'Как часто', 'How often'), pick('freq', f.freq));
  if (f.days) P(L('Kurs', 'Курс', 'Course'), f.days + ' ' + L('dni', 'дн.', 'days'));
  if (f.where) P(L('Gdzie', 'Где', 'Where'), pick(f.m ? 'where_m' : 'where', f.where));
  if (f.sev != null) P(L('Jak poważnie', 'Насколько серьёзно', 'Severity'), pick('sev', f.sev));
  if (f.res != null) P(L('Wynik', 'Результат', 'Result'), pick('res', f.res));
  if (f.beh) P(L('Zauważono', 'Заметили', 'Seen'), pick('beh', f.beh));
  if (f.v) P(L('Ocena', 'Оценка', 'Score'), f.v + '/5');
  if (f.n) P(L('Ile', 'Сколько', 'How many'), f.n);
  if (f.w) P(L('Masa', 'Вес', 'Weight'), `${f.w} ${f.wu || 'kg'}`);
  if (f.wing != null) P(L('Przycięcie lotek', 'Подрезка крыльев', 'Wing clip'), pick('wing', f.wing));
  if (f.mark) P(L('Znakowanie', 'Мечение', 'Marking'), f.mark);
  if (f.cause != null) P(L('Przyczyna', 'Причина', 'Cause'), pick('cause', f.cause));
  if (f.with) P(L('Z kim', 'С кем', 'With'), f.with);
  if (f.by && f.by.length) P(L('Kto', 'Кто', 'Who'), f.by.join(', '));
  if (f.org && r.k !== 'arrive') P(L('Instytucja', 'Организация', 'Institution'), f.org);
  return out;
}

/* ---------- missing data, change log, users ---------- */
function gapsScreen() {
  const G = gaps(), op = st.gopen ?? 0;
  return `${head(L('Brakujące dane', 'Пропущенные данные', 'Missing data'))}<div class="scroll"><p class="tip" style="margin:0 2px 10px">${L('Uzupełnij ręcznie albo poproś AI — pól z kłódką AI nie zmieni.', 'Заполни вручную или попроси нейросеть — поля с замком она не тронет.', 'Fill in by hand or ask the AI — it will not touch locked fields.')}</p>
  <div class="accs">${G.map(([l, i, list], gi) => `<div class="acc ${op === gi ? 'open' : ''}"><button class="acch" data-gopen="${gi}">${ic(i, 17)}<span>${l}</span><em class="gn">${list.length}</em><span class="chev">${ic('chev', 16, 2.4)}</span></button>${op === gi ? `<div class="glist">${list.map(([t2, id, n]) => `<button ${t2 === 'sp' ? `data-sp="${id}"` : `data-ani="${id}"`}><span>${esc(n)}</span>${ic('chev', 14, 2.4)}</button>`).join('') || `<p class="tip">${L('Wszystko uzupełnione', 'Всё заполнено', 'All filled in')}</p>`}</div>` : ''}</div>`).join('')}</div></div>`;
}
function clogScreen() {
  const tab = st.cltab || 'all', list = D.log.filter(e => tab === 'all' || e.kind === tab).slice(0, 200);
  const ENT = {records: L('wpis', 'запись', 'record'), collection: L('zwierzę', 'животное', 'animal'), species: L('gatunek', 'вид', 'species'), enclosures: L('miejsce', 'место', 'place'), photos: L('zdjęcie', 'фото', 'photo'), profiles: L('konto', 'аккаунт', 'account'), app: L('aplikacja', 'приложение', 'app')};
  const ACT = {insert: L('dodał(a)', 'добавил(а)', 'added'), update: L('zmienił(a)', 'изменил(а)', 'changed'), delete: L('usunął(ęła)', 'удалил(а)', 'deleted'), note: ''};
  return `${head(L('Dziennik zmian', 'Журнал изменений', 'Change log'))}<div class="chiprow"><div class="bl-chips nowrap">${[['all', L('Wszystko', 'Все', 'All')], ['user', L('Ludzie', 'Люди', 'People')], ['ai', 'AI'], ['dev', L('Rozwój', 'Разработка', 'Development')]].map(([k, l]) => `<button class="bl-chip" data-cltab="${k}" aria-pressed="${tab === k}">${l}</button>`).join('')}</div></div>
  <div class="scroll"><div class="stack">${list.map(e => { const who = e.kind === 'ai' ? 'AI' : e.kind === 'dev' ? 'v' + (e.ver || '') : nameOf(e.actor); const at = new Date(e.at).getTime();
    return `<div class="cl"><span class="bl-av sm2 ${e.kind}">${e.kind === 'dev' ? ic('pen', 14) : esc(String(who).slice(0, 2).toUpperCase())}</span><div><p><b>${esc(who)}</b> ${e.kind === 'dev' ? esc(e.summary || '') : `${ACT[e.action] || e.action} ${ENT[e.entity] || e.entity}${e.label ? ': ' + esc(e.label) : ''}${e.fields && e.fields.length && e.action === 'update' ? ` <span class="muted">(${esc(e.fields.join(', '))})</span>` : ''}`}</p><small>${relDay(at)} ${fTime(at)}</small></div></div>`; }).join('') || `<p class="empty">${L('Pusto', 'Пусто', 'Empty')}</p>`}</div></div>`;
}
function usersScreen() {
  const list = [...D.prof.values()].sort((a, b) => (a.display_name || a.login).localeCompare(b.display_name || b.login));
  return `${head(L('Użytkownicy', 'Пользователи', 'Users'))}<div class="scroll"><button class="bl-btn wide" data-uform="new" style="margin-bottom:10px;background:var(--fab);color:var(--on-fab)">${ic('plus', 17, 2.6)}${L('Dodaj pracownika', 'Добавить сотрудника', 'Add staff member')}</button>
  <div class="mgrp">${list.map(p => `<button class="mrow" data-uform="${p.id}"><span class="bl-av sm2">${esc((p.display_name || p.login).slice(0, 2).toUpperCase())}</span><span class="mt"><b>${esc(p.display_name || p.login)}</b><small>${esc(p.login)}${p.active === false ? ' · ' + L('zablokowany', 'заблокирован', 'blocked') : ''}</small></span><span class="role ${p.role}">${roleName(p.role)}</span><span class="chev">${ic('chev', 16, 2.4)}</span></button>`).join('')}</div></div>`;
}
function loginScreen(mode) {
  const langs = `<div class="bl-seg three" style="margin-top:14px">${[['pl', 'Polski'], ['en', 'English'], ['ru', 'Русский']].map(([k, l]) => `<button data-lang="${k}" lang="${k}" aria-pressed="${lang === k}">${l}</button>`).join('')}</div>`;
  if (mode === 'loading') return `<div class="login"><span class="lglogo">${ic('bird', 34)}</span><h1>${L('Dziennik działu ptaków', 'Журнал отдела птиц', 'Bird department log')}</h1><p>${L('Ładowanie…', 'Загрузка…', 'Loading…')}</p></div>`;
  if (mode === 'noacc') return `<div class="login"><span class="lglogo">${ic('bird', 34)}</span><h1>${L('Brak dostępu', 'Нет доступа', 'No access')}</h1><p>${L('Konto nie ma dostępu do dziennika. Poproś administratora działu.', 'У аккаунта нет доступа к журналу. Попросите администратора отдела.', 'This account has no access. Ask the department administrator.')}</p>${st.canClaim ? `<button class="bl-btn solid save wide" data-claim="1" style="background:var(--accent);color:var(--on-accent)">${L('Zostań pierwszym administratorem', 'Стать первым администратором', 'Become the first administrator')}</button>` : ''}<button class="bl-btn wide" data-logout="1">${L('Wyloguj', 'Выйти', 'Sign out')}</button>${langs}</div>`;
  return `<form class="login" id="loginf"><span class="lglogo">${ic('bird', 34)}</span><h1>${L('Dziennik działu ptaków', 'Журнал отдела птиц', 'Bird department log')}</h1><p>${L('Zaloguj się kontem pracownika', 'Войдите аккаунтом сотрудника', 'Sign in with your staff account')}</p>
  <label class="bl-field"><span>${L('Login', 'Логин', 'Login')}</span><input class="inp" id="lgl" autocomplete="username" autocapitalize="none" spellcheck="false"></label>
  <label class="bl-field"><span>${L('Hasło', 'Пароль', 'Password')}</span><input class="inp" id="lgp" type="password" autocomplete="current-password"></label>
  <p class="err" id="lge" role="alert"></p><button class="bl-btn solid save wide" type="submit" style="background:var(--accent);color:var(--on-accent)">${L('Zaloguj', 'Войти', 'Sign in')}</button>${langs}
  <p class="tip" style="text-align:center;margin-top:14px">${L('Nie masz konta? Poproś administratora działu.', 'Нет аккаунта? Попросите администратора отдела.', 'No account? Ask the department administrator.')}</p></form>`;
}
