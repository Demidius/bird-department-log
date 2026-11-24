// ux.js — v2: form and card touches.
// 1) Journal: mating records made together (same author, within a minute) show as one row «Species · samica 1 + samiec»;
//    animal cards keep one record per animal; nothing changes in the database.
// 2) Species card: what belongs to both the zoo and the wild (sex differences, breeding, health) is a separate «General» section
//    under the tabs; tabs keep «In the zoo» — diet, husbandry; «In the wild» — range, habitat, diet, behaviour.
// 3) Edit forms of cards (species, animal, enclosure, drug): an empty field is tinted light red (class isempty).
// 4) Drug field in treatment / dose forms: a tap opens the list of all drugs (catalogue + names from records); typing filters
//    by drug name (word starts); a catalogue drug fills its route when it has one.
// 5) Every filled text field in forms has a cross on the right that clears it.
// 6) Enclosures: search by enclosure name in the «Enclosures» list and in the enclosure picker; matches show as a flat list
//    with the parent place underneath.
// 7) Search in every list matches word starts only (qhit), and only the list's main name: animals — species name as shown,
//    species — name, drugs — name, enclosures — enclosure name; the journal — its text. Letters without diacritics (ż = z, ł = l).
// 8) Record card of mating / birth / hatching shows every animal on its own plate: mating — female and male (records of the
//    same author within a minute); birth / hatching — the mother (or parents) and the young (f.par / f.kids of the record,
//    otherwise cards whose parents are these animals and born within 60 days).
// 9) Animal card edit: under «Species» — all animals of that species; a tap opens that card in the same form with its data.
// 10) Narrow fields in a row: the AI lock does not shrink and moves under the label; inputs line up at the bottom.
// 11) Loading screen: birds fly in circles around the logo (wings flap), «Loading» with running dots; still when the phone
//     asks for reduced motion.

/* 7) search helper (used below and by the list functions rebuilt at the end of this file) */
const qnorm = s => String(s || '').toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '');
const qhit = (text, q) => { const w = qnorm(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean); return qnorm(q).split(/\s+/).filter(Boolean).every(t => w.some(x => x.startsWith(t))); };

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
  const all = medList().filter(m => !q || qhit(m.name, q))
    .sort((a, b) => (q ? (key(b.name).startsWith(q) - key(a.name).startsWith(q)) : 0) || b.n - a.n || a.name.localeCompare(b.name));
  const items = all.map(m => `<button data-med="${esc(m.name)}"><span><b>${esc(m.name)}</b><small>${esc([m.sub, m.dose, m.route].filter(Boolean).join(' · ')) || (m.cat ? L('z katalogu', 'из каталога', 'from the catalogue') : '')}</small></span><em>${m.n ? m.n + '×' : ''}</em></button>`).join('')
    || `<p class="tip" style="margin:8px 12px">${L('Brak takiego leku — zostanie zapisany jako nowy', 'Такого средства нет — запишется как новое', 'No such drug — it will be saved as new')}</p>`;
  const list = `<div class="clist">${items}</div>`;
  if (/<div class="clist">[\s\S]*?<\/div>/.test(h)) return h.replace(/<div class="clist">[\s\S]*?<\/div>/, list);
  const i = h.indexOf('data-medtoggle'); if (i < 0) return h;
  const j = h.indexOf('</button>', i) + 9; return h.slice(0, j) + list + h.slice(j);
};
document.addEventListener('focusin', e => { if (e.target.id !== 'medin') return; const f = F(); if (f && !f.medOpen) { f.medOpen = 1; render(); } });

/* 6) enclosures: search */
const _placeTreeU = placeTree;
placeTree = function (openAttr = 'data-plc') {
  const id = openAttr === 'data-pickplc' ? 'pq' : 'plq', v = st[id] || '';
  const box = `<label class="bl-search" style="margin-bottom:8px">${ic('search', 18)}<input id="${id}" type="search" value="${esc(v)}" placeholder="${L('Nazwa woliery', 'Название вольера', 'Enclosure name')}" autocomplete="off"></label>`;
  if (!v.trim()) return box + _placeTreeU(openAttr);
  const rows = D.pl.filter(p => p.active !== false && qhit(plName(p), v)).sort((a, b) => plName(a).localeCompare(plName(b), undefined, {numeric: true}))
    .map(p => { const par = plById(p.parent_id), n = anOfPlace(p).length; return `<div class="trow" style="--d:0"><span class="tgl"></span><button class="bl-who" ${openAttr}="${p.id}"><span class="bl-av">${ic(p.kind === 'building' ? 'building' : 'home', 20)}</span><span><b>${esc(plName(p))}</b><small>${esc(par ? plName(par) : '')}</small></span><span class="sx">${n || ''}</span></button></div>`; }).join('');
  return box + (rows ? `<div class="tree">${rows}</div>` : `<p class="empty">${L('Nic nie znaleziono', 'Ничего не найдено', 'Nothing found')}</p>`);
};
document.addEventListener('input', e => { const i = e.target.id; if (i === 'pq' || i === 'plq') { st[i] = e.target.value; render(); } });

/* 7) list searches: the list functions (views.js, forms.js, picker.js, drugs.js) filter with key(text).includes(q);
   here they are rebuilt from their own source with that check replaced by qhit(main name, q), through the chain of wrappers
   of the extension modules. If a function changes so that nothing matches, it simply stays as it was. */
(function () {
  const G = s => (0, eval)(s);
  const bal = d => d ? '(?:[^()]|\\(' + bal(d - 1) + '\\))*' : '[^()]*';
  const RE = new RegExp('key\\((' + bal(6) + ')\\)\\.includes\\(q\\)', 'g');
  const MAIN = [["anLine(a) + ' ' + a.name + ' ' + a.ring + ' ' + anEncl(a) + ' ' + ((spBy(a.species_id) || {}).latin || '')", 'anTitle(a)'],
    ["[s.name_pl, s.name_ru, s.name_en, s.latin].join(' ')", 'spName(s)'], ["d.name + ' ' + d.substance", 'd.name']];
  let n = 0;
  const patch = src => MAIN.reduce((t, w) => t.split(w[0]).join(w[1]), src).replace(RE, 'qhit($1, q)').replace(/\b(_[A-Za-z]\w*)\(/g, (m, c) => {
    let f; try { f = G(c); } catch (x) { return m; }
    if (typeof f !== 'function') return m;
    const s = f.toString(), p = patch(s); if (p === s) return m;
    const nm = '__qhit' + (n++); window[nm] = G('(' + p + ')'); return nm + '(';
  });
  ['animalsByPlace', 'listScreen', 'logsScreen', 'drugsScreen', 'medForm', 'arriveForm', 'animalEdit'].forEach(name => {
    try { const s = G(name).toString(), p = patch(s); if (p !== s) G(name + ' = (' + p + ')'); } catch (x) { console.warn('qhit', name, x); }
  });
})();

/* 8) record card: all animals of mating / birth / hatching */
const _recCardU = recCard;
recCard = function () {
  const h = _recCardU(), r = D.rec.find(x => x.id === st.rec); if (!r || !['mate', 'birth', 'hatch'].includes(r.k)) return h;
  const a = anByName(r.bird); if (!a) return h;
  const bySex = (x, y) => (x.sex === 'f' ? 0 : x.sex === 'm' ? 1 : 2) - (y.sex === 'f' ? 0 : y.sex === 'm' ? 1 : 2);
  const uniq = l => l.filter((m, i) => m && l.findIndex(x => x && x.id === m.id) === i);
  let groups;
  if (r.k === 'mate') {
    const all = uniq([a, ...D.rec.filter(x => x.id !== r.id && x.k === r.k && x.by === r.by && Math.abs(x.at - r.at) < 60000).map(x => anByName(x.bird))]).sort(bySex);
    if (all.length < 2) return h; groups = [['', all]];
  } else {
    const f = r.f || {}, young = isYoung(a, r.at);
    let par = uniq((f.par || []).map(anByName)), kids = uniq((f.kids || []).map(anByName));
    if (!par.length) par = young ? uniq((a.parents || []).map(anById)) : [a];
    if (!kids.length) { const pid = par.map(p => p.id); kids = D.an.filter(k => (k.parents || []).some(id => pid.includes(id)) && k.born && Math.abs(new Date(k.born).getTime() - r.at) <= 60 * DAY); }
    if (young && !kids.some(k => k.id === a.id)) kids.unshift(a); else if (!young && !par.some(p => p.id === a.id) && !kids.some(k => k.id === a.id)) par.unshift(a);
    par = uniq(par).sort(bySex); kids = uniq(kids);
    if (par.length + kids.length < 2) return h;
    groups = [[par.length > 1 ? L('Rodzice', 'Родители', 'Parents') : (par[0] && par[0].sex === 'm' ? L('Ojciec', 'Отец', 'Father') : L('Matka', 'Мать', 'Mother')), par],
      [r.k === 'hatch' ? L('Pisklęta', 'Птенцы', 'Chicks') : L('Młode', 'Детёныши', 'Young'), kids]].filter(g => g[1].length);
  }
  const i = h.indexOf('<button class="bl-whochip" data-ani="' + a.id + '"'); if (i < 0) return h;
  const j = h.indexOf('</button>', i) + 9, chip = h.slice(i, j), em = chip.slice(chip.lastIndexOf('<em'));
  const mk = m => m.id === a.id ? chip : `<button class="bl-whochip" data-ani="${m.id}"><span class="bl-av">${esc(anInit(m))}</span><span><b>${esc(anLine(m))}</b><small>${m.grp ? '' : sexSym(m.sex) + ' · '}${esc(plName(plByName(anEncl(m))) || anEncl(m))}</small></span>${em}`;
  return h.slice(0, i) + `<div class="matechips">${groups.map(([t, l]) => (t ? `<p class="mclab">${t} <span>${l.length}</span></p>` : '') + l.map(mk).join('')).join('')}</div>` + h.slice(j);
};

/* 9) animal card edit: animals of the chosen species */
const _animalEditU = animalEdit;
animalEdit = function () {
  const h = _animalEditU(), e = st.ed, v = e.v; if (!v.species_id) return h;
  const list = anActive().filter(a => a.species_id === v.species_id).sort((a, b) => anLine(a).localeCompare(anLine(b), undefined, {numeric: true}));
  if (!list.length || (list.length === 1 && list[0].id === e.id)) return h;
  const i = h.indexOf('data-eset="isg"'), k = i < 0 ? -1 : h.lastIndexOf('<div class="bl-field', i); if (k < 0) return h;
  const chips = list.map(a => { const pl = plName(plByName(anEncl(a))) || anEncl(a); return `<button class="bl-chip phrase" data-edani="${a.id}" aria-pressed="${a.id === e.id}">${a.grp ? '' : sexSym(a.sex) + ' '}${esc(suffix(a) || pl || anTitle(a))}</button>`; }).join('');
  return h.slice(0, k) + `<div class="bl-field"><span>${L('Zwierzęta tego gatunku', 'Животные этого вида', 'Animals of this species')} <i class="opt">${list.length}</i></span><div class="bl-chips">${chips}</div></div>` + h.slice(k);
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-edani]'); if (!b) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (st.ed && b.dataset.edani === st.ed.id) return;
  st.ani = b.dataset.edani; openEd('an'); render();
  const sc = document.querySelector('.bl-sheet .shbody, .bl-sheet .formbody'); if (sc) sc.scrollTop = 0;
}, true);

/* 11) loading screen */
const _loginScreenU = loginScreen;
loginScreen = function (mode) {
  if (mode !== 'loading') return _loginScreenU(mode);
  const bird = i => `<span class="ob ob${i}"><svg viewBox="0 0 24 14" aria-hidden="true"><path d="M1 7 Q6.5 0 12 6 Q17.5 0 23 7 Q17.5 3.5 12 9 Q6.5 3.5 1 7Z"/></svg></span>`;
  return `<div class="login lgload"><div class="orbit">${[1, 2, 3, 4].map(i => `<div class="ring r${i}">${bird(i)}</div>`).join('')}<span class="lglogo">${ic('bird', 36)}</span></div><h1>${L('Dziennik działu ptaków', 'Журнал отдела птиц', 'Bird department log')}</h1><p>${L('Ładowanie', 'Загрузка', 'Loading')}<span class="dots"><i>.</i><i>.</i><i>.</i></span></p></div>`;
};

/* 3) empty fields in edit forms; 5) clear cross */
function markEmptyFields() {
  document.querySelectorAll('.bl-sheet').forEach(sh => {
    if (!sh.querySelector('[data-ein],[data-din],[data-etr]')) return;
    sh.querySelectorAll('.bl-field').forEach(f => {
      const inp = f.querySelector('[data-ein],[data-din],[data-etr]'), chips = f.querySelectorAll('.bl-chips [aria-pressed]');
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
  if (t.matches && t.matches('[data-ein],[data-din],[data-etr]')) { const f = t.closest('.bl-field'); if (f) f.classList.toggle('isempty', !String(t.value || '').trim()); }
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
  + '.clrw.ta>.clrx{top:8px;transform:none}.clrw.has>.clrx{display:flex}.combo .clrw>input{padding-right:84px}.combo .clrw>.clrx{right:52px}'
  + '.frow{align-items:flex-end}.bl-field>span{flex-wrap:wrap;row-gap:5px}.bl-field>span .lk{flex:none}.frow .bl-field>span .lk{margin-left:0}.frow .bl-field>span{gap:5px 6px}.bl-field.isempty>span:first-child::after{flex:none;margin-left:0}'
  + '.matechips{display:flex;flex-direction:column;gap:8px}.mclab{margin:6px 4px -2px;font:700 11.5px/1.3 var(--font-text);letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}.mclab span{opacity:.7}'
  + '.lgload{align-items:center;text-align:center;gap:14px}.orbit{position:relative;width:240px;height:240px;display:flex;align-items:center;justify-content:center;margin-bottom:8px}'
  + '.orbit::before{content:"";position:absolute;inset:26px;border-radius:50%;border:1.5px dashed color-mix(in srgb, var(--accent) 22%, transparent)}'
  + '.orbit .lglogo{position:relative;width:80px;height:80px;border-radius:26px;box-shadow:0 12px 30px color-mix(in srgb, var(--accent) 30%, transparent);animation:lgpulse 2.4s ease-in-out infinite}'
  + '.ring{--d:6s;--dl:0s;position:absolute;inset:0;animation:lgspin var(--d) linear var(--dl) infinite}.r2{--d:4.4s;--dl:-1.4s;inset:34px}.r3{--d:8.5s;--dl:-5s;inset:-8px}.r4{--d:3.4s;--dl:-2.2s;inset:54px}'
  + '.ob{position:absolute;left:50%;top:0;width:0;height:0;color:var(--accent);animation:lgspin var(--d) linear var(--dl) infinite reverse}'
  + '.ob svg{position:absolute;left:-19px;top:-11px;display:block;width:38px;height:22px;fill:currentColor;transform-origin:50% 55%;animation:lgflap .46s ease-in-out infinite alternate}'
  + '.ob2 svg{left:-15px;top:-9px;width:30px;height:18px;animation-duration:.4s}.ob3{color:color-mix(in srgb, var(--accent) 60%, var(--muted))}.ob3 svg{left:-17px;top:-10px;width:34px;height:20px;animation-duration:.54s}.ob4 svg{left:-12px;top:-7px;width:24px;height:14px;animation-duration:.34s;opacity:.7}'
  + '.lgload .dots i{font-style:normal;opacity:.15;animation:lgdot 1.2s infinite}.lgload .dots i:nth-child(2){animation-delay:.2s}.lgload .dots i:nth-child(3){animation-delay:.4s}'
  + '@keyframes lgspin{to{transform:rotate(360deg)}}@keyframes lgflap{from{transform:scaleY(1)}to{transform:scaleY(.45) translateY(2px)}}@keyframes lgpulse{50%{transform:scale(1.06)}}@keyframes lgdot{30%{opacity:1}}'
  + '@media (prefers-reduced-motion: reduce){.ring,.ob,.ob svg,.orbit .lglogo,.lgload .dots i{animation:none;opacity:1}}</style>');
