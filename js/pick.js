// pick.js — searchable list for long selects, search fields
/* ---------- searchable list for long selects ---------- */
// a select with many options opens a list with a search box; the keyboard only shows up when the box is tapped
const PICK_MIN = 6;
let pickSel = null;
const pickable = s => s && s.tagName === 'SELECT' && !s.disabled && s.options.length > PICK_MIN;
const pickNorm = v => key(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
function pickRender() {
  const q = pickNorm($('#pick-q').value), sel = pickSel;
  // "choose", "new species", "other" stay visible while searching
  const rows = [...sel.options].map((o, i) => ({o, i})).filter(({o}) => !o.disabled && (!q || !o.value || o.value.startsWith('__') || pickNorm(o.textContent + ' ' + (o.dataset.s || '')).includes(q)));
  const real = rows.filter(({o}) => o.value && !o.value.startsWith('__')).length;
  $('#pick-list').innerHTML = rows.map(({o, i}) => `<button type="button" class="pick-o${o.selected ? ' on' : ''}${!o.value || o.value.startsWith('__') ? ' sp' : ''}" role="option" aria-selected="${o.selected}" data-pi="${i}">${esc(o.textContent)}</button>`).join('')
    + (q && !real ? `<p class="empty">${esc(t('none_found'))}</p>` : '');
}
function openPick(sel) {
  pickSel = sel;
  const lab = sel.id && $(`label[for="${CSS.escape(sel.id)}"]`), q = $('#pick-q');
  $('#pick-t').textContent = ((lab ? lab.textContent : sel.getAttribute('aria-label')) || '').replace(/[\s\u00a0]*\*$/, '');
  q.value = ''; q.placeholder = t('pick_ph');
  pickRender();
  $('#pick').hidden = false;
  $('#pick .pick-box').focus({preventScroll: true});
  const on = $('#pick-list .on'); if (on) on.scrollIntoView({block: 'center'});
}
function closePick(back) { if (!pickSel) return; const s = pickSel; pickSel = null; $('#pick').hidden = true; if (back) s.focus({preventScroll: true}); }
$('#pick-q').addEventListener('input', pickRender);
$('#pick-list').addEventListener('click', e => {
  const b = e.target.closest('[data-pi]'); if (!b || !pickSel) return;
  const s = pickSel; s.selectedIndex = +b.dataset.pi; closePick(true);
  s.dispatchEvent(new Event('input', {bubbles: true})); s.dispatchEvent(new Event('change', {bubbles: true}));
});
$('#pick-x').addEventListener('click', () => closePick(true));
$('#pick').addEventListener('click', e => { if (e.target.id === 'pick') closePick(true); });
// a tap (not a scroll) on a long select opens the list instead of the system one
let pickTouch = null;
document.addEventListener('touchstart', e => { const s = e.target.closest && e.target.closest('select'); pickTouch = pickable(s) ? {s, x: e.touches[0].clientX, y: e.touches[0].clientY} : null; }, {passive: true, capture: true});
document.addEventListener('touchend', e => {
  const p = pickTouch; pickTouch = null; if (!p) return;
  const c = e.changedTouches[0]; if (Math.abs(c.clientX - p.x) > 10 || Math.abs(c.clientY - p.y) > 10) return;
  e.preventDefault(); openPick(p.s);
}, {capture: true});
document.addEventListener('mousedown', e => { const s = e.target.closest && e.target.closest('select'); if (pickable(s)) { e.preventDefault(); openPick(s); } }, true);
document.addEventListener('keydown', e => { const s = e.target; if (pickable(s) && (e.key === 'Enter' || e.key === ' ' || (e.altKey && e.key === 'ArrowDown'))) { e.preventDefault(); openPick(s); } }, true);

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (pickSel) { e.stopPropagation(); closePick(true); return; }
  if (askDone) askDone(false); else if (!$('#lightbox').hidden) closeLightbox(); else if ($('.sheet.open')) requestClose();
});
[['#form', '#f-err'], ['#encl-form', '#ef-err'], ['#sp-form', '#sp-err'], ['#bird-form', '#bf-err'], ['#user-form', '#uf-err'], ['#pass-form', '#pf-err'], ['#login-form', '#lg-err']]
  .forEach(([f, er]) => $(f).addEventListener('input', () => { $(er).textContent = ''; }));
$('#q').addEventListener('input', e => { q = key(e.target.value); renderLogs(); paintPhotos(); });
$('#sq').addEventListener('input', e => { sq = key(e.target.value); renderSpecies(); });
$('#cq').addEventListener('input', e => { cq = key(e.target.value); renderColl(); paintPhotos(); });
$('#eq').addEventListener('input', e => { eq = key(e.target.value); renderEncls(); });
