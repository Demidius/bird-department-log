// avatars.js — v2: the round avatar of an animal / enclosure shows its newest card photo instead of the letters
// (animal: photos added on the animal card, else the species photo; enclosure: photos of the enclosure). No photo — letters / icon stay.
// Works on the rendered screen, so every list, card, picker and form row gets it without touching their markup.
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
function avPhoto(type, id) {
  if (!id) return '';
  const l = D.ph.filter(p => p.owner_type === type && p.owner_id === id);
  for (let i = l.length - 1; i >= 0; i--) { const u = urls.get(thumbOf(l[i].path)); if (u) return u; } // newest first
  return '';
}
const avAnimal = a => a ? avPhoto('bird', a.id) : '';
const avPlace = p => p ? avPhoto('encl', p.id) : '';
const avPic = a => a ? (avAnimal(a) || avSpecies(a.species_id)) : ''; // no photo on the animal card — the species photo
function avFor(av) {
  const f = typeof F === 'function' ? F() : null;
  if (av.closest('.avs')) { const l = f && typeof tgt === 'function' ? tgt() : []; return avPic(l[[...av.parentNode.children].indexOf(av)]); }
  let h = av.closest('[data-ani]'); if (h) return avPic(anById(h.dataset.ani));
  h = av.closest('[data-plc],[data-pickplc]'); if (h) return avPlace(plById(h.dataset.plc || h.dataset.pickplc));
  h = av.closest('[data-mvto]'); if (h) return avPlace(plByName(h.dataset.mvto));
  h = av.closest('.inj, .wrow');
  if (h) { for (const id of h.outerHTML.match(UUID_RE) || []) { const a = anById(id); if (a) return avPic(a); } return ''; }
  if (av.closest('.ahero')) return st.scr === 'card' ? avPic(anById(st.ani)) : st.scr === 'pcard' ? avPlace(plById(st.plc)) : '';
  if (av.closest('.bl-whochip') && f) return f.target === 'animal' ? avPic((typeof tgt === 'function' ? tgt() : [])[0]) : f.target === 'place' ? avPlace(plById(f.plc)) : '';
  return '';
}
function fillAvatars() {
  if (!(D.ph && D.ph.length) && !(D.sp && D.sp.size)) return;
  document.querySelectorAll('#app .bl-av').forEach(av => {
    const u = avFor(av); if (!u) return;
    av.classList.add('photo'); av.innerHTML = `<img src="${esc(u)}" alt="" loading="lazy">`;
  });
  // species tiles: species photo (Commons or own), else the photo of the first animal of that species
  document.querySelectorAll('#app .bl-who[data-sp] .bl-av:not(.photo)').forEach(av => {
    const id = av.closest('[data-sp]').dataset.sp, a = D.an.find(x => x.species_id === id && avAnimal(x));
    const u = avSpecies(id) || avAnimal(a); if (!u) return;
    av.classList.add('photo'); av.innerHTML = `<img src="${esc(u)}" alt="" loading="lazy">`;
  });
  // journal: record photo → species / animal photo → enclosure photo; the kind icon moves to the corner
  document.querySelectorAll('#app .bl-rec[data-rec] > .bl-badge:not(.phb)').forEach(b => {
    const u = avRecord(D.rec.find(x => x.id === b.parentNode.dataset.rec)); if (!u) return;
    b.classList.add('phb'); b.innerHTML = `<img src="${esc(u)}" alt="" loading="lazy"><i class="kb">${b.innerHTML}</i>`;
  });
}
function avSpecies(id) { const s = spBy(id), w = s && spInfo(s).photo; return (w && (w.thumb || w.src)) || avPhoto('species', id); }
function avRecord(r) {
  if (!r) return '';
  let u = avPhoto('record', r.id); if (u) return u;
  const a = D.an.find(x => key(x.name) === key(r.bird || ''));
  if (a) { u = avSpecies(a.species_id) || avAnimal(a); if (u) return u; }
  return avPlace(plByName(r.bird || '') || ((r.f || {}).place ? plByName(r.f.place) : null));
}
addEventListener('DOMContentLoaded', () => {
  const _renderA = render;
  render = function () { _renderA(); fillAvatars(); };
});
document.head.insertAdjacentHTML('beforeend', '<style>.bl-av.photo{background:var(--soft);padding:0}.bl-av.photo img{width:100%;height:100%;object-fit:cover;display:block}'
  // species list: square tiles, two per row; journal: bigger badge, photo instead of the icon, kind icon in the corner
  + '.stack:has(> [data-sp]){display:grid;grid-template-columns:1fr 1fr;gap:12px}.stack>.bl-who[data-sp]{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:0;padding:0;border:1px solid var(--line);border-radius:16px;background:var(--card);overflow:hidden}.stack>.bl-who[data-sp] .bl-av{width:100%;height:auto;aspect-ratio:1/1;border-radius:0;font-size:28px}.stack>.bl-who[data-sp]>span:nth-child(2){padding:8px 10px 10px;min-width:0}.stack>.bl-who[data-sp] b{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.stack>.bl-who[data-sp] small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stack>.bl-who[data-sp] .sx{position:absolute;top:8px;right:8px;display:flex;gap:4px;align-items:center;padding:4px 7px;border-radius:999px;background:rgba(255,255,255,.9);color:var(--ink)}.stack>.bl-who[data-sp] .sx:empty{display:none}.bl-rec>.bl-badge.sm{width:54px;height:54px;border-radius:16px}.bl-badge.phb{position:relative;overflow:visible}.bl-badge.phb>img{width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}.bl-badge.phb>.kb{position:absolute;right:-6px;bottom:-6px;width:22px;height:22px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:inherit;color:inherit;box-shadow:0 0 0 2px var(--card)}.bl-badge.phb>.kb svg{width:13px;height:13px}</style>');
