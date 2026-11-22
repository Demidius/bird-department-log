// locks.js — species form fields, "protect from AI" locks, translation of edited texts
const SPF = ['name', 'latin', 'pl', 'en'];
const SIF = [['group', 'select', 'sf_group'], ['iucn', 'select', 'sf_iucn'], ['cites', 'text', 'si_cites'], ['order', 'text', 'sf_order'], ['family', 'text', 'sf_family'],
  ['syn', 'text', 'si_syn'], ['size', 'text', 'si_size'], ['life', 'text', 'si_life'], ['incub_days', 'number', 'sf_incub_days'], ['fledge_days', 'number', 'sf_fledge_days'], ['gest_days', 'number', 'sf_gest_days'], ['sex', 'textarea', 'si_sex'],
  ['range', 'textarea', 'si_range'], ['habitat', 'textarea', 'si_habitat'], ['diet_wild', 'textarea', 'si_diet_wild'], ['behaviour', 'textarea', 'si_behaviour'],
  ['breeding', 'textarea', 'si_breeding'], ['diet_zoo', 'textarea', 'si_diet_zoo'], ['husbandry', 'textarea', 'si_husbandry'], ['health', 'textarea', 'si_health'],
  ['photo.src', 'url', 'sf_photo'], ['photo.credit', 'text', 'sf_photo_credit'], ['photo.page', 'url', 'sf_photo_page']];
const sifId = k => 'sfi-' + k.replace('.', '-');
const dPhotoCount = () => phSp ? phSp.keep.length + phSp.added.length : 0;
const lockKey = k => k.startsWith('photo.') ? 'photo' : k;
// the "protect from AI" checkbox under a field; only an admin can tick or untick it or edit a protected field
const lockBox = (k, locked) => { const tt = esc(t(isAdmin() || !locked.includes(k) ? 'lk_one' : 'lk_ro')); return `<label class="lk" title="${tt}"><input class="vh" type="checkbox" name="lk" value="${esc(k)}" aria-label="${tt}"${locked.includes(k) ? ' checked' : ''}${isAdmin() ? '' : ' disabled'}>${ic('unlock', 18, 2.2)}${ic('lock', 18, 2.2)}</label>`; };
// the species name fields are columns, protected under these keys
const SP_LOCK = {latin: 'latin', name: 'name_ru', pl: 'name_pl', en: 'name_en'};
// put a lock into each listed field of a form (input name -> protected key) and "protect the whole card" on top
function addLocks(form, map, locked, hint) {
  for (const [nm, k] of Object.entries(map)) {
    const inp = $(`[name="${nm}"]`, form) || $('#' + nm, form); if (!inp) continue;
    const f = inp.closest('.fld'); if (!f) continue;
    $$('.lk', f).forEach(x => x.remove());
    f.classList.add('has-lk'); f.insertAdjacentHTML('beforeend', lockBox(k, locked));
    inp.disabled = !isAdmin() && (locked.includes(k) || locked.includes('*'));
  }
  $$('.lk-all-box', form).forEach(x => x.remove());
  form.insertAdjacentHTML('afterbegin', `<div class="lk-all-box"><label class="lk-all"><input type="checkbox" name="lk" value="*"${locked.includes('*') ? ' checked' : ''}${isAdmin() ? '' : ' disabled'}>${ic('lock', 16, 2.2)}<span>${esc(t('lk_all'))}</span></label><p class="hint">${esc(t(hint))}</p></div>`);
  const lkAll = $('input[name=lk][value="*"]', form), lkOne = () => $$('input[name=lk]', form).filter(x => x !== lkAll);
  lkAll.addEventListener('change', () => lkOne().forEach(x => { x.checked = lkAll.checked; }));
  lkOne().forEach(x => x.addEventListener('change', () => { lkAll.checked = lkOne().every(y => y.checked); }));
}
const lockList = form => { const l = $$('input[name=lk]:checked', form).map(x => x.value); if (l.includes('encl')) l.push('encl_at'); return l; };
// FormData skips disabled (protected) fields, so put their shown values back
const formData = f => { const fd = new FormData(f); $$('[disabled][name]', f).forEach(x => { if (x.name !== 'lk') fd.set(x.name, x.value); }); return fd; };
const BIRD_LOCK = {name: 'name', sp: 'species_id', g_m: 'grp', parents: 'parents', sex: 'sex', ring: 'ring', chip: 'chip', born: 'born', arrived: 'arrived', origin: 'origin', encl: 'encl', status: 'status', note: 'note'};
const ENCL_LOCK = {name: 'name', kind: 'kind', parent: 'parent_id', area: 'area', size: 'size', cap: 'capacity', state: 'active', note: 'note'};
function infoFields(inf) {
  const opt = (val, cur, label) => `<option value="${val}"${val === (cur || '') ? ' selected' : ''}>${esc(label)}</option>`;
  const ph = inf.photo || {}, locked = Array.isArray(inf.locked) ? inf.locked : [];
  return SIF.map(([k, tp, l]) => {
    const id = sifId(k), v = k.startsWith('photo.') ? ph[k.slice(6)] : TRK.includes(k) ? '' : inf[k];
    let h;
    if (k === 'group') h = `<div class="fld"><label for="${id}">${esc(t(l))}</label><select id="${id}">${opt('bird', v || 'bird', t('sg_bird'))}${opt('mammal', v, t('sg_mammal'))}</select></div>`;
    else if (k === 'iucn') h = `<div class="fld"><label for="${id}">${esc(t(l))}</label><select id="${id}">${opt('', v, t('sf_iucn_none'))}${IUCN.map(c => opt(c, v, c + ' — ' + t('iucn_' + c))).join('')}</select></div>`;
    else h = field({k, l, t: tp, id, dis: !isAdmin() && locked.includes(lockKey(k))}, v == null ? '' : String(v));
    if (!isAdmin() && locked.includes(lockKey(k))) h = h.replace(/<(select|textarea) id=/, '<$1 disabled id=');
    return k.startsWith('photo.') && k !== 'photo.src' ? h : h.replace(/^<div class="fld">/, '<div class="fld has-lk">').replace(/<\/div>$/, lockBox(lockKey(k), locked) + '</div>');
  }).join('');
}
function readInfo(base) {
  const inf = JSON.parse(JSON.stringify(base || {})), ph = Object.assign({}, inf.photo || {});
  for (const [k] of SIF) {
    const v = ($('#' + sifId(k)).value || '').trim();
    if (TRK.includes(k)) { const o = spTr[k]; if (o && LANG_ORDER.some(l => (o[l] || '').trim())) inf[k] = o; else delete inf[k]; continue; }
    if (k.startsWith('photo.')) { const pk = k.slice(6); if (pk === 'src' && v !== (ph.src || '')) delete ph.thumb; if (v) ph[pk] = v; else delete ph[pk]; }
    else if (v) inf[k] = v; else delete inf[k];
  }
  if (ph.src && /^https:\/\//.test(ph.src)) inf.photo = ph; else delete inf.photo;
  const lk = $$('#sp-form input[name=lk]:checked').map(x => x.value);
  if (lk.length) inf.locked = lk; else delete inf.locked;
  if (phSp) { const m = mainOf(phSp, inf.photo); if (m && (m !== 'wiki' || dPhotoCount() > 0)) inf.main = m; else delete inf.main; }
  return inf;
}
let spTr = {}, spFL = 'pl';
// keep what is typed in the shown language; a changed text becomes the source for the other languages
function stashTr() {
  for (const k of TRK) {
    const el = $('#' + sifId(k)); if (!el || el.disabled) continue;
    const v = el.value.trim(), o = spTr[k] || {}, old = (o[spFL] || '').trim();
    if (v === old) continue;
    const wasAuto = (o.auto || []).includes(spFL) && o.src && o.src !== spFL && (o[o.src] || '').trim();
    if (v) o[spFL] = v; else delete o[spFL];
    o.auto = (o.auto || []).filter(l => l !== spFL);
    // correcting a machine translation keeps the source; any other edit makes this language the source
    if (v && wasAuto) o.fix = (o.fix || []).filter(l => l !== spFL).concat(spFL);
    else if (v) { o.src = spFL; o.fix = (o.fix || []).filter(l => l !== spFL); o._dirty = 1; }
    else o.fix = (o.fix || []).filter(l => l !== spFL);
    if (o.fix && !o.fix.length) delete o.fix;
    spTr[k] = o;
  }
}
function fillTr() {
  for (const k of TRK) {
    const el = $('#' + sifId(k)); if (!el) continue;
    const o = spTr[k] || {}, f = el.closest('.fld');
    el.value = o[spFL] || '';
    $$('.tr-note', f).forEach(x => x.remove());
    const p = o[spFL] ? (o.auto || []).includes(spFL) ? {auto: o.src || 'ru'} : null : trPick(o, spFL);
    if (p && (p.auto || p.only)) el.insertAdjacentHTML('afterend', trNote(p).replace('class="tr-note"', 'class="tr-note fld-tr"'));
  }
}
// translate every changed text into the languages that are empty or were machine-translated before
async function translateDirty() {
  let fails = 0;
  for (const k of TRK) {
    const o = spTr[k]; if (!o || !o._dirty) continue;
    delete o._dirty;
    const src = o.src, text = (o[src] || '').trim(); if (!text) continue;
    for (const l of LANG_ORDER) {
      if (l === src || ((o[l] || '').trim() && (o.fix || []).includes(l))) continue;
      try { o[l] = await mt(text, src, l); o.auto = (o.auto || []).filter(x => x !== l).concat(l); }
      catch (e) { fails++; delete o[l]; o.auto = (o.auto || []).filter(x => x !== l); }
    }
    if (!(o.auto || []).length) delete o.auto;
  }
  return fails;
}
