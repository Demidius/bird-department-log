// forms.js — v2: add flow (menu → who → what → form), per-type forms, transfer, arrival, departure, offspring, edits, saving
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const micBtn = id => SR ? `<button class="mic" type="button" data-mic="${id}" aria-label="${L('Dyktuj', 'Диктовать', 'Dictate')}">${ic('mic', 22)}</button>` : '';
const tid = p => 't-' + String(p).replace(/[^a-z0-9]/gi, '-');
const area = (path, val, ph, rows = 2) => `<div class="bl-text"><textarea id="${tid(path)}" data-in="${path}" rows="${rows}" placeholder="${esc(ph || L('Opisz lub podyktuj…', 'Опиши или надиктуй…', 'Describe or dictate…'))}">${esc(val || '')}</textarea>${micBtn(tid(path))}</div>`;
const inpt = (path, val, ph, extra = '') => `<input class="inp" data-in="${path}" value="${esc(val ?? '')}" placeholder="${esc(ph || '')}" ${extra}>`;
const fld = (label, body, cls = '') => `<div class="bl-field ${cls}"><span>${label}</span>${body}</div>`;
const getP = (o, p) => p.split('.').reduce((x, k) => x == null ? undefined : x[k], o);
function setP(o, p, v) { const ks = p.split('.'), last = ks.pop(); let x = o; for (const k of ks) { if (x[k] == null || typeof x[k] !== 'object') x[k] = {}; x = x[k]; } x[last] = v; }
const staffList = () => [...D.prof.values()].filter(p => p.active !== false && p.role !== 'viewer').sort((a, b) => (a.id === me ? -1 : b.id === me ? 1 : (a.display_name || a.login).localeCompare(b.display_name || b.login)));

/* ---------- target ---------- */
const F = () => st.add;
function tgt() { const f = F(); if (!f) return []; return f.target === 'multi' ? [...st.multi].map(anById).filter(Boolean) : f.target === 'animal' ? [anById(f.ani)].filter(Boolean) : []; }
const tgtMammal = () => { const l = tgt(); return l.length > 0 && l.every(a => isMammal(spBy(a.species_id))); };
const tgtBird = () => { const l = tgt(); return l.length > 0 && !l.some(a => isMammal(spBy(a.species_id))); };
function targetChip(noChange) {
  const f = F(), l = tgt(), ch = noChange ? '' : `<em>${L('Zmień', 'Изменить', 'Change')}</em>`, back = noChange ? '' : `data-step="${f.target === 'place' ? 'places' : f.target === 'dept' ? 'menu' : 'who'}"`;
  if (f.target === 'multi') return `<button class="bl-whochip" ${back}><span class="avs">${l.slice(0, 3).map(a => `<span class="bl-av">${esc(anInit(a))}</span>`).join('')}</span><span><b>${l.length} ${L('zwierząt', 'животных', 'animals')}</b><small>${esc([...new Set(l.map(anTitle))].join(', '))}</small><small class="dup">${L('wpis trafi do karty każdego', 'запись попадёт в карточку каждого', 'the record goes to each card')}</small></span>${ch}</button>`;
  if (f.target === 'dept') return `<div class="bl-whochip g-dept"><span class="bl-av" style="background:var(--dept-soft);color:var(--dept)">${ic('building', 20)}</span><span><b>${L('Dział', 'Отдел', 'Department')}</b><small>${L('bez zwierzęcia', 'без животного', 'no animal')}</small></span></div>`;
  if (f.target === 'place') { const p = plById(f.plc), n = p ? anOfPlace(p).length + plDesc(p.id).reduce((s, k) => s + anOfPlace(k).length, 0) : 0; return `<button class="bl-whochip" ${back}><span class="bl-av">${ic('home', 20)}</span><span><b>${esc(plName(p))}</b><small>${n} ${L('zwierząt', 'животных', 'animals')}</small></span>${ch}</button>`; }
  const a = l[0]; if (!a) return '';
  return `<button class="bl-whochip" ${back}><span class="bl-av">${esc(anInit(a))}</span><span><b>${esc(anLine(a))}</b><small>${a.grp ? '' : sexSym(a.sex) + ' · '}${esc(plName(plByName(anEncl(a))) || anEncl(a))}</small></span>${ch}</button>`;
}

/* ---------- field schemas: [type, key, label, option list | placeholder, multi | unit] ---------- */
const FS = () => {
  const m = tgtMammal();
  return {
    injury: [['chips', 'what', L('Co się stało', 'Что случилось', 'What happened'), m ? 'inj_what_m' : 'inj_what', 1], ['chips', 'where', L('Gdzie', 'Где', 'Where'), m ? 'where_m' : 'where', 1], ['chips', 'sev', L('Jak poważnie', 'Насколько серьёзно', 'How serious'), 'sev'],
      ['toggle', 'watch', L('Postaw pod obserwację', 'Поставить на наблюдение', 'Put under observation'), L('codziennie, ocena 1–5', 'каждый день, оценка 1–5', 'daily, score 1–5')]],
    proc: [['chips', 'kind', L('Zabieg', 'Процедура', 'Procedure'), m ? 'proc_m' : 'proc', 1], ['weight', 'w', L('Masa', 'Вес', 'Weight')], ['staff', 'by', L('Kto wykonał', 'Кто проводил', 'Done by')], ['chips', 'res', L('Wynik', 'Результат', 'Result'), 'res']],
    obs: [['chips', 'beh', L('Co zauważono', 'Что заметили', 'What was seen'), 'beh', 1], ['chips', 'tone', L('Ocena', 'Оценка', 'Assessment'), 'tone']],
    watch: [['chips', 'why', L('Powód', 'Причина', 'Reason'), 'why_w'], ['chips', 'freq', L('Jak często', 'Как часто', 'How often'), 'freq_w'], ['chips', 'until', L('Jak długo', 'Как долго', 'How long'), 'until'],
      ['auto', '', L('Skala oceny', 'Шкала оценки', 'Score scale'), L('1 — źle … 5 — norma', '1 — плохо … 5 — норма', '1 — bad … 5 — normal')]],
    score: [['score', 'v', L('Ocena dziś', 'Оценка сегодня', 'Score today')], ['chips', 'slot', L('Pora', 'Время суток', 'Time of day'), 'slot']],
    mate: [['partner', 'with', L('Z kim', 'С кем', 'With whom')], ['chips', 'seen', L('Co widziano', 'Что видели', 'What was seen'), 'seen']],
    lay: [['num', 'n', L('Ile jaj', 'Сколько яиц', 'How many eggs'), '1'], ['chips', 'nest', L('Gdzie', 'Где', 'Where'), 'nest'], ['chips', 'cond', L('Stan jaj', 'Состояние', 'Condition'), 'egg', 1], ['chips', 'next', L('Co dalej', 'Что дальше', 'What next'), 'eggnext']],
    incub: [['chips', 'who', L('Kto wysiaduje', 'Кто насиживает', 'Who incubates'), 'incwho'], ['num', 'n', L('Ile jaj', 'Сколько яиц', 'How many eggs'), '1'], ['expect']],
    hatch: [['num', 'n', L('Ile piskląt', 'Сколько птенцов', 'How many chicks'), '1'], ['chips', 'st', L('Stan', 'Состояние', 'Condition'), 'state', 1],
      ['toggle', 'kid', L('Utwórz karty piskląt', 'Создать карточки птенцов', 'Create chick cards'), L('rodzice i woliera — automatycznie', 'родители и вольер — автоматически', 'parents and enclosure — automatic')]],
    fledge: [['num', 'n', L('Ile opuściło gniazdo', 'Сколько вылетело', 'How many fledged'), '1'], ['chips', 'fly', L('Lot', 'Полёт', 'Flight'), 'fly']],
    birth: [['num', 'n', L('Ile młodych', 'Сколько детёнышей', 'How many young'), '1'], ['chips', 'st', L('Stan', 'Состояние', 'Condition'), 'state', 1], ['chips', 'care', L('Opieka matki', 'Забота матери', 'Maternal care'), 'care'],
      ['toggle', 'kid', L('Utwórz karty młodych', 'Создать карточки детёнышей', 'Create cards for the young'), L('matka i woliera — automatycznie', 'мать и вольер — автоматически', 'mother and enclosure — automatic')]],
    diet: [['chips', 'kind', L('Zmiana', 'Изменение', 'Change'), 'diet', 1], ['text', 'what', L('Co dokładnie', 'Что именно', 'What exactly'), L('np. bez bananów, + papaja', 'напр. без бананов, + папайя', 'e.g. no bananas, + papaya')],
      ['chips', 'until', L('Do kiedy', 'До какого числа', 'Until'), 'dietuntil'], ['chips', 'why', L('Powód', 'Причина', 'Reason'), 'dietwhy']],
    env: [['chips', 'what', L('Co zmieniono', 'Что изменили', 'What changed'), 'env', 1]],
    enr: [['chips', 'kind', L('Rodzaj', 'Вид', 'Kind'), 'enrkind'], ['text', 'item', L('Co / jakie zadanie', 'Что / какое задание', 'What / which task'), L('np. lód z rybą, wejście na wagę', 'напр. лёд с рыбой, заход на весы', 'e.g. ice with fish, stepping on scales')],
      ['chips', 'react', L('Reakcja', 'Реакция', 'Reaction'), 'react', 1], ['num', 'dur', L('Ile minut', 'Сколько минут', 'Minutes'), '10', 'min']],
    tend: [['chips', 'why', L('Dlaczego kończymy', 'Почему заканчиваем', 'Why it ends'), 'endwhy']],
    wend: [],
    dept: [['chips', 'kind', L('Czego dotyczy', 'О чём', 'About'), 'dept'], ['toggle', 'rep', L('Przypominaj co tydzień', 'Напоминать каждую неделю', 'Remind weekly'), L('pojawi się w „Teraz” za 7 dni', 'появится в «Сейчас» через 7 дней', 'appears in “Now” in 7 days')]],
    leave: [['chips', 'why', L('Powód', 'Причина', 'Reason'), 'leave']],
    arrive: [['chips', 'from', L('Skąd', 'Откуда', 'From'), 'from'], ['text', 'org', L('Instytucja / osoba', 'Организация / человек', 'Institution / person'), '']]
  };
};
function fieldHTML(x) {
  const f = F(), [type, k, lab, o, multi] = x, v = f.fv[k];
  if (type === 'chips') return fld(lab, `<div class="bl-chips">${OPT[o]().map((t, i) => `<button class="bl-chip phrase" data-fv="${k}" data-i="${i}" data-m="${multi ? 1 : ''}" aria-pressed="${multi ? !!(v && v.includes(i)) : v === i}">${esc(t)}</button>`).join('')}</div>`);
  if (type === 'toggle') return `<button class="tgl2 ${v ? 'on' : ''}" data-fv="${k}" data-i="t"><span class="box">${v ? ic('check', 14, 3) : ''}</span><span><b>${lab}</b><small>${o}</small></span></button>`;
  if (type === 'text') return fld(lab, inpt('fv.' + k, v, o));
  if (type === 'auto') return fld(lab, `<div class="auto">${o}</div>`);
  if (type === 'num') return fld(lab, `<div class="numrow">${inpt('fv.' + k, v, o, 'inputmode="decimal"')}${multi ? `<em>${multi}</em>` : ''}</div>`);
  const units = `<div class="seg2">${['g', 'kg'].map(u => `<button data-fv="wu" data-u="${u}" aria-pressed="${(f.fv.wu || 'kg') === u}">${u}</button>`).join('')}</div>`;
  if (type === 'weight' && f.target === 'multi') return fld(`${lab} <i class="opt">— ${L('dla każdego', 'для каждого', 'for each')}</i> ${units}`, `<div class="injl">${tgt().map(a => `<div class="inj"><div class="injh"><span class="bl-av sm2">${esc(anInit(a))}</span><b>${esc(suffix(a) || anTitle(a))}</b><span class="win">${inpt(`pa.${a.id}.w`, getP(f, `pa.${a.id}.w`), '0,00', 'inputmode="decimal"')}<em>${f.fv.wu || 'kg'}</em></span></div></div>`).join('')}</div>`);
  if (type === 'weight') return fld(lab, `<div class="numrow">${inpt('fv.w', v, '0,00', 'inputmode="decimal"')}${units}</div>`);
  if (type === 'score' && f.target === 'multi') return fld(`${lab} <i class="opt">— ${L('dla każdego', 'для каждого', 'for each')}</i>`, `<div class="injl">${tgt().map(a => { const pv = getP(f, `pa.${a.id}.v`); return `<div class="inj"><div class="injh"><span class="bl-av sm2">${esc(anInit(a))}</span><b>${esc(suffix(a) || anTitle(a))}</b></div><div class="bl-score">${[1, 2, 3, 4, 5].map(n => `<button data-pv="${a.id}" data-n="${n}" aria-pressed="${pv === n}">${n}</button>`).join('')}</div></div>`; }).join('')}</div>`);
  if (type === 'score') return fld(lab, `<div class="bl-score">${[1, 2, 3, 4, 5].map(n => `<button data-fv="${k}" data-n="${n}" aria-pressed="${v === n}">${n}</button>`).join('')}</div>`);
  if (type === 'staff') return fld(lab, `<div class="bl-chips">${staffList().map(p => `<button class="bl-chip phrase" data-fv="${k}" data-pid="${p.id}" aria-pressed="${!!(v && v.includes(p.id))}">${p.id === me ? L('Ja · ', 'Я · ', 'Me · ') : ''}${esc(p.display_name || p.login)}</button>`).join('')}</div>`);
  if (type === 'partner') { const a = tgt()[0]; if (!a) return ''; const cand = anActive().filter(x => x.species_id === a.species_id && x.id !== a.id && !st.multi.has(x.id));
    return fld(lab, `<div class="bl-chips">${cand.map(x => `<button class="bl-chip phrase" data-fv="${k}" data-s="${esc(x.name)}" aria-pressed="${v === x.name}">${x.grp ? '' : sexSym(x.sex) + ' '}${esc(suffix(x) || x.name)}</button>`).join('')}<button class="bl-chip phrase" data-fv="${k}" data-s="?" aria-pressed="${v === '?'}">${L('Nieznany', 'Неизвестно', 'Unknown')}</button></div>`); }
  if (type === 'expect') { const a = tgt()[0], d = a ? +spInfo(spBy(a.species_id)).incub_days || 0 : 0; return d ? fld(L('Spodziewane wyklucie', 'Ожидаемый выклев', 'Expected hatching'), `<div class="auto">≈ ${fDate(atMs() + d * DAY)} (${L('termin gatunku', 'срок вида', 'species period')}: ${d} ${L('dni', 'дн.', 'days')})</div>`) : ''; }
  return '';
}
const descLbl = base => F().target === 'multi' ? `${L('Wspólne dla wszystkich', 'Общее для всех', 'Common for all')} · ${st.multi.size}` : (base || L('Opis', 'Описание', 'Description'));
function perAnimal(med) {
  const f = F(); if (f.target !== 'multi') return '';
  return fld(`${L('Indywidualnie', 'Индивидуально', 'Individually')} <i class="opt">— ${L('tylko do karty tego zwierzęcia', 'только в карточку этой особи', 'only to this animal’s card')}</i>`, `<div class="injl">${tgt().map(a => { const o = getP(f, `pa.${a.id}.open`);
    return `<div class="inj ${o ? 'open' : ''}"><div class="injh"><span class="bl-av sm2">${esc(anInit(a))}</span><b>${esc(suffix(a) || anTitle(a))}</b>${o ? `<button class="bl-x sm" data-pa="${a.id}" aria-label="×">${ic('x', 14, 2.4)}</button>` : `<button class="addi" data-pa="${a.id}">${ic('plus', 14, 2.6)}${L('Dodaj', 'Добавить', 'Add')}</button>`}</div>${o ? `${med ? `<div class="frow">${inpt(`pa.${a.id}.dose`, getP(f, `pa.${a.id}.dose`), L('Inna dawka, np. 0,15 ml', 'Другая доза, напр. 0,15 мл', 'Other dose, e.g. 0.15 ml'))}</div>` : ''}${area(`pa.${a.id}.note`, getP(f, `pa.${a.id}.note`), L('Tylko o tym zwierzęciu…', 'Только про эту особь…', 'Only about this animal…'))}` : ''}</div>`; }).join('')}</div>`);
}
const atMs = () => { const f = F(); const t = f && f.at ? new Date(f.at).getTime() : NaN; return isFinite(t) ? t : Date.now(); };
const localDT = ms => { const d = new Date(ms - new Date(ms).getTimezoneOffset() * 6e4); return d.toISOString().slice(0, 16); };
function whenPhoto(noPhoto) {
  const f = F(), n = (f.files || []).length;
  return `<div class="bl-row" style="gap:6px">${f.showAt ? `<input class="inp" type="datetime-local" data-in="at" value="${esc(f.at || localDT(Date.now()))}" max="${localDT(Date.now() + DAY)}" style="flex:1">` : `<button class="bl-btn" style="flex:1" data-showat="1">${ic('clock', 17)}${f.at ? fDate(atMs()) + ' ' + fTime(atMs()) : L('Teraz', 'Сейчас', 'Now')}</button>`}${noPhoto ? '' : `<label class="bl-btn" style="flex:1">${ic('cam', 17)}${n ? `${L('Zdjęcia', 'Фото', 'Photos')}: ${n}` : L('Zdjęcie', 'Фото', 'Photo')}<input type="file" accept="image/*" multiple hidden data-fphoto="1"></label>`}</div>`;
}
const saveBtn = (label, attr = 'data-save="1"') => `<p class="err" id="ferr" role="alert">${esc(F().err || '')}</p><button class="bl-btn solid save wide" ${attr} ${F().busy ? 'disabled' : ''}>${F().busy ? L('Zapisywanie…', 'Сохранение…', 'Saving…') : label || L('Zapisz', 'Сохранить', 'Save')}</button>`;

/* ---------- steps ---------- */
function stepMenu() {
  const it = [['animal', 'bird', L('Karta zwierzęcia', 'Карта животного', 'Animal card'), L('wybierz zwierzę, potem co zapisać', 'выбрать животное, потом что записать', 'pick an animal, then what to record')],
    ['places', 'home', L('Woliery', 'Вольеры', 'Enclosures'), L('wpis o wolierze lub całej grupie', 'запись про вольер или всю группу', 'record about an enclosure or the whole group')],
    ['free', 'pen', L('Wolny wpis', 'Свободная запись', 'Free note'), L('wszystko inne: dział, dostawy, awarie', 'всё прочее: отдел, поставки, поломки', 'everything else: department, deliveries, breakdowns')]];
  return `<div class="scrim" data-close="add"></div><div class="dial">${it.map(([k, i, a, b]) => `<button class="dialbtn" data-menu="${k}"><span class="dic">${ic(i, 22)}</span><span><b>${a}</b><small>${b}</small></span></button>`).join('')}</div><button class="bl-fab dialx" data-close="add" aria-label="×">${ic('x', 24, 2.6)}</button>`;
}
function stepWho() {
  const q = key(st.wq), sel = st.multi;
  return `<label class="bl-search">${ic('search', 18)}<input id="wq" type="search" value="${esc(st.wq || '')}" placeholder="${L('Gatunek, imię, obrączka, woliera…', 'Вид, кличка, кольцо, вольер…', 'Species, name, ring, enclosure…')}" autocomplete="off"></label>
  <div class="plist">${animalsByPlace(true, q)}</div>
  ${sel.size ? `<div class="selbar"><span><b>${sel.size}</b> ${L('zaznaczone', 'выбрано', 'selected')}</span><button class="bl-btn" data-ckclear="1">${L('Wyczyść', 'Сбросить', 'Clear')}</button><button class="bl-btn selgo" data-gomulti="1">${L('Zapisz', 'Записать', 'Record')}</button></div>` : ''}`;
}
function stepWhat() {
  const f = F(), groups = f.target === 'place' ? ['health', 'obs', 'keep'] : ['health', 'obs', 'breed', 'keep'], m = tgtMammal(), b = tgtBird();
  const ok = k => !(f.target === 'place' && ['leave', 'mate', 'score'].includes(k)) && !(m && ['lay', 'incub', 'hatch', 'fledge'].includes(k)) && !(b && k === 'birth') && !(f.target === 'place' && k === 'tdose');
  return targetChip() + groups.map(g => { const G = GROUPS.find(x => x.id === g); return `<div class="g-${g}"><div class="bl-grouphead">${ic(G.ic, 18)}${G.n()}</div><div class="tgrid">${WHAT[g].filter(ok).map(k => `<button class="tbtn" data-kind="${k}"><span class="bl-badge sm">${ic(kIcon(k), 18)}</span><span>${kName(k)}</span></button>`).join('')}</div></div>`; }).join('');
}
function medList() {
  const m = new Map();
  for (const r of D.rec) if ((r.k === 'tstart' || r.k === 'tdose') && r.f.drug) { const k = key(r.f.drug), o = m.get(k) || {name: r.f.drug, n: 0}; o.n++; if (r.f.dose) o.dose = r.f.dose; if (r.f.route) o.route = r.f.route; m.set(k, o); }
  return [...m.values()].sort((a, b) => b.n - a.n);
}
function medForm() {
  const f = F(), q = key(f.fv.drug), list = medList().filter(m => !q || key(m.name).includes(q)).slice(0, 12);
  const rx = f.kind === 'tdose' ? activeTreatments().filter(x => tgt().some(a => key(a.name) === key(x.r.bird))) : [];
  const route = medRoute(f.fv.route)?.[0];
  return `<div class="formbody">${targetChip(!!f.edit)}
  ${rx.length && !f.edit ? fld(L('Z aktywnego zlecenia', 'Из активного назначения', 'From the active prescription'), rx.map(x => `<button class="tgl2 ${f.fv.rx === x.r.id ? 'on' : ''}" data-fromrx="${x.r.id}"><span class="box">${f.fv.rx === x.r.id ? ic('check', 14, 3) : ''}</span><span><b>${esc(x.r.f.drug || kName('tstart'))}</b><small>${esc([x.r.f.dose, medRouteLabel(x.r.f.route), x.r.f.freq != null ? pick('freq', x.r.f.freq) : ''].filter(Boolean).join(' · '))}${f.target === 'multi' ? ' · ' + esc(suffix(anByName(x.r.bird)) || x.r.bird) : ''}</small></span></button>`).join('')) : ''}
  ${fld(rx.length ? L('Albo inny lek', 'Или другое лекарство', 'Or another drug') : L('Lek', 'Лекарство', 'Drug'), `<div class="combo"><input id="medin" data-in="fv.drug" value="${esc(f.fv.drug || '')}" placeholder="${L('Wybierz z listy lub wpisz', 'Выбери из списка или впиши', 'Pick from the list or type')}" autocomplete="off"><button class="cbtn" data-medtoggle="1" aria-label="▾">${ic('chev', 18)}</button>
  ${f.medOpen && list.length ? `<div class="clist">${list.map(m => `<button data-med="${esc(m.name)}"><span><b>${esc(m.name)}</b><small>${esc([m.dose, medRouteLabel(m.route)].filter(Boolean).join(' '))}</small></span><em>${m.n}×</em></button>`).join('')}</div>` : ''}</div>`)}
  ${fld(L('Dawka', 'Доза', 'Dose'), inpt('fv.dose', f.fv.dose, '0,2 ml'))}
  ${fld(L('Podanie', 'Способ введения', 'Route'), `<div class="bl-chips">${MED_ROUTES.map(([code]) => `<button class="bl-chip phrase" data-fv="route" data-s="${esc(code)}" aria-pressed="${route === code}">${esc(medRouteLabel(code))}</button>`).join('')}</div>`)}
  ${f.kind === 'tstart' ? fld(L('Jak często', 'Как часто', 'How often'), `<div class="bl-chips">${OPT.freq().map((x, i) => `<button class="bl-chip phrase" data-fv="freq" data-i="${i}" aria-pressed="${f.fv.freq === i}">${x}</button>`).join('')}</div>`)
    + fld(L('Ile dni', 'Сколько дней', 'How many days'), `<div class="bl-chips">${DAYS_N.map((d, i) => `<button class="bl-chip phrase" data-fv="days" data-n="${d}" aria-pressed="${+f.fv.days === d}">${OPT.days()[i]}</button>`).join('')}<span class="numrow" style="max-width:110px">${inpt('fv.days', DAYS_N.includes(+f.fv.days) ? '' : f.fv.days, L('inne', 'другое', 'other'), 'inputmode="numeric"')}</span></div>`)
    + fld(L('Powód', 'Причина', 'Reason'), inpt('fv.reason', f.fv.reason, L('np. kulawizna', 'напр. хромота', 'e.g. limping'))) : ''}
  <label class="bl-field"><span>${descLbl()}</span>${area('note', f.note)}</label>${perAnimal(true)}${whenPhoto()}</div>${saveBtn()}`;
}
function moveForm() {
  const f = F(), mv = f.mv, sel = tgt(), from = [...new Set(sel.map(anEncl))];
  const to = mv.to ? plByName(mv.to) : null, staff = staffList();
  const procs = [['wing', 'x', L('Przycięcie lotek', 'Подрезка крыльев', 'Wing clipping')], ['weigh', 'scale', L('Ważenie', 'Взвешивание', 'Weighing')], ['check', 'eye', L('Oględziny / urazy', 'Осмотр / травмы', 'Check / injuries')], ['mark', 'tag', L('Znakowanie (obrączka, chip)', 'Мечение (кольцо, чип)', 'Marking (ring, chip)')]]
    .filter(p => p[0] !== 'wing' || sel.some(a => !isMammal(spBy(a.species_id))));
  const on = k => mv.proc.includes(k), who = a => `<span class="bl-av sm2">${esc(anInit(a))}</span><b>${esc(suffix(a) || anTitle(a))}</b>`;
  const body = k => {
    if (k === 'wing') return `<div class="injl">${sel.filter(a => !isMammal(spBy(a.species_id))).map(a => `<div class="inj"><div class="injh">${who(a)}<div class="seg2">${OPT.wing().map((x, i) => `<button data-mvw="${a.id}" data-v="${i}" aria-pressed="${mv.wing[a.id] === i}">${x}</button>`).join('')}</div></div></div>`).join('')}</div>`;
    if (k === 'weigh') return `<div class="seg2" style="align-self:flex-start;margin-bottom:6px;display:inline-flex">${['g', 'kg'].map(u => `<button data-mvu="${u}" aria-pressed="${(mv.wu || 'kg') === u}">${u}</button>`).join('')}</div><div class="wlist">${sel.map(a => `<label class="wrow2"><span>${esc(suffix(a) || anTitle(a))}</span><span class="win">${inpt(`mv.w.${a.id}`, mv.w[a.id], '0,00', 'inputmode="decimal"')}<em>${mv.wu || 'kg'}</em></span></label>`).join('')}</div>`;
    if (k === 'check') return `<div class="injl">${sel.map(a => { const v = mv.inj[a.id]; return `<div class="inj ${v === 1 ? 'bad' : ''}"><div class="injh">${who(a)}<div class="seg2"><button data-inja="${a.id}" data-v="0" aria-pressed="${v === 0}">${L('OK', 'Норма', 'OK')}</button><button data-inja="${a.id}" data-v="1" aria-pressed="${v === 1}">${L('Uraz', 'Травма', 'Injury')}</button></div></div>${v === 1 ? `${area(`mv.injt.${a.id}`, mv.injt[a.id], L('Jaki uraz…', 'Какая травма…', 'What injury…'))}<p class="lnk">${ic('cross', 14)} ${L('+ wpis „Uraz” w karcie tego zwierzęcia', '+ запись «Травма» в карточке этого животного', '+ an “Injury” record on this animal’s card')}</p>` : ''}</div>`; }).join('')}${sel.length > 1 ? `<button class="allok" data-injall="1">${ic('check', 15, 2.6)}${L('Wszystkie bez urazów', 'Все без травм', 'All without injuries')}</button>` : ''}</div>`;
    if (k === 'mark') return `<div class="injl">${sel.map(a => { const v = mv.mk[a.id]; const cur = v === 1 ? a.chip : v === 0 ? a.ring : ''; return `<div class="inj"><div class="injh">${who(a)}<div class="seg2">${OPT.mark().map((x, i) => `<button data-mk="${a.id}" data-v="${i}" aria-pressed="${v === i}">${x}</button>`).join('')}</div></div>${v != null ? `${inpt(`mv.mkv.${a.id}`, mv.mkv[a.id], [L('Nr obrączki', 'Номер кольца', 'Ring number'), L('Nr chipa', 'Номер чипа', 'Chip number'), L('Opis znaku', 'Описание метки', 'Mark description')][v])}${cur ? `<small class="was">${L('obecnie', 'сейчас', 'now')}: ${esc(cur)}</small>` : ''}` : ''}</div>`; }).join('')}</div>`;
    return '';
  };
  const places = D.pl.filter(p => p.active !== false && !from.some(n => key(n) === key(p.name))).sort((a, b) => plName(a).localeCompare(plName(b), undefined, {numeric: true}));
  return `<div class="formbody">${targetChip(!!f.edit)}
  <div class="route"><div class="rpt"><span class="rl">${L('Skąd', 'Откуда', 'From')}</span><b>${esc(from.map(n => plName(plByName(n)) || n || '—').join(', '))}</b><small>${L('aktualne miejsce', 'текущее место', 'current place')}</small></div><span class="rarr">${ic('chev', 20, 2.6)}</span>
  <button class="rpt to ${to ? 'set' : ''}" data-mvopen="1"><span class="rl">${L('Dokąd', 'Куда', 'To')}</span><b>${to ? esc(plName(to)) : L('Wybierz…', 'Выбрать…', 'Choose…')}</b><small>${to ? esc(plName(plById(to.parent_id)) || '') : L('woliera, klatka, kwarantanna', 'вольер, клетка, карантин', 'enclosure, cage, quarantine')}</small></button></div>
  ${mv.open ? `<div class="plpick">${places.map(p => `<button data-mvto="${esc(p.name)}"><span class="bl-av">${ic(p.kind === 'building' ? 'building' : 'home', 18)}</span><span><b>${esc(plName(p))}</b><small>${anOfPlace(p).length} ${L('zwierząt', 'животных', 'animals')}</small></span></button>`).join('')}</div>` : ''}
  ${fieldHTML(['chips', 'why', L('Przyczyna', 'Причина', 'Reason'), 'mvwhy'])}
  ${fld(L('Kto przenosił', 'Кто переносил', 'Who carried'), `<div class="bl-chips">${staff.map(p => `<button class="bl-chip phrase" data-mvby="${p.id}" aria-pressed="${mv.by.includes(p.id)}">${p.id === me ? L('Ja · ', 'Я · ', 'Me · ') : ''}${esc(p.display_name || p.login)}</button>`).join('')}</div>`)}
  ${f.edit ? '' : fld(L('Przy przeniesieniu', 'При переносе', 'During the transfer'), `<div class="procs">${procs.map(([k, i, l]) => `<div class="proc ${on(k) ? 'on' : ''}"><button class="proch" data-mvproc="${k}"><span class="box">${on(k) ? ic('check', 14, 3) : ''}</span>${ic(i, 17)}<span>${l}</span></button>${on(k) ? `<div class="pdet">${body(k)}</div>` : ''}</div>`).join('')}</div>`)}
  <label class="bl-field"><span>${descLbl(L('Uwagi', 'Примечание', 'Notes'))}</span>${area('note', f.note)}</label>${perAnimal()}${whenPhoto()}</div>${saveBtn()}`;
}
function leaveForm() {
  const f = F(), why = f.fv.why;
  return `<div class="formbody">${targetChip(!!f.edit)}${fieldHTML(['chips', 'why', L('Powód', 'Причина', 'Reason'), 'leave'])}
  ${[0, 1].includes(why) ? fieldHTML(['chips', 'cause', L('Przyczyna (jeśli znana)', 'Причина (если известна)', 'Cause (if known)'), 'cause']) + fieldHTML(['toggle', 'necro', L('Sekcja zwłok', 'Вскрытие', 'Necropsy'), L('wynik dodasz później w komentarzu', 'результат добавишь позже в комментарии', 'add the result later in a comment')]) : ''}
  ${why === 2 ? fieldHTML(['text', 'org', L('Dokąd', 'Куда', 'Where to'), L('np. ZOO Poznań', 'напр. ZOO Poznań', 'e.g. ZOO Poznań')]) : ''}
  ${f.edit ? '' : `<div class="warnbox">${ic('book', 16)}<span>${L('Karta trafi do archiwum: zniknie z list i „Teraz”, wpisy i zdjęcia zostaną.', 'Карточка уйдёт в архив: исчезнет из списков и «Сейчас», записи и фото сохранятся.', 'The card goes to the archive: it disappears from lists and “Now”, records and photos stay.')}</span></div>`}
  <label class="bl-field"><span>${descLbl()}</span>${area('note', f.note)}</label>${perAnimal()}${whenPhoto()}</div>${saveBtn(f.edit ? '' : L('Zapisz wyjście ze stanu', 'Записать выбытие', 'Record departure'))}`;
}
function freeForm() {
  const f = F();
  return `<div class="formbody">${FS().dept.map(fieldHTML).join('')}<label class="bl-field"><span>${L('Opis', 'Описание', 'Description')}</span>${area('note', f.note, '', 3)}</label>${whenPhoto()}</div>${saveBtn()}`;
}
function genericForm() {
  const f = F();
  return `<div class="formbody">${f.target === 'dept' ? '' : targetChip(!!f.edit)}${(FS()[f.kind] || []).filter(x => !(f.edit && ['kid', 'watch'].includes(x[1]))).map(fieldHTML).join('')}
  <label class="bl-field"><span>${descLbl()}</span>${area('note', f.note)}</label>${perAnimal()}${whenPhoto()}</div>${saveBtn()}`;
}
function arriveForm() {
  const f = F(), v = f.fv, q = key(f.spq), sp = spBy(v.sp);
  const list = [...D.sp.values()].filter(s => !q || key([s.name_pl, s.name_ru, s.name_en, s.latin].join(' ')).includes(q)).sort((a, b) => spName(a).localeCompare(spName(b))).slice(0, 8);
  const cnt = v.cnt ?? 0, places = D.pl.filter(p => p.active !== false).sort((a, b) => plName(a).localeCompare(plName(b), undefined, {numeric: true}));
  return `<div class="formbody">
  ${fld(L('Gatunek', 'Вид', 'Species'), `<div class="combo"><input id="spin" data-in="spq" value="${esc(sp ? spName(sp) : f.spq || '')}" placeholder="${L('Nazwa lub łacina', 'Название или латынь', 'Name or Latin')}" autocomplete="off"><button class="cbtn" data-spopen="1">${ic('chev', 18)}</button>
  ${f.spOpen ? `<div class="clist">${list.map(s => `<button data-spsel="${s.id}"><span><b>${esc(spName(s))}</b><small><i>${esc(s.latin || '')}</i></small></span><em>${anActive().filter(a => a.species_id === s.id).length || ''}</em></button>`).join('')}<button data-edform="sp" data-new="1"><span><b>+ ${L('Nowy gatunek', 'Новый вид', 'New species')}</b><small>${L('utwórz kartę gatunku', 'создать карточку вида', 'create a species card')}</small></span></button></div>` : ''}</div>`)}
  ${fld(L('Ile osobników', 'Сколько особей', 'How many'), `<div class="seg2 big">${['1', '2', '3', '4', L('Grupa', 'Группа', 'Group')].map((x, i) => `<button data-fv="cnt" data-i="${i}" aria-pressed="${cnt === i}">${x}</button>`).join('')}</div>`)}
  ${cnt === 4 ? fld(L('Skład grupy', 'Состав группы', 'Group composition'), `<div class="grpin">${[['m', '♂'], ['f', '♀'], ['u', '?'], ['j', L('młode', 'мол.', 'young')]].map(([k, x]) => `<label><b>${x}</b>${inpt('fv.g' + k, v['g' + k], '0', 'inputmode="numeric"')}</label>`).join('')}</div>`) + fld(L('Nazwa grupy', 'Название группы', 'Group name'), inpt('fv.n0', v.n0, sp ? sp.name_pl || spName(sp) : ''))
    : `<div class="injl">${Array.from({length: cnt + 1}).map((_, i) => `<div class="inj"><div class="injh"><span class="bl-av sm2">${i + 1}</span>${inpt('fv.n' + i, v['n' + i], L('Imię (opcjonalnie)', 'Кличка (необязательно)', 'Name (optional)'), 'style="flex:1;min-height:40px;font-size:14px"')}<div class="seg2">${['m', 'f', ''].map(s => `<button data-fv="sx${i}" data-s="${s}" aria-pressed="${(v['sx' + i] ?? '') === s}">${sexSym(s)}</button>`).join('')}</div></div>${inpt('fv.r' + i, v['r' + i], L('Obrączka / znak', 'Кольцо / примета', 'Ring / mark'), 'style="min-height:40px;font-size:14px"')}</div>`).join('')}</div>`}
  ${fieldHTML(['chips', 'from', L('Skąd', 'Откуда', 'From'), 'from'])}
  ${fieldHTML(['text', 'org', L('Instytucja / osoba', 'Организация / человек', 'Institution / person'), L('np. ZOO Wrocław', 'напр. ZOO Wrocław', 'e.g. ZOO Wrocław')])}
  ${fld(L('Dokąd', 'Куда', 'Where to'), `<div class="bl-chips">${places.map(p => `<button class="bl-chip phrase" data-fv="to" data-s="${esc(p.name)}" aria-pressed="${v.to === p.name}">${esc(plName(p))}</button>`).join('')}</div>`)}
  ${fieldHTML(['toggle', 'quar', L('Pod obserwacją', 'На наблюдение', 'Under observation'), L('codziennie, ocena 1–5, do odwołania', 'каждый день, оценка 1–5, до отмены', 'daily, score 1–5, until cancelled')])}
  <label class="bl-field"><span>${L('Opis', 'Описание', 'Description')}</span>${area('note', f.note)}</label>${whenPhoto()}</div>${saveBtn(L('Zapisz i utwórz kartę', 'Сохранить и создать карточку', 'Save and create the card'))}`;
}
function kidsForm() {
  const f = F(), k = f.kids, a = anById(k.parent), sp = spBy(a.species_id), mam = isMammal(sp);
  const par = anActive().filter(x => x.species_id === a.species_id && key(anEncl(x)) === key(anEncl(a)) && !x.grp && x.sex);
  return `<div class="formbody"><p class="msub" style="margin:0">${k.n} · ${esc(spName(sp))} · ${esc(plName(plByName(anEncl(a))) || anEncl(a))}</p>
  ${par.length ? fld(L('Rodzice', 'Родители', 'Parents'), `<div class="bl-chips">${par.map(x => `<button class="bl-chip phrase" data-kpar="${x.id}" aria-pressed="${k.par.includes(x.id)}">${sexSym(x.sex)} ${esc(suffix(x) || x.name)}</button>`).join('')}</div>`) : ''}
  <div class="injl">${k.names.map((nm, i) => `<div class="inj"><div class="injh"><span class="bl-av sm2">${i + 1}</span>${inpt(`kids.names.${i}`, nm, '', 'style="flex:1;min-height:40px;font-size:14px"')}<div class="seg2">${['m', 'f', ''].map(s => `<button data-ksx="${i}" data-s="${s}" aria-pressed="${k.sx[i] === s}">${sexSym(s)}</button>`).join('')}</div></div></div>`).join('')}</div>
  <div class="auto">${mam ? L('Data urodzenia, woliera i rodzice — z wpisu.', 'Дата рождения, вольер и родители — из записи.', 'Date of birth, enclosure and parents — from the record.') : L('Data wyklucia, woliera i rodzice — z wpisu.', 'Дата выклева, вольер и родители — из записи.', 'Hatching date, enclosure and parents — from the record.')}</div></div>
  ${saveBtn(L('Utwórz karty', 'Создать карточки', 'Create cards'), 'data-savekids="1"')}<button class="bl-btn wide" data-close="add" style="margin-top:6px">${L('Pomiń', 'Пропустить', 'Skip')}</button>`;
}
function addSheet() {
  const f = F(); if (!f) return '';
  if (f.step === 'menu') return stepMenu();
  let title = '', g = '', back = 'menu', body = '';
  if (f.step === 'who') { title = L('Które zwierzę?', 'Какое животное?', 'Which animal?'); body = stepWho(); }
  if (f.step === 'places') { title = L('Która woliera?', 'Какой вольер?', 'Which enclosure?'); body = `<div class="plist">${placeTree('data-pickplc')}</div>`; }
  if (f.step === 'what') { title = L('Co zapisać?', 'Что записать?', 'What to record?'); back = f.from === 'card' ? '' : f.target === 'place' ? 'places' : 'who'; body = stepWhat(); }
  if (f.step === 'kids') { g = 'g-breed'; title = `${ic('egg', 20)}${L('Karty potomstwa', 'Карточки потомства', 'Offspring cards')}`; back = ''; body = kidsForm(); }
  if (f.step === 'form') {
    const k = f.kind, displayKind = f.feedOnly ? 'feed' : k;
    g = 'g-' + kGroup(displayKind); title = `${ic(kIcon(displayKind), 20)}${f.edit ? L('Edycja: ', 'Правка: ', 'Edit: ') : ''}${k === 'dept' ? L('Wolny wpis', 'Свободная запись', 'Free note') : kName(displayKind)}`;
    back = f.edit || k === 'arrive' || k === 'dept' || f.from === 'direct' ? '' : 'what';
    body = k === 'expo' ? moveForm() : k === 'leave' ? leaveForm() : k === 'arrive' && !f.edit ? arriveForm() : ['tstart', 'tdose'].includes(k) ? medForm() : k === 'dept' ? freeForm() : genericForm();
  }
  return `<div class="scrim" data-close="add"></div><div class="bl-sheet ${g} full"><div class="grip"></div><div class="head">${back ? `<button class="bl-x" data-step="${back}" aria-label="${L('Wstecz', 'Назад', 'Back')}">${ic('back', 18)}</button>` : ''}<h3>${title}</h3><button class="bl-x" data-close="add" aria-label="×">${ic('x', 18)}</button></div><div class="shbody">${body}</div></div>`;
}
function newAdd(o) { st.add = Object.assign({step: 'menu', target: 'animal', fv: {}, pa: {}, note: '', at: '', files: [], mv: {to: '', by: [me], proc: [], wing: {}, w: {}, wu: 'kg', inj: {}, injt: {}, mk: {}, mkv: {}}}, o); }
function openEdit(r) {
  const a = anByName(r.bird), f = JSON.parse(JSON.stringify(r.f)); delete f.k;
  newAdd({step: 'form', kind: r.k, edit: r, target: r.k === 'dept' ? 'dept' : r.f.place ? 'place' : 'animal', ani: a ? a.id : null, plc: r.f.place ? (plByName(r.f.place) || {}).id : null, fv: f, note: r.note, at: localDT(r.at)});
  if (r.k === 'expo') Object.assign(st.add.mv, {to: r.f.to || '', by: (r.f.byId || []).slice()});
}

/* ---------- saving ---------- */
function clean(f) { const o = {}; for (const [k, v] of Object.entries(f)) { if (v === '' || v == null || (Array.isArray(v) && !v.length) || v === false) continue; o[k] = typeof v === 'string' ? v.trim() : v; } return o; }
function buildF(base) {
  const f = F(), o = Object.assign({}, base || f.fv);
  for (const k of ['n', 'dur', 'days', 'w']) if (o[k] != null && o[k] !== '') { const n = num(o[k]); if (n == null) delete o[k]; else o[k] = n; }
  if (o.w != null) o.wu = o.wu || 'kg'; else delete o.wu;
  if (Array.isArray(o.by) && f.kind === 'proc') o.by = o.by.map(nameOf);
  if (tgtMammal() && ['injury', 'proc'].includes(f.kind)) o.m = 1;
  return clean(o);
}
const fullNote = (a, f) => [f.note.trim(), a ? String(getP(f, `pa.${a.id}.note`) || '').trim() : ''].filter(Boolean).join('\n');
async function saveForm() {
  const f = F(), k = f.kind, at = atMs(), made = [], patches = [], fresh = [];
  const err = m => { f.err = m; render(); };
  if (at > Date.now() + DAY) return err(L('Data z przyszłości', 'Дата из будущего', 'Date in the future'));
  if (k === 'arrive' && !f.edit) return saveArrive();
  if ((k === 'tstart' || k === 'tdose') && !String(f.fv.drug || '').trim()) return err(L('Podaj lek', 'Укажи лекарство', 'Enter the drug'));
  if (k === 'expo' && !f.mv.to) return err(L('Wybierz, dokąd', 'Выбери, куда', 'Choose where to'));
  if (k === 'dept' && !f.note.trim() && f.fv.kind == null) return err(L('Dodaj opis', 'Добавь описание', 'Add a description'));
  if (k === 'obs' && !f.note.trim() && !(f.fv.beh || []).length && f.fv.tone == null) return err(L('Dodaj opis', 'Добавь описание', 'Add a description'));
  if (k === 'score' && f.target !== 'multi' && !f.fv.v) return err(L('Wybierz ocenę', 'Выбери оценку', 'Pick a score'));
  if (k === 'leave' && f.fv.why == null) return err(L('Wybierz powód', 'Выбери причину', 'Pick a reason'));
  if (!['dept'].includes(k) && f.target !== 'place' && !tgt().length) return err(L('Wybierz zwierzę', 'Выбери животное', 'Pick an animal'));
  f.busy = 1; f.err = ''; render();
  try {
    if (f.edit) {
      const source = f.feedOnly ? D.rec.find(r => r.id === f.edit.id) : f.edit;
      if (!source || !canEditRec(source)) throw new Error();
      let fv = f.feedOnly ? {...source.f, feedTimes: f.fv.feedTimes, feedDuration: f.fv.feedDuration} : buildF();
      if (k === 'expo') fv = clean(Object.assign(fv, {to: f.mv.to, byId: f.mv.by, by: f.mv.by.map(nameOf)}));
      const note = f.feedOnly && k === 'incub' ? source.note : f.note.trim();
      await updateRecord(source, fv, note, f.feedOnly ? source.at : at);
      st.add = null; toast(L('Zapisano zmiany', 'Изменения сохранены', 'Changes saved')); render(); return;
    }
    if (k === 'dept') { made.push(await addRecord('dept', '—', null, buildF(), f.note.trim(), at)); }
    else if (f.target === 'place') { const p = plById(f.plc); made.push(await addRecord(k, p.name, null, Object.assign(buildF(), {place: p.name}), f.note.trim(), at)); }
    else for (const a of tgt()) {
      const fv = buildF(), pa = (f.pa || {})[a.id] || {};
      if (f.target === 'multi') { if (pa.w != null && pa.w !== '') { fv.w = num(pa.w); fv.wu = f.fv.wu || 'kg'; } if (pa.v) fv.v = pa.v; if (pa.dose) fv.dose = pa.dose; }
      if (k === 'tdose' && fv.rx) { const rx = D.rec.find(x => x.id === fv.rx); if (rx && key(rx.bird) !== key(a.name)) { const own = activeTreatments().find(x => key(x.r.bird) === key(a.name) && key(x.r.f.drug) === key(fv.drug)); if (own) fv.rx = own.r.id; else delete fv.rx; } }
      if (k === 'expo') {
        const mv = f.mv; Object.assign(fv, {from: anEncl(a) || '', to: mv.to, byId: mv.by, by: mv.by.map(nameOf)});
        if (mv.proc.includes('wing') && mv.wing[a.id] != null) fv.wing = mv.wing[a.id];
        if (mv.proc.includes('weigh') && num(mv.w[a.id]) != null) { fv.w = num(mv.w[a.id]); fv.wu = mv.wu || 'kg'; }
        if (mv.proc.includes('mark') && mv.mk[a.id] != null && String(mv.mkv[a.id] || '').trim()) {
          const val = String(mv.mkv[a.id]).trim(), t = mv.mk[a.id]; fv.mark = `${OPT.mark()[t]}: ${val}`;
          if (t < 2) { const col = t === 0 ? 'ring' : 'chip'; patches.push({id: a.id, prev: {[col]: a[col] || ''}}); await putAnimal(a.id, {[col]: val}); }
        }
      }
      const r = await addRecord(k, a.name, a.species_id, clean(fv), fullNote(a, f), at); made.push(r);
      if (k === 'expo' && f.mv.proc.includes('check') && f.mv.inj[a.id] === 1) made.push(await addRecord('injury', a.name, a.species_id, {}, String(f.mv.injt[a.id] || '').trim() || L('Uraz przy przeniesieniu', 'Травма при переносе', 'Injury during the transfer'), at));
      if (k === 'injury' && f.fv.watch) made.push(await addRecord('watch', a.name, a.species_id, {why: 0, freq: 3, until: 1}, '', at));
      if (k === 'leave') { patches.push({id: a.id, prev: {status: a.status || 'active'}}); await putAnimal(a.id, {status: 'out'}); }
    }
    for (const file of f.files || []) for (const r of made) await uploadPhoto(file, 'record', r.id).catch(() => {});
    if (f.files && f.files.length) await ensureUrls(D.ph.map(p => thumbOf(p.path)));
    const n = made.filter(r => r.k === k).length;
    const kid = ['hatch', 'birth'].includes(k) && f.fv.kid && tgt().length === 1 && !(f.fv.st || []).includes(2) && (num(f.fv.n) || 1) > 0;
    st.multi = new Set();
    if (kid) startKids(tgt()[0], num(f.fv.n) || 1, at, made);
    else st.add = null;
    toast(n > 1 ? L(`Zapisano w kartach: ${n}`, `Записано в карточки: ${n}`, `Saved to ${n} cards`) : L('Zapisano', 'Записано', 'Saved'), {recs: made.map(r => r.id), patches});
  } catch (e) { f.busy = 0; f.err = errText(e); if (made.length) toast(L('Zapisano częściowo', 'Сохранено частично', 'Partly saved'), {recs: made.map(r => r.id), patches}); }
  if (st.add) st.add.busy = 0;
  render();
}
function uniqName(base) { let n = base, i = 2; while (D.an.some(a => key(a.name) === key(n))) n = `${base} (${i++})`; return n; }
async function saveArrive() {
  const f = F(), v = f.fv, sp = spBy(v.sp), at = atMs();
  if (!sp) { f.err = L('Wybierz gatunek', 'Выбери вид', 'Pick the species'); return render(); }
  if (!v.to) { f.err = L('Wybierz, dokąd', 'Выбери, куда', 'Choose where to'); return render(); }
  f.busy = 1; f.err = ''; render();
  const made = [], ans = [], base = sp.name_pl || sp.latin || spName(sp), SX = {m: 'samiec', f: 'samica', '': 'płeć nieznana'};
  try {
    const rows = (v.cnt ?? 0) === 4 ? [{name: String(v.n0 || '').trim() || base, sex: '', grp: {m: num(v.gm) || 0, f: num(v.gf) || 0, u: num(v.gu) || 0, j: num(v.gj) || 0}}]
      : Array.from({length: (v.cnt ?? 0) + 1}).map((_, i) => ({name: String(v['n' + i] || '').trim() || `${base} - ${SX[v['sx' + i] ?? '']}`, sex: v['sx' + i] ?? '', ring: String(v['r' + i] || '').trim()}));
    for (const r of rows) {
      const id = uuid(), name = uniqName(r.name);
      const a = await putAnimal(id, clean({name, species_id: sp.id, sex: r.sex, ring: r.ring, grp: r.grp, arrived: ymd(at), origin: String(v.org || '').trim() || (v.from != null ? pick('from', v.from) : ''), encl: v.to, encl_at: new Date(at).toISOString(), status: 'active'}), true);
      ans.push(a.id);
      made.push(await addRecord('arrive', a.name, sp.id, clean({from: v.from, org: v.org, to: v.to}), f.note.trim(), at));
      if (v.quar) made.push(await addRecord('watch', a.name, sp.id, {why: 3, freq: 3, until: 3}, '', at));
    }
    for (const file of f.files || []) for (const r of made.filter(x => x.k === 'arrive')) await uploadPhoto(file, 'record', r.id).catch(() => {});
    st.add = null; toast(L('Dodano kartę', 'Карточка создана', 'Card created'), {recs: made.map(r => r.id), ans});
    if (ans.length === 1) go({scr: 'card', ani: ans[0]});
  } catch (e) { f.busy = 0; f.err = errText(e); if (made.length || ans.length) toast(L('Zapisano częściowo', 'Сохранено частично', 'Partly saved'), {recs: made.map(r => r.id), ans}); }
  render();
}
function startKids(a, n, at, made) {
  const mam = isMammal(spBy(a.species_id)), base = (spBy(a.species_id) || {}).name_pl || a.name;
  const d = new Date(at), ds = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  const par = anActive().filter(x => x.species_id === a.species_id && key(anEncl(x)) === key(anEncl(a)) && !x.grp && x.sex).map(x => x.id);
  st.add = Object.assign(F(), {step: 'kids', busy: 0, err: '', kids: {parent: a.id, n: Math.min(n, 12), at, par, names: Array.from({length: Math.min(n, 12)}).map((_, i) => `${base} - ${mam ? 'młode' : 'pisklę'} ${ds}${n > 1 ? ' (' + (i + 1) + ')' : ''}`), sx: Array.from({length: Math.min(n, 12)}).map(() => ''), made}});
}
async function saveKids() {
  const f = F(), k = f.kids, a = anById(k.parent); f.busy = 1; render();
  const ans = [];
  try {
    for (let i = 0; i < k.names.length; i++) {
      const row = await putAnimal(uuid(), clean({name: uniqName(String(k.names[i] || '').trim() || 'młode'), species_id: a.species_id, sex: k.sx[i], born: ymd(k.at), encl: anEncl(a), encl_at: new Date(k.at).toISOString(), status: 'active', parents: k.par}), true);
      ans.push(row.id);
    }
    st.add = null; toast(L(`Utworzono kart: ${ans.length}`, `Создано карточек: ${ans.length}`, `Cards created: ${ans.length}`), {ans});
  } catch (e) { f.busy = 0; f.err = errText(e); }
  render();
}
async function undo(u) {
  try {
    for (const id of u.recs || []) await dropRecord(id).catch(() => {});
    for (const p of u.patches || []) await putAnimal(p.id, p.prev).catch(() => {});
    for (const id of u.ans || []) { const r = await sb.from('collection').delete().eq('id', id); if (r.error) await putAnimal(id, {status: 'out'}).catch(() => {}); else D.an = D.an.filter(a => a.id !== id); }
    toast(L('Cofnięto', 'Отменено', 'Undone'));
  } catch (e) { toast(errText(e)); }
  render();
}

/* ---------- quick actions from "Now" ---------- */
async function quick(kind, src, f, note) {
  try { const r = await addRecord(kind, src.bird, src.sp || null, f, note || ''); toast(L('Zapisano', 'Записано', 'Saved'), {recs: [r.id]}); }
  catch (e) { toast(errText(e)); }
  render();
}
function treatMenu() {
  const r = D.rec.find(x => x.id === st.tmenu); if (!r) return '';
  const a = anByName(r.bird), end = st.tend, mine = canEditRec(r), v = st.tendv || {};
  return `<div class="scrim" data-close="tmenu"></div><div class="bl-sheet g-health menu"><div class="grip"></div><div class="head"><h3>${ic('pill', 20)}${esc(r.f.drug || kName('tstart'))}</h3><button class="bl-x" data-close="tmenu">${ic('x', 18)}</button></div>
  <p class="msub">${esc(a ? anLine(a) : r.bird)} · ${esc([r.f.dose, medRouteLabel(r.f.route), r.f.freq != null ? pick('freq', r.f.freq) : ''].filter(Boolean).join(' · '))}</p>
  ${end ? `${fld(L('Dlaczego kończymy', 'Почему заканчиваем', 'Why it ends'), `<div class="bl-chips">${OPT.endwhy().map((x, i) => `<button class="bl-chip phrase" data-tendr="${i}" aria-pressed="${v.why === i}">${x}</button>`).join('')}</div>`)}
   <div class="bl-text"><textarea id="tendn" rows="2" placeholder="${L('Komentarz (opcjonalnie)…', 'Комментарий (необязательно)…', 'Comment (optional)…')}">${esc(v.note || '')}</textarea>${micBtn('tendn')}</div>
   <button class="bl-btn solid save wide" data-tendok="1">${L('Zakończ leczenie', 'Завершить лечение', 'End treatment')}</button>`
  : `<div class="mlist"><button data-tend="1">${ic('check', 18, 2.4)}<span><b>${L('Zakończ leczenie', 'Завершить лечение', 'End treatment')}</b><small>${L('zniknie z „Teraz”, zostanie w historii', 'уйдёт из «Сейчас», останется в истории', 'leaves “Now”, stays in the history')}</small></span></button>
   ${mine ? `<button data-editrx="1">${ic('pen', 18)}<span><b>${L('Zmień zlecenie', 'Изменить назначение', 'Change prescription')}</b><small>${L('dawka, częstotliwość, ile dni', 'доза, частота, сколько дней', 'dose, frequency, days')}</small></span></button>
   <div class="extend">${ic('clock', 18)}<span><b>${L('Przedłuż', 'Продлить', 'Extend')}</b></span>${[3, 5, 7].map(n => `<button class="bl-chip phrase" data-extend="${n}">+${n}</button>`).join('')}</div>` : ''}
   <button data-rec="${r.id}">${ic('list', 18)}<span><b>${L('Zlecenie i komentarze', 'Назначение и комментарии', 'Prescription and comments')}</b><small>${L('karta wpisu', 'карточка записи', 'record card')}</small></span></button></div>`}</div>`;
}
function watchMenu() {
  const r = D.rec.find(x => x.id === st.wmenu); if (!r) return '';
  const a = anByName(r.bird);
  return `<div class="scrim" data-close="wmenu"></div><div class="bl-sheet g-obs menu"><div class="grip"></div><div class="head"><h3>${ic('eye', 20)}${kName('watch')}</h3><button class="bl-x" data-close="wmenu">${ic('x', 18)}</button></div>
  <p class="msub">${esc(a ? anLine(a) : r.bird)}${r.note ? ' · ' + esc(r.note) : ''}</p><div class="mlist"><button data-wend="1">${ic('check', 18, 2.4)}<span><b>${L('Zakończ obserwację', 'Завершить наблюдение', 'End observation')}</b><small>${L('zniknie z „Teraz”, zostanie w historii', 'уйдёт из «Сейчас», останется в истории', 'leaves “Now”, stays in the history')}</small></span></button>
  <button data-rec="${r.id}">${ic('list', 18)}<span><b>${L('Karta wpisu', 'Карточка записи', 'Record card')}</b><small>${L('komentarze, edycja', 'комментарии, правка', 'comments, editing')}</small></span></button></div></div>`;
}

/* ---------- entity edits (animal, place, species) with AI locks ---------- */
const IUCNK = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'DD'];
const PLKINDS = ['building', 'aviary', 'enclosure', 'cage', 'incubator', 'brooder', 'room', 'quarantine', 'pond', 'other'];
function lockBtn(k) { const e = st.ed, on = e.locks.includes(k) || e.locks.includes('*'); return `<button class="lk ${on ? 'on' : ''}" ${isAdmin() ? `data-lock="${k}"` : 'disabled'} aria-pressed="${on}" title="${on ? L('AI nie może zmieniać tego pola', 'Нейросеть не может менять это поле', 'AI cannot change this field') : L('AI może uzupełniać to pole', 'Нейросеть может дополнять это поле', 'AI may fill in this field')}"><b>AI</b>${ic(on ? 'lock' : 'unlock', 12, 2.4)}</button>`; }
const ro = k => !isAdmin() && (st.ed.locks.includes(k) || st.ed.locks.includes('*'));
const efld = (label, k, body) => `<div class="bl-field"><span>${label}${k ? lockBtn(k) : ''}</span>${body}</div>`;
const ein = (label, k, ph, extra = '') => efld(label, k, `<input class="inp" data-ein="${k}" value="${esc(st.ed.v[k] ?? '')}" placeholder="${esc(ph || '')}" ${ro(k) ? 'disabled' : ''} ${extra}>`);
const etx = (label, k, path) => efld(label, k, `<div class="bl-text"><textarea id="${tid('e-' + (path || k))}" data-ein="${path || k}" rows="3" placeholder="${L('brak danych', 'нет данных', 'no data')}" ${ro(k) ? 'disabled' : ''}>${esc(getP(st.ed.v, path || k) ?? '')}</textarea>${micBtn(tid('e-' + (path || k)))}</div>`);
const lockTip = () => `<p class="tip lktip"><span class="lk on"><b>AI</b>${ic('lock', 12, 2.4)}</span> ${L('— AI nie zmieni pola', '— нейросеть не тронет поле', '— AI will not change the field')} &nbsp; <span class="lk"><b>AI</b>${ic('unlock', 12, 2.4)}</span> ${L('— AI może uzupełniać', '— нейросеть может дополнять', '— AI may fill in')}${isAdmin() ? '' : ' · ' + L('kłódki zmienia administrator', 'замки меняет администратор', 'only an admin changes locks')}</p>`;
function openEd(k, isNew) {
  let v = {}, locks = [], id = null;
  if (k === 'an') { const a = isNew ? null : anById(st.ani); if (a) { id = a.id; v = {name: a.name, species_id: a.species_id, sex: a.sex || '', ring: a.ring || '', chip: a.chip || '', born: a.born || '', arrived: a.arrived || '', origin: a.origin || '', encl: anEncl(a), note: a.note || '', parents: (a.parents || []).slice(), isg: !!a.grp, grp: Object.assign({m: 0, f: 0, u: 0, j: 0}, a.grp || {})}; locks = (a.locked || []).slice(); } }
  if (k === 'pl') { const p = isNew ? null : plById(st.plc); if (p) { id = p.id; v = {name: p.name, kind: p.kind || 'aviary', parent_id: p.parent_id || '', area: p.area || '', capacity: p.capacity ?? '', note: p.note || '', active: p.active !== false, names: Object.fromEntries((p.names || []).map(x => [x.l, x.v]))}; locks = (p.locked || []).slice(); } else v = {kind: 'aviary', parent_id: isNew && st.scr === 'pcard' ? st.plc : '', active: true, names: {}}; }
  if (k === 'sp') { const s = isNew ? null : spBy(st.sp); v = {info: {}}; if (s) { id = s.id; const inf = JSON.parse(JSON.stringify(spInfo(s))); v = {name_pl: s.name_pl || '', name_ru: s.name_ru || '', name_en: s.name_en || '', latin: s.latin || '', note: s.note || '', info: inf}; locks = (inf.locked || []).slice(); } }
  st.ed = {k, id, isNew: !!isNew, v, locks, edLang: lang, err: ''};
}
function animalEdit() {
  const e = st.ed, v = e.v, sp = spBy(v.species_id), q = key(e.spq);
  const sps = [...D.sp.values()].filter(s => !q || key([s.name_pl, s.name_ru, s.name_en, s.latin].join(' ')).includes(q)).sort((a, b) => spName(a).localeCompare(spName(b))).slice(0, 8);
  const par = D.an.filter(x => x.species_id === v.species_id && x.id !== e.id && !x.grp);
  const places = D.pl.filter(p => p.active !== false).sort((a, b) => plName(a).localeCompare(plName(b), undefined, {numeric: true}));
  return `<div class="formbody">
  ${efld(L('Gatunek', 'Вид', 'Species'), 'species_id', `<div class="combo"><input data-ein="spq" value="${esc(e.spOpen ? e.spq || '' : sp ? spName(sp) : '')}" placeholder="${L('Nazwa lub łacina', 'Название или латынь', 'Name or Latin')}" ${ro('species_id') ? 'disabled' : ''} autocomplete="off"><button class="cbtn" data-espopen="1" ${ro('species_id') ? 'disabled' : ''}>${ic('chev', 18)}</button>${e.spOpen ? `<div class="clist">${sps.map(s => `<button data-espsel="${s.id}"><span><b>${esc(spName(s))}</b><small><i>${esc(s.latin || '')}</i></small></span></button>`).join('')}</div>` : ''}</div>`)}
  ${efld(L('Typ karty', 'Тип карточки', 'Card type'), 'grp', `<div class="bl-seg two"><button data-eset="isg" data-b="0" aria-pressed="${!v.isg}" ${ro('grp') ? 'disabled' : ''}>${L('Osobnik', 'Особь', 'Individual')}</button><button data-eset="isg" data-b="1" aria-pressed="${!!v.isg}" ${ro('grp') ? 'disabled' : ''}>${L('Grupa', 'Группа', 'Group')}</button></div>`)}
  ${ein(L('Nazwa karty', 'Название карточки', 'Card name'), 'name', L('np. Pawica - samica', 'напр. Pawica - samica', 'e.g. Pawica - samica'))}
  ${v.isg ? efld(L('Skład grupy', 'Состав группы', 'Group composition'), '', `<div class="grpin">${[['m', '♂'], ['f', '♀'], ['u', '?'], ['j', L('młode', 'мол.', 'young')]].map(([k, x]) => `<label><b>${x}</b><input class="inp" data-ein="grp.${k}" value="${esc(v.grp[k] ?? 0)}" inputmode="numeric" ${ro('grp') ? 'disabled' : ''}></label>`).join('')}</div>`)
    : efld(L('Płeć', 'Пол', 'Sex'), 'sex', `<div class="bl-seg three">${[['m', L('samiec', 'самец', 'male')], ['f', L('samica', 'самка', 'female')], ['', L('nieznana', 'неизвестен', 'unknown')]].map(([k, l]) => `<button data-eset="sex" data-s="${k}" aria-pressed="${v.sex === k}" ${ro('sex') ? 'disabled' : ''}>${l}</button>`).join('')}</div>`)}
  ${ein(L('Znak / obrączka', 'Примета / кольцо', 'Mark / ring'), 'ring', L('np. zielona obrączka L', 'напр. зелёное кольцо Л', 'e.g. green ring L'))}
  <div class="frow">${ein(L('Chip', 'Чип', 'Chip'), 'chip', '')}${ein(L('Urodzony / wykluty', 'Родился / вылупился', 'Born / hatched'), 'born', '', 'type="date"')}</div>
  <div class="frow">${ein(L('Przybył', 'Поступил', 'Arrived'), 'arrived', '', 'type="date"')}${ein(L('Pochodzenie', 'Происхождение', 'Origin'), 'origin', L('np. ZOO Wrocław', 'напр. ZOO Wrocław', 'e.g. ZOO Wrocław'))}</div>
  ${efld(L('Miejsce', 'Место', 'Place'), 'encl', `<div class="bl-chips">${places.map(p => `<button class="bl-chip phrase" data-eset="encl" data-s="${esc(p.name)}" aria-pressed="${key(v.encl) === key(p.name)}" ${ro('encl') ? 'disabled' : ''}>${esc(plName(p))}</button>`).join('')}</div><small class="hint2">${L('To poprawka danych. Prawdziwe przeniesienie zapisz jako „Przeniesienie”.', 'Это исправление данных. Настоящий перевод записывай как «Перемещение».', 'This is a data fix. Record a real move as “Transfer”.')}</small>`)}
  ${par.length ? efld(L('Rodzice', 'Родители', 'Parents'), 'parents', `<div class="bl-chips">${par.map(x => `<button class="bl-chip phrase" data-epar="${x.id}" aria-pressed="${v.parents.includes(x.id)}" ${ro('parents') ? 'disabled' : ''}>${sexSym(x.sex)} ${esc(suffix(x) || x.name)}</button>`).join('')}</div>`) : ''}
  ${etx(L('Notatka', 'Заметка', 'Note'), 'note')}${lockTip()}</div>`;
}
function placeEdit() {
  const e = st.ed, v = e.v, KN = OPT_PL();
  const parents = D.pl.filter(p => p.id !== e.id && !plDesc(e.id || '-').some(d => d.id === p.id)).sort((a, b) => plName(a).localeCompare(plName(b), undefined, {numeric: true}));
  return `<div class="formbody">${ein(L('Nazwa', 'Название', 'Name'), 'name', L('np. Woliera 7', 'напр. Woliera 7', 'e.g. Aviary 7'))}
  <div class="names3">${['pl', 'ru', 'en'].map(l => `<label><em>${l.toUpperCase()}</em><input class="inp" data-ein="names.${l}" value="${esc(v.names[l] || '')}" placeholder="${L('tłumaczenie', 'перевод', 'translation')}" ${ro('names') ? 'disabled' : ''}></label>`).join('')}</div>
  ${efld(L('Rodzaj', 'Тип', 'Kind'), 'kind', `<div class="bl-chips">${PLKINDS.map(k => `<button class="bl-chip phrase" data-eset="kind" data-s="${k}" aria-pressed="${v.kind === k}" ${ro('kind') ? 'disabled' : ''}>${KN[k]}</button>`).join('')}</div>`)}
  ${efld(L('Wchodzi w skład', 'Входит в', 'Part of'), 'parent_id', `<div class="bl-chips"><button class="bl-chip phrase" data-eset="parent_id" data-s="" aria-pressed="${!v.parent_id}" ${ro('parent_id') ? 'disabled' : ''}>${L('— nic (najwyższy poziom)', '— ничего (верхний уровень)', '— nothing (top level)')}</button>${parents.map(p => `<button class="bl-chip phrase" data-eset="parent_id" data-s="${p.id}" aria-pressed="${v.parent_id === p.id}" ${ro('parent_id') ? 'disabled' : ''}>${esc(plName(p))}</button>`).join('')}</div>`)}
  <div class="frow">${ein(L('Powierzchnia', 'Площадь', 'Area'), 'area', L('np. 24 m²', 'напр. 24 м²', 'e.g. 24 m²'))}${ein(L('Pojemność', 'Вместимость', 'Capacity'), 'capacity', L('ile zwierząt', 'сколько животных', 'how many animals'), 'inputmode="numeric"')}</div>
  ${etx(L('Notatka', 'Заметка', 'Note'), 'note')}
  ${e.isNew ? '' : `<button class="tgl2 ${v.active ? 'on' : ''}" data-eset="active" data-b="${v.active ? 0 : 1}" ${ro('active') ? 'disabled' : ''}><span class="box">${v.active ? ic('check', 14, 3) : ''}</span><span><b>${L('Aktywne', 'Активно', 'Active')}</b><small>${L('wyłącz, jeśli miejsce nie jest używane', 'выключи, если место не используется', 'turn off if the place is not used')}</small></span></button>`}${lockTip()}</div>`;
}
const OPT_PL = () => ({building: L('Budynek', 'Здание', 'Building'), aviary: L('Woliera', 'Вольера', 'Aviary'), enclosure: L('Wybieg', 'Выгул', 'Enclosure'), cage: L('Klatka', 'Клетка', 'Cage'), incubator: L('Inkubator', 'Инкубатор', 'Incubator'), brooder: L('Odchowalnia', 'Брудер', 'Brooder'), room: L('Pomieszczenie', 'Помещение', 'Room'), quarantine: L('Kwarantanna', 'Карантин', 'Quarantine'), pond: L('Basen', 'Водоём', 'Pond'), other: L('Inne', 'Другое', 'Other')});
const TRK2 = ['size', 'life', 'order', 'family', 'range', 'habitat', 'diet_wild', 'behaviour', 'breeding', 'diet_zoo', 'husbandry', 'health', 'sex'];
const trGet = (inf, k, l) => { const o = inf[k]; if (o == null) return ''; if (typeof o === 'string') return l === 'ru' ? o : ''; return o[l] || ''; };
function speciesEdit() {
  const e = st.ed, v = e.v, inf = v.info, l = e.edLang, mam = inf.group === 'mammal';
  const tr = (label, k, area2) => efld(label, k, area2 ? `<div class="bl-text"><textarea id="${tid('e-' + k)}" data-etr="${k}" rows="3" placeholder="${L('brak danych', 'нет данных', 'no data')}" ${ro(k) ? 'disabled' : ''}>${esc(trGet(inf, k, l))}</textarea>${micBtn(tid('e-' + k))}</div>` : `<input class="inp" data-etr="${k}" value="${esc(trGet(inf, k, l))}" ${ro(k) ? 'disabled' : ''}>`);
  const ii = (label, k, ph) => efld(label, k, `<input class="inp" data-ein="info.${k}" value="${esc(inf[k] ?? '')}" placeholder="${ph || ''}" inputmode="numeric" ${ro(k) ? 'disabled' : ''}>`);
  return `<div class="formbody">${ein(L('Łacina', 'Латынь', 'Latin'), 'latin', '')}
  <div class="names3">${[['pl', 'name_pl'], ['ru', 'name_ru'], ['en', 'name_en']].map(([x, k]) => `<label><em>${x.toUpperCase()}</em><input class="inp" data-ein="${k}" value="${esc(v[k] || '')}" ${ro(k) ? 'disabled' : ''}></label>`).join('')}</div>
  ${efld(L('Grupa', 'Группа', 'Group'), 'group', `<div class="bl-seg two"><button data-eset="info.group" data-s="bird" aria-pressed="${!mam}" ${ro('group') ? 'disabled' : ''}>${L('Ptak', 'Птица', 'Bird')}</button><button data-eset="info.group" data-s="mammal" aria-pressed="${mam}" ${ro('group') ? 'disabled' : ''}>${L('Ssak', 'Млекопитающее', 'Mammal')}</button></div>`)}
  ${efld('IUCN', 'iucn', `<div class="bl-chips">${IUCNK.map(x => `<button class="bl-chip phrase" data-eset="info.iucn" data-s="${inf.iucn === x ? '' : x}" aria-pressed="${inf.iucn === x}" ${ro('iucn') ? 'disabled' : ''}><b class="iub" style="background:${IUCNC[x]};${['CR', 'EW'].includes(x) ? 'color:#fff' : ''}">${x}</b>${IUCNN()[x]}</button>`).join('')}</div>`)}
  <div class="frow">${mam ? ii(L('Ciąża, dni', 'Беременность, дн.', 'Gestation, days'), 'gest_days', '140') : ii(L('Wysiadywanie, dni', 'Насиживание, дн.', 'Incubation, days'), 'incub_days', '28') + ii(L('Do wylotu, dni', 'До вылета, дн.', 'Until fledging, days'), 'fledge_days', '30')}${efld('CITES', 'cites', `<input class="inp" data-ein="info.cites" value="${esc(inf.cites || '')}" placeholder="I / II / III" ${ro('cites') ? 'disabled' : ''}>`)}</div>
  <div class="sec" style="margin-top:6px"><span>${L('Teksty', 'Тексты', 'Texts')}</span><div class="seg2">${['pl', 'ru', 'en'].map(x => `<button data-edlang="${x}" aria-pressed="${l === x}">${x.toUpperCase()}</button>`).join('')}</div></div>
  <div class="frow">${tr(L('Rząd', 'Отряд', 'Order'), 'order')}${tr(L('Rodzina', 'Семейство', 'Family'), 'family')}</div>
  <div class="frow">${tr(L('Wielkość', 'Размер', 'Size'), 'size')}${tr(L('Długość życia', 'Продолжительность жизни', 'Lifespan'), 'life')}</div>
  <p class="sub2">${L('W naturze', 'В природе', 'In the wild')}</p>${tr(L('Zasięg', 'Ареал', 'Range'), 'range', 1)}${tr(L('Siedlisko', 'Местообитание', 'Habitat'), 'habitat', 1)}${tr(L('Pokarm w naturze', 'Питание в природе', 'Diet in the wild'), 'diet_wild', 1)}${tr(L('Zachowanie', 'Поведение', 'Behaviour'), 'behaviour', 1)}${tr(L('Rozród', 'Размножение', 'Breeding'), 'breeding', 1)}
  <p class="sub2">${L('W ZOO', 'В зоопарке', 'In the zoo')}</p>${tr(L('Żywienie w ZOO', 'Кормление в зоопарке', 'Diet in the zoo'), 'diet_zoo', 1)}${tr(L('Utrzymanie', 'Содержание', 'Husbandry'), 'husbandry', 1)}${tr(L('Zdrowie', 'Здоровье', 'Health'), 'health', 1)}${tr(L('Różnice płci', 'Половые различия', 'Sex differences'), 'sex', 1)}
  ${etx(L('Notatki działu', 'Заметки отдела', 'Department notes'), 'note')}${lockTip()}</div>`;
}
function edSheet() {
  const e = st.ed; if (!e) return '';
  const T = {an: [L('Edycja karty zwierzęcia', 'Правка карточки животного', 'Edit animal card')], pl: [e.isNew ? L('Nowe miejsce', 'Новое место', 'New place') : L('Edycja miejsca', 'Правка места', 'Edit place')], sp: [e.isNew ? L('Nowy gatunek', 'Новый вид', 'New species') : L('Edycja gatunku', 'Правка вида', 'Edit species')]};
  return `<div class="scrim" data-close="ed"></div><div class="bl-sheet full"><div class="grip"></div><div class="head"><h3>${ic('pen', 20)}${T[e.k][0]}</h3><button class="bl-x" data-close="ed">${ic('x', 18)}</button></div><div class="shbody">${e.k === 'an' ? animalEdit() : e.k === 'pl' ? placeEdit() : speciesEdit()}
  <p class="err" role="alert">${esc(e.err || '')}</p><button class="bl-btn solid save wide" data-edsave="1" style="background:var(--fab);color:var(--on-fab)" ${e.busy ? 'disabled' : ''}>${e.busy ? L('Zapisywanie…', 'Сохранение…', 'Saving…') : e.isNew ? L('Utwórz', 'Создать', 'Create') : L('Zapisz', 'Сохранить', 'Save')}</button></div></div>`;
}
function setTr(k, val) {
  const inf = st.ed.v.info, l = st.ed.edLang; let o = inf[k]; o = typeof o === 'string' ? (o.trim() ? {ru: o, src: 'ru'} : {}) : o && typeof o === 'object' ? o : {};
  const old = (o[l] || '').trim(), v = val.trim(); if (v === old) return;
  const wasAuto = (o.auto || []).includes(l) && o.src && o.src !== l;
  if (v) o[l] = v; else delete o[l];
  o.auto = (o.auto || []).filter(x => x !== l); if (!o.auto.length) delete o.auto;
  if (v && wasAuto) o.fix = (o.fix || []).filter(x => x !== l).concat(l); else if (v) { o.src = l; if (o.fix) o.fix = o.fix.filter(x => x !== l); }
  if (o.fix && !o.fix.length) delete o.fix;
  if (['pl', 'ru', 'en'].some(x => (o[x] || '').trim())) inf[k] = o; else delete inf[k];
}
async function saveEd() {
  const e = st.ed, v = e.v, adm = isAdmin(), drop = p => { if (!adm) for (const k of Object.keys(p)) if (e.locks.includes(k) || e.locks.includes('*')) delete p[k]; return p; };
  const err = m => { e.err = m; render(); };
  try {
    if (e.k === 'an') {
      if (!String(v.name || '').trim()) return err(L('Podaj nazwę', 'Укажи название', 'Enter a name'));
      if (!v.species_id) return err(L('Wybierz gatunek', 'Выбери вид', 'Pick the species'));
      const a = anById(e.id), p = {name: v.name.trim(), species_id: v.species_id, sex: v.isg ? '' : v.sex, ring: v.ring.trim(), chip: v.chip.trim(), born: v.born || null, arrived: v.arrived || null, origin: v.origin.trim(), note: v.note.trim(), parents: v.parents,
        grp: v.isg ? {m: num(v.grp.m) || 0, f: num(v.grp.f) || 0, u: num(v.grp.u) || 0, j: num(v.grp.j) || 0} : null};
      if (key(v.encl) !== key(anEncl(a))) { p.encl = v.encl; p.encl_at = new Date().toISOString(); }
      drop(p); if (adm) p.locked = e.locks;
      e.busy = 1; render(); await putAnimal(e.id, p);
    }
    if (e.k === 'pl') {
      if (!String(v.name || '').trim()) return err(L('Podaj nazwę', 'Укажи название', 'Enter a name'));
      const cap = String(v.capacity ?? '').trim() ? num(v.capacity) : null;
      const p = {name: v.name.trim(), kind: v.kind, parent_id: v.parent_id || null, area: String(v.area || '').trim(), capacity: cap ? Math.round(cap) : null, note: String(v.note || '').trim(), active: !!v.active,
        names: ['pl', 'ru', 'en'].map(l => ({l, v: String(v.names[l] || '').trim()})).filter(x => x.v)};
      drop(p); if (adm) p.locked = e.locks;
      e.busy = 1; render(); const row = await putPlace(e.id || uuid(), p, e.isNew); e.id = row.id;
    }
    if (e.k === 'sp') {
      if (!['name_pl', 'name_ru', 'name_en', 'latin'].some(k => String(v[k] || '').trim())) return err(L('Podaj nazwę', 'Укажи название', 'Enter a name'));
      const inf = JSON.parse(JSON.stringify(v.info));
      for (const k of ['incub_days', 'fledge_days', 'gest_days']) { if (inf[k] === '' || inf[k] == null) delete inf[k]; else { const n = num(inf[k]); if (n == null) delete inf[k]; else inf[k] = n; } }
      for (const k of ['iucn', 'cites']) if (!inf[k]) delete inf[k];
      if (adm) { if (e.locks.length) inf.locked = e.locks; else delete inf.locked; }
      const p = {name_pl: v.name_pl.trim(), name_ru: v.name_ru.trim(), name_en: v.name_en.trim(), latin: v.latin.trim(), note: String(v.note || '').trim(), info: inf};
      if (!adm) for (const k of ['name_pl', 'name_ru', 'name_en', 'latin', 'note']) if (e.locks.includes(k) || e.locks.includes('*')) delete p[k];
      e.busy = 1; render(); const row = await putSpecies(e.id || uuid(), p, e.isNew); e.id = row.id;
      if (e.isNew && st.add && st.add.kind === 'arrive') { st.add.fv.sp = row.id; st.add.spOpen = 0; }
    }
    const was = e; st.ed = null; toast(was.isNew ? L('Utworzono', 'Создано', 'Created') : L('Zapisano zmiany', 'Изменения сохранены', 'Changes saved'));
    if (was.isNew && !st.add) go(was.k === 'pl' ? {scr: 'pcard', plc: was.id} : was.k === 'sp' ? {scr: 'scard', sp: was.id} : {});
  } catch (x) { e.busy = 0; e.err = errText(x); }
  render();
}

/* ---------- More sheets: CSV, password, user ---------- */
function mSheet() {
  const k = st.msheet, m = st.mv2 || (st.mv2 = {per: 0});
  if (k === 'csv') return `<div class="scrim" data-close="msheet"></div><div class="bl-sheet"><div class="grip"></div><div class="head"><h3>${ic('list', 20)}${L('Eksport CSV', 'Экспорт CSV', 'CSV export')}</h3><button class="bl-x" data-close="msheet">${ic('x', 18)}</button></div>
  ${fld(L('Okres', 'Период', 'Period'), `<div class="bl-chips">${[L('Ten miesiąc', 'Этот месяц', 'This month'), L('3 miesiące', '3 месяца', '3 months'), L('Ten rok', 'Этот год', 'This year'), L('Wszystko', 'Всё', 'Everything')].map((x, i) => `<button class="bl-chip phrase" data-csvper="${i}" aria-pressed="${m.per === i}">${x}</button>`).join('')}</div>`)}
  <div class="auto">${L('Plik otworzy się w Excelu (CSV, separator „;”, UTF-8).', 'Файл откроется в Excel (CSV, разделитель «;», UTF-8).', 'The file opens in Excel (CSV, “;” separator, UTF-8).')}</div>
  <button class="bl-btn solid save wide" style="background:var(--fab);color:var(--on-fab)" data-csv="1">${ic('list', 17)}${L('Pobierz', 'Скачать', 'Download')}</button></div>`;
  if (k === 'pass') return `<div class="scrim" data-close="msheet"></div><div class="bl-sheet"><div class="grip"></div><div class="head"><h3>${ic('lock', 20)}${L('Zmiana hasła', 'Смена пароля', 'Change password')}</h3><button class="bl-x" data-close="msheet">${ic('x', 18)}</button></div>
  <label class="bl-field"><span>${L('Nowe hasło', 'Новый пароль', 'New password')}</span><input class="inp" type="password" id="pw1" autocomplete="new-password" placeholder="${L('min. 8 znaków', 'не меньше 8 символов', 'at least 8 characters')}"></label>
  <label class="bl-field"><span>${L('Powtórz nowe hasło', 'Повтори новый пароль', 'Repeat new password')}</span><input class="inp" type="password" id="pw2" autocomplete="new-password"></label>
  <p class="err" role="alert">${esc(m.err || '')}</p><button class="bl-btn solid save wide" style="background:var(--fab);color:var(--on-fab)" data-pwsave="1">${L('Zmień hasło', 'Сменить пароль', 'Change password')}</button></div>`;
  return '';
}
function csvExport() {
  const per = (st.mv2 || {}).per || 0, d = new Date(), from = per === 0 ? new Date(d.getFullYear(), d.getMonth(), 1).getTime() : per === 1 ? new Date(d.getFullYear(), d.getMonth() - 2, 1).getTime() : per === 2 ? new Date(d.getFullYear(), 0, 1).getTime() : 0;
  const q = v => { const s = String(v ?? ''); return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const rows = [[L('Data', 'Дата', 'Date'), L('Godzina', 'Время', 'Time'), L('Grupa', 'Группа', 'Group'), L('Wpis', 'Запись', 'Record'), L('Kto / co', 'Кто / что', 'Who / what'), L('Opis', 'Описание', 'Description'), L('Autor', 'Автор', 'Author')]];
  for (const r of D.rec.filter(x => x.at >= from).sort((a, b) => a.at - b.at)) rows.push([ymd(r.at), fTime(r.at), GROUPS.find(g => g.id === kGroup(r.k)).n(), recTitle(r), recWho(r), r.note, nameOf(r.by)]);
  const blob = new Blob(['﻿' + rows.map(r => r.map(q).join(';')).join('\r\n')], {type: 'text/csv;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `dziennik-${ymd(Date.now())}.csv`; document.body.appendChild(a); a.click(); a.remove();
  st.msheet = ''; render();
}
function userSheet() {
  const u = st.uform; if (!u) return '';
  const p = u.id === 'new' ? null : D.prof.get(u.id), R = [['staff', L('Zapis', 'Запись', 'Write')], ['viewer', L('Tylko odczyt', 'Только чтение', 'Read only')], ['admin', L('Administrator', 'Администратор', 'Administrator')]];
  return `<div class="scrim" data-close="uform"></div><div class="bl-sheet"><div class="grip"></div><div class="head"><h3>${ic('users', 20)}${p ? esc(p.display_name || p.login) : L('Nowy pracownik', 'Новый сотрудник', 'New staff member')}</h3><button class="bl-x" data-close="uform">${ic('x', 18)}</button></div>
  <label class="bl-field"><span>${L('Imię', 'Имя', 'Name')}</span><input class="inp" data-uin="name" value="${esc(u.name ?? '')}" placeholder="${L('jak widać w dzienniku', 'как будет видно в журнале', 'as shown in the journal')}"></label>
  ${p ? `<div class="bl-field"><span>${L('Login', 'Логин', 'Login')}</span><div class="auto">${esc(p.login)}</div></div>` : `<label class="bl-field"><span>${L('Login', 'Логин', 'Login')}</span><input class="inp" data-uin="login" value="${esc(u.login ?? '')}" autocapitalize="none" placeholder="${L('małe litery, bez spacji', 'латиницей, без пробелов', 'lowercase, no spaces')}"></label>`}
  <label class="bl-field"><span>${p ? L('Nowe hasło (opcjonalnie)', 'Новый пароль (необязательно)', 'New password (optional)') : L('Hasło', 'Пароль', 'Password')}</span><input class="inp" type="password" data-uin="pass" value="${esc(u.pass ?? '')}" autocomplete="new-password" autocapitalize="none" spellcheck="false" placeholder="${L('min. 8 znaków', 'не меньше 8 символов', 'at least 8 characters')}"></label>
  ${fld(L('Rola', 'Роль', 'Role'), `<div class="bl-seg three">${R.map(([k, l]) => `<button data-urole="${k}" aria-pressed="${u.role === k}">${l}</button>`).join('')}</div>`)}
  ${p ? `<button class="tgl2 ${u.active ? 'on' : ''}" data-uactive="1"><span class="box">${u.active ? ic('check', 14, 3) : ''}</span><span><b>${L('Konto aktywne', 'Аккаунт активен', 'Account active')}</b><small>${L('wyłącz, aby zablokować wejście', 'выключи, чтобы закрыть вход', 'turn off to block sign-in')}</small></span></button>` : ''}
  <p class="err" role="alert">${esc(u.err || '')}</p><button class="bl-btn solid save wide" style="background:var(--fab);color:var(--on-fab)" data-usave="1" ${u.busy ? 'disabled' : ''}>${p ? L('Zapisz', 'Сохранить', 'Save') : L('Utwórz konto', 'Создать аккаунт', 'Create account')}</button></div>`;
}
async function saveUser() {
  const u = st.uform;
  if (!u || u.busy) return;
  const p = u.id === 'new' ? null : D.prof.get(u.id), name = String(u.name || '').trim(), login = String(u.login || '').trim().toLowerCase();
  // Autofill can change the visible value without an input event.
  const pass = $('[data-uin="pass"]')?.value ?? u.pass ?? '';
  u.pass = pass;
  const err = m => { u.err = m; render(); };
  if (!name) return err(L('Podaj imię', 'Укажи имя', 'Enter a name'));
  if (!p && !/^[a-z0-9._-]{2,32}$/.test(login)) return err(L('Login: 2–32 znaki a-z 0-9 . _ -', 'Логин: 2–32 символа a-z 0-9 . _ -', 'Login: 2–32 characters a-z 0-9 . _ -'));
  if ((!p || pass) && pass.length < 8) return err(L('Hasło: min. 8 znaków', 'Пароль: не меньше 8 символов', 'Password: at least 8 characters'));
  u.busy = 1; u.err = ''; render();
  try {
    if (p) {
      const body = {action: 'update', id: p.id};
      if (name !== p.display_name) body.display_name = name;
      if (u.role !== p.role) body.role = u.role;
      if (!!u.active !== (p.active !== false)) body.active = !!u.active;
      if (pass) body.password = pass;
      const result = await callAdmin(body);
      if (pass && result.password_changed !== true) throw {appCode: 'password_unconfirmed'};
    } else await callAdmin({action: 'create', login, password: pass, display_name: name, role: u.role});
    u.pass = '';
    if (st.uform === u) st.uform = null;
    toast(p && pass ? L(`Hasło zmienione. Login: ${p.login}`, `Пароль изменён. Логин: ${p.login}`, `Password changed. Login: ${p.login}`) : L('Zapisano', 'Сохранено', 'Saved'));
    await LOAD.profiles().catch(() => {});
  } catch (x) {
    u.busy = 0;
    u.err = ({
      login_taken: L('Taki login już jest', 'Такой логин уже есть', 'This login is taken'),
      password_unconfirmed: L('Serwer nie potwierdził zmiany hasła.', 'Сервер не подтвердил смену пароля.', 'The server did not confirm the password change.'),
      short_password: L('Hasło: min. 8 znaków', 'Пароль: не меньше 8 символов', 'Password: at least 8 characters'),
      password_update_failed: L('Nie udało się zmienić hasła.', 'Не удалось сменить пароль.', 'Could not change the password.')
    })[x?.appCode] || L('Nie udało się zapisać', 'Не удалось сохранить', 'Could not save');
  }
  render();
}
