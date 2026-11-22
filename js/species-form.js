// species-form.js — species form: open, save, delete
function openSpForm(s) {
  if (!canWrite()) return;
  editingSp = s || null; spDelArmed = false;
  $('#sp-f-title').textContent = s ? t('spf_edit') : t('spf_new');
  $('#sp-f-sub').textContent = s ? t('editing') : t('spf_sub_new');
  for (const k of SPF) $('#sp-' + k).value = s ? s[k] : '';
  $('#sp-note').value = s ? s.note : '';
  const inf0 = s ? s.info || {} : {}, locked = Array.isArray(inf0.locked) ? inf0.locked : [];
  $('#sp-info-fields').innerHTML = infoFields(inf0);
  // a lock inside each name field and the notes, plus "protect the whole card" at the top
  addLocks($('#sp-form'), Object.fromEntries(Object.entries(Object.assign({note: 'note'}, SP_LOCK)).map(([id, k]) => ['sp-' + id, k])), locked, 'lk_hint');
  // the description texts are edited one language at a time
  spTr = {}; spFL = lang;
  for (const k of TRK) { const o = trObj(inf0[k]); if (o) spTr[k] = JSON.parse(JSON.stringify(o)); }
  $$('#sp-form .tr-switch').forEach(x => x.remove());
  $('#sp-info-fields').insertAdjacentHTML('beforebegin', `<div class="tr-switch"><span class="tr-l">${esc(t('tr_lang'))}</span><div class="seg" role="group">${LANG_ORDER.map(l => `<button type="button" data-trl="${l}" aria-pressed="${l === spFL}">${l.toUpperCase()}</button>`).join('')}</div><p class="hint">${esc(t('tr_hint'))}</p></div>`);
  $$('#sp-form [data-trl]').forEach(b => b.addEventListener('click', () => { stashTr(); spFL = b.dataset.trl; $$('#sp-form [data-trl]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); fillTr(); }));
  fillTr();
  $('#sp-more').open = !s;
  $('#sp-err').textContent = '';
  const d = $('#sp-del'); d.hidden = !s || !isAdmin(); d.textContent = t('del_sp');
  const wikiNow = () => { const src = ($('#sfi-photo-src').value || '').trim(); return /^https:\/\//.test(src) ? {src, thumb: src === ((inf0.photo || {}).src) ? inf0.photo.thumb : ''} : null; };
  phSp = photoBox('sp-ph', 'species', s ? s.id : null, true, {main: inf0.main || '', wiki: wikiNow,
    onWikiRm: () => ['photo-src', 'photo-credit', 'photo-page'].forEach(k => { $('#sfi-' + k).value = ''; }),
    lockMain: () => !isAdmin() && locked.includes('photo')});
  $('#sfi-photo-src').addEventListener('change', () => phSp.redraw());
  openSheet('sp');
}
$('#sp-form').addEventListener('submit', async e => {
  e.preventDefault();
  const err = m => { $('#sp-err').textContent = m; };
  const v = {};
  for (const k of SPF) v[k] = $('#sp-' + k).value.trim();
  if (!SPF.some(k => v[k])) return err(t('e_spname'));
  if (species.some(x => (!editingSp || x.id !== editingSp.id) && SPF.some(k => v[k] && key(x[k]) === key(v[k])))) return err(t('e_spdup'));
  if (phSp && phSp.busy) return;
  v.note = $('#sp-note').value.trim();
  stashTr();
  await withBusy($('#sp-save'), async () => {
    try {
      if (TRK.some(k => spTr[k] && spTr[k]._dirty)) err(t('tr_busy'));
      const trFail = await translateDirty();
      err('');
      if (trFail) toast(t('tr_fail'));
      v.info = readInfo(editingSp ? editingSp.info : {});
      const wasEdit = !!editingSp, id = wasEdit ? editingSp.id : uuid();
      await putSp(id, v, !wasEdit);
      if (phSp && (phSp.added.length || phSp.removed.length)) err(t('ph_saving'));
      const failed = await commitPhotos(phSp, id);
      closeSheets();
      toast(failed ? t('e_photo', failed) : wasEdit ? t('t_card_upd') : t('t_sp_added'));
      openCard('sp', id);
      render();
    } catch (x) { err(errMsg(x)); }
  });
});
$('#sp-del').addEventListener('click', async () => {
  if (!editingSp || !isAdmin()) return;
  const n = recs.filter(r => r.sp === editingSp.id).length;
  if (!spDelArmed) { spDelArmed = true; $('#sp-del').textContent = n ? t('del_sp_n', n) : t('del_confirm'); return; }
  try { await dropSp(editingSp.id); closeSheets(); render(); toast(t('t_sp_del')); setTab('species'); }
  catch (x) { $('#sp-err').textContent = errMsg(x); }
});
