// forms.js — record form, offspring card offer, parents, animal (collection) form
/* ---------- forms ---------- */
$('#form').addEventListener('submit', async e => {
  e.preventDefault();
  if (editing && !canEditRec(editing)) return;
  const tp = T[curType], fd = new FormData(e.target), err = m => { $('#f-err').textContent = m; };
  const spSel = String(fd.get('sp') || ''), newName = String(fd.get('newsp') || '').trim();
  if (!spSel) return err(t('e_pick_sp'));
  if (spSel === '__new' && !newName) return err(t('e_new_sp'));
  const bird = canonBird(String(fd.get('bird') || '').trim());
  if (!bird) return err(t('e_bird'));
  const dt = String(fd.get('date') || ''), tm = $('#fld-time-wrap').hidden ? '' : String(fd.get('time') || '');
  const at = /^\d{4}-\d{2}-\d{2}$/.test(dt) ? fromInput(dt + 'T' + (/^\d{2}:\d{2}/.test(tm) ? tm.slice(0, 5) : '12:00')) : NaN;
  if (!isFinite(at)) return err(t('e_at'));
  const f = {}, fresh = [];
  if (!/^\d{2}:\d{2}/.test(tm)) f.nt = 1;
  for (const x of tp.fields) {
    let val = String(fd.get(x.k) || '').trim();
    if (curType === 'expo') { const pe = readEncl(fd, x.k); if (pe.err) return err(pe.err); val = pe.name; if (pe.fresh) fresh.push(x.k); }
    if (x.req && !val) return err(t('e_field', t(x.l)));
    if (val) f[x.k] = x.t === 'number' ? Math.max(x.min || 0, toN(val)) : val;
  }
  const note = String(fd.get('note') || '').trim();
  if (tp.noteReq && !note) return err(t('e_obs'));
  if (phRec && phRec.busy) return;
  await withBusy($('#f-save'), async () => {
    try {
      const r = {type: curType, sp: spSel, bird, at, f, note};
      if (spSel === '__new') r.sp = await ensureSpecies(newName);
      for (const k of fresh) r.f[k] = await ensureEncl(r.f[k]);
      const id = editing ? editing.id : uuid(), wasEdit = !!editing;
      await putRec(id, r, !wasEdit);
      if (phRec && (phRec.added.length || phRec.removed.length)) err(t('ph_saving'));
      const failed = await commitPhotos(phRec, id);
      closeSheets(); render();
      toast(failed ? t('e_photo', failed) : wasEdit ? t('t_updated') : t('t_saved'));
      if (!wasEdit && (r.type === 'hatch' || r.type === 'birth')) offerKid(r);
    } catch (x) { err(errMsg(x)); }
  });
});

$('#f-del').addEventListener('click', async () => {
  if (!editing || !canEditRec(editing)) return;
  if (!delArmed) { delArmed = true; $('#f-del').textContent = t('del_confirm'); return; }
  try { await dropRec(editing.id); closeSheets(); render(); toast(t('t_deleted')); }
  catch (x) { $('#f-err').textContent = errMsg(x); }
});

// after a hatching or a birth: offer a collection card for the young, filled from the record and its parent
async function offerKid(r) {
  const n = r.f.n || 1, par = collByName.get(key(r.bird));
  if (!await ask(t('kid_t'), t('kid_p', n, par ? dn(par) : ''), t('kid_yes'), t('kid_no'))) return;
  const d = new Date(r.at), p2 = x => String(x).padStart(2, '0');
  openBirdForm(null, {sp: r.sp, born: d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()), parents: par ? [par.id] : [],
    grp: n > 1 ? {m: 0, f: 0, u: 0, j: n} : null, encl: par ? placeOf(par).name : ''});
}
// parents: any number of collection cards, groups included (when the exact parent is unknown)
const paOpts = (self, cur) => `<option value="">${esc(t('bird_pick'))}</option>` + [...coll].filter(b => b.id !== self).sort((a, b) => (spName(spById(a.sp)) || '').localeCompare(spName(spById(b.sp)) || '', LOCALE[lang]) || byName(a, b))
  .map(b => `<option value="${esc(b.id)}"${b.id === cur ? ' selected' : ''}>${esc(dn(b) + (b.grp ? ' (' + t('grp_w') + ')' : '') + (spById(b.sp) ? ' · ' + spName(spById(b.sp)) : '') + (b.status === 'out' ? ' · ' + t('st_out') : ''))}</option>`).join('');
const paRow = (self, cur) => `<div class="pa-row"><select name="pa" aria-label="${esc(t('bf_parents'))}">${paOpts(self, cur)}</select><button type="button" class="x" data-pa-rm aria-label="${esc(t('pa_rm'))}">${ic('x', 18, 2.2)}</button></div>`;
const parentsEditor = (self, list) => `<div class="fld pa-ed"><span class="lbl">${esc(t('bf_parents'))}</span><div class="pa-rows" data-self="${esc(self || '')}">${(list || []).map(id => paRow(self, id)).join('')}</div><button type="button" class="mini ghost" id="parents" data-pa-add>${esc('+ ' + t('pa_add'))}</button><p class="hint">${esc(t('pa_hint'))}</p></div>`;

function openBirdForm(cb, pre) {
  if (!canWrite()) return;
  editingBird = cb || null; birdDelArmed = false;
  $('#bf-title').textContent = cb ? t('bf_edit') : t('bf_new');
  $('#bf-sub').textContent = cb ? t('editing') : t('bf_sub_new');
  const v = cb || Object.assign({sp: tab === 'sp' ? curSp : '', status: 'active'}, pre || {});
  const opt = (val, cur, label) => `<option value="${val}"${val === (cur || '') ? ' selected' : ''}>${esc(label)}</option>`;
  const gv = v.grp || {}, gIn = k => `<label class="gnum"><span>${esc(t('g_' + k))}</span><input id="bf-g${k}" name="g_${k}" type="number" min="0" inputmode="numeric" value="${gv[k] || ''}"></label>`;
  $('#bf-fields').innerHTML = `<div class="fld"><label for="bf-kind">${esc(t('bf_kind'))}</label><select id="bf-kind" name="kind">${opt('one', v.grp ? 'group' : 'one', t('bf_one'))}${opt('group', v.grp ? 'group' : 'one', t('bf_group'))}</select></div>`
    + field({k: 'name', l: 'bf_name', t: 'text', id: 'bf-name', ph: 'bf_name_ph'}, v.name) + namesEditor(v.names) + spSelect(v.sp, 'bf')
    + `<div class="fld bf-grp"><span class="lbl">${esc(t('bf_grp'))}</span><div class="gnums">${['m', 'f', 'u', 'j'].map(gIn).join('')}</div></div>`
    + `<div class="fld bf-one"><label for="bf-sex">${esc(t('fa_sex'))}</label><select id="bf-sex" name="sex">${opt('', v.sex, t('sex_u'))}${opt('f', v.sex, cap(t('sex_f')))}${opt('m', v.sex, cap(t('sex_m')))}</select></div>`
    + field({k: 'ring', l: 'bf_ring', t: 'text', id: 'bf-ring'}, v.ring).replace('class="fld"', 'class="fld bf-one"') + field({k: 'chip', l: 'bf_chip', t: 'text', id: 'bf-chip'}, v.chip).replace('class="fld"', 'class="fld bf-one"')
    + field({k: 'born', l: 'fa_born', t: 'date', id: 'bf-born'}, v.born) + field({k: 'arrived', l: 'bf_arrived', t: 'date', id: 'bf-arrived'}, v.arrived)
    + field({k: 'origin', l: 'fa_origin', t: 'text', id: 'bf-origin', ph: 'bf_origin_ph'}, v.origin)
    + parentsEditor(cb ? cb.id : '', v.parents)
    + enclSelect({k: 'encl', l: 'fa_encl', id: 'bf-encl'}, cb ? placeOf(cb).name : pre && pre.encl ? pre.encl : (tab === 'encl' && enclMap.get(curEncl) ? enclMap.get(curEncl).name : ''))
    + `<div class="fld"><label for="bf-status">${esc(t('bf_status'))}</label><select id="bf-status" name="status">${opt('active', v.status, t('cf_active'))}${opt('out', v.status, t('st_out_opt'))}</select></div>`
    + field({k: 'note', l: 'bf_note', t: 'textarea', id: 'bf-note'}, v.note);
  wireEnclSelects($('#bf-fields'));
  const sel = $('#bf-sp'), wrap = $('#bf-newsp-wrap'), sync = () => { wrap.hidden = sel.value !== '__new'; };
  if (!species.length && !cb) sel.value = '__new';
  sync();
  sel.addEventListener('change', () => { sync(); if (sel.value === '__new') $('#bf-newsp').focus(); });
  $('#bf-err').textContent = '';
  const d = $('#bf-del'); d.hidden = !cb || !isAdmin(); d.textContent = t('del_card');
  phBird = photoBox('bf-ph', 'bird', cb ? cb.id : null, true);
  addLocks($('#bird-form'), BIRD_LOCK, cb ? cb.locked || [] : [], 'lk_hint_g');
  const gl = cb && !isAdmin() && ((cb.locked || []).includes('grp') || (cb.locked || []).includes('*'));
  $$('.gnums input', $('#bird-form')).forEach(x => { x.disabled = !!gl; });
  const pl = cb && !isAdmin() && ((cb.locked || []).includes('parents') || (cb.locked || []).includes('*'));
  $$('.pa-ed select, .pa-ed [data-pa-rm], .pa-ed [data-pa-add]', $('#bird-form')).forEach(x => { x.disabled = !!pl; });
  const kind = $('#bf-kind'), kSync = () => { const g = kind.value === 'group'; $$('#bf-fields .bf-one').forEach(x => { x.hidden = g; }); $('#bf-fields .bf-grp').hidden = !g; };
  kind.addEventListener('change', kSync); kSync();
  openSheet('bird');
}
$('#bird-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = formData(e.target), err = m => { $('#bf-err').textContent = m; }, g = k => String(fd.get(k) || '').trim();
  const spSel = g('sp'), newName = g('newsp'), old = editingBird, isGrp = g('kind') === 'group';
  if (!spSel) return err(t('e_pick_sp'));
  if (spSel === '__new' && !newName) return err(t('e_new_sp'));
  const gn = k => Math.max(0, Math.floor(toN(g('g_' + k)) || 0)), grp = isGrp ? {m: gn('m'), f: gn('f'), u: gn('u'), j: gn('j')} : null;
  if (isGrp && !grpTotal(grp)) return err(t('e_grp'));
  // no name typed: species name (+ ring, or "group"), numbered if already taken
  let name = g('name');
  if (!name) {
    const base = (spSel === '__new' ? newName : spName(spById(spSel))) || t('no_sp'), free = n => !coll.some(x => key(x.name) === key(n) && (!old || x.id !== old.id));
    name = base + (isGrp ? ' — ' + t('grp_w') : g('ring') ? ' ' + g('ring') : '');
    for (let i = 2; !free(name); i++) name = base + (isGrp ? ' — ' + t('grp_w') : '') + ' ' + i;
  }
  if (coll.some(x => key(x.name) === key(name) && (!old || x.id !== old.id))) return err(t('e_bdup'));
  if (phBird && phBird.busy) return;
  const pe = readEncl(fd, 'encl');
  if (pe.err) return err(pe.err);
  const date = k => /^\d{4}-\d{2}-\d{2}$/.test(g(k)) ? g(k) : '', now = Date.now(), encl = pe.name, cur = old ? placeOf(old).name : '';
  const b = {name, sp: spSel, grp, sex: isGrp ? '' : g('sex'), ring: isGrp ? '' : g('ring'), chip: isGrp ? '' : g('chip'), born: date('born'), arrived: date('arrived'), origin: g('origin'),
    encl: old && key(cur) === key(encl) ? old.encl : encl,
    enclAt: old && key(cur) === key(encl) ? old.enclAt : (encl ? Math.floor(now / 60000) * 60000 : 0), status: g('status') === 'out' ? 'out' : 'active', note: g('note'), names: readNames(fd), locked: lockList(e.target, BIRD_LOCK),
    parents: [...new Set(fd.getAll('pa').map(String).filter(x => x && collMap.has(x) && (!old || x !== old.id)))]};
  await withBusy($('#bf-save'), async () => {
    try {
      if (spSel === '__new') b.sp = await ensureSpecies(newName);
      if (pe.fresh) b.encl = await ensureEncl(b.encl);
      const id = old ? old.id : uuid();
      await putBird(id, b, !old);
      if (phBird && (phBird.added.length || phBird.removed.length)) err(t('ph_saving'));
      const failed = await commitPhotos(phBird, id);
      if (old && (key(old.name) !== key(name) || old.sp !== b.sp)) await LOADERS.records();
      closeSheets();
      toast(failed ? t('e_photo', failed) : old ? t('t_card_upd') : t('t_bird_added'));
      openCard('bird', id);
      render();
    } catch (x) { err(x && x.code === '23505' ? t('e_bdup') : errMsg(x)); }
  });
});
$('#bf-del').addEventListener('click', async () => {
  if (!editingBird || !isAdmin()) return;
  if (!birdDelArmed) { birdDelArmed = true; $('#bf-del').textContent = t('del_card_confirm'); return; }
  try { await dropBird(editingBird.id); closeSheets(); render(); toast(t('t_card_del')); setTab('coll'); }
  catch (x) { $('#bf-err').textContent = errMsg(x); }
});
