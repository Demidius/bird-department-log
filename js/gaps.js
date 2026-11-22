// gaps.js — missing data screen
/* ---------- missing data in species cards ---------- */
// kinds of data: [key, label, where it lives, only for this group]
const GAPS = [['latin', 'spf_latin', 'col'], ['pl', 'spf_pl', 'col'], ['en', 'spf_en', 'col'], ['name', 'spf_ru', 'col'], ['photo', 'gap_photo', 'photo'],
  ['iucn', 'sf_iucn', 'val'], ['order', 'sf_order', 'val'], ['family', 'sf_family', 'val'], ['size', 'si_size', 'txt'], ['life', 'si_life', 'txt'],
  ['incub_days', 'si_incub', 'num', 'bird'], ['fledge_days', 'si_fledge', 'num', 'bird'], ['gest_days', 'si_gest', 'num', 'mammal'],
  ['range', 'si_range', 'txt'], ['habitat', 'si_habitat', 'txt'], ['diet_wild', 'si_diet_wild', 'txt'], ['behaviour', 'si_behaviour', 'txt'], ['breeding', 'si_breeding', 'txt'],
  ['diet_zoo', 'si_diet_zoo', 'txt'], ['husbandry', 'si_husbandry', 'txt'], ['health', 'si_health', 'txt'], ['sex', 'si_sex', 'txt']];
const hasTxt = v => typeof v === 'string' ? !!v.trim() : !!(v && typeof v === 'object' && LANG_ORDER.some(l => typeof v[l] === 'string' && v[l].trim()));
function gapMissing(sp, g) {
  const [k, , w, grp] = g, inf = spInfo(sp);
  if (grp && spGroup(sp) !== grp) return false;
  if (w === 'col') return !String(sp[k] || '').trim();
  if (w === 'photo') return !(inf.photo && inf.photo.src) && !photosOf('species', sp.id).length;
  if (w === 'num') return !(toN(inf[k]) > 0);
  return !hasTxt(inf[k]);
}
let gapsOpen = new Set();
function renderGaps() {
  const box = $('#gaps-body'); if (!box) return;
  const rows = GAPS.map(g => ({g, list: species.filter(sp => gapMissing(sp, g)).sort(bySp)}));
  const withGaps = rows.filter(r => r.list.length);
  $('#gaps-count').textContent = species.length ? t('gaps_menu', withGaps.length) : '';
  box.innerHTML = withGaps.concat(rows.filter(r => !r.list.length)).map(({g, list}) => {
    const [k, l, , grp] = g, sub = grp ? ' · ' + t(grp === 'bird' ? 'gaps_birds' : 'gaps_mammals') : '';
    if (!list.length) return `<div class="gap gap-ok"><span class="gap-h"><b>${esc(t(l))}</b><small>${esc(t('gaps_full') + sub)}</small></span>${ic('check', 18, 2.4)}</div>`;
    return `<details class="gap" data-gap="${k}"${gapsOpen.has(k) ? ' open' : ''}><summary><span class="gap-h"><b>${esc(t(l))}</b>${sub ? `<small>${esc(sub.slice(3))}</small>` : ''}</span><span class="nc">${list.length}</span></summary>`
      + `<div class="gap-list">${list.map(sp => `<button class="row" type="button" data-gap-sp="${esc(sp.id)}" data-gap-k="${k}"><span class="rt"><b>${esc(spName(sp))}</b>${sp.latin && sp.latin !== spName(sp) ? `<small><i>${esc(sp.latin)}</i></small>` : ''}</span><span class="chev">${ic('chev', 18)}</span></button>`).join('')}</div></details>`;
  }).join('');
  $$('#gaps-body details').forEach(d => d.addEventListener('toggle', () => { if (d.open) gapsOpen.add(d.dataset.gap); else gapsOpen.delete(d.dataset.gap); }));
}
// opens the species form at the missing field (staff) or the species card (read-only)
function openGap(id, k) {
  const sp = spById(id); if (!sp) return;
  if (!canWrite()) { openCard('sp', id); return; }
  openSpForm(sp);
  const g = GAPS.find(x => x[0] === k) || [];
  if (g[2] !== 'col') $('#sp-more').open = true;
  const el = g[2] === 'col' ? $('#sp-' + k) : g[2] === 'photo' ? $('#sp-ph') || $('#sfi-photo-src') : $('#' + sifId(k));
  const f = el && (el.closest('.fld') || el);
  if (f) setTimeout(() => { f.scrollIntoView({block: 'center'}); f.classList.add('flash'); setTimeout(() => f.classList.remove('flash'), 2400); }, 320);
}
