// ux2.js — v2: further small touches (continues ux.js; loads right after it).
// 1) Comment field: no scrollbar strip on the right; the field grows with the text up to 5 lines, then scrolls.
// 2) Photos: signed links live 1 hour, the app kept them forever, so after an hour thumbnails broke (the full photo got a
//    fresh link and opened). Now links older than 50 min are re-signed, old ones are refreshed every 5 min, and an image
//    that fails to load takes a new link.
// 3) Card top bar: instead of the pale «Journal» — a clear window type label in the window colour (journal entry, animal,
//    species, enclosure, drug card); the label and round buttons are white with a coloured outline.
// 4) «Now», treatment with several doses a day: after the first dose, «Undo» next to «Give» removes the last dose
//    given today (if the user may edit it: author or admin).
// 5) Enclosure card: «Residents» above «Temperature»; temperature is folded — the header shows the last value and an arrow,
//    a tap opens the chart and list (and folds them back); after «Record» the chart stays open.
// 6) Cards: content does not stick to the top bar; a count in a field label has a gap.
// 7) Enclosures (list and enclosure picker): all folded at first; new places appear folded; opened ones stay open.
// 8) Enclosure card: «Add animal» / «Take animal out» instead of «Move» in «Add record», and − / + on the «Animals» tile.
//    Add: pick animals (except those living here) → move form with «to» = this enclosure (from = their current place).
//    Take out: pick from the residents → move form, choose «to». Records are ordinary moves.
// 9) Calendar: records of a day newest first (phone and computer); expected events stay at the bottom.
// 10) Move form: a date earlier than the last place change (arrival / previous move) does not change the enclosure on the
//     card — the form warns; pressing «Save» again saves it as history.
// 11) Forms: the date is a «Now» button that opens the date-time picker at once (no input field in the form);
//     the chosen date shows on the button, × returns to «Now» (no × when editing a record).
// 12) Forms: «Save» sits in the bottom bar next to «Back»; the error message is above them.
// 13) Phone (narrow screen < 600px): the screen does not turn sideways — in the installed app on Android (iPhone does not
//     allow it from a site); tablet and computer are not touched.

/* 1) comment field */
const cinFit = t => { t.style.height = '48px'; const h = Math.min(t.scrollHeight, 132); t.style.height = Math.max(48, h) + 'px'; t.classList.toggle('tall', t.scrollHeight > 132); };
document.addEventListener('input', e => { if (e.target.id === 'cin') cinFit(e.target); });
addEventListener('DOMContentLoaded', () => { const _renderU2 = render; render = function () { _renderU2(); const t = document.getElementById('cin'); if (t && t.value) cinFit(t); cardCat(); }; });

/* 2) photo links: refresh before they expire */
const URL_TTL = 50 * 60000, urlAt = new Map();
const _urlsSetU2 = urls.set.bind(urls); urls.set = (k, v) => { urlAt.set(k, Date.now()); return _urlsSetU2(k, v); };
const dropOldUrls = () => { const t = Date.now() - URL_TTL; for (const k of [...urls.keys()]) if (!(urlAt.get(k) > t)) urls.delete(k); };
const _ensureUrlsU2 = ensureUrls;
ensureUrls = function (paths) { dropOldUrls(); return _ensureUrlsU2(paths); };
setInterval(() => { const old = [...urls.keys()].filter(k => !(urlAt.get(k) > Date.now() - URL_TTL)); if (old.length) ensureUrls(old); }, 5 * 60000);
const phRetry = new Set();
document.addEventListener('error', e => {
  const img = e.target; if (!img || img.tagName !== 'IMG') return;
  const hit = [...urls.entries()].find(([, u]) => u === img.src), path = hit && hit[0]; if (!path || phRetry.has(path)) return;
  phRetry.add(path); urls.delete(path);
  ensureUrls([path]).then(() => { const u = urls.get(path); if (u) img.src = u; setTimeout(() => phRetry.delete(path), 60000); });
}, true);

/* 3) card top bar: window type label */
const CARD_CAT = {rcard: () => L('Wpis w dzienniku', 'Запись журнала', 'Journal entry'), card: () => L('Karta zwierzęcia', 'Карточка животного', 'Animal card'),
  scard: () => L('Karta gatunku', 'Карточка вида', 'Species card'), pcard: () => L('Karta woliery', 'Карточка вольера', 'Enclosure card'), dcard: () => L('Karta leku', 'Карточка лекарства', 'Drug card')};
function cardCat() {
  const f = CARD_CAT[st.scr]; if (!f) return;
  const s = document.querySelector('.topbar > span:not([style])'); if (s && !s.querySelector('.tbcat')) s.innerHTML = `<b class="tbcat">${esc(f())}</b>`;
}

/* 4) «Now»: undo the last dose of today */
function undoLastGiveButton(r) {
  if (!r || !canEditRec(r)) return '';
  return `<button class="bl-btn undodose" data-undorec="${esc(r.id)}" aria-label="${L('Cofnij ostatnie podanie', 'Отменить последнюю подачу', 'Undo last dose')}">${ic('back', 16)}<span>${L('Cofnij', 'Отменить', 'Undo')}</span></button>`;
}
const _taskHTMLU2 = taskHTML;
taskHTML = function (x) {
  let h = _taskHTMLU2(x); const r = x.rx; if (!r || x.act !== 'dose' || !canWrite()) return h;
  const today = D.rec.filter(d => d.k === 'tdose' && key(d.bird) === key(r.bird) && d.at > r.at && d.at >= today0() && (!r.f.drug || !d.f.drug || key(d.f.drug) === key(r.f.drug))).sort((a, b) => b.at - a.at);
  const btn = undoLastGiveButton(today[0]); if (!btn) return h;
  const i = h.indexOf(`<button class="bl-btn icon" data-tmenu="${r.id}"`); return i < 0 ? h : h.slice(0, i) + btn + h.slice(i);
};

/* 5) enclosure card: residents first, temperature folded */
const _placeCardTT = placeCard;
placeCard = function () {
  let h = _placeCardTT(); const p = plById(st.plc); if (!p) return h;
  const tl = L('Temperatura', 'Температура', 'Temperature'), ts = h.indexOf(`<div class="sec"><span>${tl}</span>`); if (ts < 0) return h;
  const nx = [h.indexOf('<div class="sec"', ts + 10), h.indexOf('<div class="note"', ts + 10)].filter(x => x > 0), te = nx.length ? Math.min(...nx) : h.lastIndexOf('</div></div>');
  let blk = h.slice(ts, te); h = h.slice(0, ts) + h.slice(te);
  const open = !!st.tOpen, last = tempRecs(p).slice(-1)[0];
  const sum = last ? `<em class="tlast">${last.f.t} °C · ${relDay(last.at)}</em>` : '';
  blk = blk.replace(`<span>${tl}</span>`, `<button class="tsecb" data-ttgl="1" aria-expanded="${open}"><span>${tl}</span>${open ? '' : sum}${ic('chev', 16, 2.4)}</button>`);
  if (!open) blk = blk.slice(0, blk.indexOf('</div>') + 6);
  const rs = h.indexOf(`<div class="sec"><span>${L('Mieszkańcy', 'Жители', 'Residents')}</span>`);
  const at = rs < 0 ? ts : (h.indexOf('<div class="sec"', rs + 10) > 0 ? h.indexOf('<div class="sec"', rs + 10) : h.lastIndexOf('</div></div>'));
  return h.slice(0, at) + blk + h.slice(at);
};
document.addEventListener('click', e => { if (e.target.closest('[data-tadd]')) st.tOpen = true; }, true); // after recording a temperature its chart is shown
document.addEventListener('click', e => { if (!e.target.closest('[data-ttgl]')) return; e.preventDefault(); e.stopImmediatePropagation(); st.tOpen = !st.tOpen; render(); }, true);
document.head.insertAdjacentHTML('beforeend', '<style>.tsecb{flex:1;display:flex;align-items:center;gap:8px;padding:0;border:0;background:none;color:inherit;font:inherit;letter-spacing:inherit;text-transform:inherit;text-align:left;cursor:pointer}.tsecb .tlast{margin-left:auto;font:700 13px/1 var(--font-text);font-style:normal;letter-spacing:0;text-transform:none;color:var(--muted)}.tsecb svg{flex:none;transition:transform .15s}.tsecb[aria-expanded=true] svg{transform:rotate(90deg)}.tsecb[aria-expanded=true]{flex:1}.tsecb[aria-expanded=true] span{flex:1}</style>');

/* 7) enclosures folded at first */
const plSeen = new Set();
const _placeTreeF = placeTree;
placeTree = function (openAttr) { for (const p of D.pl) if (!plSeen.has(p.id)) { plSeen.add(p.id); st.folded.add(p.id); } return _placeTreeF(openAttr); };

/* 8) enclosure: add / take out animals */
const pmvStart = (mode, plc) => { newAdd({step: 'who', target: 'multi', from: 'card', pmv: {mode, plc}}); st.multi = new Set(); st.wq = ''; render(); };
const _stepWhatPmv = stepWhat;
stepWhat = function () {
  const h = _stepWhatPmv(), f = F(); if (!f || f.target !== 'place' || !f.plc) return h;
  const b = (m, icn, t) => `<button class="tbtn" data-pmv="${m}"><span class="bl-badge sm">${ic(icn, 18)}</span><span>${t}</span></button>`;
  return h.replace(/<button class="tbtn" data-kind="expo">[\s\S]*?<\/button>/, b('in', 'plus', L('Dodaj zwierzę', 'Добавить животное', 'Add animal')) + b('out', 'swap', L('Zabierz zwierzę', 'Забрать животное', 'Take animal out')));
};
const _stepWhoPmv = stepWho;
stepWho = function () {
  const f = F(); if (!f || !f.pmv) return _stepWhoPmv();
  const p = plById(f.pmv.plc), here = p ? anOfPlace(p).map(a => a.id) : [], all = D.an;
  D.an = all.filter(a => f.pmv.mode === 'out' ? here.includes(a.id) : !here.includes(a.id));
  try { return _stepWhoPmv(); } finally { D.an = all; }
};
function pmvTitle() {
  const f = st.add; if (!f || !f.pmv) return; const p = plById(f.pmv.plc), h = document.querySelector('.bl-sheet h3'); if (!h || !p) return;
  const t = f.step === 'who' ? (f.pmv.mode === 'in' ? L('Kogo dodać do: ', 'Кого добавить в: ', 'Who to add to: ') : L('Kogo zabrać z: ', 'Кого забрать из: ', 'Who to take out of: ')) + plName(p)
    : f.step === 'form' ? (f.pmv.mode === 'in' ? L('Dodaj do: ', 'Добавить в: ', 'Add to: ') : L('Zabierz z: ', 'Забрать из: ', 'Take out of: ')) + plName(p) : '';
  if (t) { const ico = h.querySelector('svg'); h.textContent = t; if (ico) h.prepend(ico); }
}
function pmvTile() {
  if (st.scr !== 'pcard' || !canWrite()) return; const p = plById(st.plc); if (!p) return;
  const dt = [...document.querySelectorAll('.cardscr .bl-facts dt')].find(x => x.textContent.trim() === L('Zwierzęta', 'Животные', 'Animals'));
  if (!dt || dt.parentNode.querySelector('.pmvb')) return;
  dt.parentNode.classList.add('pmvt');
  dt.parentNode.insertAdjacentHTML('beforeend', `<span class="pmvb"><button data-pmv="out" aria-label="${L('Zabierz zwierzę', 'Забрать животное', 'Take animal out')}">−</button><button data-pmv="in" aria-label="${L('Dodaj zwierzę', 'Добавить животное', 'Add animal')}">+</button></span>`);
}
addEventListener('DOMContentLoaded', () => { const _r = render; render = function () { _r(); pmvTitle(); pmvTile(); }; });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-pmv]'), g = !b && e.target.closest('[data-gomulti]');
  if (b) { e.preventDefault(); e.stopImmediatePropagation(); const plc = (st.add && st.add.plc) || st.plc; pmvStart(b.dataset.pmv, plc); return; }
  const f = st.add; if (!g || !f || !f.pmv || !st.multi.size) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (st.multi.size === 1) { f.target = 'animal'; f.ani = [...st.multi][0]; st.multi = new Set(); } else f.target = 'multi';
  f.kind = 'expo'; f.step = 'form'; f.from = 'who';
  const p = plById(f.pmv.plc); f.mv.to = f.pmv.mode === 'in' && p ? p.name : ''; render();
}, true);
document.head.insertAdjacentHTML('beforeend', '<style>.bl-facts .pmvt{position:relative}.pmvb{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;gap:6px}.pmvb button{width:34px;height:34px;border-radius:50%;border:1.5px solid var(--ctl-line);background:var(--card);color:var(--ink);font:800 18px/1 var(--font-text);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}.pmvb button:hover{background:var(--soft)}</style>');

/* 9) calendar: newest first */
const _calEventsNew = calEvents;
calEvents = function () {
  const m = _calEventsNew(), srt = Array.prototype.sort;
  for (const a of m.values()) a.sort = function () { return srt.call(this, (x, y) => (x.exp ? 1 : 0) - (y.exp ? 1 : 0) || y.r.at - x.r.at); };
  return m;
};

/* 10) move earlier than the last place change */
const plSince = (a, skip) => { let t = a.encl_at ? new Date(a.encl_at).getTime() : 0, how = 'in'; for (const r of D.rec) if (r.k === 'expo' && r.f.to && r.id !== skip && key(r.bird) === key(a.name) && r.at > t) { t = r.at; how = 'mv'; } return {t, how}; };
const _saveFormMv = saveForm;
saveForm = function () {
  const f = F(); if (!f || f.kind !== 'expo') return _saveFormMv();
  const at = atMs(), skip = f.edit && f.edit.id;
  const late = tgt().map(a => [a, plSince(a, skip)]).filter(([, s]) => s.t && at < s.t);
  if (!late.length || f.mvWarn === at) { f.mvWarn = null; return _saveFormMv(); }
  f.mvWarn = at; const [a, s] = late[0];
  f.err = L('Data jest wcześniejsza niż ', 'Дата раньше, чем ', 'The date is earlier than ') + (s.how === 'in' ? L('przybycie / ustawienie miejsca', 'прибытие / указание места', 'arrival / place set') : L('ostatnie przeniesienie', 'последнее перемещение', 'the last move'))
    + ' (' + anTitle(a) + ', ' + fDay(s.t) + ' ' + fTime(s.t) + L('), więc woliera w karcie się nie zmieni. Sprawdź datę albo naciśnij «Zapisz» jeszcze raz, żeby zapisać jako historię.', '), поэтому вольер в карточке не изменится. Проверь дату или нажми «Сохранить» ещё раз, чтобы записать как историю.', '), so the enclosure on the card will not change. Check the date or press «Save» again to save it as history.');
  render();
};

/* 11) date: «Now» button opens the picker */
const _whenPhotoAt = whenPhoto;
whenPhoto = function (noPhoto) {
  const f = F(); if (!f) return _whenPhotoAt(noPhoto); f.showAt = 0;
  const h = _whenPhotoAt(noPhoto), set = !!f.at;
  const btn = `<span class="atwrap"><button class="bl-btn atbtn${set ? ' set' : ''}" data-atpick="1" type="button">${ic('clock', 17)}<span>${set ? fDate(atMs()) + ' ' + fTime(atMs()) : L('Teraz', 'Сейчас', 'Now')}</span></button>`
    + (set && !f.edit ? `<button class="atclr" data-atclr="1" type="button" aria-label="${L('Ustaw: teraz', 'Поставить «сейчас»', 'Set to now')}">${ic('x', 14, 2.4)}</button>` : '')
    + `<input class="athid" type="datetime-local" data-atin="1" value="${esc(f.at || localDT(Date.now()))}" max="${localDT(Date.now() + DAY)}" tabindex="-1" aria-hidden="true"></span>`;
  return h.replace(/<button class="bl-btn" style="flex:1" data-showat="1">[\s\S]*?<\/button>/, btn);
};
document.addEventListener('click', e => {
  const p = e.target.closest('[data-atpick]'), c = !p && e.target.closest('[data-atclr]'); if (!p && !c) return;
  e.preventDefault(); e.stopImmediatePropagation(); const f = F(); if (!f) return;
  if (c) { f.at = ''; f.mvWarn = null; f.err = ''; return render(); }
  const inp = p.parentNode.querySelector('.athid');
  try { inp.showPicker(); } catch (x) { f.showAt = 1; f.at = f.at || localDT(Date.now()); render(); }
}, true);
document.addEventListener('change', e => { if (!e.target.matches || !e.target.matches('[data-atin]')) return; const f = F(); if (!f) return; f.at = e.target.value; f.mvWarn = null; f.err = ''; render(); });
/* 12) «Save» in the bottom bar */
const _addSheetSv = addSheet;
addSheet = function () {
  const h = _addSheetSv(); if (!h || h.indexOf('class="shfoot"') < 0) return h;
  const m = h.match(/<p class="err" id="ferr" role="alert">([\s\S]*?)<\/p>(<button class="bl-btn solid save wide"[^>]*>[\s\S]*?<\/button>)/); if (!m) return h;
  const sv = m[2].replace('bl-btn solid save wide', 'bl-btn solid save shsave');
  return h.replace(m[0], '').replace(/<div class="shfoot">(<button class="shback"[^>]*>[\s\S]*?<\/button>)/, (x, b) => `<div class="shfoot"><p class="err shferr" id="ferr" role="alert">${m[1]}</p>${b}${sv}`);
};
document.head.insertAdjacentHTML('beforeend', '<style>.atwrap{flex:1;position:relative;display:flex;min-width:0}.atwrap .atbtn{flex:1;min-width:0}.atbtn span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.atbtn.set{background:var(--card);box-shadow:inset 0 0 0 1.5px color-mix(in srgb, var(--accent) 45%, transparent);color:var(--ink)}.atwrap:has(.atclr) .atbtn{padding-right:44px}.atclr{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:30px;height:30px;border-radius:50%;border:0;background:var(--soft);color:var(--ink-2);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}.athid{position:absolute;left:0;bottom:0;width:100%;height:100%;opacity:0;pointer-events:none;border:0;padding:0}.bl-sheet .shfoot{flex-wrap:wrap;gap:10px}.bl-sheet .shfoot .shferr{flex-basis:100%;margin:2px 0 0}.bl-sheet .shfoot .shferr:empty{display:none}.bl-sheet .shfoot:has(.shsave) .shback{flex:0 0 34%}.bl-sheet .shfoot .shsave{flex:1;min-height:50px;margin:0;border-radius:14px}</style>');

/* 13) phone: portrait only */
const lockPortrait = () => { try { if (Math.min(screen.width, screen.height) < 600 && screen.orientation && screen.orientation.lock) screen.orientation.lock('portrait').catch(() => {}); } catch (x) {} };
lockPortrait(); document.addEventListener('visibilitychange', () => { if (!document.hidden) lockPortrait(); });

document.head.insertAdjacentHTML('beforeend', '<style>'
  + '.cardscr .scroll{padding-top:14px}.bl-field>span .opt{margin-left:5px}'
  + '.cbar textarea{overflow-y:hidden;scrollbar-width:none;max-height:132px}.cbar textarea::-webkit-scrollbar{display:none}.cbar textarea.tall{overflow-y:auto}'
  + '.topbar .tbcat{display:inline-flex;align-items:center;min-height:40px;box-sizing:border-box;padding:0 16px;border-radius:999px;background:var(--card);border:1.5px solid color-mix(in srgb, var(--tint, var(--accent)) 60%, var(--line));color:var(--ink);font:800 16.5px/1 var(--font-display);letter-spacing:.01em;box-shadow:0 1px 3px color-mix(in srgb, var(--ink) 8%, transparent)}'
  + '.cardscr .topbar .bl-x{background:var(--card);border:1.5px solid color-mix(in srgb, var(--tint, var(--accent)) 60%, var(--line));box-shadow:0 1px 3px color-mix(in srgb, var(--ink) 8%, transparent)}'
  + '.acts .undodose{flex:none;display:inline-flex;align-items:center;gap:5px;min-height:42px;padding:0 12px;border-radius:12px;background:var(--soft);color:var(--ink-2);font:700 13px/1 var(--font-text);white-space:nowrap}'
  + '</style>');
