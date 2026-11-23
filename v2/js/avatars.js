// avatars.js — v2: the round avatar of an animal / enclosure shows its newest card photo instead of the letters
// (animal: photos added on the animal card; enclosure: photos of the enclosure). No photo — letters / icon stay.
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
function avFor(av) {
  const f = typeof F === 'function' ? F() : null;
  if (av.closest('.avs')) { const l = f && typeof tgt === 'function' ? tgt() : []; return avAnimal(l[[...av.parentNode.children].indexOf(av)]); }
  let h = av.closest('[data-ani]'); if (h) return avAnimal(anById(h.dataset.ani));
  h = av.closest('[data-plc],[data-pickplc]'); if (h) return avPlace(plById(h.dataset.plc || h.dataset.pickplc));
  h = av.closest('[data-mvto]'); if (h) return avPlace(plByName(h.dataset.mvto));
  h = av.closest('.inj, .wrow');
  if (h) { for (const id of h.outerHTML.match(UUID_RE) || []) { const a = anById(id); if (a) return avAnimal(a); } return ''; }
  if (av.closest('.ahero')) return st.scr === 'card' ? avAnimal(anById(st.ani)) : st.scr === 'pcard' ? avPlace(plById(st.plc)) : '';
  if (av.closest('.bl-whochip') && f) return f.target === 'animal' ? avAnimal((typeof tgt === 'function' ? tgt() : [])[0]) : f.target === 'place' ? avPlace(plById(f.plc)) : '';
  return '';
}
function fillAvatars() {
  if (!D.ph || !D.ph.length) return;
  document.querySelectorAll('#app .bl-av').forEach(av => {
    const u = avFor(av); if (!u) return;
    av.classList.add('photo'); av.innerHTML = `<img src="${esc(u)}" alt="" loading="lazy">`;
  });
}
addEventListener('DOMContentLoaded', () => {
  const _renderA = render;
  render = function () { _renderA(); fillAvatars(); };
});
document.head.insertAdjacentHTML('beforeend', '<style>.bl-av.photo{background:var(--soft);padding:0}.bl-av.photo img{width:100%;height:100%;object-fit:cover;display:block}</style>');
