// clicks.js — global click handler, tall photo fit
/* ---------- clicks ---------- */
document.addEventListener('click', e => {
  const lb = e.target.closest('[data-lb]');
  if (lb) { e.preventDefault(); e.stopPropagation(); openLightbox(lb.dataset.lb); return; }
  const lbu = e.target.closest('[data-lbu]');
  if (lbu) { e.preventDefault(); const img = $('#lb-img'); delete img.dataset.path; img.src = lbu.dataset.lbu; $('#lightbox').hidden = false; setTimeout(() => $('[data-lb-close]').focus({preventScroll: true}), 30); return; }
  const jp = e.target.closest('[data-jump]');
  if (jp) { const x = $('#' + jp.dataset.jump); if (x) x.scrollIntoView({block: 'start', behavior: 'smooth'}); return; }
  const sgb = e.target.closest('[data-sg]');
  if (sgb) { sg = sgb.dataset.sg; renderSpecies(); return; }
  const lgfb = e.target.closest('[data-lgf]');
  if (lgfb) { lgf = lgfb.dataset.lgf; renderLog(); return; }
  const lgd = e.target.closest('[data-lg-del]');
  if (lgd) {
    if (!isAdmin()) return;
    if (logDelArmed !== lgd.dataset.lgDel) { logDelArmed = lgd.dataset.lgDel; renderLog(); return; }
    const id = logDelArmed; logDelArmed = '';
    sb.from('change_log').delete().eq('id', id).then(res => { if (res.error) { toast(errMsg(res.error)); return; } logRows = logRows.filter(x => String(x.id) !== id); renderLog(); toast(t('t_log_del')); });
    return;
  }
  if (logDelArmed) { logDelArmed = ''; renderLog(); }
  const gsp = e.target.closest('[data-gap-sp]');
  if (gsp) { openGap(gsp.dataset.gapSp, gsp.dataset.gapK); return; }
  const paa = e.target.closest('[data-pa-add]');
  if (paa) { const box = paa.parentElement.querySelector('.pa-rows'); box.insertAdjacentHTML('beforeend', paRow(box.dataset.self, '')); box.lastElementChild.querySelector('select').focus(); return; }
  const par = e.target.closest('[data-pa-rm]');
  if (par) { par.closest('.pa-row').remove(); return; }
  const nma = e.target.closest('[data-nm-add]');
  if (nma) { const box = nma.parentElement.querySelector('.nm-rows'), used = $$('select[name=nl]', box).map(x => x.value); box.insertAdjacentHTML('beforeend', nameRow(LANGS.find(l => !used.includes(l) && l !== lang) || LANGS.find(l => !used.includes(l)) || lang, '')); box.lastElementChild.querySelector('input').focus(); return; }
  const nmr = e.target.closest('[data-nm-rm]');
  if (nmr) { nmr.closest('.nm-row').remove(); return; }
  const cmode = e.target.closest('[data-cal-mode]');
  if (cmode) { calMode = cmode.dataset.calMode; calSel = ''; try { localStorage.setItem('zoo-cal-mode', calMode); } catch (x) {} calFrom = null; renderCal(); window.scrollTo(0, 0); setTimeout(() => { calObsOn = true; }, 400); return; }
  if (e.target.closest('[data-cal-earlier]')) { const hgt = document.documentElement.scrollHeight; calFrom -= 6; renderCal(); window.scrollBy(0, document.documentElement.scrollHeight - hgt); return; }
  const cnav = e.target.closest('[data-cal-nav]');
  if (cnav && calMode === 'grid') { calJump(); return; }
  if (cnav) { const n = +cnav.dataset.calNav, d = new Date(); calM = n ? new Date(calM.getFullYear(), calM.getMonth() + n, 1) : new Date(d.getFullYear(), d.getMonth(), 1); calSel = ''; renderCal(); return; }
  const ci = e.target.closest('[data-ci],[data-co]');
  if (ci) {
    if (ci.dataset.co) openCalItem(ci.dataset.co);
    else if (calSel === ci.dataset.ci && !ci.dataset.ci.startsWith('m:')) openCalItem(ci.dataset.ci);
    else { calSel = ci.dataset.ci; renderCal(); }
    return;
  }
  if (calSel && e.target.closest('#cal-tip') && !calSel.startsWith('m:')) { openCalItem(calSel); return; }
  const dy = e.target.closest('#cal-months [data-day]');
  if (dy) { if (calSel) { calSel = ''; renderCal(); } openDay(+dy.dataset.day); return; }
  if (calSel && e.target.closest('#view-cal')) { calSel = ''; renderCal(); }
  const ekb = e.target.closest('[data-ek]');
  if (ekb) { ek = ekb.dataset.ek; renderEncls(); return; }
  const ecb = e.target.closest('[data-ec],[data-encl-new],[data-encl-edit]');
  if (ecb) {
    if (ecb.dataset.ec) openCard('encl', ecb.dataset.ec);
    else if (ecb.dataset.enclNew !== undefined) openEnclForm(null, ecb.dataset.parent || '');
    else { const x = enclMap.get(curEncl); if (x) openEnclForm(x); }
    return;
  }
  if (e.target.closest('[data-lb-close]') || e.target.id === 'lightbox' || e.target.id === 'lb-img') { closeLightbox(); return; }
  const el = e.target.closest('[data-new],[data-sheet],[data-tab],[data-edit],[data-close],[data-goto],[data-f],[data-view],[data-sp],[data-sp-new],[data-sp-edit],[data-bc],[data-cf],[data-bird-new],[data-bird-edit],[data-lang],[data-user],[data-user-new],[data-logout],[data-pass]');
  if (!el) return;
  const d = el.dataset;
  if (d.lang) setLang(d.lang);
  else if (d.logout !== undefined) ask(t('cf_logout'), t('cf_logout_p'), t('logout'), t('cf_cancel'), true).then(ok => { if (ok) { closeSheets(); sb && sb.auth.signOut(); } });
  else if (d.pass !== undefined) { $('#pf-err').textContent = ''; openSheet('pass'); }
  else if (d.userNew !== undefined) openUserForm(null);
  else if (d.user) openUserForm(profiles.get(d.user));
  else if (d.spNew !== undefined) openSpForm(null);
  else if (d.spEdit !== undefined) { const s = spById(curSp); if (s) openSpForm(s); }
  else if (d.birdNew !== undefined) openBirdForm(null);
  else if (d.birdEdit !== undefined) { const b = collMap.get(curBird); if (b) openBirdForm(b); }
  else if (d.bc) openCard('bird', d.bc);
  else if (d.cf) { cf = d.cf; $$('#view-coll .chip').forEach(c => c.setAttribute('aria-pressed', String(c === el))); renderColl(); paintPhotos(); }
  else if (d.sp) openCard('sp', d.sp);
  else if (d.view) setTab(d.view);
  else if (d.new) { if (!canWrite()) return; const pre = {}; if (d.bird) pre.bird = d.bird; if (d.from) pre.from = d.from; if (d.to) pre.to = d.to; if (d.at) pre.at = +d.at; openForm(d.new, pre); }
  else if (d.sheet) { if (!canWrite()) return; presetBird = d.preset || null; openSheet(d.sheet); }
  else if (d.tab) setTab(d.tab);
  else if (d.edit) { const r = recs.find(x => x.id === d.edit); if (r) openForm(r.type, null, r); }
  else if (d.close !== undefined) requestClose();
  else if (d.goto) { setTab('now'); const s = $('#' + d.goto); if (s) s.scrollIntoView({block: 'start'}); }
  else if (d.f) { filt = d.f; $$('#view-logs .chip').forEach(c => c.setAttribute('aria-pressed', String(c === el))); renderLogs(); paintPhotos(); }
});
/* ---------- tall photos are shown whole (fit by height) instead of cropped ---------- */
const fitPhoto = img => { if (img.naturalWidth) img.classList.toggle('tall', img.naturalHeight > img.naturalWidth); };
document.addEventListener('load', e => { const img = e.target; if (img.tagName === 'IMG' && img.closest('.sp-photo')) fitPhoto(img); }, true);
new MutationObserver(() => $$('.sp-photo img').forEach(img => { if (img.complete) fitPhoto(img); })).observe(document.body, {childList: true, subtree: true});
