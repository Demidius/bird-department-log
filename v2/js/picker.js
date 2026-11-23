// picker.js — v2: «Which animal?» list in the add flow: sort switch on top (by enclosure / by name / favourites),
// the enclosure on every row, a star on the right to add the animal to favourites.
// Favourites are kept on this device for the signed-in user (store 'v2fav-<user id>').
const FAV_STAR = on => `<svg viewBox="0 0 24 24" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/></svg>`;
const favs = () => { try { return new Set(JSON.parse(store.get('v2fav-' + me) || '[]')); } catch (x) { return new Set(); } };
const setFavs = s => store.set('v2fav-' + me, JSON.stringify([...s]));
const anPlaceName = a => { const e = anEncl(a); return e ? (plName(plByName(e)) || e) : ''; };

const _animalRowsP = animalRows;
animalRows = function (list, checks) {
  if (!checks) return _animalRowsP(list, checks);
  const fv = favs();
  return _animalRowsP(list, checks).split('<div class="wrow">').map((h, i) => {
    if (!i) return h; const a = list[i - 1], on = fv.has(a.id), p = anPlaceName(a);
    if (p) h = h.replace('</small></span></button>', `</small><em class="wpl">${esc(p)}</em></span></button>`);
    return h.replace(/(<button class="ck[^"]*" data-ck=)/, `<button class="fav ${on ? 'on' : ''}" data-fav="${a.id}" aria-pressed="${on}" aria-label="${L('Ulubione', 'Избранное', 'Favourite')}">${FAV_STAR(on)}</button>$1`);
  }).join('<div class="wrow">');
};
const _animalsByPlaceP = animalsByPlace;
animalsByPlace = function (checks, q) {
  const m = st.wsort || 'place'; if (!checks || m === 'place') return _animalsByPlaceP(checks, q);
  const fv = favs();
  const list = anActive().filter(a => (m !== 'fav' || fv.has(a.id)) && (!q || key(anLine(a) + ' ' + a.name + ' ' + a.ring + ' ' + anEncl(a) + ' ' + ((spBy(a.species_id) || {}).latin || '')).includes(q)))
    .sort((a, b) => anLine(a).localeCompare(anLine(b), undefined, {numeric: true}));
  if (!list.length) return `<p class="empty">${m === 'fav' ? L('Brak ulubionych — dotknij ☆ przy zwierzęciu', 'Нет избранных — нажми ☆ у животного', 'No favourites — tap ☆ next to an animal') : L('Nic nie znaleziono', 'Ничего не найдено', 'Nothing found')}</p>`;
  return `<div class="bl-pg pgck"><span>${m === 'fav' ? L('Ulubione', 'Избранные', 'Favourites') : L('Wszystkie wg nazwy', 'Все по названию', 'All by name')}</span><span class="pgr">${list.length}</span></div>${animalRows(list, checks)}`;
};
const _stepWhoP = stepWho;
stepWho = function () {
  const m = st.wsort || 'place', b = (k, t) => `<button data-wsort="${k}" aria-pressed="${m === k}">${t}</button>`;
  const bar = `<div class="wsort">${b('place', L('Woliera', 'Вольер', 'Enclosure'))}${b('name', L('Nazwa', 'Название', 'Name'))}${b('fav', FAV_STAR(m === 'fav').replace('<svg', '<svg width="15" height="15"') + L('Ulubione', 'Избранные', 'Favourites'))}</div>`;
  return _stepWhoP().replace('<div class="plist">', bar + '<div class="plist">');
};
document.addEventListener('click', e => {
  const s = e.target.closest('[data-wsort]'), f = e.target.closest('[data-fav]'); if (!s && !f) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (s) st.wsort = s.dataset.wsort;
  else { const v = favs(), id = f.dataset.fav; v.has(id) ? v.delete(id) : v.add(id); setFavs(v); }
  const sc = document.querySelector('.shbody'), y = sc ? sc.scrollTop : 0; render();
  const sc2 = document.querySelector('.shbody'); if (sc2 && f) sc2.scrollTop = y;
}, true);
document.head.insertAdjacentHTML('beforeend', '<style>.wsort{display:flex;gap:6px;margin:-2px 0 2px}.wsort button{flex:1;min-height:36px;border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--ink-2);font:600 13px/1 var(--font-text);display:inline-flex;align-items:center;justify-content:center;gap:5px;cursor:pointer}.wsort button[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:var(--card)}.wrow .fav{flex:none;width:40px;height:40px;border:0;background:none;display:flex;align-items:center;justify-content:center;color:var(--muted);cursor:pointer;padding:0}.wrow .fav.on{color:#e8a317}.wrow .fav svg{width:24px;height:24px}.bl-who .wpl{display:block;font:500 12.5px/1.3 var(--font-text);font-style:normal;color:var(--accent)}</style>');
