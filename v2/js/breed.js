// breed.js — v2: parents and young in the Birth and Hatching forms (extends forms.js: genericForm, fieldHTML, saveForm, recDetails)
const BREED = ['birth', 'hatch'];
const isYoung = (a, at) => !!a && !a.grp && ((a.born && Math.abs(new Date(a.born).getTime() - at) <= 60 * DAY) || /młode|pisklę/i.test(a.name));
// first look at the form: parents from the card's parents (or the adult itself), the young = the card itself if it is young
function breedPrefill(f) {
  if (f.fv.par && f.fv.kids) return;
  const l = tgt(), at = atMs();
  if (!f.fv.kids) f.fv.kids = l.filter(a => isYoung(a, at)).map(a => a.name);
  if (!f.fv.par) {
    const fromCards = [...new Set(l.flatMap(a => (a.parents || []).map(anById).filter(Boolean).map(p => p.name)))];
    f.fv.par = fromCards.length ? fromCards : l.filter(a => !isYoung(a, at) && !a.grp && a.sex).map(a => a.name);
  }
}
function breedFields() {
  const f = F(), l = tgt(); if (!l.length) return '';
  breedPrefill(f);
  const sp = l[0].species_id, at = atMs(), par = f.fv.par, kids = f.fv.kids;
  const same = D.an.filter(a => a.species_id === sp && !a.grp);
  const pc = same.filter(a => !kids.includes(a.name) && (par.includes(a.name) || (a.status !== 'out' && a.sex && !isYoung(a, at))));
  const kc = same.filter(a => !par.includes(a.name) && (kids.includes(a.name) || isYoung(a, at) || (a.parents || []).some(id => par.includes((anById(id) || {}).name))));
  const chip = (k, a, on) => `<button class="bl-chip phrase" data-brd="${k}" data-ms="${esc(a.name)}" aria-pressed="${on}">${a.sex ? sexSym(a.sex) + ' ' : ''}${esc(suffix(a) || a.name)}</button>`;
  return fld(L('Rodzice', 'Родители', 'Parents'), pc.length ? `<div class="bl-chips">${pc.map(a => chip('par', a, par.includes(a.name))).join('')}</div>` : `<p class="tip">${L('Brak dorosłych tego gatunku', 'Нет взрослых этого вида', 'No adults of this species')}</p>`)
    + fld(f.kind === 'hatch' ? L('Kto się wykluł', 'Кто вылупился', 'Who hatched') : L('Kto się urodził', 'Кто родился', 'Who was born'), kc.length ? `<div class="bl-chips">${kc.map(a => chip('kids', a, kids.includes(a.name))).join('')}</div>` : `<p class="tip">${L('Brak kart młodych — włącz „Utwórz karty” poniżej', 'Карточек детёнышей нет — включи «Создать карточки» ниже', 'No cards of the young — turn on “Create cards” below')}</p>`);
}
const _genericForm = genericForm;
genericForm = function () {
  const f = F(); if (!BREED.includes(f.kind) || f.target === 'place') return _genericForm();
  const fs = (FS()[f.kind] || []).filter(x => !(f.edit && ['kid', 'watch'].includes(x[1])));
  return `<div class="formbody">${targetChip(!!f.edit)}${fieldHTML(fs[0])}${breedFields()}${fs.slice(1).map(fieldHTML).join('')}
  <label class="bl-field"><span>${descLbl()}</span>${area('note', f.note)}</label>${perAnimal()}${whenPhoto()}</div>${saveBtn()}`;
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-brd]'); if (!b || !st.add) return;
  const fv = st.add.fv, k = b.dataset.brd, n = b.dataset.ms;
  fv[k] = togg(fv[k] || [], n); render();
});
// after saving: the chosen young get the chosen parents on their cards; new cards of the young get them too
const _saveForm = saveForm;
saveForm = async function () {
  const f = F(), k = f && f.kind, fv = f ? Object.assign({}, f.fv) : {};
  await _saveForm();
  if (!BREED.includes(k) || (st.add === f && f.err) || (st.add === f && f.step === 'form')) return;
  const parIds = (fv.par || []).map(anByName).filter(Boolean).map(a => a.id);
  if (!parIds.length) return;
  let changed = 0;
  for (const name of fv.kids || []) {
    const a = anByName(name); if (!a) continue;
    if ([...(a.parents || [])].sort().join() === [...parIds].sort().join()) continue;
    try { await putAnimal(a.id, {parents: parIds}); changed++; } catch (x) {}
  }
  if (st.add && st.add.step === 'kids' && st.add.kids) st.add.kids.par = parIds;
  if (changed || (st.add && st.add.step === 'kids')) render();
};
const _recDetails = recDetails;
recDetails = function (r) {
  const out = _recDetails(r), nm = n => { const a = anByName(n); return a ? suffix(a) || a.name : n; };
  if (Array.isArray(r.f.par) && r.f.par.length) out.push([L('Rodzice', 'Родители', 'Parents'), r.f.par.map(nm).join(', ')]);
  if (Array.isArray(r.f.kids) && r.f.kids.length) out.push([r.k === 'hatch' ? L('Wykluły się', 'Вылупились', 'Hatched') : L('Urodziły się', 'Родились', 'Born'), r.f.kids.map(nm).join(', ')]);
  return out;
};
