// places.js — housing place form
/* ---------- housing places ---------- */
function openEnclForm(x, parentId) {
  if (!canWrite()) return;
  editingEncl = x || null; enclDelArmed = false;
  $('#ef-title').textContent = x ? x.name : t('ef_new');
  $('#ef-sub').textContent = x ? t('editing') : t('ef_sub_new');
  const par = parentId ? enclMap.get(parentId) : null;
  const v = x || {kind: par ? ({building: 'room', room: 'enclosure'}[par.kind] || 'enclosure') : ek !== 'all' && ek !== 'off' ? ek : 'enclosure', active: true, parent: par ? par.id : ''};
  const banned = x ? new Set([x.id].concat(descOf(x).map(z => z.id))) : new Set();
  const parOpts = treeOrder(encls.filter(z => !banned.has(z.id) && (z.active || z.id === v.parent))).map(([z, d]) =>
    `<option value="${esc(z.id)}"${z.id === v.parent ? ' selected' : ''}>${INDENT(d)}${esc(dn(z))} · ${esc(t('ek_' + z.kind))}</option>`).join('');
  const opt = (val, cur, label) => `<option value="${val}"${val === cur ? ' selected' : ''}>${esc(label)}</option>`;
  $('#ef-fields').innerHTML = field({k: 'name', l: 'ef_name', t: 'text', req: 1, id: 'ef-name', ph: 'ef_name_ph', ac: 'off'}, v.name) + namesEditor(v.names)
    + `<div class="fld"><label for="ef-kind">${esc(t('ef_kind'))}</label><select id="ef-kind" name="kind">${EK.map(k => opt(k, v.kind, t('ek_' + k))).join('')}</select></div>`
    + `<div class="fld"><label for="ef-parent">${esc(t('ef_parent'))}</label><select id="ef-parent" name="parent"><option value="">${esc(t('ef_top'))}</option>${parOpts}</select></div>`
    + field({k: 'area', l: 'ef_area', t: 'text', id: 'ef-area', ph: 'ef_area_ph'}, v.area)
    + field({k: 'size', l: 'ef_size', t: 'text', id: 'ef-size', ph: 'ef_size_ph'}, v.size)
    + field({k: 'cap', l: 'ef_cap', t: 'number', id: 'ef-cap', min: 1}, v.cap || '')
    + (x ? `<div class="fld"><label for="ef-state">${esc(t('ef_state'))}</label><select id="ef-state" name="state">${opt('on', x.active ? 'on' : 'off', t('ef_on'))}${opt('off', x.active ? 'on' : 'off', t('ef_off'))}</select></div>` : '')
    + field({k: 'note', l: 'ef_note', t: 'textarea', id: 'ef-note'}, v.note);
  $('#ef-note').placeholder = t('ef_note_ph');
  $('#ef-err').textContent = '';
  const d = $('#ef-del'); d.hidden = !x || !isAdmin(); d.textContent = t('del_encl');
  phEncl = photoBox('ef-ph', 'encl', x ? x.id : null, true);
  addLocks($('#encl-form'), ENCL_LOCK, x ? x.locked || [] : [], 'lk_hint_g');
  openSheet('encl');
}
$('#encl-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = formData(e.target), err = m => { $('#ef-err').textContent = m; }, g = k => String(fd.get(k) || '').trim(), old = editingEncl;
  const name = g('name').replace(/\s+/g, ' ');
  if (!name) return err(t('e_ename'));
  if (encls.some(x => key(x.name) === key(name) && (!old || x.id !== old.id))) return err(t('e_edup'));
  if (phEncl && phEncl.busy) return;
  const x = {name, kind: EK.includes(g('kind')) ? g('kind') : 'other', area: g('area'), size: g('size'), cap: Math.min(10000, toN(g('cap'))),
    active: old ? g('state') !== 'off' : true, note: g('note'), parent: enclMap.has(g('parent')) ? g('parent') : '', names: readNames(fd), locked: lockList(e.target, ENCL_LOCK)};
  if (old && x.parent && (x.parent === old.id || descOf(old).some(z => z.id === x.parent))) return err(t('e_cycle'));
  await withBusy($('#ef-save'), async () => {
    try {
      const id = old ? old.id : uuid();
      await putEncl(id, x, !old);
      if (phEncl && (phEncl.added.length || phEncl.removed.length)) err(t('ph_saving'));
      const failed = await commitPhotos(phEncl, id);
      if (old && old.name !== name) await Promise.all([LOADERS.collection(), LOADERS.records()]);
      closeSheets();
      toast(failed ? t('e_photo', failed) : old ? t('t_card_upd') : t('t_encl_added'));
      openCard('encl', id);
      render();
    } catch (y) { err(y && y.code === '23505' ? t('e_edup') : y && y.code === '23514' ? t('e_cycle') : errMsg(y)); }
  });
});
$('#ef-del').addEventListener('click', async () => {
  if (!editingEncl || !isAdmin()) return;
  const n = occOf(editingEncl).length, nk = kidsOf(editingEncl.id).length;
  if (!enclDelArmed) { enclDelArmed = true; $('#ef-del').textContent = n ? t('del_encl_n', n) : nk ? t('del_encl_kids', nk) : t('del_confirm'); return; }
  try { await dropEncl(editingEncl.id); if (nk) await LOADERS.enclosures(); closeSheets(); render(); toast(t('t_encl_del')); setTab('encls'); }
  catch (y) { $('#ef-err').textContent = errMsg(y); }
});
