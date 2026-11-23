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
