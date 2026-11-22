// changelog.js — change log screen
/* ---------- change log ---------- */
function logLine(x) {
  if (x.kind === 'dev') return x.summary;
  const what = x.entity === 'records' && x.extra && T[x.extra.type] ? evLabel(x.extra.type) + ' · ' + bn(x.label) : x.entity === 'photos' ? t('le_' + (x.extra && x.extra.owner ? 'photos' : 'photos')) : t('le_' + x.entity) + (x.label ? ' «' + (x.entity === 'collection' ? bn(x.label) : x.entity === 'enclosures' ? enDn(x.label) : x.label) + '»' : '');
  const f = (x.fields || []).map(k => t('lf_' + k) === 'lf_' + k ? k : t('lf_' + k)).filter((v, i, a) => a.indexOf(v) === i).join(', ');
  return t('lg_' + x.action) + ': ' + what + (x.action === 'update' && f ? ' — ' + f : '') + (x.summary ? ' — ' + x.summary : '');
}
function renderLog() {
  if (!$('#log-body')) return;
  $('#log-count').textContent = t('log_count', logRows.length);
  const cnt = k => logRows.filter(x => k === 'all' || x.kind === k).length;
  const ver = logRows.reduce((m, x) => x.kind === 'dev' && x.ver > m ? x.ver : m, 0);
  if ($('#app-ver')) $('#app-ver').textContent = ver ? t('app_ver', ver) : '';
  $('#lg-chips').innerHTML = ['all', 'user', 'ai', 'dev'].map(k => `<button class="chip" type="button" data-lgf="${k}" aria-pressed="${lgf === k}">${esc(t('lg_' + k))} <span class="chip-n">${cnt(k)}</span></button>`).join('');
  const list = logRows.filter(x => lgf === 'all' || x.kind === lgf);
  if (!list.length) { $('#log-body').innerHTML = `<p class="empty">${esc(t('log_empty'))}</p>`; return; }
  let h = '', last = '';
  for (const x of list) {
    const k = dayKey(x.at);
    if (k !== last) { h += `<h2 class="day">${esc(dayTitle(x.at))}</h2>`; last = k; }
    const who = x.kind === 'dev' ? t('lg_dev_who') : x.kind === 'ai' ? t('lg_ai_who') : x.actor ? authorName(x.actor) || '—' : t('lg_sys');
    const num = x.kind === 'dev' && x.ver ? `<span class="lg-ver">v${esc(x.ver)}</span>` : `<span class="lg-n">${esc(t('lg_n', x.id))}</span>`;
    h += `<div class="lg-row${x.kind === 'dev' ? ' dev' : x.kind === 'ai' ? ' ai' : ''}"><time>${esc(fTime.format(x.at))}</time><span class="lg-t">${num}<b>${esc(who)}</b> ${esc(logLine(x))}</span>${isAdmin() ? `<button type="button" class="lg-del${logDelArmed === String(x.id) ? ' armed' : ''}" data-lg-del="${esc(x.id)}" aria-label="${esc(t('lg_del'))}">${logDelArmed === String(x.id) ? esc(t('lg_del2')) : ic('x', 16, 2.2)}</button>` : ''}</div>`;
  }
  $('#log-body').innerHTML = h;
}
