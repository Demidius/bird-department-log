// groups.js — v2: a group without an exact count. grp = {m:0, f:0, u:0, j:0, unk:true, about:'~20'} (about is optional text).
// Toggle in the arrival form and in the card edit; lists show "grupa ×?" or "grupa ≈ 20", the card shows "Liczebność".
const gUnk = g => !!(g && g.unk);
const gAbout = g => String((g && g.about) || '').trim();
const gEst = ab => /^\d/.test(ab) ? '≈ ' + ab : ab; // "20" -> "≈ 20", "około 20" stays as written
const UNK_LBL = () => L('Dokładna liczebność nieznana', 'Точная численность неизвестна', 'Exact count unknown');
const gToggle = on => `<button class="tgl2 ${on ? 'on' : ''}" data-gunk="1"><span class="box">${on ? ic('check', 14, 3) : ''}</span><span><b>${UNK_LBL()}</b><small>${L('można podać w przybliżeniu', 'можно указать примерно', 'you can give an estimate')}</small></span></button>`;
const ABOUT_PH = () => L('np. ok. 20 lub 10–15', 'напр. около 20 или 10–15', 'e.g. about 20 or 10–15');
// the composition field ("Skład grupy" + the four counters), as arriveForm / animalEdit render it
const GRP_FIELD = /<div class="bl-field ?"><span>[^<]*<\/span><div class="grpin">[\s\S]*?<\/div><\/div>/;
const aboutField = input => `<div class="bl-field"><span>${L('Ile mniej więcej', 'Примерно сколько', 'Roughly how many')} <i class="opt">— ${L('opcjonalnie', 'необязательно', 'optional')}</i></span>${input}</div>`;

/* ---------- forms ---------- */
const _arriveFormG = arriveForm;
arriveForm = function () {
  const html = _arriveFormG(), v = F().fv;
  if ((v.cnt ?? 0) !== 4) return html;
  return html.replace(GRP_FIELD, m => v.gunk ? gToggle(true) + aboutField(inpt('fv.gabout', v.gabout, ABOUT_PH(), 'maxlength="40"')) : m + gToggle(false));
};
const _animalEditG = animalEdit;
animalEdit = function () {
  const html = _animalEditG(), e = st.ed, v = e.v;
  if (!v.isg) return html;
  const dis = ro('grp') ? 'disabled' : '';
  const tg = dis ? '' : gToggle(gUnk(v.grp));
  return html.replace(GRP_FIELD, m => gUnk(v.grp) ? tg + aboutField(`<input class="inp" data-ein="grp.about" value="${esc(gAbout(v.grp))}" placeholder="${esc(ABOUT_PH())}" maxlength="40" ${dis}>`) : m + tg);
};
document.addEventListener('click', e => {
  if (!e.target.closest('[data-gunk]')) return;
  if (st.ed && st.ed.k === 'an') { const g = st.ed.v.grp; g.unk = !g.unk; }
  else if (st.add) st.add.fv.gunk = !st.add.fv.gunk;
  render();
});

/* ---------- saving: the original code writes the counters; the mark is added on the way to the database ---------- */
let GRP_X = null;
const _putRowG = putRow;
putRow = function (table, list, id, patch, isNew) {
  if (table === 'collection' && GRP_X && patch && patch.grp) patch = Object.assign({}, patch, {grp: Object.assign({m: 0, f: 0, u: 0, j: 0, unk: true}, GRP_X)});
  return _putRowG(table, list, id, patch, isNew);
};
const grpMark = about => (about = String(about || '').trim().slice(0, 40)) ? {about} : {};
const _saveArriveG = saveArrive;
saveArrive = async function () {
  const v = F().fv;
  GRP_X = (v.cnt ?? 0) === 4 && v.gunk ? grpMark(v.gabout) : null;
  try { return await _saveArriveG(); } finally { GRP_X = null; }
};
const _saveEdG = saveEd;
saveEd = async function () {
  const e = st.ed;
  GRP_X = e && e.k === 'an' && e.v.isg && gUnk(e.v.grp) ? grpMark(e.v.grp.about) : null;
  try { return await _saveEdG(); } finally { GRP_X = null; }
};

/* ---------- how it reads ---------- */
const _suffixG = suffix;
suffix = function (a) {
  if (!a || !gUnk(a.grp)) return _suffixG(a);
  const x = _suffixG(Object.assign({}, a, {grp: null})), ab = gAbout(a.grp), lbl = L('grupa', 'группа', 'group');
  const head = /(^|\s)(grupa|группа|group)$/i.test(x) ? x : (x ? x + ' · ' : '') + lbl;
  return head + (ab ? ' ' + gEst(ab) : ' ×?');
};
const _animalCardG = animalCard;
animalCard = function () {
  const html = _animalCardG(), a = anById(st.ani);
  if (!a || !gUnk(a.grp)) return html;
  const g = a.grp, comp = `♂ ${g.m || 0} · ♀ ${g.f || 0} · ? ${g.u || 0}${g.j ? ' · ' + L('młode ', 'мол. ', 'young ') + g.j : ''}`, ab = gAbout(g);
  return html.replace(`<div><dt>${L('Płeć', 'Пол', 'Sex')}</dt><dd>${esc(comp)}</dd></div>`,
    `<div><dt>${L('Liczebność', 'Численность', 'Count')}</dt><dd>${esc(ab ? gEst(ab) : L('nieznana', 'неизвестна', 'unknown'))}</dd></div>`);
};

/* ---------- separate individuals from a counted group ---------- */
const splitLabel = () => L('Wydziel', 'Отделить', 'Separate');
const splitAllowed = a => !!(a?.grp && a.status === 'active' && canWrite()
  && (isAdmin() || !(a.locked || []).some(k => k === '*' || k === 'grp')));
const splitKinds = mammal => [
  ['m', L('Samiec', 'Самец', 'Male')],
  ['f', L('Samica', 'Самка', 'Female')],
  ['u', L('Płeć nieznana', 'Пол неизвестен', 'Unknown sex')],
  ['j', mammal ? L('Młody osobnik', 'Молодая особь', 'Young animal') : L('Młody ptak', 'Молодая птица', 'Young bird')]
];
function openSplitGroup(a) {
  if (!splitAllowed(a)) return;
  st.splitGroup = {id: a.id, version: a.updated_at, grp: a.grp, selected: new Set(), busy: false, error: ''};
  render();
  $('#split-close')?.focus();
}
function splitGroupSheet() {
  const s = st.splitGroup;
  if (!s) return '';
  const total = grpTotal(s.grp);
  const kinds = splitKinds(isMammal(spBy(anById(s.id)?.species_id)));
  const unavailable = gUnk(s.grp) || !total || kinds.some(([k]) => {
    const n = Number(s.grp[k] ?? 0);
    return !Number.isSafeInteger(n) || n < 0;
  });
  const disabled = s.busy || s.stale ? 'disabled' : '';
  const rows = unavailable ? '' : kinds.map(([k, label]) =>
    Array.from({length: +s.grp[k] || 0}, (_, i) => {
      const value = k + (i + 1);
      return `<label class="split-choice"><input type="checkbox" id="split-${value}" data-split-choice="${value}" ${s.selected.has(value) ? 'checked' : ''} ${disabled}>${label} ${i + 1}</label>`;
    }).join('')).join('');
  return `<div class="scrim" ${s.busy ? '' : 'data-split-close="1"'}></div>
    <div class="bl-sheet split-sheet" role="dialog" aria-modal="true" aria-labelledby="split-title">
      <div class="grip"></div><div class="head"><h3 id="split-title">${splitLabel()}</h3>
      <button class="bl-x" id="split-close" data-split-close="1" aria-label="${L('Zamknij', 'Закрыть', 'Close')}" ${s.busy ? 'disabled' : ''}>${ic('x', 18)}</button></div>
      <div class="shbody">
        ${unavailable ? `<p class="tip">${L('Najpierw wpisz dokładny skład grupy.', 'Сначала укажи точный состав группы.', 'Enter the exact group composition first.')}</p>` : rows}
        ${total && s.selected.size === total ? `<p class="tip">${L('Pusta grupa zniknie z listy zwierząt. Jej wpisy pozostaną w dzienniku.', 'Пустая группа исчезнет из списка животных. Её записи останутся в журнале.', 'The empty group will leave the animal list. Its records will stay in the journal.')}</p>` : ''}
        ${s.error ? `<p class="tip" role="alert">${esc(s.error)}</p>` : ''}
      </div>
      ${unavailable ? `<button class="bl-btn wide" data-split-edit="1">${L('Edytuj skład', 'Изменить состав', 'Edit composition')}</button>` :
        `<button class="bl-btn solid wide" data-split-save="1" ${!s.selected.size || disabled ? 'disabled' : ''}>${s.busy ? L('Zapisywanie…', 'Сохранение…', 'Saving…') : splitLabel() + ' (' + s.selected.size + ')'}</button>`}
    </div>`;
}
function closeSplitGroup() {
  if (st.splitGroup?.busy) return;
  st.splitGroup = null;
  render();
  $('[data-split-open]')?.focus();
}
async function saveSplitGroup() {
  const s = st.splitGroup;
  if (!s || s.busy || s.stale || !s.selected.size) return;
  const counts = {m: 0, f: 0, u: 0, j: 0};
  for (const value of s.selected) counts[value[0]]++;
  s.busy = true;
  s.error = '';
  render();
  try {
    const result = must(await sb.rpc('split_collection_group', {
      p_id: s.id, p_version: s.version, p_counts: counts
    }));
    const created = new Set(result.individuals.map(a => a.id));
    D.an = D.an.filter(a => a.id !== s.id && !created.has(a.id)).concat(result.group, result.individuals);
    st.splitGroup = null;
    toast(L('Utworzono karty: ', 'Создано карточек: ', 'Cards created: ') + result.individuals.length);
  } catch (e) {
    if (e.code === '40001') {
      s.stale = true;
      s.error = L('Grupa się zmieniła. Zamknij okno i wybierz ponownie.', 'Группа изменилась. Закрой окно и выбери птиц заново.', 'The group changed. Close this window and select again.');
      try { await LOAD.collection(); } catch (x) { /* Realtime or manual refresh can reload it later. */ }
    } else {
      s.error = errText(e);
    }
    s.busy = false;
  }
  render();
}
document.addEventListener('change', e => {
  const value = e.target.dataset.splitChoice, s = st.splitGroup;
  if (!value || !s || s.busy || s.stale) return;
  if (e.target.checked) s.selected.add(value); else s.selected.delete(value);
  render();
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-split-open],[data-split-close],[data-split-save],[data-split-edit]');
  if (!b || b.disabled) return;
  if (b.hasAttribute('data-split-open')) return openSplitGroup(anById(st.ani));
  if (b.hasAttribute('data-split-close')) return closeSplitGroup();
  if (b.hasAttribute('data-split-save')) return saveSplitGroup();
  if (!st.splitGroup || !splitAllowed(anById(st.ani))) return;
  st.splitGroup = null;
  openEd('an');
  render();
});
