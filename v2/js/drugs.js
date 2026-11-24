// drugs.js — v2: drug catalogue. «More → Drugs» (list + search) → drug card: photos, active substance, form, strength, routes, maker,
// dosage, indications and use, contraindications, storage, notes; at the bottom — prescriptions and doses of this drug in the department.
// Table public.drugs (form = index of OPT.dform, routes = indexes of OPT.routes); photos owner_type 'drug'. Names used in records
// but without a card are listed under the catalogue with «create card». A treatment / dose record card links to the drug card (↗).
if (typeof WIN_TINT !== 'undefined') { WIN_TINT.drugs = 'dr'; WIN_TINT.dcard = 'dr'; }
D.dr = [];
let drugsOn = false;
LOAD.drugs = async () => { // never breaks loading: no table yet → the catalogue is hidden
  try { const r = await sb.from('drugs').select('*').order('name', {ascending: true}).range(0, 1999); drugsOn = !r.error; D.dr = r.data || []; } catch (x) { drugsOn = false; D.dr = []; }
};
OPT.dform = () => LA(['Tabletki', 'Kapsułki', 'Zawiesina / syrop', 'Roztwór do wstrzykiwań', 'Krople', 'Maść / krem', 'Proszek', 'Inne'], ['Таблетки', 'Капсулы', 'Суспензия / сироп', 'Раствор для инъекций', 'Капли', 'Мазь / крем', 'Порошок', 'Другое'], ['Tablets', 'Capsules', 'Suspension / syrup', 'Injection solution', 'Drops', 'Ointment / cream', 'Powder', 'Other']);
const DRUG_TX = () => [['dose', L('Dawkowanie', 'Дозировка', 'Dosage'), L('np. 0,2 mg/kg 1× dziennie', 'напр. 0,2 мг/кг 1× в день', 'e.g. 0.2 mg/kg once a day')],
  ['use', L('Wskazania i sposób użycia', 'Показания и применение', 'Indications and use'), ''], ['contra', L('Przeciwwskazania i uwagi', 'Противопоказания и осторожности', 'Contraindications and cautions'), ''],
  ['storage', L('Przechowywanie', 'Хранение', 'Storage'), L('np. 2–8 °C, po otwarciu 28 dni', 'напр. 2–8 °C, после вскрытия 28 дней', 'e.g. 2–8 °C, 28 days after opening')], ['note', L('Notatki', 'Заметки', 'Notes'), '']];
const drBy = id => D.dr.find(d => d.id === id), drByName = n => D.dr.find(d => key(d.name) === key(n || ''));
const drUses = d => D.rec.filter(r => (r.k === 'tstart' || r.k === 'tdose') && key(r.f.drug || '') === key(d.name)).sort((a, b) => b.at - a.at);
const drPhoto = d => avPhoto('drug', d.id);
const drAv = (d, cls = '') => { const u = drPhoto(d); return u ? `<span class="bl-av ${cls} photo"><img src="${esc(u)}" alt=""></span>` : `<span class="bl-av ${cls}">${ic('pill', cls ? 30 : 20)}</span>`; };
const drSub = d => [d.substance, d.form != null ? OPT.dform()[d.form] : '', d.conc].filter(Boolean).join(' · ');
const _photosForD = photosFor;
photosFor = function (kind, id) {
  if (kind !== 'dr') return _photosForD(kind, id);
  return phOf('drug', id).map(p => ({src: 'drug', g: '', label: L('Lek', 'Лекарство', 'Drug'), d: new Date(p.created_at).getTime(), p})).sort((a, b) => b.d - a.d);
};
function drugsScreen() {
  const q = key(st.dq || ''), list = D.dr.filter(d => !q || key(d.name + ' ' + d.substance).includes(q));
  const noCard = medList().filter(m => !drByName(m.name) && (!q || key(m.name).includes(q)));
  return `<div class="cardscr">${topbar(L('Więcej', 'Ещё', 'More'))}<div class="scroll"><h1 class="sph1" style="margin:4px 2px 10px">${L('Leki', 'Лекарства', 'Drugs')}</h1>
  ${canWrite() ? `<button class="bl-who newani" data-dnew="1"><span class="bl-av">${ic('plus', 20, 2.4)}</span><span><b>${L('Nowy lek', 'Новое средство', 'New drug')}</b><small>${L('dawkowanie, podanie, zdjęcia', 'дозировки, способ подачи, фото', 'dosage, route, photos')}</small></span></button>` : ''}
  <label class="bl-search" style="margin:8px 0">${ic('search', 18)}<input id="dq" type="search" value="${esc(st.dq || '')}" placeholder="${L('Nazwa, substancja…', 'Название, вещество…', 'Name, substance…')}" autocomplete="off"></label>
  <div class="stack">${list.map(d => `<button class="bl-who flat2" data-drug="${d.id}">${drAv(d)}<span><b>${esc(d.name)}</b><small>${esc(drSub(d)) || '&nbsp;'}</small></span><span class="sx">${drUses(d).length || ''}</span></button>`).join('') || `<p class="empty">${L('Brak kart leków', 'Карточек средств пока нет', 'No drug cards yet')}</p>`}</div>
  ${noCard.length && canWrite() ? `<div class="sec"><span>${L('Z wpisów, bez karty', 'Из записей, без карточки', 'From records, no card')}</span><span>${noCard.length}</span></div><div class="stack">${noCard.map(m => `<button class="bl-who flat2" data-dnew="1" data-dname="${esc(m.name)}"><span class="bl-av">${ic('plus', 18, 2.4)}</span><span><b>${esc(m.name)}</b><small>${L('utwórz kartę', 'создать карточку', 'create card')} · ${m.n}×</small></span></button>`).join('')}</div>` : ''}
  </div></div>`;
}
function drugCard() {
  const d = drBy(st.drug); if (!d) return drugsScreen();
  const u = drUses(d), routes = (Array.isArray(d.routes) ? d.routes : []).map(i => OPT.routes()[i]).filter(Boolean).join(', ');
  const facts = [[L('Postać', 'Форма', 'Form'), d.form != null ? OPT.dform()[d.form] : '—'], [L('Stężenie', 'Концентрация', 'Strength'), d.conc || '—'], [L('Podanie', 'Способ подачи', 'Route'), routes || '—'], [L('Producent', 'Производитель', 'Maker'), d.maker || '—']];
  return `<div class="cardscr">${topbar(L('Leki', 'Лекарства', 'Drugs'), canWrite() ? `<button class="bl-x" data-dedit="1" aria-label="${L('Edytuj', 'Редактировать', 'Edit')}">${ic('pen', 18)}</button>` : '')}<div class="scroll">
  <div class="ahero">${drAv(d, 'big')}<div><h1>${esc(d.name)}</h1><p class="sfx">${esc(d.substance || L('substancja czynna — nie podano', 'действующее вещество не указано', 'active substance not given'))}</p></div></div>
  <dl class="bl-facts">${facts.map(([x, y]) => `<div><dt>${x}</dt><dd>${esc(y)}</dd></div>`).join('')}</dl>
  ${DRUG_TX().map(([k, l]) => `<div class="sec"><span>${l}</span><span></span></div>${d[k] ? `<div class="note dtext">${esc(d[k])}</div>` : canWrite() ? `<button class="notebox" data-dedit="1">${ic('pen', 16)}<span>${L('Dodaj', 'Добавить', 'Add')}: ${l.toLowerCase()}</span></button>` : '<p class="empty">—</p>'}`).join('')}
  ${photoBlock('dr', d.id, 'drug')}
  <div class="sec"><span>${L('Stosowanie w dziale', 'Применение в отделе', 'Use in the department')}</span><span>${u.length}</span></div><div class="stack">${u.slice(0, 30).map(recHTML).join('') || `<p class="empty">${L('Jeszcze nie stosowano', 'Ещё не применялось', 'Not used yet')}</p>`}</div>
  </div>${st.gal ? gallery('dr', d.id, 'drug') : ''}${st.ph >= 0 ? lightbox('dr', d.id) : ''}</div>`;
}
function drugForm() {
  const f = st.dform; if (!f) return '';
  const chips = (k, list, multi) => `<div class="bl-chips">${list.map((t, i) => `<button class="bl-chip phrase" data-dchip="${k}" data-i="${i}" data-m="${multi ? 1 : ''}" aria-pressed="${multi ? (f[k] || []).includes(i) : f[k] === i}">${esc(t)}</button>`).join('')}</div>`;
  const inp = (k, ph) => `<input class="inp" data-din="${k}" value="${esc(f[k] || '')}" placeholder="${esc(ph || '')}" autocomplete="off">`;
  return `<div class="scrim" data-dclose="1"></div><div class="bl-sheet g-health full"><div class="grip"></div><div class="head"><h3>${ic('pill', 20)}${f.id ? L('Edycja leku', 'Правка средства', 'Edit drug') : L('Nowy lek', 'Новое средство', 'New drug')}</h3><button class="bl-x" data-dclose="1" aria-label="×">${ic('x', 18)}</button></div><div class="shbody"><div class="formbody">
    ${fld(L('Nazwa', 'Название', 'Name'), inp('name', L('nazwa handlowa', 'торговое название', 'trade name')))}
    ${fld(L('Substancja czynna', 'Действующее вещество', 'Active substance'), inp('substance'))}
    ${fld(L('Postać', 'Форма', 'Form'), chips('form', OPT.dform()))}
    ${fld(L('Stężenie', 'Концентрация', 'Strength'), inp('conc', L('np. 5 mg/ml', 'напр. 5 мг/мл', 'e.g. 5 mg/ml')))}
    ${fld(L('Podanie', 'Способ подачи', 'Route'), chips('routes', OPT.routes(), 1))}
    ${fld(L('Producent', 'Производитель', 'Maker'), inp('maker'))}
    ${DRUG_TX().map(([k, l, ph]) => fld(l, `<div class="bl-text"><textarea data-din="${k}" rows="3" placeholder="${esc(ph)}">${esc(f[k] || '')}</textarea></div>`)).join('')}
    <p class="tip">${L('Zdjęcia — w karcie leku, sekcja «Zdjęcia».', 'Фото — в карточке средства, раздел «Фотографии».', 'Photos — in the drug card, «Photos».')}</p>
    ${f.err ? `<p class="err" id="ferr">${esc(f.err)}</p>` : ''}</div>
    <button class="bl-btn solid wide" data-dsave="1">${L('Zapisz', 'Сохранить', 'Save')}</button></div></div>`;
}
const DRUG_COLS = ['name', 'substance', 'form', 'conc', 'routes', 'maker', 'dose', 'use', 'contra', 'storage', 'note'];
async function saveDrug() {
  const f = st.dform, name = String(f.name || '').trim();
  if (!name) { f.err = L('Podaj nazwę', 'Укажи название', 'Enter the name'); return render(); }
  if (D.dr.some(d => d.id !== f.id && key(d.name) === key(name))) { f.err = L('Taki lek już jest', 'Такое средство уже есть', 'This drug already exists'); return render(); }
  const row = {}; for (const k of DRUG_COLS) row[k] = k === 'form' ? (f.form ?? null) : k === 'routes' ? (f.routes || []) : String(f[k] || '').trim();
  row.name = name;
  try {
    const saved = f.id ? must(await sb.from('drugs').update(row).eq('id', f.id).select().single())
                       : must(await sb.from('drugs').insert(Object.assign(row, {created_by: me})).select().single());
    const i = D.dr.findIndex(d => d.id === saved.id); if (i >= 0) D.dr[i] = saved; else D.dr.push(saved);
    D.dr.sort((a, b) => a.name.localeCompare(b.name)); st.dform = null; toast(L('Zapisano', 'Сохранено', 'Saved'));
    if (!f.id) return go({scr: 'dcard', drug: saved.id});
  } catch (x) { f.err = errText(x); }
  render();
}
addEventListener('DOMContentLoaded', () => { // screen and NAVK come from main.js, which loads last
  if (!NAVK.includes('drug')) NAVK.push('drug');
  const _screenD = screen;
  screen = function () {
    if (st.scr === 'drugs') return drugsScreen() + drugForm();
    if (st.scr === 'dcard') return drugCard() + drugForm();
    let h = _screenD();
    if (st.scr === 'more' && drugsOn) { const row = `<button class="mrow" data-scr="drugs"><span class="mic2">${ic('pill', 20)}</span><span class="mt"><b>${L('Leki', 'Лекарства', 'Drugs')}</b><small>${L('dawkowanie, podanie, zdjęcia', 'дозировки, способ подачи, фото', 'dosage, route, photos')}</small></span><em>${D.dr.length}</em><span class="chev">${ic('chev', 16, 2.4)}</span></button>`, i = h.indexOf('</div>\n  <div class="msec">'); if (i >= 0) h = h.slice(0, i) + row + h.slice(i); }
    if (st.scr === 'rcard') { const r = D.rec.find(x => x.id === st.rec), d = r && (r.k === 'tstart' || r.k === 'tdose') && drByName(r.f.drug), i = h.indexOf('<dl class="bl-facts"');
      if (d && i >= 0) h = h.slice(0, i) + `<button class="bl-whochip" data-drug="${d.id}" style="margin-top:8px">${drAv(d)}<span><b>${esc(d.name)}</b><small>${L('Karta leku', 'Карточка средства', 'Drug card')}${drSub(d) ? ' · ' + esc(drSub(d)) : ''}</small></span><em>${ic('chev', 18)}</em></button>` + h.slice(i); }
    return h;
  };
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-drug],[data-dnew],[data-dedit],[data-dclose],[data-dchip],[data-dsave]'); if (!b) return;
  e.preventDefault(); e.stopImmediatePropagation(); const x = b.dataset;
  if (x.drug) { st.dform = null; go({scr: 'dcard', drug: x.drug}); return; }
  if (x.dnew) st.dform = {routes: [], name: x.dname || ''};
  else if (x.dedit) { const d = drBy(st.drug); if (d) st.dform = JSON.parse(JSON.stringify(d)); }
  else if (x.dclose) st.dform = null;
  else if (x.dchip) { const f = st.dform, i = +x.i; if (x.m) { const a = f[x.dchip] || []; f[x.dchip] = a.includes(i) ? a.filter(v => v !== i) : a.concat(i).sort(); } else f[x.dchip] = f[x.dchip] === i ? null : i; }
  else if (x.dsave) return saveDrug();
  render();
}, true);
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset && t.dataset.din != null && st.dform) { st.dform[t.dataset.din] = t.value; e.stopImmediatePropagation(); }
  else if (t.id === 'dq') { st.dq = t.value; e.stopImmediatePropagation(); clearTimeout(drugsScreen.t); drugsScreen.t = setTimeout(() => { render(); const q = document.getElementById('dq'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 250); }
}, true);
document.head.insertAdjacentHTML('beforeend', '<style>#app[data-wt=dr]{--tint:#e3a3ae}.dtext{white-space:pre-wrap}</style>');
