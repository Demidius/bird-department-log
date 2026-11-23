// main.js — v2: state, render, navigation (phone Back moves through screens), events, sign-in, theme, language
const st = {scr: 'now', flt: 'all', q: '', lq: '', wq: '', lim: 150, multi: new Set(), folded: new Set(), acc: new Set(), ph: -1, gal: 0, phf: 'all',
  add: null, ed: null, tmenu: null, tend: 0, tendv: {}, wmenu: null, msheet: '', uform: null, cf: '', gate: 'loading', calMode: 'month'};
const app = () => $('#app');
const urlTried = new Set();

/* ---------- theme ---------- */
const mqDark = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
function applyTheme() { const t = store.get('v2theme') || 'auto', dark = t === 'dark' || (t === 'auto' && mqDark && mqDark.matches); document.documentElement.dataset.theme = dark ? 'dark' : 'light'; const m = $('meta[name=theme-color]'); if (m) m.content = dark ? '#0f1412' : '#f4f5f1'; }
if (mqDark) mqDark.addEventListener('change', applyTheme);
applyTheme();

/* ---------- toast with undo ---------- */
let toastT = 0, toastU = null;
function toast(msg, u) {
  const e = $('#toast'); toastU = u || null;
  e.innerHTML = `<span>${esc(msg)}</span>${u ? `<button data-undo="1">${L('Cofnij', 'Отменить', 'Undo')}</button>` : ''}`;
  e.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => { e.classList.remove('on'); toastU = null; }, u ? 6000 : 1800);
}
$('#toast').addEventListener('click', e => { if (e.target.closest('[data-undo]') && toastU) { const u = toastU; toastU = null; $('#toast').classList.remove('on'); undo(u); } });

/* ---------- navigation ---------- */
const NAVK = ['scr', 'ani', 'plc', 'sp', 'rec'];
const navOf = () => Object.fromEntries(NAVK.map(k => [k, st[k]]));
const overlayOpen = () => !!(st.add || st.ed || st.tmenu || st.wmenu || st.msheet || st.uform || st.gal || st.ph >= 0 || st.lbx || st.cf);
const addDirty = () => { const f = st.add; return !!(f && f.step !== 'menu' && f.step !== 'kids' && (String(f.note || '').trim() || Object.keys(f.fv).some(k => !['cnt', 'wu'].includes(k) && f.fv[k] != null && f.fv[k] !== '' && !(Array.isArray(f.fv[k]) && !f.fv[k].length)) || (f.files || []).length || (f.mv && (f.mv.to || f.mv.proc.length)))); };
function closeTop() {
  if (st.cf) { st.cf = ''; return; }
  if (st.lbx) { st.lbx = ''; return; }
  if (st.ph >= 0) { st.ph = -1; return; }
  if (st.gal) { st.gal = 0; return; }
  if (st.ed) { st.ed = null; return; }
  if (st.uform) { st.uform = null; return; }
  if (st.msheet) { st.msheet = ''; return; }
  if (st.tmenu) { st.tmenu = null; st.tend = 0; st.tendv = {}; return; }
  if (st.wmenu) { st.wmenu = null; return; }
  if (st.add) { if (addDirty()) { st.cf = 'add'; return; } st.add = null; }
}
function go(o) {
  const prev = JSON.stringify(navOf());
  Object.assign(st, o); if (o.scr) { st.ph = -1; st.gal = 0; st.phf = 'all'; st.replyTo = ''; st.lbx = ''; st.cin = ''; }
  if (o.scr && ['logs', 'animals', 'species'].includes(o.scr) && o.scr !== JSON.parse(prev).scr) st.lq = '';
  if (JSON.stringify(navOf()) !== prev) { history.pushState({v2: 1, nav: navOf()}, ''); window.scrollTo(0, 0); const s = $('.scroll'); if (s) s.scrollTop = 0; }
  if (o.scr === 'rcard' && o.rec) markSeen(o.rec);
  render();
  const s2 = $('.scroll'); if (s2) s2.scrollTop = 0;
}
window.addEventListener('popstate', e => {
  if (st.gate !== 'app') return;
  if (overlayOpen()) { history.pushState({v2: 1, nav: navOf()}, ''); closeTop(); render(); return; }
  const s = e.state;
  if (!s || !s.v2 || s.root) { st.cf = 'exit'; history.pushState({v2: 1, nav: navOf()}, ''); render(); return; }
  Object.assign(st, s.nav); st.ph = -1; st.gal = 0; render();
});

/* ---------- render ---------- */
const NAV = [['now', 'now', () => L('Teraz', 'Сейчас', 'Now')], ['logs', 'list', () => L('Dziennik', 'Журнал', 'Journal')], ['', '', null], ['cal', 'cal', () => L('Kalendarz', 'Календарь', 'Calendar')], ['more', 'grid', () => L('Więcej', 'Ещё', 'More')]];
const navKey = () => ({animals: 'more', places: 'more', species: 'more', card: 'more', pcard: 'more', scard: 'more', gaps: 'more', clog: 'more', users: 'more', rcard: 'logs'})[st.scr] || st.scr;
const bottomNav = () => `<nav class="bl-nav">${NAV.map(([k, i, l]) => k ? `<button data-scr="${k}" ${navKey() === k ? 'aria-current="page"' : ''}>${ic(i, 22)}${l()}</button>` : '<span></span>').join('')}${canWrite() ? `<button class="bl-fab" data-fab="1" aria-label="${L('Dodaj wpis', 'Добавить запись', 'Add record')}">${ic('plus', 26, 2.6)}</button>` : ''}</nav>`;
function confirmBox() {
  const T = {add: [L('Odrzucić zmiany?', 'Отменить изменения?', 'Discard changes?'), L('Wpisane dane nie zostaną zapisane.', 'Введённое не сохранится.', 'What you entered will not be saved.'), L('Wróć do formularza', 'Продолжить заполнение', 'Back to the form'), L('Odrzuć', 'Отменить', 'Discard')],
    exit: [L('Zamknąć dziennik?', 'Закрыть журнал?', 'Close the journal?'), '', L('Zostań', 'Остаться', 'Stay'), L('Zamknij', 'Закрыть', 'Close')],
    del: [L('Usunąć wpis?', 'Удалить запись?', 'Delete the record?'), L('Tego nie da się cofnąć.', 'Это нельзя отменить.', 'This cannot be undone.'), L('Anuluj', 'Отмена', 'Cancel'), L('Usuń', 'Удалить', 'Delete')]}[st.cf];
  return `<div class="scrim top" data-cf="no"></div><div class="cfbox" role="alertdialog"><h3>${T[0]}</h3>${T[1] ? `<p>${T[1]}</p>` : ''}<div class="bl-row" style="gap:6px"><button class="bl-btn" style="flex:1" data-cf="no">${T[2]}</button><button class="bl-btn solid" style="flex:1;background:var(--health);color:var(--on-group)" data-cf="yes">${T[3]}</button></div></div>`;
}
function screen() {
  switch (st.scr) {
    case 'logs': return logsScreen();
    case 'cal': return calScreen();
    case 'more': return moreScreen();
    case 'animals': case 'places': case 'species': return listScreen(st.scr);
    case 'card': return animalCard();
    case 'pcard': return placeCard();
    case 'scard': return speciesCard();
    case 'rcard': return recCard();
    case 'gaps': return gapsScreen();
    case 'clog': return clogScreen();
    case 'users': return isAdmin() ? usersScreen() : moreScreen();
    default: return nowScreen();
  }
}
function render() {
  const root = app();
  // keep focus and caret in the field being typed into
  const ae = document.activeElement, fk = ae && ae !== document.body && (ae.id ? '#' + ae.id : ['data-in', 'data-ein', 'data-etr', 'data-uin'].map(a => ae.getAttribute(a) != null ? `[${a}="${ae.getAttribute(a)}"]` : '').find(Boolean));
  const caret = fk && ae.selectionStart != null ? [ae.selectionStart, ae.selectionEnd] : null;
  const scrolls = [...root.querySelectorAll('.scroll,.shbody')].map(x => x.scrollTop);
  document.documentElement.lang = lang;
  if (st.gate !== 'app') { root.innerHTML = `<div class="app">${loginScreen(st.gate)}</div>`; }
  else {
    root.innerHTML = `<div class="app scr-${st.scr}">${screen()}${st.scr === 'rcard' && commentsOn && canWrite() ? '' : bottomNav()}${addSheet()}${st.tmenu ? treatMenu() : ''}${st.wmenu ? watchMenu() : ''}${edSheet()}${st.msheet ? mSheet() : ''}${st.uform ? userSheet() : ''}${st.cf ? confirmBox() : ''}</div>`;
  }
  const sc = [...root.querySelectorAll('.scroll,.shbody')]; sc.forEach((x, i) => { if (scrolls[i] != null) x.scrollTop = scrolls[i]; });
  if (fk) { try { const el = root.querySelector(fk); if (el) { el.focus({preventScroll: true}); if (caret && el.setSelectionRange) el.setSelectionRange(caret[0], caret[1]); } } catch (x) {} }
  const need = st.gate === 'app' ? D.ph.map(x => thumbOf(x.path)).filter(p => !urls.has(p) && !urlTried.has(p)) : [];
  if (need.length && !render.loading) { render.loading = 1; need.forEach(p => urlTried.add(p)); ensureUrls(need).then(() => { render.loading = 0; if (need.some(p => urls.has(p))) render(); }); }
}

/* ---------- input ---------- */
let inT = 0;
const later = fn => { clearTimeout(inT); inT = setTimeout(fn, 180); };
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'q') { st.q = t.value; st.lim = 150; return later(render); }
  if (t.id === 'lq') { st.lq = t.value; return later(render); }
  if (t.id === 'wq') { st.wq = t.value; return later(render); }
  if (t.id === 'tendn') { st.tendv.note = t.value; return; }
  if (t.id === 'cin') { st.cin = t.value; return; }
  if (t.dataset.in != null && st.add) {
    const p = t.dataset.in; if (p === 'spq') { st.add.spq = t.value; st.add.fv.sp = null; st.add.spOpen = 1; return later(render); }
    setP(st.add, p, t.value);
    if (p === 'fv.drug') { st.add.medOpen = 1; st.add.fv.rx = null; return later(render); }
    if (p === 'fv.days') { return; }
    return;
  }
  if (t.dataset.ein != null && st.ed) { const p = t.dataset.ein; if (p === 'spq') { st.ed.spq = t.value; st.ed.spOpen = 1; return later(render); } setP(st.ed.v, p, t.value); return; }
  if (t.dataset.etr != null && st.ed) { setTr(t.dataset.etr, t.value); return; }
  if (t.dataset.uin != null && st.uform) { st.uform[t.dataset.uin] = t.value; return; }
});
document.addEventListener('change', async e => {
  const t = e.target;
  if (t.dataset.fphoto && st.add) { st.add.files = [...t.files]; render(); return; }
  if (t.dataset.upload) {
    const [type, id] = t.dataset.upload.split(':'), files = [...t.files]; if (!files.length) return;
    toast(L('Wysyłanie zdjęć…', 'Загрузка фото…', 'Uploading photos…'));
    let fail = 0; for (const f of files) { try { await uploadPhoto(f, type, id); } catch (x) { fail++; } }
    await ensureUrls(D.ph.map(p => thumbOf(p.path)));
    toast(fail ? L('Nie wszystkie zdjęcia się wysłały', 'Не все фото загрузились', 'Not all photos were uploaded') : L('Dodano zdjęcia', 'Фото добавлены', 'Photos added')); render();
  }
});
document.addEventListener('submit', async e => {
  if (e.target.id !== 'loginf') return; e.preventDefault();
  const login = $('#lgl').value.trim().toLowerCase(), pass = $('#lgp').value, er = m => { $('#lge').textContent = m; };
  if (!login || !pass) return er(L('Podaj login i hasło', 'Введи логин и пароль', 'Enter login and password'));
  const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true;
  const {error} = await sb.auth.signInWithPassword({email: login.includes('@') ? login : login + '@' + LOGIN_DOMAIN, password: pass});
  btn.disabled = false;
  if (error) return er(error.status === 400 || error.code === 'invalid_credentials' ? L('Zły login lub hasło', 'Неверный логин или пароль', 'Wrong login or password') : L('Brak sieci — spróbuj ponownie', 'Нет сети — попробуй ещё раз', 'No network — try again'));
  boot();
});

/* ---------- dictation ---------- */
let rec0 = null;
function dictate(id, btn) {
  if (!SR) return;
  if (rec0) { try { rec0.stop(); } catch (x) {} rec0 = null; return; }
  const ta = document.getElementById(id); if (!ta) return;
  const r = new SR(); r.lang = LOC(); r.interimResults = false; r.continuous = false;
  r.onresult = ev => { const txt = [...ev.results].map(x => x[0].transcript).join(' ').trim(); if (!txt) return; ta.value = (ta.value.trim() ? ta.value.trim() + ' ' : '') + txt; ta.dispatchEvent(new Event('input', {bubbles: true})); };
  r.onend = () => { rec0 = null; btn.classList.remove('on'); };
  r.onerror = () => { rec0 = null; btn.classList.remove('on'); };
  rec0 = r; btn.classList.add('on'); try { r.start(); } catch (x) { rec0 = null; btn.classList.remove('on'); }
}

/* ---------- clicks ---------- */
const togg = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : arr.concat(v);
document.addEventListener('click', async e => {
  const b = e.target.closest('button,[data-ph],[data-gal],[data-close],[data-cf]'); if (!b || b.disabled) return;
  const d = b.dataset, f = st.add;
  if (b.closest('label') && b.tagName !== 'BUTTON') return;
  // confirm box
  if (d.cf) { const k = st.cf; st.cf = ''; if (d.cf === 'yes') { if (k === 'add') st.add = null; if (k === 'exit') { st.gate = 'bye'; history.go(-2); setTimeout(() => { try { window.close(); } catch (x) {} st.gate = 'app'; render(); }, 400); return; } if (k === 'del') { const r = D.rec.find(x => x.id === st.rec); try { await dropRecord(r.id); toast(L('Usunięto', 'Удалено', 'Deleted')); history.back(); } catch (x) { toast(errText(x)); } } } return render(); }
  if (d.mic) return dictate(d.mic, b);
  if (d.close) { if (d.close === 'add' && addDirty()) st.cf = 'add'; else if (d.close === 'tmenu') { st.tmenu = null; st.tend = 0; st.tendv = {}; } else st[d.close] = d.close === 'msheet' ? '' : null; return render(); }
  // sign-in gate
  if (d.lang) { lang = d.lang; store.set('zoo-log-lang2', lang); return render(); }
  if (d.logout) { try { await sb.auth.signOut(); } catch (x) {} location.reload(); return; }
  if (d.claim) { const {data, error} = await sb.rpc('claim_first_admin', {p_name: ''}); if (error || !data) return toast(error ? errText(error) : L('Brak uprawnień', 'Нет прав', 'No permission')); return boot(); }
  if (st.gate !== 'app') return;
  // add flow
  if (d.fab) { newAdd({step: 'menu'}); return render(); }
  if (d.menu) { if (d.menu === 'animal') { st.multi = new Set(); st.wq = ''; f.step = 'who'; f.target = 'animal'; } if (d.menu === 'places') { f.step = 'places'; f.target = 'place'; } if (d.menu === 'free') Object.assign(f, {step: 'form', kind: 'dept', target: 'dept'}); return render(); }
  if (d.step != null && f) { f.step = d.step; f.err = ''; if (d.step === 'who') f.target = 'animal'; return render(); }
  if (d.ck) { st.multi.has(d.ck) ? st.multi.delete(d.ck) : st.multi.add(d.ck); return render(); }
  if (d.ckall != null) { const list = anActive().filter(a => (anEncl(a) || '') === d.ckall), all = list.every(a => st.multi.has(a.id)); list.forEach(a => all ? st.multi.delete(a.id) : st.multi.add(a.id)); return render(); }
  if (d.ckclear) { st.multi = new Set(); return render(); }
  if (d.gomulti) { if (st.multi.size === 1) { f.target = 'animal'; f.ani = [...st.multi][0]; st.multi = new Set(); } else f.target = 'multi'; f.step = 'what'; f.from = 'who'; return render(); }
  if (d.pickplc) { st.add = null; go({scr: 'pcard', plc: d.pickplc}); return; }
  if (d.add) { newAdd(d.add === 'an' ? {step: 'what', target: 'animal', ani: st.ani, from: 'card'} : {step: 'what', target: 'place', plc: st.plc, from: 'card'}); return render(); }
  if (d.kind && f) {
    Object.assign(f, {kind: d.kind, step: 'form', err: '', fv: {}, pa: {}});
    if (d.kind === 'tdose') { const rx = activeTreatments().filter(x => tgt().some(a => key(a.name) === key(x.r.bird))); if (rx.length === 1) { const r = rx[0].r; Object.assign(f.fv, {rx: r.id, drug: r.f.drug || '', dose: r.f.dose || '', route: r.f.route || ''}); } }
    return render();
  }
  if (d.arrive) { newAdd({step: 'form', kind: 'arrive', target: 'none', fv: {cnt: 0}}); return render(); }
  if (d.fv && f) {
    const k = d.fv, fv = f.fv;
    if (d.i === 't') fv[k] = !fv[k];
    else if (d.pid) fv[k] = togg(fv[k] || [], d.pid);
    else if (d.u) fv.wu = d.u;
    else if (d.s != null) fv[k] = fv[k] === d.s && !['sx0', 'sx1', 'sx2', 'sx3', 'to'].includes(k) ? null : d.s;
    else if (d.n) fv[k] = fv[k] === +d.n && k !== 'v' ? null : +d.n;
    else if (d.m) fv[k] = togg(fv[k] || [], +d.i);
    else fv[k] = fv[k] === +d.i && k !== 'cnt' ? null : +d.i;
    return render();
  }
  if (d.pv && f) { setP(f, `pa.${d.pv}.v`, +d.n); return render(); }
  if (d.pa && f) { setP(f, `pa.${d.pa}.open`, !getP(f, `pa.${d.pa}.open`)); return render(); }
  if (d.showat && f) { f.showAt = 1; f.at = f.at || localDT(Date.now()); return render(); }
  if (d.medtoggle && f) { f.medOpen = !f.medOpen; return render(); }
  if (d.med != null && f) { const m = medList().find(x => x.name === d.med) || {}; Object.assign(f.fv, {drug: d.med, rx: null}); if (m.dose && !f.fv.dose) f.fv.dose = m.dose; if (m.route && !f.fv.route) f.fv.route = m.route; f.medOpen = 0; return render(); }
  if (d.fromrx && f) { if (f.fv.rx === d.fromrx) f.fv.rx = null; else { const r = D.rec.find(x => x.id === d.fromrx); Object.assign(f.fv, {rx: r.id, drug: r.f.drug || '', dose: r.f.dose || '', route: r.f.route || ''}); } return render(); }
  if (d.mvopen && f) { f.mv.open = !f.mv.open; return render(); }
  if (d.mvto && f) { f.mv.to = d.mvto; f.mv.open = 0; return render(); }
  if (d.mvby && f) { f.mv.by = togg(f.mv.by, d.mvby); return render(); }
  if (d.mvproc && f) { f.mv.proc = togg(f.mv.proc, d.mvproc); return render(); }
  if (d.mvw && f) { f.mv.wing[d.mvw] = f.mv.wing[d.mvw] === +d.v ? null : +d.v; return render(); }
  if (d.mvu && f) { f.mv.wu = d.mvu; return render(); }
  if (d.inja && f) { f.mv.inj[d.inja] = +d.v; return render(); }
  if (d.injall && f) { tgt().forEach(a => { f.mv.inj[a.id] = 0; }); return render(); }
  if (d.mk && f) { f.mv.mk[d.mk] = f.mv.mk[d.mk] === +d.v ? null : +d.v; return render(); }
  if (d.spopen && f) { f.spOpen = !f.spOpen; return render(); }
  if (d.spsel && f) { f.fv.sp = d.spsel; f.spOpen = 0; f.spq = ''; return render(); }
  if (d.save && f) return saveForm();
  if (d.kpar && f) { f.kids.par = togg(f.kids.par, d.kpar); return render(); }
  if (d.ksx && f) { f.kids.sx[+d.ksx] = d.s; return render(); }
  if (d.savekids && f) return saveKids();
  // quick actions from "Now" and cards
  if (d.dose) { const r = D.rec.find(x => x.id === d.dose); return quick('tdose', r, clean({drug: r.f.drug, dose: r.f.dose, route: r.f.route, rx: r.id})); }
  if (d.undorec) { try { await dropRecord(d.undorec); toast(L('Cofnięto', 'Отменено', 'Undone')); } catch (x) { toast(errText(x)); } return render(); }
  if (d.score) { const r = D.rec.find(x => x.id === d.score); return quick('score', r, {v: +d.n, of: r.id}); }
  if (d.deptdone) { const r = D.rec.find(x => x.id === d.deptdone); return quick('dept', {bird: '—'}, clean({kind: r.f.kind, rep: 1}), r.note); }
  if (d.tmenu) { st.tmenu = d.tmenu; st.tend = 0; st.tendv = {}; return render(); }
  if (d.tend) { st.tend = 1; return render(); }
  if (d.tendr) { st.tendv.why = +d.tendr; return render(); }
  if (d.tendok) { const r = D.rec.find(x => x.id === st.tmenu), v = st.tendv; st.tmenu = null; st.tend = 0; st.tendv = {}; return quick('tend', r, clean({drug: r.f.drug, why: v.why, result: v.why != null ? OPT.endwhy()[v.why] : '', rx: r.id}), String(v.note || '').trim()); }
  if (d.editrx) { const r = D.rec.find(x => x.id === st.tmenu); st.tmenu = null; openEdit(r); return render(); }
  if (d.extend) { const r = D.rec.find(x => x.id === st.tmenu), n = +d.extend, el = Math.floor((today0() - midnight(r.at)) / DAY) + 1; const nf = Object.assign({}, r.f, {days: (r.f.until ? Math.round((new Date(r.f.until).getTime() - midnight(r.at)) / DAY) + 1 : r.f.days || el) + n}); delete nf.k; delete nf.until;
    try { await updateRecord(r, nf); st.tmenu = null; toast(L(`Przedłużono o ${n} dni`, `Продлено на ${n} дн.`, `Extended by ${n} days`)); } catch (x) { toast(errText(x)); } return render(); }
  if (d.wmenu) { st.wmenu = d.wmenu; return render(); }
  if (d.wend) { const r = D.rec.find(x => x.id === st.wmenu); st.wmenu = null; return quick('wend', r, {of: r.id}); }
  // navigation
  if (d.back) { history.back(); return; }
  if (d.scr) { st.add = null; st.ed = null; st.msheet = ''; go({scr: d.scr}); return; }
  if (d.ani) { st.add = null; st.tmenu = null; st.wmenu = null; go({scr: 'card', ani: d.ani}); return; }
  if (d.plc) { st.add = null; go({scr: 'pcard', plc: d.plc}); return; }
  if (d.sp) { go({scr: 'scard', sp: d.sp, spTab: 'wild'}); st.acc = new Set(); return render(); }
  if (d.rec) { st.tmenu = null; st.wmenu = null; st.replyTo = ''; go({scr: 'rcard', rec: d.rec}); return; }
  if (d.flt) { st.flt = d.flt; st.lim = 150; if (st.scr !== 'logs') go({scr: 'logs'}); else render(); return; }
  if (d.more) { st.lim += 150; return render(); }
  if (d.mon != null) { const n = +d.mon, now = new Date(); let y = st.cy ?? now.getFullYear(), m = st.cm ?? now.getMonth(); if (n === 0) { y = now.getFullYear(); m = now.getMonth(); st.dk = dayKey(Date.now()); } else { m += n; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } st.dk = `${y}-${m}-1`; } st.cy = y; st.cm = m; return render(); }
  if (d.day) { st.dk = d.day; return render(); }
  if (d.cal) { st.calMode = d.cal; return render(); }
  if (d.fold) { st.folded.has(d.fold) ? st.folded.delete(d.fold) : st.folded.add(d.fold); return render(); }
  if (d.acc) { st.acc.has(d.acc) ? st.acc.delete(d.acc) : st.acc.add(d.acc); return render(); }
  if (d.sptab) { st.spTab = d.sptab; return render(); }
  if (d.gal != null) { st.gal = +d.gal; st.phf = 'all'; return render(); }
  if (d.phf) { st.phf = d.phf; return render(); }
  if (d.ph != null) { st.ph = +d.ph; if (st.ph >= 0) { const kind = st.scr === 'pcard' ? 'pl' : st.scr === 'scard' ? 'sp' : 'an', x = photosFor(kind, kind === 'pl' ? st.plc : kind === 'sp' ? st.sp : st.ani)[st.ph]; if (x && x.p) await ensureUrls([x.p.path]); } return render(); }
  if (d.open != null) { st.lbx = d.open; if (d.open) await ensureUrls([d.open]); return render(); }
  // record card
  if (d.editrec) { const r = D.rec.find(x => x.id === st.rec); if (r && canEditRec(r)) openEdit(r); return render(); }
  if (d.delrec) { st.cf = 'del'; return render(); }
  if (d.reply != null) { st.replyTo = d.reply; render(); const c = $('#cin'); if (c) c.focus(); return; }
  if (d.send) { const c = $('#cin'), body = c ? c.value.trim() : ''; if (!body) return; b.disabled = true; try { await addComment(st.rec, body.slice(0, 2000), st.replyTo || null); st.replyTo = ''; st.cin = ''; markSeen(st.rec); } catch (x) { toast(errText(x)); } return render(); }
  if (d.delcom) { const c = (D.com.get(st.rec) || []).find(x => x.id === d.delcom); try { await dropComment(c); } catch (x) { toast(errText(x)); } return render(); }
  // edits
  if (d.edform) { openEd(d.edform, !!d.new); return render(); }
  if (st.ed) {
    const e2 = st.ed;
    if (d.lock) { e2.locks = togg(e2.locks.filter(x => x !== '*'), d.lock); return render(); }
    if (d.eset) { setP(e2.v, d.eset, d.b != null ? d.b === '1' : d.s); return render(); }
    if (d.epar) { e2.v.parents = togg(e2.v.parents || [], d.epar); return render(); }
    if (d.espopen) { e2.spOpen = !e2.spOpen; return render(); }
    if (d.espsel) { e2.v.species_id = d.espsel; e2.spOpen = 0; e2.spq = ''; return render(); }
    if (d.edlang) { e2.edLang = d.edlang; return render(); }
    if (d.edsave) return saveEd();
  }
  // More
  if (d.thm) { store.set('v2theme', d.thm); applyTheme(); return render(); }
  if (d.old) { location.href = '../'; return; }
  if (d.msheet) { st.msheet = d.msheet; st.mv2 = {per: 0}; return render(); }
  if (d.csvper) { st.mv2.per = +d.csvper; return render(); }
  if (d.csv) return csvExport();
  if (d.pwsave) { const a = $('#pw1').value, c = $('#pw2').value; if (a.length < 8) { st.mv2.err = L('Hasło: min. 8 znaków', 'Пароль: не меньше 8 символов', 'Password: at least 8 characters'); return render(); } if (a !== c) { st.mv2.err = L('Hasła się różnią', 'Пароли не совпадают', 'Passwords differ'); return render(); }
    const {error} = await sb.auth.updateUser({password: a}); if (error) { st.mv2.err = errText(error); return render(); } st.msheet = ''; toast(L('Hasło zmienione', 'Пароль изменён', 'Password changed')); return render(); }
  if (d.uform) { const p = D.prof.get(d.uform); st.uform = p ? {id: p.id, name: p.display_name || '', role: p.role, active: p.active !== false, pass: ''} : {id: 'new', role: 'staff', name: '', login: '', pass: ''}; return render(); }
  if (d.urole && st.uform) { st.uform.role = d.urole; return render(); }
  if (d.uactive && st.uform) { st.uform.active = !st.uform.active; return render(); }
  if (d.usave) return saveUser();
  if (d.gopen != null) { st.gopen = st.gopen === +d.gopen ? -1 : +d.gopen; return render(); }
  if (d.cltab) { st.cltab = d.cltab; return render(); }
});
// calendar swipe
let sx0 = null;
document.addEventListener('pointerdown', e => { sx0 = e.target.closest('#mgrid') ? e.clientX : null; });
document.addEventListener('pointerup', e => { if (sx0 == null) return; const dx = e.clientX - sx0; sx0 = null; if (Math.abs(dx) > 50) { const b = document.createElement('button'); b.dataset.mon = dx < 0 ? '1' : '-1'; b.hidden = true; app().appendChild(b); b.click(); b.remove(); } });
window.addEventListener('online', render); window.addEventListener('offline', render);

/* ---------- boot ---------- */
let booted = false;
async function boot() {
  const {data: {session}} = await sb.auth.getSession();
  if (!session) { st.gate = 'login'; return render(); }
  me = session.user.id; st.gate = 'loading'; render();
  const {data: prof, error} = await sb.from('profiles').select('*').eq('id', me).maybeSingle();
  if (error) { st.gate = 'login'; render(); const e = $('#lge'); if (e) e.textContent = L('Brak sieci — spróbuj ponownie', 'Нет сети — попробуй ещё раз', 'No network — try again'); return; }
  if (!prof || prof.active === false) {
    st.canClaim = false; const em = String(session.user.email || '');
    if (!prof && em && !em.endsWith('@' + LOGIN_DOMAIN) && session.user.email_confirmed_at) { const {data: has} = await sb.rpc('journal_has_admin'); st.canClaim = has === false; }
    st.gate = 'noacc'; return render();
  }
  myProfile = prof;
  try { await loadAll(); } catch (x) { toast(L('Nie udało się wczytać danych', 'Не удалось загрузить данные', 'Could not load data')); }
  st.gate = 'app';
  if (!booted) { booted = true; history.replaceState({v2: 1, root: 1}, ''); history.pushState({v2: 1, nav: navOf()}, ''); subscribe(); }
  render();
}
sb = supabase.createClient(SB_URL, SB_KEY, {auth: {persistSession: true, autoRefreshToken: true}});
sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') { st.gate = 'login'; render(); } });
render();
boot();
