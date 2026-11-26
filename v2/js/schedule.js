// schedule.js — v2: «Now» and timed doses.
// Tapping a task card (not its buttons) opens the record card of that event.
// Treatment 2×/3× a day and observation «several times a day» get a time for each dose / check (f.times = ['08:00', …]).
// In «Now» the «Give» (score) button shows from 30 min before the time on; earlier — «Give at 14:00». «Now» re-renders once a minute.
document.addEventListener('click', e => {
  if (e.target.closest('button,a,input,textarea,label')) return;
  const t = e.target.closest('.bl-task[data-trec]'); if (!t || !D.rec.some(r => r.id === t.dataset.trec)) return;
  st.tmenu = null; st.wmenu = null; go({scr: 'rcard', rec: t.dataset.trec, recFeeding: !!t.dataset.feedCard});
});
const SLOTS = f => f.kind === 'tstart' ? ({1: 2, 2: 3})[f.fv.freq] || 0 : f.kind === 'watch' ? (f.fv.freq === 0 ? 3 : 0) : 0;
const timesLbl = k => k === 'tstart' ? L('Godziny podania', 'Время подачи', 'Dose times') : L('Godziny oceny', 'Время оценки', 'Check times');
function timesBlock(f) {
  const n = SLOTS(f); if (!n) return '';
  if (Array.isArray(f.fv.times) && f.fv.tm0 == null) f.fv.times.forEach((t, i) => { f.fv['tm' + i] = t; });
  return fld(timesLbl(f.kind), `<div class="tmrow">${[...Array(n)].map((_, i) => `<label class="tmi"><em>${i + 1}</em><input type="time" class="inp" data-in="fv.tm${i}" value="${esc(f.fv['tm' + i] || '')}"></label>`).join('')}</div>`);
}
const _medFormS = medForm;
medForm = function () {
  const h = _medFormS(), f = F(); if (!f || f.kind !== 'tstart') return h;
  const tb = timesBlock(f), m = `<div class="bl-field "><span>${L('Ile dni', 'Сколько дней', 'How many days')}</span>`, i = h.indexOf(m);
  return !tb || i < 0 ? h : h.slice(0, i) + tb + h.slice(i);
};
const _genericFormS = genericForm;
genericForm = function () {
  const h = _genericFormS(), f = F(); if (!f || f.kind !== 'watch') return h;
  const tb = timesBlock(f), m = `<label class="bl-field"><span>${descLbl()}</span>`, i = h.indexOf(m);
  return !tb || i < 0 ? h : h.slice(0, i) + tb + h.slice(i);
};
const _saveFormS = saveForm;
saveForm = function () {
  const f = F();
  if (f && (f.kind === 'tstart' || f.kind === 'watch')) {
    const n = SLOTS(f), tm = [];
    for (let i = 0; i < 3; i++) { const v = String(f.fv['tm' + i] || ''); if (i < n && /^\d{1,2}:\d{2}$/.test(v)) tm.push(v.padStart(5, '0')); delete f.fv['tm' + i]; }
    if (tm.length) f.fv.times = [...new Set(tm)].sort(); else delete f.fv.times;
  }
  return _saveFormS();
};
const _recDetailsS = recDetails;
recDetails = function (r) {
  const out = _recDetailsS(r);
  if ((r.k === 'tstart' || r.k === 'watch') && Array.isArray(r.f.times) && r.f.times.length) out.push([timesLbl(r.k), r.f.times.join(', ')]);
  return out;
};
const slotAt = t => { const [h, m] = t.split(':').map(Number); return today0() + (h * 60 + m) * 60000; };
const _taskCardsS = taskCards;
taskCards = function () {
  const T = _taskCardsS(), ends = new Map(activeTreatments().map(x => [x.r.id, x.end]));
  for (const x of T) {
    const r = x.rx || x.watch, tm = r && r.f.times; if (!tm || !tm.length) continue;
    const per = x.rx ? (r.f.freq != null ? FREQ_N[r.f.freq] : 1) : ((r.f.freq ?? 3) === 0 ? 3 : 1); if (tm.length < per) continue;
    const n = x.rx ? D.rec.filter(d => d.k === 'tdose' && key(d.bird) === key(r.bird) && d.at > r.at && d.at >= today0() && (!r.f.drug || !d.f.drug || key(d.f.drug) === key(r.f.drug))).length
      : D.rec.filter(d => d.k === 'score' && key(d.bird) === key(r.bird) && d.at >= r.at && d.at >= today0()).length;
    const end = x.rx && ends.get(r.id);
    x.meta = tm.map((t, i) => i < n ? t + ' ✓' : t).join(' · ') + (end ? ' · ' + L('do ', 'до ', 'until ') + fDate(end - DAY) : '');
    if (n >= tm.length) { x.need = false; x.when = ''; x.act = x.rx ? 'dosed' : ''; continue; }
    const t = tm[n], ready = Date.now() >= slotAt(t) - 30 * 60000;
    x.slot = {t, ready}; x.need = ready; x.when = t; x.act = x.rx ? 'dose' : 'score';
  }
  return T;
};
const _taskHTMLS = taskHTML;
taskHTML = function (x) {
  let h = _taskHTMLS(x); const rid = x.rec || (x.rx || x.watch || x.dept || {}).id || String(x.id || '').slice(1);
  h = h.replace('<div class="bl-task ', `<div data-trec="${esc(rid)}"${x.rec ? ' data-feed-card="1"' : ''} class="bl-task `);
  if (x.slot && !x.slot.ready) {
    const w = `<span class="slotw">${ic('clock', 16)}${x.rx ? L('Podać o ', 'Подать в ', 'Give at ') : L('Ocenić o ', 'Оценить в ', 'Score at ')}<b>${x.slot.t}</b></span>`;
    h = x.rx ? h.replace(/<button class="bl-btn solid grow" data-dose="[^"]*">[\s\S]*?<\/button>/, w) : h.replace(/<div class="bl-score">[\s\S]*?<\/div>/, w);
  } else if (x.slot && x.rx) h = h.replace(`${L('Podaj', 'Подать', 'Give')}</button>`, `${L('Podaj', 'Подать', 'Give')} · ${x.slot.t}</button>`);
  return h;
};
setInterval(() => { const ae = document.activeElement; if (st.scr === 'now' && !st.add && !st.cf && !st.tmenu && !st.wmenu && !(ae && ae.matches && ae.matches('input,textarea'))) render(); }, 60000);
document.head.insertAdjacentHTML('beforeend', '<style>.bl-task[data-trec]{cursor:pointer}.slotw{flex:1;display:inline-flex;align-items:center;gap:6px;min-height:42px;padding:0 12px;border-radius:12px;background:var(--soft);color:var(--ink-2);font:600 14px/1 var(--font-text)}.slotw b{color:var(--ink);font-weight:800}.tmrow{display:flex;gap:8px}.tmi{flex:1;display:flex;align-items:center;gap:6px;min-width:0}.tmi em{font:700 12px/1 var(--font-text);font-style:normal;color:var(--muted)}.tmi input{min-width:0;flex:1}</style>');
