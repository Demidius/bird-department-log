// ui.js — tabs, sheets, Back button history, confirmations, place picker, alt-name rows
/* ---------- ui ---------- */
let toastT = 0;
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600); }
function setStatus(k, kind) { statusKey = k; statusKind = kind; const s = $('#status'); s.hidden = !k; s.textContent = k ? t(k) : ''; s.className = 'status' + (kind === 'info' ? ' info' : ''); }

function applyStatic() {
  document.documentElement.lang = lang;
  document.title = t('app_title');
  $$('[data-t]').forEach(e => { e.textContent = t(e.dataset.t); });
  $$('[data-tp]').forEach(e => { e.placeholder = t(e.dataset.tp); });
  $$('[data-ta]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.ta)); });
  $$('[data-th]').forEach(e => { e.innerHTML = t(e.dataset.th); });
  $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  $('#now-date').textContent = fLong.format(Date.now());
  $('#gate-msg').textContent = t(gateKey);
  setStatus(statusKey, statusKind);
}
function setLang(l) {
  if (!DICT[l] || l === lang) return;
  lang = l;
  try { localStorage.setItem('zoo-log-lang2', l); } catch (x) {}
  $('#lg-err').textContent = ''; $('#claim-err').textContent = '';
  mkFmt(); applyStatic(); render();
}

const TAB_OF = {gaps: 'menu', species: 'menu', sp: 'menu', coll: 'menu', bird: 'menu', users: 'menu', encls: 'menu', encl: 'menu', log: 'menu'};
// the phone's Back button moves through screens: every screen change is a history entry
let navOn = false;
const navState = () => ({app: 1, v: tab, id: tab === 'sp' ? curSp : tab === 'bird' ? curBird : tab === 'encl' ? curEncl : null});
function navStart() {
  if (navOn) return;
  navOn = true;
  history.replaceState({app: 1, root: 1}, '');
  history.pushState(navState(), '');
}
function setTab(v, fromBack) {
  const prev = navOn && history.state ? history.state : null;
  tab = v;
  if (navOn && !fromBack) { const ns = navState(); if (!prev || prev.root || prev.v !== ns.v || prev.id !== ns.id) history.pushState(ns, ''); }
  const hi = TAB_OF[v] || v;
  $$('.view').forEach(x => { x.hidden = x.id !== 'view-' + v; });
  $$('.tab').forEach(b => { const on = b.dataset.tab === hi; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  window.scrollTo(0, 0);
  if (v === 'cal' && calMode === 'grid') { calFrom = null; renderCal(); setTimeout(() => { calObsOn = true; }, 400); }
}

window.addEventListener('popstate', e => {
  if (!navOn) return;
  const st0 = e.state;
  // a window or picture on top: Back closes it and the screen stays
  if (pickSel) { history.pushState(navState(), ''); closePick(true); return; }
  if (askDone || !$('#lightbox').hidden || $('.sheet.open')) {
    history.pushState(navState(), '');
    if (askDone) askDone(false); else if (!$('#lightbox').hidden) closeLightbox(); else requestClose();
    return;
  }
  // on the first entry: one more Back leaves the app, so ask; "stay" restores the screen
  if (!st0 || !st0.app || st0.root) {
    ask(t('cf_exit'), t('cf_exit_p'), t('cf_exit_ok'), t('cf_cancel')).then(ok => {
      if (!ok) { history.pushState(navState(), ''); return; }
      navOn = false; history.back(); setTimeout(() => { try { window.close(); } catch (x) {} }, 300);
    });
    return;
  }
  const v = st0.v || 'add';
  if (v === 'sp') curSp = st0.id; else if (v === 'bird') curBird = st0.id; else if (v === 'encl') curEncl = st0.id;
  if (v === 'sp') renderSpCard(); else if (v === 'bird') renderBirdCard(); else if (v === 'encl') renderEnclCard();
  setTab(v, true);
});
function hideSheet(s) { s.classList.remove('open'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('inert', ''); }
function openSheet(name) {
  const s = $('#sheet-' + name);
  if (!$('.sheet.open')) lastFocus = document.activeElement;
  $$('.sheet.open').forEach(x => { if (x !== s) hideSheet(x); });
  $('#overlay').classList.add('on');
  formDirty = false;
  s.removeAttribute('inert'); s.setAttribute('aria-hidden', 'false'); s.classList.add('open'); s.scrollTop = 0;
  setTimeout(() => s.focus({preventScroll: true}), 40);
}
// asks a yes/no question in a small window; resolves true when confirmed
let askDone = null;
function ask(title, text, okText, noText, danger) {
  if (askDone) askDone(false);
  const box = $('#cfm'), back = document.activeElement;
  $('#cfm-t').textContent = title; $('#cfm-p').textContent = text;
  $('#cfm-ok').textContent = okText; $('#cfm-no').textContent = noText;
  $('#cfm-ok').classList.toggle('danger', !!danger);
  box.hidden = false;
  setTimeout(() => $('#cfm-no').focus({preventScroll: true}), 30);
  return new Promise(res => { askDone = v => { askDone = null; box.hidden = true; if (back && document.contains(back)) back.focus({preventScroll: true}); res(v); }; });
}
$('#cfm-ok').addEventListener('click', () => askDone && askDone(true));
$('#cfm-no').addEventListener('click', () => askDone && askDone(false));
$('#cfm').addEventListener('click', e => { if (e.target.id === 'cfm' && askDone) askDone(false); });
// a form counts as changed once the person types, picks, ticks or touches its photos
let formDirty = false;
const markDirty = e => { if (e.target.closest && e.target.closest('.sheet.open form')) formDirty = true; };
document.addEventListener('input', markDirty, true);
document.addEventListener('change', markDirty, true);
document.addEventListener('click', e => { if (e.target.closest('.sheet.open form [data-star],.sheet.open form [data-rmw],.sheet.open form [data-rmk],.sheet.open form [data-rma],.sheet.open form [data-nm-add],.sheet.open form [data-nm-rm],.sheet.open form [data-pa-add],.sheet.open form [data-pa-rm]')) formDirty = true; }, true);
window.addEventListener('beforeunload', e => { if (formDirty && $('.sheet.open')) { e.preventDefault(); e.returnValue = ''; } });
// closing on request (cross, overlay, Back, Escape): asks first when there are unsaved changes
async function requestClose() {
  if (formDirty && $('.sheet.open form') && !await ask(t('cf_leave'), t('cf_leave_p'), t('cf_leave_ok'), t('cf_stay'), true)) return;
  closeSheets();
}
function closeSheets() {
  formDirty = false;
  presetBird = null;
  $$('.sheet.open').forEach(hideSheet);
  $('#overlay').classList.remove('on');
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({preventScroll: true});
  lastFocus = null;
}

function field(f, val) {
  const id = f.id || 'fld-' + f.k, v = val == null ? '' : val;
  const lab = `<label for="${id}">${esc(t(f.l))}${f.req ? '&nbsp;<span class="req" aria-hidden="true">*</span>' : ''}</label>`;
  if (f.t === 'textarea') return `<div class="fld">${lab}<textarea id="${id}" name="${f.k}" rows="3"${f.req ? ' aria-required="true"' : ''}>${esc(v)}</textarea></div>`;
  return `<div class="fld">${lab}<input id="${id}" name="${f.k}" type="${f.t}"${f.list ? ` list="${f.list}" autocomplete="off"` : ''}${f.t === 'number' ? ` min="${f.min || 0}" inputmode="numeric"` : ''}${f.req ? ' aria-required="true"' : ''}${f.ph ? ` placeholder="${esc(t(f.ph))}"` : ''}${f.ac ? ` autocomplete="${f.ac}"` : ''}${f.dis ? ' disabled' : ''} value="${esc(v)}"></div>`;
}

function spSelect(val, p = 'fld') {
  const opts = species.slice().sort(bySp).map(s => `<option value="${esc(s.id)}" data-s="${esc(spNames(s).join(' '))}"${s.id === val ? ' selected' : ''}>${esc(spName(s))}</option>`).join('');
  return `<div class="fld"><label for="${p}-sp">${esc(t('f_species'))}&nbsp;<span class="req" aria-hidden="true">*</span></label><select id="${p}-sp" name="sp" aria-required="true"><option value="">${esc(t('f_pick_sp'))}</option>${opts}<option value="__new">${esc(t('f_new_sp'))}</option></select></div>`
    + `<div class="fld" id="${p}-newsp-wrap" hidden><label for="${p}-newsp">${esc(t('f_new_sp_name'))}</label><input id="${p}-newsp" name="newsp" type="text" autocomplete="off"></div>`;
}

// a list of registered housing places, in tree order, with "+ new place" at the end
function enclSelect(f, val) {
  const id = f.id || 'fld-' + f.k, v = String(val || '').trim(), cur = v ? enclByName.get(key(v)) : null;
  const groups = treeOrder(encls.filter(x => x.active || x === cur)).map(([x, d]) =>
    `<option value="${esc(x.name)}"${x === cur ? ' selected' : ''}>${INDENT(d)}${esc(dn(x))} · ${esc(t('ek_' + x.kind))}</option>`).join('');
  const unreg = v && !cur ? `<option value="${esc(v)}" selected>${esc(v + t('encl_unreg'))}</option>` : '';
  return `<div class="fld"><label for="${id}">${esc(t(f.l))}${f.req ? '&nbsp;<span class="req" aria-hidden="true">*</span>' : ''}</label><select id="${id}" name="${f.k}" data-encl${f.req ? ' aria-required="true"' : ''}><option value="">${esc(t('encl_none_opt'))}</option>${unreg}${groups}<option value="__new">${esc(t('encl_new_opt'))}</option></select></div>`
    + `<div class="fld" id="${id}-new-wrap" hidden><label for="${id}-new">${esc(t('encl_new_name'))}</label><input id="${id}-new" name="${f.k}_new" type="text" autocomplete="off"></div>`;
}
function wireEnclSelects(root) {
  $$('select[data-encl]', root).forEach(sel => sel.addEventListener('change', () => {
    const w = $('#' + sel.id + '-new-wrap'); w.hidden = sel.value !== '__new'; if (!w.hidden) $('#' + sel.id + '-new').focus();
  }));
}
function setEnclSel(sel, name) {
  if (!sel || !name) return;
  if (![...sel.options].some(o => o.value === name)) { const o = document.createElement('option'); o.value = name; o.textContent = name + t('encl_unreg'); sel.insertBefore(o, sel.options[1] || null); }
  sel.value = name;
}
// reads a place picked in a form: {name} or {err}; "new" places are created on save by ensureEncl
function readEncl(fd, k) {
  const v = String(fd.get(k) || '').trim();
  if (v !== '__new') return {name: v};
  const n = String(fd.get(k + '_new') || '').trim();
  return n ? {name: n, fresh: true} : {err: t('e_new_encl')};
}
async function ensureEncl(name) {
  const ex = encls.find(x => key(x.name) === key(name));
  if (ex) return ex.name;
  const id = uuid();
  await putEncl(id, {name: name.trim(), kind: 'enclosure', area: '', size: '', cap: 0, active: true, note: ''}, true);
  return name.trim();
}

// "+ add a name" rows: a language picker and the name in that language
const nameRow = (l, v) => `<div class="nm-row"><select name="nl" aria-label="${esc(t('alt_lang'))}">${LANGS.map(o => `<option value="${o}"${o === l ? ' selected' : ''}>${LANG_NAME[o]}</option>`).join('')}</select><input name="nv" type="text" autocomplete="off" value="${esc(v || '')}" aria-label="${esc(t('alt_name'))}"><button type="button" class="x" data-nm-rm aria-label="${esc(t('alt_rm'))}">${ic('x', 18, 2.2)}</button></div>`;
const namesEditor = list => `<div class="fld nm-ed"><span class="lbl">${esc(t('alt_names'))}</span><div class="nm-rows">${(list || []).map(n => nameRow(n.l, n.v)).join('')}</div><button type="button" class="mini ghost" data-nm-add>${esc('+ ' + t('alt_add'))}</button><p class="hint">${esc(t('alt_hint'))}</p></div>`;
const readNames = fd => { const ls = fd.getAll('nl'), vs = fd.getAll('nv'), seen = new Set(); return vs.map((v, i) => ({l: String(ls[i] || ''), v: String(v || '').trim().slice(0, 120)})).filter(n => LANGS.includes(n.l) && n.v && !seen.has(n.l + key(n.v)) && seen.add(n.l + key(n.v))).slice(0, 12); };

function activeDrug(bird) { const b = st && st.birds.get(key(bird)); return b && b.treat ? b.treat.drug : ''; }

function openForm(type, pre, rec) {
  const tp = T[type];
  if (!tp) return;
  if (!rec && !canWrite()) return;
  const editable = rec ? canEditRec(rec) : true;
  curType = type; editing = rec || null; delArmed = false;
  $('#f-title').textContent = evLabel(type);
  $('#f-sub').textContent = rec ? t('f_edit') : t('f_new');
  const fi = $('#f-icon'); fi.className = 'tile t-' + tp.tone; fi.innerHTML = ic(tp.icon);
  const pre2 = Object.assign({}, pre || {});
  if (!pre2.bird && presetBird) pre2.bird = presetBird;
  if (pre2.bird) pre2.bird = bn(pre2.bird);
  const v = rec ? Object.assign({bird: bn(rec.bird), at: rec.at, note: rec.note, sp: rec.sp}, rec.f) : Object.assign({at: Date.now()}, pre2);
  if (!rec) {
    for (const f of tp.fields) if (v[f.k] == null && f.def != null) v[f.k] = f.def;
    if (type === 'tdose' && v.bird && !v.drug) v.drug = activeDrug(canonBird(v.bird));
    if (v.bird && !v.sp) v.sp = spOfBird(v.bird);
    if (type === 'incub' && v.days == null && incubDays(v.sp)) v.days = incubDays(v.sp);
    if (type === 'expo' && v.bird && !v.from) { const cb = collByName.get(key(canonBird(v.bird))); v.from = cb ? placeOf(cb).name : ((st && st.birds.get(key(v.bird))) || {}).encl || ''; }
  }
  let h = spSelect(v.sp) + `<div class="fld"><label for="fld-birdsel">${esc(t('f_bird'))}&nbsp;<span class="req" aria-hidden="true">*</span></label><select id="fld-birdsel"></select></div>` + field({k:'bird', l:'f_bird_other', t:'text', list:'birds'}, v.bird);
  for (const f of tp.fields) h += type === 'expo' ? enclSelect(f, v[f.k]) : field(f, v[f.k]);
  // the date is enough; the time of day only when asked for
  const showT = rec ? !(rec.f && rec.f.nt) : false, ti = toInput(v.at);
  h += `<div class="fld"><label for="fld-date">${esc(t('f_at'))}&nbsp;<span class="req" aria-hidden="true">*</span></label><input id="fld-date" name="date" type="date" aria-required="true" value="${ti.slice(0, 10)}"></div>`
    + `<div class="fld" id="fld-time-wrap"${showT ? '' : ' hidden'}><label for="fld-time">${esc(t('f_time'))}</label><input id="fld-time" name="time" type="time" value="${showT ? ti.slice(11, 16) : ''}"></div>`
    + `<button type="button" class="mini ghost time-tg" id="fld-time-tg" aria-expanded="${showT}">${esc(showT ? t('time_rm') : '+ ' + t('time_add'))}</button>`;
  h += field({k:'note', l:tp.noteLabel || 'f_note', t:'textarea', req:tp.noteReq}, v.note);
  $('#f-fields').innerHTML = h;
  wireEnclSelects($('#f-fields'));
  $('#f-fs').disabled = !editable;
  $('#f-ro').hidden = editable;
  $('#f-save').hidden = !editable;
  $('#f-err').textContent = '';
  const del = $('#f-del'); del.hidden = !rec || !editable; del.textContent = t('del_rec');
  phRec = photoBox('f-ph', 'record', rec ? rec.id : null, editable);
  const bird = $('#fld-bird'), sel = $('#fld-sp'), wrap = $('#fld-newsp-wrap');
  const days = type === 'incub' && !rec ? $('#fld-days') : null;
  if (days) { days.dataset.auto = days.value ? '1' : ''; days.addEventListener('input', () => { days.dataset.auto = ''; }); }
  const autoDays = () => { if (days && (!days.value || days.dataset.auto) && incubDays(sel.value)) { days.value = incubDays(sel.value); days.dataset.auto = '1'; } };
  const syncSp = () => { wrap.hidden = sel.value !== '__new'; fillBirds(sel.value); autoDays(); };
  if (!species.length && !rec) sel.value = '__new';
  syncSp();
  sel.addEventListener('change', () => { syncSp(); if (sel.value === '__new') $('#fld-newsp').focus(); });
  const tg = $('#fld-time-tg');
  tg.addEventListener('click', () => {
    const w = $('#fld-time-wrap'), on = w.hidden;
    w.hidden = !on; tg.setAttribute('aria-expanded', String(on)); tg.textContent = on ? t('time_rm') : '+ ' + t('time_add');
    const ti2 = $('#fld-time');
    if (on) { if (!ti2.value) { const n = new Date(); ti2.value = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'); } ti2.focus(); } else ti2.value = '';
    formDirty = true;
  });
  const ps = $('#fld-birdsel');
  ps.addEventListener('change', () => {
    const o = ps.value === '__other';
    bird.closest('.fld').hidden = !o;
    bird.value = o ? '' : ps.value;
    if (o) bird.focus(); else bird.dispatchEvent(new Event('change'));
  });
  bird.addEventListener('change', () => {
    const bs = spOfBird(bird.value);
    if (bs && (!sel.value || sel.value === '__new')) { sel.value = bs; syncSp(); } else autoDays();
    if (type === 'tdose') { const d = $('#fld-drug'); if (d && !d.value) d.value = activeDrug(canonBird(bird.value)); }
    if (type === 'expo') { const fr = $('#fld-from'), cb = collByName.get(key(canonBird(bird.value))); if (fr && !fr.value && cb) setEnclSel(fr, placeOf(cb).name); }
  });
  openSheet('form');
}
