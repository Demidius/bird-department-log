// gate.js — CSV export, sign-in gate, loading curtain, boot
/* ---------- export ---------- */
function csv() {
  const rows = [t('csv_h')];
  [...recs].sort((a, b) => a.at - b.at).forEach(r => {
    const s = spById(r.sp);
    rows.push([new Date(r.at).toLocaleDateString(LOCALE[lang]), recTime(r), t('g_' + T[r.type].g), evLabel(r.type), spName(s), s ? s.latin : '', r.bird, details(r), r.note, r.by ? authorName(r.by) : '', photosOf('record', r.id).length || '']);
  });
  return rows.map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(';')).join('\r\n');
}
$('#btn-dl').addEventListener('click', () => {
  const blob = new Blob(['﻿' + csv()], {type: 'text/csv;charset=utf-8'}), a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = t('csv_file') + '-' + toInput(Date.now()).slice(0, 10) + '.csv';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
});
$('#btn-copy').addEventListener('click', async () => {
  const text = csv(), box = $('#csv-box');
  try { await navigator.clipboard.writeText(text); toast(t('t_copied')); box.hidden = true; }
  catch (x) { box.hidden = false; box.value = text; box.focus(); box.select(); toast(t('t_select')); }
});

/* ---------- sign-in gate ---------- */
// the loading curtain with circling birds (drawn by desktop.css) stays until the first screen is ready
const splashT0 = performance.now();
function splash(on) {
  clearTimeout(splash.t);
  if (on) { document.body.classList.remove('ready'); return; }
  splash.t = setTimeout(() => document.body.classList.add('ready'), Math.max(0, 700 - (performance.now() - splashT0)));
}
function gate(mode, msgKey) {
  splash(mode === 'loading' && !msgKey);
  gateKey = msgKey || (mode === 'login' ? 'app_title' : mode === 'noacc' ? 'noacc_p' : 'loading');
  $('#gate').hidden = mode === 'off';
  $('#login-form').hidden = mode !== 'login';
  $('#noacc').hidden = mode !== 'noacc';
  $('#gate-msg').hidden = mode === 'login' || mode === 'noacc';
  $('#gate-msg').textContent = t(gateKey);
  if (mode === 'login') setTimeout(() => $('#lg-login').focus({preventScroll: true}), 30);
}
function applyRole() {
  document.body.classList.toggle('ro', !canWrite());
  document.body.classList.toggle('admin', isAdmin());
}
function resetState() {
  navOn = false;
  me = null; myProfile = null; recs = []; species = []; coll = []; encls = []; photos = []; logRows = []; profiles = new Map(); urlCache.clear();
  if (channel && sb) { sb.removeChannel(channel); channel = null; }
  document.body.classList.remove('ro', 'admin');
}

$('#login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const login = $('#lg-login').value.trim().toLowerCase(), pass = $('#lg-pass').value;
  if (!login || !pass) return void ($('#lg-err').textContent = t('e_login'));
  const email = login.includes('@') ? login : login + '@' + LOGIN_DOMAIN;
  await withBusy($('#lg-btn'), async () => {
    const {error} = await sb.auth.signInWithPassword({email, password: pass});
    if (error) { $('#lg-err').textContent = (error.status === 400 || error.code === 'invalid_credentials') ? t('e_login') : t('e_net'); return; }
    $('#lg-pass').value = '';
    await boot();
  });
});

$('#claim-btn').addEventListener('click', async () => {
  await withBusy($('#claim-btn'), async () => {
    const {data, error} = await sb.rpc('claim_first_admin', {p_name: ''});
    if (error || !data) { $('#claim-err').textContent = error ? errMsg(error) : t('e_perm'); return; }
    await boot();
  });
});

let booting = false;
async function boot() {
  if (booting) return;
  booting = true;
  try {
    const {data: {session}} = await sb.auth.getSession();
    if (!session) { resetState(); gate('login'); return; }
    me = session.user.id;
    gate('loading');
    const {data: prof, error} = await sb.from('profiles').select('*').eq('id', me).maybeSingle();
    if (error) { gate('login'); $('#lg-err').textContent = t('e_net'); return; }
    if (!prof || !prof.active) {
      let canClaim = false;
      const em = String(session.user.email || '');
      if (!prof && em && !em.endsWith('@' + LOGIN_DOMAIN) && session.user.email_confirmed_at) {
        const {data: has} = await sb.rpc('journal_has_admin');
        canClaim = has === false;
      }
      $('#claim-btn').hidden = !canClaim; $('#claim-hint').hidden = !canClaim; $('#claim-err').textContent = '';
      gate('noacc');
      return;
    }
    myProfile = prof;
    applyRole();
    await loadAll();
    if (!myProfile || !myProfile.active) return;
    setTab('add');
    navStart();
    render();
    gate('off');
    subscribe();
    if (!navigator.onLine) setStatus('s_offline', 'warn');
  } catch (x) {
    gate('login'); $('#lg-err').textContent = t('e_net');
  } finally { booting = false; }
}

window.addEventListener('offline', () => setStatus('s_offline', 'warn'));
window.addEventListener('online', () => { if (statusKey === 's_offline') setStatus('', 'info'); if (myProfile) Object.keys(LOADERS).forEach(scheduleReload); });
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  if (myProfile && hiddenAt && Date.now() - hiddenAt > 60e3) Object.keys(LOADERS).forEach(scheduleReload);
});
