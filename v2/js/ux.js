// ux.js — v2: form and card touches.
// 1) Journal: mating records made together (same author, within a minute) show as one row «Species · samica 1 + samiec»;
//    animal cards keep one record per animal; nothing changes in the database.
// 2) Species card: what belongs to both the zoo and the wild (sex differences, breeding, health) is a separate «General» section
//    under the tabs; tabs keep «In the zoo» — diet, husbandry; «In the wild» — range, habitat, diet, behaviour.
// 3) Edit forms of cards (species, animal, enclosure, drug): an empty field is tinted light red (class isempty).
// 4) Drug field in treatment / dose forms: a tap opens the list of all drugs (catalogue + names from records); typing filters
//    by name and active substance; a catalogue drug fills its route when it has one.
// 5) Every filled text field in forms has a cross on the right that clears it.

/* 1) journal: merged mating rows */
const MERGE_KINDS = ['mate'];
const _recWhoU = recWho;
recWho = function (r) { return r && r.__who ? r.__who : _recWhoU(r); };
const _recsByDayU = recsByDay;
recsByDay = function (list) {
  if (st.scr !== 'logs') return _recsByDayU(list);
  const out = [], used = new Set();
  list.forEach((r, i) => {
    if (used.has(r.id)) return;
    if (!MERGE_KINDS.includes(r.k)) { out.push(r); return; }
    const mates = list.filter((x, j) => j > i && !used.has(x.id) && x.k === r.k && x.by === r.by && Math.abs(x.at - r.at) < 60000);
    if (!mates.length) { out.push(r); return; }
    mates.forEach(x => used.add(x.id));
    const an = [r, ...mates].map(x => anByName(x.bird)).filter(Boolean);
    const sameSp = an.length === mates.length + 1 && an.every(a => a.species_id === an[0].species_id);
    const who = sameSp ? anTitle(an[0]) + ' · ' + an.map(a => suffix(a) || sexSym(a.sex)).join(' + ') : [r, ...mates].map(x => _recWhoU(x)).join(' + ');
    out.push(Object.assign({}, r, {__who: who}));
  });
  return _recsByDayU(out);
};

/* 2) species card: «General» section */
const GEN_KEYS = ['sex', 'breeding', 'health'];
const accRowRe = k => new RegExp('<div class="acc ?(?:open)?"><button class="acch" data-acc="' + k + '">[\\s\\S]*?</button>(?:<div class="accb">[\\s\\S]*?</div>)?</div>');
const _speciesCardU = speciesCard;
speciesCard = function () {
  const tab = st.spTab || 'wild';
  let h = _speciesCardU(); st.spTab = tab === 'zoo' ? 'wild' : 'zoo'; const other = _speciesCardU(); st.spTab = tab;
  const rows = [];
  for (const k of GEN_KEYS) { const m = h.match(accRowRe(k)) || other.match(accRowRe(k)); if (m) { rows.push(m[0]); h = h.replace(accRowRe(k), ''); } }
  if (!rows.length) return h;
  const sec = `<div class="sec"><span>${L('Ogólne', 'Общее', 'General')}</span><span></span></div><div class="accs">${rows.join('')}</div>`;
  const mk = `<div class="sec"><span>${L('Notatki działu', 'Заметки отдела', 'Department notes')}</span>`, i = h.indexOf(mk);
  return i < 0 ? h : h.slice(0, i) + sec + h.slice(i);
};

/* 4) drug field: full list on tap, filter while typing */
const _medListU = medList;
medList = function () {
  const l = _medListU(), cat = Array.isArray(D.dr) ? D.dr : [];
  for (const d of cat) {
    const rt = Array.isArray(d.routes) && d.routes.length === 1 ? OPT.routes()[d.routes[0]] : '';
    const m = l.find(x => key(x.name) === key(d.name));
    if (m) { m.sub = d.substance || ''; if (!m.route && rt) m.route = rt; } else l.push({name: d.name, n: 0, route: rt, sub: d.substance || '', cat: 1});
  }
  return l;
};
const _medFormU = medForm;
medForm = function () {
  const h = _medFormU(), f = F(); if (!f || !f.medOpen) return h;
  const q = key(f.fv.drug || '');
  const all = medList().filter(m => !q || key(m.name + ' ' + (m.sub || '')).includes(q))
    .sort((a, b) => (q ? (key(b.name).startsWith(q) - key(a.name).startsWith(q)) : 0) || b.n - a.n || a.name.localeCompare(b.name));
  const items = all.map(m => `<button data-med="${esc(m.name)}"><span><b>${esc(m.name)}</b><small>${esc([m.sub, m.dose, m.route].filter(Boolean).join(' · ')) || (m.cat ? L('z katalogu', 'из каталога', 'from the catalogue') : '')}</small></span><em>${m.n ? m.n + '×' : ''}</em></button>`).join('')
    || `<p class="tip" style="margin:8px 12px">${L('Brak takiego leku — zostanie zapisany jako nowy', 'Такого средства нет — запишется как новое', 'No such drug — it will be saved as new')}</p>`;
  const list = `<div class="clist">${items}</div>`;
  if (/<div class="clist">[\s\S]*?<\/div>/.test(h)) return h.replace(/<div class="clist">[\s\S]*?<\/div>/, list);
  const i = h.indexOf('data-medtoggle'); if (i < 0) return h;
  const j = h.indexOf('</button>', i) + 9; return h.slice(0, j) + list + h.slice(j);
};
document.addEventListener('focusin', e => { if (e.target.id !== 'medin') return; const f = F(); if (f && !f.medOpen) { f.medOpen = 1; render(); } });

/* 3) empty fields in edit forms; 5) clear cross */
function markEmptyFields() {
  document.querySelectorAll('.bl-sheet').forEach(sh => {
    if (!sh.querySelector('[data-ein],[data-din]')) return;
    sh.querySelectorAll('.bl-field').forEach(f => {
      const inp = f.querySelector('[data-ein],[data-din]'), chips = f.querySelectorAll('.bl-chips [aria-pressed]');
      let empty = false;
      if (inp) empty = !String(inp.value || '').trim();
      else if (chips.length) empty = ![...chips].some(b => b.getAttribute('aria-pressed') === 'true');
      f.classList.toggle('isempty', empty);
    });
  });
}
const CLR_SEL = '.bl-sheet :is(input.inp, input[data-in], input[data-ein], input[data-din], .combo input, textarea):not([disabled]):not([type=search]):not([type=file]):not([type=checkbox]):not([type=radio])';
const CLR_X = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
function addClearButtons() {
  document.querySelectorAll(CLR_SEL).forEach(el => {
    if (el.parentNode.classList.contains('clrw')) { el.parentNode.classList.toggle('has', !!el.value); return; }
    const ae = document.activeElement === el, s = ae ? [el.selectionStart, el.selectionEnd] : null;
    const w = document.createElement('span'); w.className = 'clrw' + (el.tagName === 'TEXTAREA' ? ' ta' : '') + (el.value ? ' has' : '');
    el.parentNode.insertBefore(w, el); w.appendChild(el);
    w.insertAdjacentHTML('beforeend', `<button type="button" class="clrx" data-clr="1" aria-label="${L('Wyczyść', 'Очистить', 'Clear')}">${CLR_X}</button>`);
    if (ae) { el.focus(); try { el.setSelectionRange(s[0], s[1]); } catch (x) {} }
  });
}
addEventListener('DOMContentLoaded', () => { const _renderU = render; render = function () { _renderU(); addClearButtons(); markEmptyFields(); }; });
document.addEventListener('input', e => {
  const t = e.target, w = t.parentNode;
  if (w && w.classList && w.classList.contains('clrw')) w.classList.toggle('has', !!t.value);
  if (t.matches && t.matches('[data-ein],[data-din]')) { const f = t.closest('.bl-field'); if (f) f.classList.toggle('isempty', !String(t.value || '').trim()); }
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-clr]'); if (!b) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const el = b.parentNode.querySelector('input, textarea'); if (!el) return;
  el.value = ''; el.focus(); el.dispatchEvent(new Event('input', {bubbles: true})); b.parentNode.classList.remove('has');
}, true);
document.head.insertAdjacentHTML('beforeend', '<style>'
  + '.bl-field.isempty :is(input.inp, .bl-text, textarea){background:color-mix(in srgb, var(--health) 7%, var(--card));border-color:color-mix(in srgb, var(--health) 35%, var(--line))}.bl-field.isempty .bl-text textarea{background:transparent}'
  + '.bl-field.isempty>span:first-child{color:color-mix(in srgb, var(--health) 70%, var(--muted))}.bl-field.isempty>span:first-child::after{content:"";display:inline-block;width:6px;height:6px;margin-left:6px;border-radius:999px;background:var(--health);vertical-align:middle}'
  + '.bl-field.isempty .bl-chips button:not([aria-pressed=true]){border-color:color-mix(in srgb, var(--health) 30%, var(--line))}'
  + '.clrw{position:relative;display:block;flex:1;min-width:0}.clrw>input,.clrw>textarea{width:100%;padding-right:42px}'
  + '.clrx{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:none;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:0;border-radius:999px;background:color-mix(in srgb, var(--ink) 12%, transparent);color:var(--ink-2);cursor:pointer}'
  + '.clrw.ta>.clrx{top:8px;transform:none}.clrw.has>.clrx{display:flex}.combo .clrw>input{padding-right:84px}.combo .clrw>.clrx{right:52px}</style>');
