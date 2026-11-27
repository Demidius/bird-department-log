// ux3.js — v2: further touches (continues ux2.js; loads after pc.js).
// 1) Breeding timings from the records: incubation (start of incubation → hatching) and nest time (hatching → fledging).
//    Hatching / fledging record: tile «Incubation» / «In the nest»: reference N days (here: M days).
//    Species card: the same in the incubation and fledging fields + «Forecast» = average of the reference and all our cases.
//    Calendar: expected hatching and fledging use that average; expected fledging disappears once any chick of the brood
//    has fledged (chicks found by parents, as on the record card).
// 2) Calendar, expected events: species name in green as in ordinary records; no «Expected: Expected hatching».
// 3) Phone: the keyboard changes the window height; that re-rendered the screen, the field took focus again and the
//    keyboard reopened (and typing lagged). Now a window resize re-renders only when switching phone ↔ computer.
// 4) Phone: when the keyboard is hidden («⌄»), the field loses focus — otherwise any re-render (sync, timers) focused it
//    again and the keyboard popped up.
// 5) Treatment, «How many days»: + «Until cancelled» — no end date, runs until ended by hand; «Now» shows «until cancelled».
// 6) Arrival, «From»: Born in the zoo · From another zoo · CITES · Other.
// 7) Arrival: per animal «Age»: unknown / birth date / age as a number (years or months) / stage: chick, young, adult, old
//    (stage and assessment date are kept; the card shows the stage and «now about from–to», growing with time).
//    Stage limits from the species card: chick — until fledging; young — until sexual maturity (species field
//    «Sexual maturity, years», info.mature_years); adult — until 75 % of the lifespan (the largest number of years in
//    «Lifespan»); old — until the end of the lifespan. Species card: row «Age stages». Animal columns age_class, age_n
//    (months, for age as a number), age_at (assessment date).
//    «When»: date and time / date only (record without time) / no date (only the card: no journal or calendar entry,
//    photos go to the animal card).
// 8) Users (admin): the list shows the name and «Login: …»; in the form the password can be shown (eye) and generated;
//    after creating an account or changing a password — a «Sign-in details» window: name, login, password + «Copy».
// 9) Staff passwords visible to the admin (owner's request): the staff card starts with «Login» and «Password» (dots, eye,
//    «Copy»). The admin-users Edge Function keeps a copy of every password it sets in public.account_passwords (admins only);
//    older passwords are unknown («unknown — set a new one»). The login can be changed (not for e-mail logins).
// 10) Computer: the window type label goes to the card on the right (not to a list from «Now» in the middle column);
//     lists in the middle column have no back button.
// 11) Calendar counters larger (phone 12px, computer 14px); on narrow phones smaller icons (≤ 400px) or none (< 370px),
//     so that both counters stay on one line inside the day cell.
// 12) Age also for groups (arrival) and in the animal card edit: unknown / birth date / years / stage — under the
//     «Born» lock; changing the stage or the years sets a new assessment date.

/* 1) breeding timings */
const brdUniq = l => l.filter((m, i) => m && l.findIndex(x => x && x.id === m.id) === i);
const brdSp = r => { const a = anByName(r.bird); return spBy(r.sp) || (a ? spBy(a.species_id) : null); };
function brdKids(r) {
  const f = r.f || {}, a = anByName(r.bird), young = a && isYoung(a, r.at);
  let par = brdUniq((f.par || []).map(anByName)); if (!par.length && a) par = young ? brdUniq((a.parents || []).map(anById)) : [a];
  let kids = brdUniq((f.kids || []).map(anByName));
  if (!kids.length) { const pid = par.map(p => p.id); kids = D.an.filter(k => (k.parents || []).some(id => pid.includes(id)) && k.born && Math.abs(new Date(k.born).getTime() - r.at) <= 60 * DAY); }
  if (young) kids = brdUniq([a, ...kids]);
  return {par, kids};
}
const brdNames = r => { const {par, kids} = brdKids(r); return [r.bird, ...par.map(x => x.name), ...kids.map(x => x.name)].map(key); };
// one brood: incubation start (earliest «incub» of a parent within 60 days before, after the previous hatching) and first fledging
function brdObs(h) {
  const {par, kids} = brdKids(h), pn = [h.bird, ...par.map(x => x.name)].map(key), kn = [h.bird, ...kids.map(x => x.name)].map(key);
  const prev = D.rec.filter(x => x.k === 'hatch' && x.id !== h.id && x.at < h.at && pn.includes(key(x.bird))).reduce((m, x) => Math.max(m, x.at), 0);
  const inc = D.rec.filter(x => x.k === 'incub' && pn.includes(key(x.bird)) && x.at < h.at && x.at > prev && h.at - x.at <= 60 * DAY).sort((a, b) => a.at - b.at)[0];
  const fl = D.rec.filter(x => x.k === 'fledge' && kn.includes(key(x.bird)) && x.at > h.at && x.at - h.at <= 120 * DAY).sort((a, b) => a.at - b.at)[0];
  return {inc: inc ? Math.round((h.at - inc.at) / DAY) : null, nest: fl ? Math.round((fl.at - h.at) / DAY) : null, fl};
}
function brdStats(s) {
  const inf = spInfo(s), ref = {inc: +inf.incub_days || 0, nest: +inf.fledge_days || 0}, obs = {inc: [], nest: []};
  if (s) for (const h of D.rec) if (h.k === 'hatch') { const sp = brdSp(h); if (!sp || sp.id !== s.id) continue; const o = brdObs(h); if (o.inc > 0) obs.inc.push(o.inc); if (o.nest > 0) obs.nest.push(o.nest); }
  const avg = k => { const v = (ref[k] ? [ref[k]] : []).concat(obs[k]); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0; };
  return {ref, obs, est: {inc: avg('inc'), nest: avg('nest')}};
}
const dni = n => `${n} ${L('dni', 'дн.', 'days')}`;
const brdOurs = l => !l.length ? '' : L('u nas: ', 'у нас: ', 'here: ') + (l.length === 1 ? dni(l[0]) : L('śr. ', 'в ср. ', 'avg ') + dni(Math.round(l.reduce((a, b) => a + b, 0) / l.length)) + ', ' + l.length + '×');
// record card: hatching → incubation, fledging → time in the nest
const _recCardBrd = recCard;
recCard = function () {
  const h = _recCardBrd(), r = D.rec.find(x => x.id === st.rec); if (!r || !['hatch', 'fledge'].includes(r.k)) return h;
  let hat = r, o; if (r.k === 'fledge') { const k = key(r.bird); hat = D.rec.filter(x => x.k === 'hatch' && x.at < r.at && brdNames(x).includes(k)).sort((a, b) => b.at - a.at)[0]; if (!hat) return h; }
  o = brdObs(hat); const s = brdSp(hat), st0 = brdStats(s);
  const kind = r.k === 'hatch' ? 'inc' : 'nest', mine = r.k === 'hatch' ? o.inc : (o.fl && o.fl.id === r.id ? o.nest : Math.round((r.at - hat.at) / DAY));
  const ref = st0.ref[kind]; if (!ref && !(mine > 0)) return h;
  const lab = kind === 'inc' ? L('Wysiadywanie', 'Насиживание', 'Incubation') : L('W gnieździe', 'В гнезде', 'In the nest');
  const val = (ref ? dni(ref) : L('brak w karcie gatunku', 'нет в карточке вида', 'not in the species card')) + (mine > 0 ? ` (${L('u nas: ', 'у нас: ', 'here: ')}${dni(mine)})` : '');
  const a = h.indexOf('<dl class="bl-facts" style="margin-top:10px">'), b = a < 0 ? -1 : h.indexOf('</dl>', a); if (b < 0) return h;
  return h.slice(0, b) + `<div class="brdt"><dt>${lab}</dt><dd>${esc(val)}</dd></div>` + h.slice(b);
};
// species card: our durations and the forecast
const _speciesCardBrd = speciesCard;
speciesCard = function () {
  let h = _speciesCardBrd(); const s = spBy(st.sp); if (!s || isMammal(s)) return h;
  const S = brdStats(s);
  for (const [k, lab, icn] of [['inc', L('Wysiadywanie', 'Насиживание', 'Incubation'), 'egg'], ['nest', L('Do opuszczenia gniazda', 'До вылета из гнезда', 'Until fledging'), 'nest']]) {
    if (!S.obs[k].length) continue;
    const add = `${S.ref[k] ? ' ' : ''}<span class="brdo">(${esc(brdOurs(S.obs[k]))})</span><small class="brdp">${L('Prognoza: ≈ ', 'Прогноз: ≈ ', 'Forecast: ≈ ')}${dni(S.est[k])}</small>`;
    const t = `${lab}</dt><dd>`, i = h.indexOf(t);
    if (i >= 0) { const j = h.indexOf('</dd>', i); h = h.slice(0, j) + add + h.slice(j); }
    else { const d = h.indexOf('<dl class="ffacts">'), e = d < 0 ? -1 : h.indexOf('</dl>', d); if (e >= 0) h = h.slice(0, e) + `<div><dt>${ic(icn, 14)}${lab}</dt><dd>${add}</dd></div>` + h.slice(e); }
  }
  return h;
};
// calendar: expected hatching / fledging by the average; fledging disappears once any chick of the brood has fledged
const _calEventsBrd = calEvents;
calEvents = function () {
  const ev = _calEventsBrd(), srt = Array.prototype.sort, cache = new Map(), est = s => { if (!s) return {inc: 0, nest: 0}; if (!cache.has(s.id)) cache.set(s.id, brdStats(s).est); return cache.get(s.id); };
  for (const [k, l] of ev) { const f = l.filter(e => !(e.exp && (e.r.k === 'incub' || e.r.k === 'hatch'))); if (f.length) ev.set(k, f); else ev.delete(k); }
  const put = (at, it) => { const k = dayKey(at); if (!ev.has(k)) ev.set(k, []); ev.get(k).push(it); };
  for (const x of activeIncub()) { const d = x.r.f.days || est(brdSp(x.r)).inc; if (d) put(x.r.at + d * DAY, {g: 'breed', icn: 'egg', exp: 1, r: x.r, label: L('Spodziewane wyklucie', 'Ожидается выклев', 'Expected hatching')}); }
  for (const r of D.rec.filter(x => x.k === 'hatch' && !gone(x.bird))) {
    const d = est(brdSp(r)).nest; if (!d) continue;
    const names = brdNames(r); if (D.rec.some(x => x.k === 'fledge' && x.at > r.at && names.includes(key(x.bird)))) continue;
    const at = r.at + d * DAY; if (Date.now() > at + 14 * DAY) continue;
    put(at, {g: 'breed', icn: kIcon('fledge'), exp: 1, r, label: L('Spodziewany wylot', 'Ожидается вылет', 'Expected fledging')});
  }
  const cmp = (x, y) => (x.exp ? 1 : 0) - (y.exp ? 1 : 0) || y.r.at - x.r.at;
  for (const a of ev.values()) a.sort = function () { return srt.call(this, cmp); };
  return ev;
};
document.head.insertAdjacentHTML('beforeend', '<style>.brdo{color:var(--muted);font-weight:600}.brdp{display:block;margin-top:3px;font:600 12.5px/1.3 var(--font-text);color:var(--accent)}</style>');

/* 2) calendar: expected events — species in green, no double «Expected:» */
function guessFix() {
  document.querySelectorAll('.guessrow[data-rec]').forEach(el => {
    if (el.dataset.gfx) return; el.dataset.gfx = 1;
    const b = el.querySelector('b'), p = L('Spodziewane: ', 'Ожидается: ', 'Expected: ');
    if (b && b.textContent.startsWith(p)) { const rest = b.textContent.slice(p.length); if (/^(Spodziewan|Ожида|Expected)/i.test(rest)) b.textContent = rest.charAt(0).toUpperCase() + rest.slice(1); }
    const r = D.rec.find(x => x.id === el.dataset.rec), a = r && anByName(r.bird), t = a && anTitle(a), s = el.querySelector('div > span');
    if (s && t && s.textContent.startsWith(t) && !s.querySelector('.spn')) s.innerHTML = `<em class="spn">${esc(t)}</em>${esc(s.textContent.slice(t.length))}`;
  });
}
addEventListener('DOMContentLoaded', () => { const _r = render; render = function () { _r(); guessFix(); }; });
document.head.insertAdjacentHTML('beforeend', '<style>.guessrow .spn{font-style:normal;font-weight:600;color:var(--accent)}</style>');

/* 3) no full re-render when only the window height changes */
let pcWas = isPC(); const _setTO = window.setTimeout;
window.setTimeout = function (fn, ms, ...a) {
  if (fn === render && ms === 150 && window.event && window.event.type === 'resize') { const now = isPC(); if (now === pcWas) return 0; pcWas = now; }
  return _setTO.call(window, fn, ms, ...a);
};

/* 4) keyboard hidden → field loses focus */
if (window.visualViewport && matchMedia('(pointer: coarse)').matches) {
  let vh = visualViewport.height;
  visualViewport.addEventListener('resize', () => { const h = visualViewport.height, ae = document.activeElement; if (h > vh + 120 && ae && ae.matches && ae.matches('input:not([type=date]):not([type=time]):not([type=datetime-local]),textarea')) ae.blur(); vh = h; });
}

/* 5) treatment: «until cancelled» */
const _medFormOpen = medForm;
medForm = function () {
  const h = _medFormOpen(), f = F(); if (!f || !f.fv) return h;
  const i = h.indexOf('<span class="numrow" style="max-width:110px">'); if (i < 0) return h;
  return h.slice(0, i) + `<button class="bl-chip phrase" data-dopen="1" aria-pressed="${!!f.fv.open}">${L('Do odwołania', 'До отмены', 'Until cancelled')}</button>` + h.slice(i);
};
document.addEventListener('click', e => {
  const f = F(); if (!f || !f.fv) return;
  if (e.target.closest('[data-dopen]')) { e.preventDefault(); e.stopImmediatePropagation(); f.fv.open = f.fv.open ? 0 : 1; if (f.fv.open) f.fv.days = null; return render(); }
  if (e.target.closest('[data-fv=days]')) f.fv.open = 0;
}, true);
document.addEventListener('input', e => { if (e.target.matches && e.target.matches('[data-in="fv.days"]') && st.add && st.add.fv && st.add.fv.open) { st.add.fv.open = 0; const b = document.querySelector('[data-dopen]'); if (b) b.setAttribute('aria-pressed', 'false'); } });
const _taskCardsOpen = taskCards;
taskCards = function () {
  const T = _taskCardsOpen();
  for (const x of T) if (x.rx && x.rx.f.open && !/(do |до |until )\d/.test(x.meta || '')) x.meta = (x.meta ? x.meta + ' · ' : '') + L('do odwołania', 'до отмены', 'until cancelled');
  return T;
};

/* 6) arrival: «from» options */
OPT.from = () => LA(['Urodzony w ZOO', 'Z innego ZOO', 'CITES', 'Inne'], ['Родился в зоопарке', 'Из другого зоопарка', 'CITES', 'Другое'], ['Born in the zoo', 'From another zoo', 'CITES', 'Other']);

/* 7) arrival: age and «when» */
// age stages of a species (days): chick → until fledging, young → until maturity, adult → until 75 % of lifespan, old → lifespan
const lifeYears = s => { const t = String(infoTx(s, 'life') || ''); let m = 0; for (const x of t.matchAll(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*(lat|lata|rok|year|лет|год)/gi)) m = Math.max(m, parseFloat((x[2] || x[1]).replace(',', '.'))); return m || 0; };
function ageStages(s) {
  if (!s) return []; const inf = spInfo(s), mam = isMammal(s), Y = 365.25, F = mam ? 0 : +inf.fledge_days || 0, M = (parseFloat(String(inf.mature_years || '').replace(',', '.')) || 0) * Y, Lf = lifeYears(s) * Y;
  const st0 = [['young', L('Młody', 'Молодой', 'Young'), F || 0, M || null], ['adult', L('Dorosły', 'Взрослый', 'Adult'), M || null, Lf ? Lf * 0.75 : null], ['old', L('Stary', 'Старый', 'Old'), Lf ? Lf * 0.75 : null, Lf || null]];
  return (mam ? [] : [['chick', L('Pisklę', 'Птенец', 'Chick'), 0, F || null]]).concat(st0).map(([k, lab, from, to]) => ({k, lab, from, to}));
}
const agePl = (n, a, b, c) => n === 1 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c;
const ageY = n => Number.isInteger(n) ? L(agePl(n, 'rok', 'lata', 'lat'), n === 1 ? 'год' : agePl(n, 'год', 'года', 'лет'), n === 1 ? 'year' : 'years') : L('roku', 'года', 'years');
const ageParts = d => d == null ? null : d < 45 ? [Math.round(d), 'd'] : d < 730 ? [Math.round(d / 30.44), 'm'] : [Math.round(d / 365.25 * 2) / 2, 'y'];
const ageUnit = ([n, u]) => u === 'd' ? L('dni', 'дн.', n === 1 ? 'day' : 'days') : u === 'm' ? L('mies.', 'мес.', 'mo') : ageY(n);
const ageNum = n => String(n).replace('.', L(',', ',', '.'));
const ageFmt = d => { const p = ageParts(d); return p ? ageNum(p[0]) + ' ' + ageUnit(p) : '?'; };
const ageRange = (g, plus = 0) => { if (g.from == null && g.to == null) return '';
  const a = ageParts(g.from == null ? null : g.from + plus), b = ageParts(g.to == null ? null : g.to + plus);
  if (a && b && a[1] === b[1]) return `${ageNum(a[0])}–${ageNum(b[0])} ${ageUnit(b)}`;
  return `${a ? ageNum(a[0]) + ' ' + ageUnit(a) : '?'} – ${b ? ageNum(b[0]) + ' ' + ageUnit(b) : '?'}`; };
const fDateY = ms => new Date(ms).toLocaleDateString(LOC(), {day: 'numeric', month: 'numeric', year: 'numeric'});
function arrAge(i) {
  const f = F(), v = f.fv, m = v['am' + i] || 'x', seg = (k, s, t) => `<button data-fv="${k}" data-s="${s}" aria-pressed="${(v[k] || (k.startsWith('au') ? 'y' : 'x')) === s}">${t}</button>`;
  const stg = ageStages(spBy(v.sp));
  return `<div class="agerow"><span class="agel">${L('Wiek', 'Возраст', 'Age')}</span><div class="seg2">${seg('am' + i, 'x', L('Nie wiem', 'Не знаю', 'Unknown'))}${seg('am' + i, 'd', L('Data ur.', 'Дата рожд.', 'Birth date'))}${seg('am' + i, 'n', L('Ile lat', 'Сколько', 'Years'))}${seg('am' + i, 'a', L('Etap', 'Стадия', 'Stage'))}</div></div>`
    + (m === 'd' ? `<input class="inp" type="date" data-in="fv.bd${i}" value="${esc(v['bd' + i] || '')}" max="${ymd(Date.now())}" style="min-height:42px">` : '')
    + (m === 'n' ? `<div class="ageap">${inpt('fv.ag' + i, v['ag' + i], L('np. 5', 'напр. 5', 'e.g. 5'), 'inputmode="decimal" style="min-height:42px"')}<div class="seg2">${seg('au' + i, 'y', L('lat', 'лет', 'years'))}${seg('au' + i, 'm', L('mies.', 'мес.', 'months'))}</div></div>` : '')
    + (m === 'a' ? (stg.length ? `<div class="agecls">${stg.map(g => `<button data-fv="ac${i}" data-s="${g.k}" aria-pressed="${v['ac' + i] === g.k}"><b>${g.lab}</b>${ageRange(g) ? `<small>${ageRange(g)}</small>` : ''}</button>`).join('')}</div>` : `<p class="tip">${L('Najpierw wybierz gatunek', 'Сначала выбери вид', 'Pick the species first')}</p>`) : '');
}
const _arriveFormAg = arriveForm;
arriveForm = function () {
  let h = _arriveFormAg(); const f = F(), grp = (f.fv.cnt ?? 0) === 4;
  for (let i = 0; i <= (grp ? 0 : f.fv.cnt ?? 0); i++) { const t = grp ? 'data-in="fv.n0"' : `data-in="fv.r${i}"`, a = h.indexOf(t); if (a < 0) continue; const b = h.indexOf('>', a) + 1; h = h.slice(0, b) + arrAge(i) + h.slice(b); }
  return h;
};
// «When» for the arrival
const _whenPhotoArr = whenPhoto;
whenPhoto = function (noPhoto) {
  const f = F(); if (!f || f.kind !== 'arrive' || f.edit) return _whenPhotoArr(noPhoto);
  const m = f.atMode || 'dt', b = (s, t) => `<button data-atmode="${s}" aria-pressed="${m === s}">${t}</button>`;
  const seg = `<div class="bl-field"><span>${L('Kiedy', 'Когда', 'When')}</span><div class="seg2 atseg">${b('dt', L('Data i godzina', 'Дата и время', 'Date and time'))}${b('d', L('Tylko data', 'Только дата', 'Date only'))}${b('none', L('Bez daty', 'Без даты', 'No date'))}</div></div>`;
  let h = _whenPhotoArr(noPhoto);
  if (m === 'd') h = h.replace(/<span class="atwrap">[\s\S]*?<\/span>(?=<label|<\/div>$)/, `<span class="atwrap"><input class="inp" type="date" data-in="atd" value="${esc(f.atd || ymd(Date.now()))}" max="${ymd(Date.now())}" style="flex:1"></span>`);
  if (m === 'none') h = h.replace(/<span class="atwrap">[\s\S]*?<\/span>(?=<label|<\/div>$)/, `<span class="atwrap"><span class="atnone">${L('Bez wpisu w dzienniku i kalendarzu', 'Без записи в журнал и календарь', 'No journal or calendar entry')}</span></span>`);
  return seg + h;
};
document.addEventListener('click', e => { const b = e.target.closest('[data-atmode]'); if (!b) return; e.preventDefault(); e.stopImmediatePropagation(); const f = F(); if (!f) return; f.atMode = b.dataset.atmode; render(); }, true);
const arrAt = f => f.atMode === 'd' ? new Date((f.atd || ymd(Date.now())) + 'T12:00').getTime() : f.atMode === 'none' ? Date.now() : atMs();
function arrBorn(v, i, at) {
  const m = v['am' + i] || 'x';
  if (m === 'd' && v['bd' + i]) return {born: v['bd' + i]};
  if (m === 'a' && v['ac' + i]) return {age_class: v['ac' + i], age_at: ymd(at)};
  const n = parseFloat(String(v['ag' + i] || '').replace(',', '.'));
  if (m === 'n' && n >= 0) return {age_class: 'num', age_n: Math.round((v['au' + i] || 'y') === 'm' ? n : n * 12), age_at: ymd(at)};
  return {};
}
saveArrive = async function () { // replaces the whole chain; keeps the group «unknown count» of groups.js
  const v0 = F().fv; GRP_X = (v0.cnt ?? 0) === 4 && v0.gunk ? grpMark(v0.gabout) : null;
  try { return await arrSave(); } finally { GRP_X = null; }
};
async function arrSave() {
  const f = F(), v = f.fv, sp = spBy(v.sp), mode = f.atMode || 'dt', at = arrAt(f);
  if (!sp) { f.err = L('Wybierz gatunek', 'Выбери вид', 'Pick the species'); return render(); }
  if (!v.to) { f.err = L('Wybierz, dokąd', 'Выбери, куда', 'Choose where to'); return render(); }
  if (at > Date.now() + DAY) { f.err = L('Data z przyszłości', 'Дата из будущего', 'Date in the future'); return render(); }
  f.busy = 1; f.err = ''; render();
  const made = [], ans = [], base = sp.name_pl || sp.latin || spName(sp), SX = {m: 'samiec', f: 'samica', '': 'płeć nieznana'};
  try {
    const rows = (v.cnt ?? 0) === 4 ? [Object.assign({name: String(v.n0 || '').trim() || base, sex: '', grp: {m: num(v.gm) || 0, f: num(v.gf) || 0, u: num(v.gu) || 0, j: num(v.gj) || 0}}, arrBorn(v, 0, at))]
      : Array.from({length: (v.cnt ?? 0) + 1}).map((_, i) => Object.assign({name: String(v['n' + i] || '').trim() || `${base} - ${SX[v['sx' + i] ?? '']}`, sex: v['sx' + i] ?? '', ring: String(v['r' + i] || '').trim()}, arrBorn(v, i, at)));
    for (const r of rows) {
      const id = uuid(), name = uniqName(r.name);
      const a = await putAnimal(id, clean({name, species_id: sp.id, sex: r.sex, ring: r.ring, grp: r.grp, born: r.born, age_class: r.age_class, age_n: r.age_n, age_at: r.age_at, arrived: mode === 'none' ? undefined : ymd(at),
        origin: String(v.org || '').trim() || (v.from != null ? pick('from', v.from) : ''), encl: v.to, encl_at: new Date(at).toISOString(), status: 'active'}), true);
      ans.push(a.id);
      if (mode !== 'none') made.push(await addRecord('arrive', a.name, sp.id, clean({from: v.from, org: v.org, to: v.to, nt: mode === 'd' ? 1 : undefined}), f.note.trim(), at));
      if (v.quar) made.push(await addRecord('watch', a.name, sp.id, {why: 3, freq: 3, until: 3}, '', mode === 'none' ? Date.now() : at));
    }
    const arr = made.filter(x => x.k === 'arrive');
    for (const file of f.files || []) { if (arr.length) for (const r of arr) await uploadPhoto(file, 'record', r.id).catch(() => {}); else for (const id of ans) await uploadPhoto(file, 'bird', id).catch(() => {}); }
    st.add = null; toast(L('Dodano kartę', 'Карточка создана', 'Card created'), {recs: made.map(r => r.id), ans});
    if (ans.length === 1) go({scr: 'card', ani: ans[0]});
  } catch (e) { f.busy = 0; f.err = errText(e); if (made.length || ans.length) toast(L('Zapisano częściowo', 'Сохранено частично', 'Partly saved'), {recs: made.map(r => r.id), ans}); }
  render();
}
// animal card: age — birth date with the age now, or the stage with «now about from – to»
const _animalCardAg = animalCard;
animalCard = function () {
  let h = _animalCardAg(); const a = anById(st.ani); if (!a) return h;
  if (a.born) { const lab = L('Urodzony', 'Родился', 'Born'), b = new Date(a.born).getTime(), t = `<dt>${lab}</dt><dd>${esc(fDate(b))}</dd>`; return h.replace(t, `<dt>${lab}</dt><dd>${esc(fDateY(b) + ' · ' + ageFmt((Date.now() - b) / DAY))}</dd>`); }
  if (!a.age_class) return h;
  if (a.age_class === 'num') {
    const at = a.age_at ? new Date(a.age_at).getTime() : Date.now(), d0 = (+a.age_n || 0) * 30.44, now = d0 + (Date.now() - at) / DAY;
    const val = `${L('ok. ', 'ок. ', 'about ')}${ageFmt(d0)} (${L('ocena', 'оценка', 'assessed')} ${fDateY(at)})` + (now - d0 > 30 ? ` · ${L('teraz ok. ', 'сейчас ок. ', 'now about ')}${ageFmt(now)}` : '');
    const i = h.indexOf('<dl class="bl-facts"'), j = i < 0 ? -1 : h.indexOf('</dl>', i); if (j < 0) return h;
    return h.slice(0, j) + `<div class="agef"><dt>${L('Wiek', 'Возраст', 'Age')}</dt><dd>${esc(val)}</dd></div>` + h.slice(j);
  }
  const g = ageStages(spBy(a.species_id)).find(x => x.k === a.age_class); if (!g) return h;
  const at = a.age_at ? new Date(a.age_at).getTime() : Date.now(), r = ageRange(g, (Date.now() - at) / DAY);
  const val = `${g.lab} (${L('ocena', 'оценка', 'assessed')} ${fDateY(at)})` + (r ? ` · ${L('teraz ok. ', 'сейчас ок. ', 'now about ')}${r}` : '');
  const i = h.indexOf('<dl class="bl-facts"'), j = i < 0 ? -1 : h.indexOf('</dl>', i); if (j < 0) return h;
  return h.slice(0, j) + `<div class="agef"><dt>${L('Wiek', 'Возраст', 'Age')}</dt><dd>${esc(val)}</dd></div>` + h.slice(j);
};
// species card: age stages
const _speciesCardAg = speciesCard;
speciesCard = function () {
  let h = _speciesCardAg(); const s = spBy(st.sp); if (!s) return h;
  const stg = ageStages(s); if (!stg.some(g => g.to != null && g.k !== 'chick')) return h;
  const d = h.indexOf('<dl class="ffacts">'), e = d < 0 ? -1 : h.indexOf('</dl>', d); if (e < 0) return h;
  return h.slice(0, e) + `<div class="agestg"><dt>${ic('clock', 14)}${L('Etapy wieku', 'Стадии возраста', 'Age stages')}</dt><dd>${stg.map(g => `<span><b>${g.lab}</b> ${esc(ageRange(g))}</span>`).join('')}<small>${L('dorosły — od dojrzałości, stary — ostatnie 25 % długości życia', 'взрослый — с половой зрелости, старый — последние 25 % жизни', 'adult — from maturity, old — the last 25 % of the lifespan')}</small></dd></div>` + h.slice(e);
};
// species edit: sexual maturity, years
const _speciesEditAg = speciesEdit;
speciesEdit = function () {
  const h = _speciesEditAg(), inf = st.ed.v.info, t = 'data-ein="info.cites"', i = h.indexOf(t); if (i < 0) return h;
  const j = h.indexOf('</div></div>', i) + 12;
  return h.slice(0, j) + `<div class="frow">${efld(L('Dojrzałość płciowa, lata', 'Половая зрелость, лет', 'Sexual maturity, years'), 'mature_years', `<input class="inp" data-ein="info.mature_years" value="${esc(inf.mature_years ?? '')}" placeholder="2" inputmode="decimal" ${ro('mature_years') ? 'disabled' : ''}>`)}</div>` + h.slice(j);
};
document.addEventListener('click', e => { if (!e.target.closest('[data-edsave]') || !st.ed || !st.ed.v || !st.ed.v.info) return; const inf = st.ed.v.info, n = parseFloat(String(inf.mature_years ?? '').replace(',', '.')); if (n > 0) inf.mature_years = n; else delete inf.mature_years; }, true);
document.head.insertAdjacentHTML('beforeend', '<style>.agecls{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.agecls button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:9px 12px;border-radius:12px;border:1.5px solid var(--ctl-line);background:var(--card);color:var(--ink);font:inherit;text-align:left;cursor:pointer}.agecls button b{font:700 14px/1.2 var(--font-text)}.agecls button small{font:600 12px/1.2 var(--font-text);color:var(--muted)}.agecls button[aria-pressed=true]{background:var(--fab);border-color:var(--fab);color:var(--on-fab)}.agecls button[aria-pressed=true] small{color:inherit;opacity:.8}.agestg dd{display:flex;flex-direction:column;gap:3px}.agestg dd small{margin-top:2px;font:600 11.5px/1.3 var(--font-text);color:var(--muted)}</style>');
document.head.insertAdjacentHTML('beforeend', '<style>.agerow{display:flex;align-items:center;gap:10px;margin-top:8px}.agel{font:700 12px/1 var(--font-text);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.agerow .seg2{flex:1}.agerow .seg2 button{flex:1;font-size:12.5px;min-height:38px;white-space:nowrap;padding:0 6px}.inj>.inp[type=date],.inj .ageap{margin-top:8px}.ageap{display:flex;gap:8px;align-items:center}.ageap>.clrw,.ageap>.inp{flex:1}.atseg{display:flex}.atseg button{flex:1;font-size:13px}.atnone{flex:1;display:flex;align-items:center;justify-content:center;min-height:48px;padding:0 12px;border-radius:14px;border:1.5px dashed var(--line);color:var(--muted);font:600 13px/1.3 var(--font-text);text-align:center}</style>');

/* 8) users: login in the list, password eye / generate, sign-in details window */
const _usersScreenCred = usersScreen;
usersScreen = function () {
  if (Date.now() - pwAt > 60000) loadPw();
  let h = _usersScreenCred().replace(/(<button class="mrow" data-uform="[^"]+">[\s\S]*?<small>)/g, `$1${L('Login: ', 'Логин: ', 'Login: ')}`);
  const c = st.ucred; if (!c) return h;
  const row = (l, v, k) => `<div class="crow"><span>${l}</span><b ${k ? `data-ccopy="${k}"` : ''}>${esc(v)}</b></div>`;
  return h + `<div class="scrim" data-ccclose="1"></div><div class="bl-sheet credsh"><div class="grip"></div><div class="head"><h3>${ic('users', 20)}${L('Dane do logowania', 'Данные для входа', 'Sign-in details')}</h3><button class="bl-x" data-ccclose="1">${ic('x', 18)}</button></div>
  <div class="creds">${row(L('Imię', 'Имя', 'Name'), c.name)}${row(L('Login', 'Логин', 'Login'), c.login)}${row(L('Hasło', 'Пароль', 'Password'), c.pass)}</div>
  <p class="tip">${L('Przekaż te dane pracownikowi. Hasło widać też w karcie pracownika.', 'Передай эти данные сотруднику. Пароль виден и в карточке сотрудника.', 'Pass these details on. The password is also shown in the staff card.')}</p>
  <div class="bl-row" style="gap:8px"><button class="bl-btn" style="flex:1" data-ccopyall="1">${L('Kopiuj', 'Копировать', 'Copy')}</button><button class="bl-btn solid" style="flex:1;background:var(--fab);color:var(--on-fab)" data-ccclose="1">${L('Gotowe', 'Готово', 'Done')}</button></div></div>`;
};
const _userSheetCred = userSheet;
userSheet = function () {
  const h = _userSheetCred(), u = st.uform; if (!u) return h;
  const m = h.match(/<input class="inp" type="password" data-uin="pass"[^>]*>/); if (!m) return h;
  const inp = u.showPass ? m[0].replace('type="password"', 'type="text"') : m[0];
  return h.replace(m[0], `<span class="pwrow">${inp}<button type="button" class="pwb" data-upeye="1" aria-label="${L('Pokaż hasło', 'Показать пароль', 'Show password')}">${ic('eye', 18)}</button><button type="button" class="pwb pwgen" data-upgen="1">${L('Wygeneruj', 'Создать', 'Generate')}</button></span>`);
};
const pwGen = () => { const a = 'abcdefghjkmnpqrstuvwxyz23456789', r = crypto.getRandomValues(new Uint32Array(10)); return [...r].map(x => a[x % a.length]).join(''); };
document.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('[data-upeye]') && st.uform) { e.preventDefault(); e.stopImmediatePropagation(); const i = document.querySelector('[data-uin="pass"]'); if (i) st.uform.pass = i.value; st.uform.showPass = !st.uform.showPass; return render(); }
  if (t.closest('[data-upgen]') && st.uform) { e.preventDefault(); e.stopImmediatePropagation(); st.uform.pass = pwGen(); st.uform.showPass = true; return render(); }
  if (t.closest('[data-ccclose]')) { e.preventDefault(); e.stopImmediatePropagation(); st.ucred = null; return render(); }
  const cp = t.closest('[data-ccopyall]'); if (cp && st.ucred) { e.preventDefault(); e.stopImmediatePropagation(); const c = st.ucred;
    const txt = `${L('Login', 'Логин', 'Login')}: ${c.login}\n${L('Hasło', 'Пароль', 'Password')}: ${c.pass}`;
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(L('Skopiowano', 'Скопировано', 'Copied')), () => toast(L('Nie udało się skopiować', 'Не удалось скопировать', 'Could not copy'))); }
}, true);
const _saveUserCred = saveUser;
saveUser = async function () {
  const u = st.uform; if (!u) return _saveUserCred();
  const p = u.id === 'new' ? null : D.prof.get(u.id), i = document.querySelector('[data-uin="pass"]'), pass = (i && i.value) || u.pass || '';
  const name = String(u.name || '').trim();
  await _saveUserCred();
  const q = p ? D.prof.get(p.id) : null, login = q ? q.login : String(u.login || '').trim().toLowerCase();
  if (pass && !st.uform) { st.ucred = {name, login, pass}; render(); }
};
document.head.insertAdjacentHTML('beforeend', '<style>.pwrow{display:flex;gap:6px;align-items:stretch}.pwrow>.inp,.pwrow>.clrw{flex:1;min-width:0}.pwrow .pwb{min-height:50px}.pwb{flex:none;display:flex;align-items:center;justify-content:center;min-width:46px;padding:0 10px;border:0;border-radius:12px;background:var(--soft);color:var(--ink);font:700 13px/1 var(--font-text);cursor:pointer}.creds{display:flex;flex-direction:column;gap:8px;margin:4px 0 10px}.crow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-radius:14px;background:var(--soft)}.crow span{font:600 13px/1 var(--font-text);color:var(--muted)}.crow b{font:700 17px/1.2 var(--font-text);user-select:all;word-break:break-all;text-align:right}.mrow .mt small{color:var(--ink-2)}</style>');

/* 9) staff passwords and login change */
const PWK = new Map();
let pwAt = 0;
const loadPw = async () => {
  if (!isAdmin()) return; pwAt = Date.now();
  try { const {data, error} = await sb.from('account_passwords').select('user_id, password'); if (error || !data) return; PWK.clear(); for (const r of data) PWK.set(r.user_id, r.password); if (st.scr === 'users') render(); } catch (x) {}
};
const _saveUserPw = saveUser;
saveUser = async function () {
  const u = st.uform; if (!u || u.busy) return _saveUserPw();
  const i = document.querySelector('[data-uin="pass"]'), pass = (i && i.value) || u.pass || '', p = u.id === 'new' ? null : D.prof.get(u.id);
  let login = p ? p.login : String(u.login || '').trim().toLowerCase();
  if (p && u.login != null && !p.login.includes('@')) { // login change first, as its own request
    const nl = String(u.login).trim().toLowerCase();
    if (nl !== p.login) {
      if (!/^[a-z0-9._-]{2,32}$/.test(nl)) { u.err = L('Login: 2–32 znaki a-z 0-9 . _ -', 'Логин: 2–32 символа a-z 0-9 . _ -', 'Login: 2–32 characters a-z 0-9 . _ -'); return render(); }
      u.busy = 1; u.err = ''; render();
      try { await callAdmin({action: 'update', id: p.id, login: nl}); p.login = nl; login = nl; await LOAD.profiles().catch(() => {}); }
      catch (x) { u.busy = 0; u.err = x && x.appCode === 'login_taken' ? L('Taki login już jest', 'Такой логин уже есть', 'This login is taken') : L('Nie udało się zmienić loginu', 'Не удалось сменить логин', 'Could not change the login'); return render(); }
      u.busy = 0;
      if (!pass) { toast(L(`Login zmieniony: ${nl}`, `Логин изменён: ${nl}`, `Login changed: ${nl}`)); }
    }
  }
  await _saveUserPw();
  if (pass && !st.uform) { const q = [...D.prof.values()].find(x => x.login === login); if (q) PWK.set(q.id, pass); }
};
const _userSheetPw = userSheet;
userSheet = function () {
  const h = _userSheetPw(), u = st.uform; if (!u || u.id === 'new') return h;
  const p = D.prof.get(u.id); if (!p) return h;
  const pw = PWK.get(p.id), show = !!u.showOld;
  const blk = `<div class="acc2"><div class="crow"><span>${L('Login', 'Логин', 'Login')}</span><b>${esc(p.login)}</b></div>
  <div class="crow"><span>${L('Hasło', 'Пароль', 'Password')}</span>${pw ? `<b class="pwv">${show ? esc(pw) : '••••••••'}</b><button type="button" class="pwb" data-upold="1" aria-label="${L('Pokaż hasło', 'Показать пароль', 'Show password')}">${ic('eye', 18)}</button><button type="button" class="pwb" data-upcopy="1">${L('Kopiuj', 'Копировать', 'Copy')}</button>` : `<em class="pwnone">${L('nieznane — ustaw nowe poniżej', 'неизвестен — задай новый ниже', 'unknown — set a new one below')}</em>`}</div></div>`;
  const lin = p.login.includes('@') ? '' : `<label class="bl-field"><span>${L('Login', 'Логин', 'Login')}</span><input class="inp" data-uin="login" value="${esc(u.login ?? p.login)}" autocapitalize="none" spellcheck="false"></label>`;
  const h2 = h.replace(/<div class="bl-field"><span>[^<]*<\/span><div class="auto">[^<]*<\/div><\/div>/, lin), i = h2.indexOf('<label class="bl-field"><span>' + L('Imię', 'Имя', 'Name')); return i < 0 ? h2 : h2.slice(0, i) + blk + h2.slice(i);
};
document.addEventListener('click', e => {
  if (e.target.closest('[data-upold]') && st.uform) { e.preventDefault(); e.stopImmediatePropagation(); st.uform.showOld = !st.uform.showOld; return render(); }
  if (e.target.closest('[data-upcopy]') && st.uform) { e.preventDefault(); e.stopImmediatePropagation(); const p = D.prof.get(st.uform.id), pw = p && PWK.get(p.id); if (!pw) return;
    const txt = `${L('Login', 'Логин', 'Login')}: ${p.login}\n${L('Hasło', 'Пароль', 'Password')}: ${pw}`;
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(L('Skopiowano', 'Скопировано', 'Copied')), () => toast(L('Nie udało się skopiować', 'Не удалось скопировать', 'Could not copy'))); }
}, true);
document.head.insertAdjacentHTML('beforeend', '<style>.acc2{display:flex;flex-direction:column;gap:8px;margin:2px 0 12px}.acc2 .crow{gap:8px}.acc2 .crow span{flex:1}.acc2 .pwv{font:700 16px/1.2 var(--font-text);letter-spacing:.02em}.acc2 .pwb{min-height:36px;background:var(--card)}.pwnone{font:600 13px/1.3 var(--font-text);font-style:normal;color:var(--muted)}</style>');

/* 10) computer: card label in the right column, no back button in the middle column */
cardCat = function () {
  const f = CARD_CAT[st.scr]; if (!f) return;
  const s = document.querySelector((isPC() ? '.pc-det ' : '') + '.cardscr .topbar > span:not([style])') || document.querySelector('.topbar > span:not([style])');
  if (s && !s.querySelector('.tbcat')) s.innerHTML = `<b class="tbcat">${esc(f())}</b>`;
};
document.head.insertAdjacentHTML('beforeend', '<style>@media (min-width: 1000px){.pc-list>.topbar>[data-back]{display:none}.pc-list>.topbar{padding-left:20px}}</style>');

/* 11) calendar counters */
document.head.insertAdjacentHTML('beforeend', '<style>.cal-counts{font-size:12px;gap:3px}.cal-count{gap:1px}.cal-count svg{width:11px;height:11px}'
  + '@media (max-width: 400px){.cal-counts{gap:2px}.cal-count{gap:0}.cal-count svg{width:9px;height:9px}}@media (max-width: 369px){.cal-count svg{display:none}}'
  + '.pcd .cal-counts{font-size:14px;gap:10px}.pcd .cal-count{gap:3px}.pcd .cal-count svg{width:14px;height:14px}</style>');

/* 12) age in the animal card edit */
const ageFromAnimal = a => a.born ? {am: 'd', bd: String(a.born).slice(0, 10)} : a.age_class === 'num' ? (a.age_n % 12 || !a.age_n ? {am: 'n', ag: String(a.age_n ?? ''), au: 'm'} : {am: 'n', ag: String(a.age_n / 12), au: 'y'})
  : a.age_class ? {am: 'a', ac: a.age_class} : {am: 'x'};
const _openEdAg = openEd;
openEd = function (k, isNew) {
  const r = _openEdAg(k, isNew), e = st.ed;
  if (e && e.k === 'an') { const a = e.id ? anById(e.id) : null; e.v.age = a ? ageFromAnimal(a) : {am: 'x'}; e.v.age0 = JSON.stringify(e.v.age); }
  return r;
};
function edAge() {
  const e = st.ed, g = e.v.age || {am: 'x'}, dis = ro('born') ? 'disabled' : '', m = g.am || 'x', stg = ageStages(spBy(e.v.species_id));
  const seg = (k, s, t, def) => `<button data-eset="age.${k}" data-s="${s}" aria-pressed="${(g[k] || def) === s}" ${dis}>${t}</button>`;
  return efld(L('Wiek', 'Возраст', 'Age'), 'born', `<div class="seg2 edage">${seg('am', 'x', L('Nie wiem', 'Не знаю', 'Unknown'), 'x')}${seg('am', 'd', L('Data ur.', 'Дата рожд.', 'Birth date'), 'x')}${seg('am', 'n', L('Ile lat', 'Сколько', 'Years'), 'x')}${seg('am', 'a', L('Etap', 'Стадия', 'Stage'), 'x')}</div>`
    + (m === 'd' ? `<input class="inp" type="date" data-ein="age.bd" value="${esc(g.bd || '')}" max="${ymd(Date.now())}" ${dis} style="margin-top:8px">` : '')
    + (m === 'n' ? `<div class="ageap"><input class="inp" data-ein="age.ag" value="${esc(g.ag || '')}" placeholder="${L('np. 5', 'напр. 5', 'e.g. 5')}" inputmode="decimal" ${dis}><div class="seg2">${seg('au', 'y', L('lat', 'лет', 'years'), 'y')}${seg('au', 'm', L('mies.', 'мес.', 'months'), 'y')}</div></div>` : '')
    + (m === 'a' ? `<div class="agecls">${stg.map(x => `<button data-eset="age.ac" data-s="${x.k}" aria-pressed="${g.ac === x.k}" ${dis}><b>${x.lab}</b>${ageRange(x) ? `<small>${ageRange(x)}</small>` : ''}</button>`).join('')}</div>` : ''));
}
const _animalEditAg = animalEdit;
animalEdit = function () {
  const h = _animalEditAg(), i = h.indexOf('data-ein="born"'); if (i < 0) return h;
  const a = h.lastIndexOf('<div class="bl-field">', i), b = h.indexOf('</div>', i) + 6, r = h.lastIndexOf('<div class="frow">', a);
  const h2 = h.slice(0, a) + h.slice(b), at = r < 0 ? a : r;
  return h2.slice(0, at) + `<div class="edagew">${edAge()}</div>` + h2.slice(at);
};
let AGE_PATCH = null;
const _putRowAg = putRow;
putRow = function (table, list, id, patch, isNew) {
  if (table === 'collection' && AGE_PATCH && AGE_PATCH.id === id && patch) { patch = Object.assign({}, patch, AGE_PATCH.p); AGE_PATCH = null; }
  return _putRowAg(table, list, id, patch, isNew);
};
const _saveEdAg = saveEd;
saveEd = async function () {
  const e = st.ed; if (!e || e.k !== 'an' || !e.v.age || (ro('born') && !isAdmin())) return _saveEdAg();
  const g = e.v.age, a = e.id ? anById(e.id) : null, changed = JSON.stringify(g) !== e.v.age0, today = ymd(Date.now());
  const n = parseFloat(String(g.ag || '').replace(',', '.'));
  let p;
  if (g.am === 'd') p = {born: g.bd || null, age_class: null, age_n: null, age_at: null};
  else if (g.am === 'n' && n >= 0) p = {born: null, age_class: 'num', age_n: Math.round((g.au || 'y') === 'm' ? n : n * 12), age_at: changed || !a || !a.age_at ? today : a.age_at};
  else if (g.am === 'a' && g.ac) p = {born: null, age_class: g.ac, age_n: null, age_at: changed || !a || !a.age_at ? today : a.age_at};
  else p = {born: null, age_class: null, age_n: null, age_at: null};
  e.v.born = p.born || '';
  AGE_PATCH = changed && e.id ? {id: e.id, p: {age_class: p.age_class, age_n: p.age_n, age_at: p.age_at}} : null;
  try { return await _saveEdAg(); } finally { AGE_PATCH = null; }
};
document.head.insertAdjacentHTML('beforeend', '<style>.edage{display:flex}.edage button{flex:1;font-size:12.5px;white-space:nowrap;padding:0 6px}.edagew .ageap{margin-top:8px}</style>');
