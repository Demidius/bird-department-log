// report.js — v2: PDF documents (through the browser's print window → «Save as PDF»; loads after qrcard.js).
// 1) Species card: «PDF» button next to the pencil → a preview of the whole card as a document: names, status, facts,
//    age stages and breeding timings, the department (animals by enclosure), descriptions (in the wild / in the zoo),
//    department note, photos, sources, latest records.
// 2) Journal: «PDF» button in the header → a window: start date, end date, groups, with photos or not → a preview of the
//    report: summary and every record of the period day by day (time, what, who, details, note, author, comments).
// Preview: full screen, «Save as PDF / Print» prints only the document; the file name comes from the document title.
// The phone «back» button closes the preview, then the window.

BirdLog.icons.pdf = '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6M10 17h4"/>';
const REP_G = {health: '#bf321e', obs: '#6a3fb5', breed: '#9e5600', keep: '#0d6f64', dept: '#3b4a6b'};
const repDateL = ms => new Date(ms).toLocaleDateString(LOC(), {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
const repNow = () => `${fDateY(Date.now())} ${fTime(Date.now())}`;
const repFoot = () => `<p class="rpfoot">${L('Dziennik działu ptaków', 'Журнал отдела птиц', 'Bird department log')} · ${L('utworzono', 'создано', 'created')} ${repNow()} · ${esc(nameOf(me))}</p>`;
const repRows = rows => rows.filter(r => r[1] !== '' && r[1] != null).map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('');
const repImgs = list => list.length ? `<div class="rpimgs">${list.map(u => `<img src="${esc(u)}" alt="">`).join('')}</div>` : '';
function repRec(r, photos, day) {
  const g = kGroup(r.k), cm = commentsOn ? (D.com.get(r.id) || []) : [], det = recDetails(r);
  const when = (day ? fDateY(r.at) + ' ' : '') + (r.f.nt ? '' : fTime(r.at));
  const ph = photos ? phOf('record', r.id).map(p => urls.get(thumbOf(p.path))).filter(Boolean) : [];
  return `<div class="rprec" style="border-left-color:${REP_G[g] || '#888'}"><div class="rph"><b>${esc(recTitle(r))}</b><span>${esc(when.trim() || '—')}</span></div>
  <p class="rpwho">${esc(recWho(r))} · <span style="color:${REP_G[g] || '#888'}">${GROUPS.find(x => x.id === g).n()}</span></p>
  ${det.length ? `<table class="rptab sm">${repRows(det)}</table>` : ''}${r.note ? `<p class="rpnote">${esc(r.note)}</p>` : ''}${repImgs(ph)}
  <p class="rpby">${L('Autor', 'Автор', 'Author')}: ${esc(nameOf(r.by))}</p>
  ${cm.length ? `<div class="rpcom">${cm.slice().sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))).map(c => `<p><b>${esc(nameOf(c.created_by))}</b> <span>${fDateY(new Date(c.created_at).getTime())} ${fTime(new Date(c.created_at).getTime())}</span>${c.parent_id ? ' ↳' : ''}<br>${esc(c.body)}</p>`).join('')}</div>` : ''}</div>`;
}

/* species card document */
async function spDoc(s) {
  const inf = spInfo(s), mam = isMammal(s), dd = v => v ? `${v} ${L('dni', 'дн.', 'days')}` : '';
  const list = anActive().filter(a => a.species_id === s.id), pls = [...new Set(list.map(a => anEncl(a)))];
  const sx = k => list.filter(a => !a.grp && a.sex === k).length + list.filter(a => a.grp).reduce((n, a) => n + (+a.grp[{m: 'm', f: 'f', '': 'u'}[k]] || 0), 0);
  const B = typeof brdStats === 'function' && !mam ? brdStats(s) : null, stg = typeof ageStages === 'function' ? ageStages(s) : [];
  const ours = k => B && B.obs[k].length ? ` (${brdOurs(B.obs[k])}; ${L('prognoza', 'прогноз', 'forecast')} ≈ ${dni(B.est[k])})` : '';
  const facts = [[L('Systematyka', 'Систематика', 'Taxonomy'), [infoTx(s, 'order'), infoTx(s, 'family')].filter(Boolean).join(' · ')], [L('Wielkość', 'Размер', 'Size'), infoTx(s, 'size')], [L('Długość życia', 'Продолжительность жизни', 'Lifespan'), infoTx(s, 'life')],
    mam ? [L('Ciąża', 'Беременность', 'Gestation'), dd(inf.gest_days)] : [L('Wysiadywanie', 'Насиживание', 'Incubation'), (dd(inf.incub_days) + (inf.incub_range && inf.incub_range != inf.incub_days ? ` (${inf.incub_range})` : '') + ours('inc')).trim()],
    mam ? ['', ''] : [L('Do opuszczenia gniazda', 'До вылета из гнезда', 'Until fledging'), (dd(inf.fledge_days) + ours('nest')).trim()],
    [L('Dojrzałość płciowa', 'Половая зрелость', 'Sexual maturity'), inf.mature_years ? `${String(inf.mature_years).replace('.', L(',', ',', '.'))} ${L('lat', 'лет', 'years')}` : ''],
    [L('Etapy wieku', 'Стадии возраста', 'Age stages'), stg.some(g => g.to != null && g.k !== 'chick') ? stg.map(g => `${g.lab} ${ageRange(g)}`.trim()).join(' · ') : '']];
  const SEC = [[L('W naturze', 'В природе', 'In the wild'), [['range', L('Zasięg', 'Ареал', 'Range')], ['habitat', L('Siedlisko', 'Местообитание', 'Habitat')], ['diet_wild', L('Pokarm w naturze', 'Питание в природе', 'Diet in the wild')], ['behaviour', L('Zachowanie', 'Поведение', 'Behaviour')], ['breeding', L('Rozród', 'Размножение', 'Breeding')]]],
    [L('W ZOO', 'В зоопарке', 'In the zoo'), [['diet_zoo', L('Żywienie w ZOO', 'Кормление в зоопарке', 'Diet in the zoo')], ['husbandry', L('Utrzymanie', 'Содержание', 'Husbandry')], ['health', L('Zdrowie', 'Здоровье', 'Health')], ['sex', L('Różnice płci', 'Половые различия', 'Sex differences')]]]];
  const desc = SEC.map(([t, ks]) => { const b = ks.map(([k, l]) => infoTx(s, k) ? `<h4>${l}</h4><p class="rptx">${esc(infoTx(s, k))}</p>` : '').join(''); return b ? `<h3>${t}</h3>${b}` : ''; }).join('');
  const ph = photosFor('sp', s.id).filter(x => x.p).slice(0, 6); await ensureUrls(ph.map(x => thumbOf(x.p.path)));
  const src = (Array.isArray(inf.sources) ? inf.sources : []).filter(x => x && (x.t || x.url));
  const recs = D.rec.filter(r => r.sp === s.id).sort((a, b) => b.at - a.at).slice(0, 5), w = inf.photo, iu = inf.iucn;
  const sexL = a => a.grp ? L('grupa', 'группа', 'group') + ' ' + grpTotal(a.grp) : ({m: L('samiec', 'самец', 'male'), f: L('samica', 'самка', 'female')})[a.sex] || L('płeć nieznana', 'пол неизвестен', 'sex unknown');
  const html = `<div class="rphead">${w && w.src ? `<figure><img src="${esc(w.thumb || w.src)}" alt=""><figcaption>${w.credit ? esc(w.credit) + ' · ' : ''}Wikimedia Commons</figcaption></figure>` : ''}<div>
  <p class="rpkind">${L('Karta gatunku', 'Карточка вида', 'Species card')} · ${mam ? L('Ssak', 'Млекопитающее', 'Mammal') : L('Ptak', 'Птица', 'Bird')}</p><h1>${esc(spName(s))}</h1><p class="rplat">${esc(s.latin || '')}</p>
  <p class="rpnames">${[['PL', s.name_pl], ['RU', s.name_ru], ['EN', s.name_en]].filter(x => x[1]).map(([l, v]) => `<span><em>${l}</em> ${esc(v)}</span>`).join('')}</p>
  ${iu || infoTx(s, 'cites') ? `<p class="rpnames">${iu ? `<span><b class="rpiucn" style="background:${IUCNC[iu] || '#ccc'};color:${['CR', 'EW'].includes(iu) ? '#fff' : '#13201A'}">${iu}</b> ${IUCNN()[iu] || ''}</span>` : ''}${infoTx(s, 'cites') ? `<span>CITES ${esc(infoTx(s, 'cites'))}</span>` : ''}</p>` : ''}</div></div>
  ${facts.some(f => f[1]) ? `<table class="rptab">${repRows(facts)}</table>` : ''}
  <h2>${L('W dziale', 'В отделе', 'In the department')}</h2>
  <p class="rpsum"><b>${list.reduce((n, a) => n + (a.grp ? grpTotal(a.grp) : 1), 0)}</b> ${L('w kolekcji', 'в коллекции', 'in collection')} · ♂${sx('m')} ♀${sx('f')} ?${sx('')} · <b>${pls.length}</b> ${L('woliery', 'вольеры', 'enclosures')}</p>
  ${pls.length ? `<table class="rptab an"><tr><th>${L('Zwierzę', 'Животное', 'Animal')}</th><th>${L('Płeć', 'Пол', 'Sex')}</th><th>${L('Woliera', 'Вольер', 'Enclosure')}</th><th>${L('Znak / obrączka', 'Знак / кольцо', 'Mark / ring')}</th></tr>${pls.flatMap(pn => list.filter(a => anEncl(a) === pn).map(a => `<tr><td>${esc(suffix(a) || anTitle(a))}</td><td>${esc(sexL(a))}</td><td>${esc(plName(plByName(pn)) || pn || '—')}</td><td>${esc(a.ring || '')}</td></tr>`)).join('')}</table>` : `<p class="rpmuted">${L('Brak w kolekcji', 'Нет в коллекции', 'Not in the collection')}</p>`}
  ${desc ? `<h2>${L('Opis gatunku', 'Описание вида', 'Description')}</h2>${desc}` : ''}
  ${s.note ? `<h2>${L('Notatki działu', 'Заметки отдела', 'Department notes')}</h2><p class="rptx">${esc(s.note)}</p>` : ''}
  ${ph.length ? `<h2>${L('Zdjęcia', 'Фотографии', 'Photos')}</h2>${repImgs(ph.map(x => urls.get(thumbOf(x.p.path))).filter(Boolean))}` : ''}
  ${recs.length ? `<h2>${L('Ostatnie wpisy', 'Последние записи', 'Latest records')}</h2>${recs.map(r => repRec(r, false, true)).join('')}` : ''}
  ${src.length ? `<h2>${L('Źródła', 'Источники', 'Sources')}</h2><ol class="rpsrc">${src.map(x => `<li>${esc(x.t || '')}${x.url ? `<br><span>${esc(x.url)}</span>` : ''}</li>`).join('')}</ol>` : ''}${repFoot()}`;
  return {title: `${L('Gatunek', 'Вид', 'Species')} — ${spName(s)}`, html};
}

/* journal report */
const repRange = f => [new Date(f.from + 'T00:00').getTime(), new Date(f.to + 'T23:59:59.999').getTime()];
const repList = f => { const [a, b] = repRange(f); return D.rec.filter(r => r.at >= a && r.at <= b && (!f.g.length || f.g.includes(kGroup(r.k)))).sort((x, y) => x.at - y.at); };
async function logDoc(f) {
  const list = repList(f), [a, b] = repRange(f);
  if (f.ph) await ensureUrls(list.flatMap(r => phOf('record', r.id).map(p => thumbOf(p.path))));
  let day = '', body = '';
  for (const r of list) { const k = dayKey(r.at); if (k !== day) { day = k; body += `<h3 class="rpday">${esc(repDateL(r.at))}</h3>`; } body += repRec(r, f.ph); }
  const per = GROUPS.map(g => [g, list.filter(r => kGroup(r.k) === g.id).length]).filter(x => x[1]);
  const html = `<div class="rphead"><div><p class="rpkind">${L('Raport z dziennika', 'Отчёт по журналу', 'Journal report')}</p><h1>${fDateY(a)} — ${fDateY(b)}</h1>
  <p class="rpsum"><b>${list.length}</b> ${L('wpisów', 'записей', 'records')}${per.length ? ' · ' + per.map(([g, n]) => `<span style="color:${REP_G[g.id]}">${g.n()}: ${n}</span>`).join(' · ') : ''}</p>
  ${f.g.length ? `<p class="rpmuted">${L('Grupy', 'Группы', 'Groups')}: ${f.g.map(id => GROUPS.find(g => g.id === id).n()).join(', ')}</p>` : ''}</div></div>
  ${body || `<p class="rpmuted">${L('Brak wpisów w tym okresie', 'За этот период записей нет', 'No records in this period')}</p>`}${repFoot()}`;
  return {title: `${L('Dziennik', 'Журнал', 'Journal')} ${f.from} — ${f.to}`, html};
}

/* overlay: period window and preview */
const repOpen = async (make, arg) => { st.rep = {busy: 1}; render(); try { st.rep = await make(arg); } catch (x) { st.rep = null; toast(errText(x)); } render(); };
function repLayer() {
  if (st.rep) return `<div class="repv"><div class="repbar"><button class="bl-x" data-repclose="1" aria-label="${L('Zamknij', 'Закрыть', 'Close')}">${ic('x', 18)}</button><b>${esc(st.rep.title || L('Przygotowuję…', 'Готовлю…', 'Preparing…'))}</b>
  <button class="bl-btn solid repgo" data-repprint="1" ${st.rep.busy ? 'disabled' : ''}>${ic('pdf', 18)}${L('Zapisz PDF', 'Сохранить PDF', 'Save PDF')}</button></div>
  <p class="reptip">${L('W oknie drukowania wybierz „Zapisz jako PDF” lub drukarkę.', 'В окне печати выбери «Сохранить как PDF» или принтер.', 'In the print window choose “Save as PDF” or a printer.')}</p>
  <div class="repscroll">${st.rep.busy ? `<p class="reptip">${L('Przygotowuję dokument…', 'Готовлю документ…', 'Preparing the document…')}</p>` : `<div class="repdoc">${st.rep.html}</div>`}</div></div>`;
  const f = st.repf; if (!f) return '';
  const ok = f.from && f.to && f.from <= f.to, n = ok ? repList(f).length : 0, gOn = id => !f.g.length || f.g.includes(id);
  return `<div class="repscrim" data-repfclose="1"></div><div class="repm"><div class="head"><h3>${ic('pdf', 20)}${L('Raport PDF z dziennika', 'PDF-отчёт по журналу', 'Journal PDF report')}</h3><button class="bl-x" data-repfclose="1">${ic('x', 18)}</button></div>
  <div class="frow"><label class="bl-field"><span>${L('Od', 'С', 'From')}</span><input class="inp" type="date" data-rf="from" value="${esc(f.from)}" max="${ymd(Date.now())}"></label><label class="bl-field"><span>${L('Do', 'По', 'To')}</span><input class="inp" type="date" data-rf="to" value="${esc(f.to)}" max="${ymd(Date.now())}"></label></div>
  <div class="bl-chips repq">${[[L('Ten miesiąc', 'Этот месяц', 'This month'), 'm0'], [L('Poprzedni miesiąc', 'Прошлый месяц', 'Last month'), 'm1'], [L('7 dni', '7 дней', '7 days'), 'd7'], [L('30 dni', '30 дней', '30 days'), 'd30']].map(([l, k]) => `<button class="bl-chip" data-rq="${k}">${l}</button>`).join('')}</div>
  <div class="bl-field"><span>${L('Grupy', 'Группы', 'Groups')}</span><div class="bl-chips"><button class="bl-chip" data-rg="all" aria-pressed="${!f.g.length}">${L('Wszystkie', 'Все', 'All')}</button>${GROUPS.map(g => `<button class="bl-chip g-${g.id}" data-rg="${g.id}" aria-pressed="${!!f.g.length && gOn(g.id)}">${ic(g.ic, 15)}${g.n()}</button>`).join('')}</div></div>
  <div class="bl-field"><span>${L('Zdjęcia z wpisów', 'Фото из записей', 'Photos from records')}</span><div class="seg2"><button data-rph="0" aria-pressed="${!f.ph}">${L('Bez zdjęć', 'Без фото', 'No photos')}</button><button data-rph="1" aria-pressed="${!!f.ph}">${L('Ze zdjęciami', 'С фото', 'With photos')}</button></div></div>
  <p class="repcnt">${ok ? `${L('Wpisów w okresie', 'Записей за период', 'Records in the period')}: <b>${n}</b>` : `<span class="err">${L('Data początku jest późniejsza niż końca', 'Дата начала позже даты окончания', 'The start date is after the end date')}</span>`}</p>
  <button class="bl-btn solid wide repgo" data-repmake="1" ${ok ? '' : 'disabled'}>${ic('pdf', 18)}${L('Utwórz raport', 'Сформировать отчёт', 'Create the report')}</button></div>`;
}
addEventListener('DOMContentLoaded', () => {
  const _r = render; render = function () { _r(); const a = document.getElementById('app'), h = st.gate === 'app' ? repLayer() : ''; if (a && h) a.insertAdjacentHTML('beforeend', `<div id="repl">${h}</div>`); };
  const _g = go; go = function (o) { if (o && o.scr) { st.rep = null; st.repf = null; } return _g(o); };
});
addEventListener('popstate', e => { if (!st.rep && !st.repf) return; e.stopImmediatePropagation(); if (st.rep) st.rep = null; else st.repf = null; history.pushState({v2: 1, nav: navOf()}, ''); render(); });
// buttons: species card topbar, journal header
const repBtn = (attr, label) => `<button class="bl-x reppdf" ${attr} aria-label="${label}">${ic('pdf', 18)}</button>`;
const _speciesCardRep = speciesCard;
speciesCard = function () {
  let h = _speciesCardRep(); if (!spBy(st.sp)) return h;
  const i = h.indexOf('<div class="topbar">'), j = i < 0 ? -1 : h.indexOf('</span>', i); if (j < 0) return h;
  const k = j + 7, ph = '<span style="width:40px"></span>', b = repBtn('data-repsp="1"', L('PDF karty gatunku', 'PDF карточки вида', 'Species card PDF'));
  return h.slice(0, k) + b + (h.startsWith(ph, k) ? h.slice(k + ph.length) : h.slice(k));
};
const _logsScreenRep = logsScreen;
logsScreen = function () {
  const h = _logsScreenRep(), i = h.indexOf('<button class="me"'); if (i < 0) return h;
  return h.slice(0, i) + repBtn('data-repf="1"', L('Raport PDF', 'PDF-отчёт', 'PDF report')) + h.slice(i);
};
const repQuick = k => { const d = new Date(), y = d.getFullYear(), m = d.getMonth();
  if (k === 'm0') return [ymd(new Date(y, m, 1).getTime()), ymd(Date.now())];
  if (k === 'm1') return [ymd(new Date(y, m - 1, 1).getTime()), ymd(new Date(y, m, 0).getTime())];
  return [ymd(Date.now() - ((k === 'd7' ? 7 : 30) - 1) * DAY), ymd(Date.now())]; };
function repPrint() {
  const r = st.rep; if (!r || r.busy) return;
  let el = document.getElementById('repprint'); if (!el) { el = document.createElement('div'); el.id = 'repprint'; document.body.appendChild(el); }
  el.innerHTML = `<div class="repdoc">${r.html}</div>`;
  const t0 = document.title; document.title = r.title.replace(/[\\/:*?"<>|]+/g, ' ');
  document.body.classList.add('repp');
  const done = () => { document.body.classList.remove('repp'); document.title = t0; el.innerHTML = ''; removeEventListener('afterprint', done); };
  addEventListener('afterprint', done);
  const imgs = [...el.querySelectorAll('img')].map(im => im.complete ? 0 : new Promise(res => { im.onload = im.onerror = res; }));
  Promise.race([Promise.all(imgs), new Promise(res => setTimeout(res, 4000))]).then(() => window.print());
}
document.addEventListener('click', e => {
  const t = e.target, stop = () => { e.preventDefault(); e.stopImmediatePropagation(); };
  if (t.closest('[data-repsp]')) { stop(); const s = spBy(st.sp); if (s) repOpen(spDoc, s); return; }
  if (t.closest('[data-repf]')) { stop(); const [a, b] = repQuick('m0'); st.repf = {from: a, to: b, g: [], ph: 0}; return render(); }
  if (t.closest('[data-repclose]')) { stop(); st.rep = null; return render(); }
  if (t.closest('[data-repprint]')) { stop(); return repPrint(); }
  const f = st.repf; if (!f) return;
  if (t.closest('[data-repfclose]')) { stop(); st.repf = null; return render(); }
  const q = t.closest('[data-rq]'); if (q) { stop(); [f.from, f.to] = repQuick(q.dataset.rq); return render(); }
  const g = t.closest('[data-rg]'); if (g) { stop(); const id = g.dataset.rg; if (id === 'all') f.g = []; else { const cur = f.g.length ? f.g : []; f.g = cur.includes(id) ? cur.filter(x => x !== id) : cur.concat(id); if (f.g.length === GROUPS.length) f.g = []; } return render(); }
  const p = t.closest('[data-rph]'); if (p) { stop(); f.ph = +p.dataset.rph; return render(); }
  if (t.closest('[data-repmake]')) { stop(); if (f.from && f.to && f.from <= f.to) repOpen(logDoc, Object.assign({}, f)); }
}, true);
document.addEventListener('change', e => { const i = e.target.closest && e.target.closest('[data-rf]'); if (!i || !st.repf) return; st.repf[i.dataset.rf] = i.value; render(); });
document.head.insertAdjacentHTML('beforeend', '<style>'
  + '.repv{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;background:var(--bg)}.repbar{display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 12px 8px}.repbar b{flex:1;min-width:0;font:700 15px/1.25 var(--font-text);color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
  + '.repgo{display:flex;align-items:center;justify-content:center;gap:6px;background:var(--fab);color:var(--on-fab)}.repbar .repgo{padding:0 14px;min-height:42px;font-size:14px}.reptip{margin:0 14px 8px;font:500 12.5px/1.35 var(--font-text);color:var(--muted)}'
  + '.repscroll{flex:1;overflow:auto;padding:4px 10px calc(20px + env(safe-area-inset-bottom))}.repscroll .repdoc{max-width:780px;margin:0 auto;padding:22px 20px;border-radius:10px;box-shadow:0 2px 16px rgba(0,0,0,.18)}'
  + '.repscrim{position:fixed;inset:0;z-index:58;background:rgba(10,18,14,.45)}.repm{position:fixed;left:0;right:0;bottom:0;z-index:59;display:flex;flex-direction:column;gap:12px;max-height:92vh;overflow:auto;padding:14px 14px calc(18px + env(safe-area-inset-bottom));border-radius:var(--radius-sheet) var(--radius-sheet) 0 0;background:var(--card);box-shadow:var(--shadow-sheet)}'
  + '.repm .head{display:flex;align-items:center;gap:10px}.repm h3{flex:1;display:flex;align-items:center;gap:8px;margin:0;font:800 18px/1.2 var(--font-display);color:var(--ink)}.repm .frow{display:flex;gap:10px}.repm .frow>*{flex:1;min-width:0}.repq{gap:6px}.repq .bl-chip{min-height:34px;font-size:13px}'
  + '.repm .seg2{display:flex}.repm .seg2 button{flex:1}.repcnt{margin:0;font:600 14px/1.3 var(--font-text);color:var(--ink-2)}.repcnt .err{color:var(--health)}.repm .repgo{min-height:50px;font-size:15px}.repm .repgo[disabled]{opacity:.45}'
  + '@media (min-width:1000px){.repm{left:50%;right:auto;bottom:auto;top:50%;transform:translate(-50%,-50%);width:520px;border-radius:24px}}'
  + '.repdoc{background:#fff;color:#16201b;font:400 13px/1.45 Inter,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.repdoc h1{margin:2px 0 2px;font:800 24px/1.2 Manrope,Inter,sans-serif}.repdoc h2{margin:20px 0 8px;padding-bottom:4px;border-bottom:1.5px solid #d9ddd5;font:800 16px/1.25 Manrope,Inter,sans-serif;break-after:avoid}'
  + '.repdoc h3{margin:14px 0 6px;font:800 14px/1.25 Manrope,Inter,sans-serif;break-after:avoid}.repdoc h4{margin:10px 0 2px;font:700 12.5px/1.3 Inter,sans-serif;color:#4a5550;text-transform:uppercase;letter-spacing:.04em;break-after:avoid}.repdoc .rpday{margin-top:18px;padding:6px 10px;border-radius:6px;background:#eef1ea}.repdoc .rpday::first-letter{text-transform:uppercase}'
  + '.rphead{display:flex;gap:16px;align-items:flex-start;margin-bottom:12px}.rphead figure{flex:none;width:150px;margin:0}.rphead figure img{width:150px;height:150px;object-fit:cover;border-radius:8px;display:block}.rphead figcaption{margin-top:3px;font-size:9.5px;color:#6b746f}'
  + '.rpkind{margin:0;font:700 11px/1.2 Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#6b746f}.rplat{margin:0 0 6px;font-style:italic;color:#4a5550}.rpnames{display:flex;flex-wrap:wrap;gap:4px 14px;margin:4px 0 0}.rpnames em{font-style:normal;font-weight:700;color:#6b746f;font-size:11px}'
  + '.rpiucn{display:inline-block;padding:1px 6px;border-radius:4px;font-size:11.5px}.rpsum{margin:4px 0 8px}.rpmuted{color:#6b746f}.rptx{margin:0 0 4px;white-space:pre-wrap}'
  + '.rptab{width:100%;border-collapse:collapse;margin:6px 0}.rptab th,.rptab td{padding:5px 8px;border-bottom:1px solid #e4e7e1;text-align:left;vertical-align:top}.rptab th{width:34%;font-weight:600;color:#4a5550}.rptab.an th{width:auto;background:#f3f5f0}.rptab.sm th,.rptab.sm td{padding:3px 6px;font-size:12px}.rptab tr{break-inside:avoid}'
  + '.rprec{margin:8px 0;padding:8px 10px 8px 12px;border-left:4px solid #888;border-radius:4px;background:#fafbf8;break-inside:avoid}.rph{display:flex;justify-content:space-between;gap:10px}.rph b{font-size:13.5px}.rph span{flex:none;color:#4a5550;font-variant-numeric:tabular-nums}'
  + '.rpwho{margin:1px 0 4px;color:#33403a;font-weight:600}.rpnote{margin:4px 0;white-space:pre-wrap}.rpby{margin:4px 0 0;font-size:11.5px;color:#6b746f}.rpcom{margin-top:6px;padding:4px 8px;border-radius:4px;background:#f1f3ee;font-size:12px}.rpcom p{margin:3px 0}.rpcom span{color:#6b746f;font-size:11px}'
  + '.rpimgs{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.rpimgs img{width:120px;height:120px;object-fit:cover;border-radius:6px}.rpsrc{margin:0;padding-left:20px}.rpsrc li{margin:3px 0}.rpsrc span{font-size:11px;color:#4a5550;word-break:break-all}.rpfoot{margin:22px 0 0;padding-top:6px;border-top:1px solid #e4e7e1;font-size:10.5px;color:#6b746f}'
  + '#repprint{display:none}@media print{html,body.repp{background:#fff!important}body.repp>*:not(#repprint){display:none!important}body.repp #repprint{display:block!important}@page{margin:14mm}}'
  + '</style>');
