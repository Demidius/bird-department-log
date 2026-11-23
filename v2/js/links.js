// links.js — v2: one sign for «go to another card» — an ↗ arrow in a small circle (a «›» chevron stays for opening / paging).
// Card cells naming an enclosure or a species («Enclosure» of an animal, «Part of» of an enclosure …) and the place plate
// of a record card open that card. Rows inside cards that lead to another card get the same arrow.
const GO_ARROW = s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>`;
const goLink = (el, kind, id) => { el.dataset.go = kind + ':' + id; el.classList.add('golink'); if (!el.querySelector('.gochev')) el.insertAdjacentHTML('beforeend', `<em class="gochev">${GO_ARROW(15)}</em>`); };
const plByText = t => D.pl.find(x => plName(x) === t || x.name === t);
const spByText = t => [...D.sp.values()].find(x => spName(x) === t || x.latin === t);
function markLinks() {
  if (!document.querySelector('.cardscr')) return;
  document.querySelectorAll('.cardscr button.bl-whochip > em:not(.goic)').forEach(em => { em.className = 'goic'; em.innerHTML = GO_ARROW(15); });
  document.querySelectorAll('.cardscr .splink .lat > svg').forEach(sv => { sv.outerHTML = `<em class="goic">${GO_ARROW(12)}</em>`; });
  document.querySelectorAll('.cardscr :is(button.bl-who, button.lnkb):is([data-ani], [data-plc], [data-sp])').forEach(b => { if (!b.querySelector('.goic')) b.insertAdjacentHTML('beforeend', `<em class="goic">${GO_ARROW(13)}</em>`); });
  document.querySelectorAll('.cardscr .bl-facts > div').forEach(d => {
    const dd = d.querySelector('dd'), t = dd ? dd.textContent.trim() : ''; if (!t || t === '—') return;
    const p = plByText(t); if (p && !(st.scr === 'pcard' && p.id === st.plc)) return goLink(d, 'plc', p.id);
    const s = spByText(t); if (s && !(st.scr === 'scard' && s.id === st.sp)) return goLink(d, 'sp', s.id);
  });
  if (st.scr === 'rcard') {
    const c = document.querySelector('.cardscr div.bl-whochip'), r = D.rec.find(x => x.id === st.rec);
    const p = c && r && (plByName((r.f || {}).place || '') || plByName(r.bird || '')); if (p) goLink(c, 'plc', p.id);
  }
}
addEventListener('DOMContentLoaded', () => { const _renderL = render; render = function () { _renderL(); markLinks(); }; });
document.addEventListener('click', e => {
  const el = e.target.closest('[data-go]'); if (!el || e.target.closest('button')) return;
  const [k, id] = el.dataset.go.split(':');
  if (k === 'plc') go({scr: 'pcard', plc: id}); else if (k === 'sp') { go({scr: 'scard', sp: id, spTab: 'zoo'}); st.acc = new Set(); }
});
document.head.insertAdjacentHTML('beforeend', '<style>.golink{position:relative;cursor:pointer}.bl-facts .golink{padding-right:44px}.golink:active{filter:brightness(.96)}'
  + '.golink .gochev{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;background:color-mix(in srgb, var(--accent) 14%, transparent);color:var(--accent)}'
  + '.golink dd{text-decoration:underline;text-decoration-color:color-mix(in srgb, var(--accent) 45%, transparent);text-underline-offset:3px}'
  + '.goic{display:inline-flex;align-items:center;justify-content:center;flex:none;width:26px;height:26px;border-radius:999px;background:color-mix(in srgb, var(--accent) 14%, transparent);color:var(--accent);font-style:normal}'
  + '.splink .goic{width:20px;height:20px;vertical-align:middle;margin-left:2px}.cardscr button.bl-who:has(>.goic){grid-template-columns:auto 1fr auto auto}.cardscr button.bl-who>.goic{width:24px;height:24px}.lnkb .goic{width:18px;height:18px;margin-left:3px;vertical-align:middle}</style>');
