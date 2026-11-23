/* ---------- keeping data fresh ----------
   Live: Supabase realtime -> only the changed tables reload.
   Safety net: a cheap "version" of the server (newest change_log id + comments count/newest) is checked when the app
   comes back to the screen, when the network returns, after the live channel reconnects and every minute;
   if the server is ahead, everything reloads.
   Button next to the account: reload by hand; highlighted when newer data exists but could not be loaded. */
BirdLog.icons.sync = '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8"/><path d="M4 3.5V8h4.5"/><path d="M4 13a8 8 0 0 0 14.6 4.5L20 16"/><path d="M20 20.5V16h-4.5"/>';
const SYNC = {sig: null, busy: 0, stale: false, ch: null, live: false, wasLive: false, rt: 0};

async function syncSig() {
  const [a, c] = await Promise.all([
    sb.from('change_log').select('id').order('id', {ascending: false}).limit(1),
    sb.from('comments').select('id', {count: 'exact'}).order('created_at', {ascending: false}).limit(1)
  ]);
  if (a.error) throw a.error;
  const top = (a.data || [])[0], cm = c.error ? null : c;
  return [top ? top.id : 0, cm ? cm.count ?? '' : '', cm && cm.data && cm.data[0] ? cm.data[0].id : ''].join('|');
}

// every full load remembers the server version it matches
const _loadAllS = loadAll;
loadAll = async function () {
  const s = await syncSig().catch(() => null);
  await _loadAllS();
  if (s) SYNC.sig = s;
  SYNC.stale = false;
};

// force = the button: always reload everything
async function syncAll(force) {
  if (SYNC.busy || st.gate !== 'app') return;
  if (!force && !navigator.onLine) return;
  SYNC.busy = 1; if (force) render();
  let s = null, changed = !!force;
  try { s = await syncSig(); } catch (x) {
    SYNC.busy = 0; if (force) { toast(L('Brak sieci — spróbuj ponownie', 'Нет сети — попробуй ещё раз', 'No network — try again')); render(); } return;
  }
  if (force || s !== SYNC.sig) {
    changed = true;
    try { await _loadAllS(); SYNC.sig = s; SYNC.stale = false; if (force) toast(L('Dane aktualne', 'Данные обновлены', 'Data up to date')); }
    catch (x) { SYNC.stale = true; if (force) toast(L('Nie udało się odświeżyć', 'Не удалось обновить', 'Could not refresh')); }
  }
  SYNC.busy = 0;
  if (changed) render();
}

// live channel; reconnects by itself and catches up on what was missed while it was down
subscribe = function () {
  const old = SYNC.ch; let pend = new Set(), t = 0, ch;
  try {
    ch = SYNC.ch = sb.channel('v2-' + Date.now()).on('postgres_changes', {event: '*', schema: 'public'}, p => {
      if (ch !== SYNC.ch || !LOAD[p.table]) return; pend.add(p.table); clearTimeout(t);
      t = setTimeout(async () => {
        const l = [...pend]; pend = new Set();
        try { const s = await syncSig().catch(() => null); await Promise.all(l.map(x => LOAD[x]())); if (s) SYNC.sig = s; }
        catch (x) { SYNC.stale = true; }
        render();
      }, 500);
    }).subscribe(status => {
      if (ch !== SYNC.ch) return;
      const was = SYNC.live; SYNC.live = status === 'SUBSCRIBED';
      if (SYNC.live && !was && SYNC.wasLive) syncAll();
      if (SYNC.live) SYNC.wasLive = true;
      if (!SYNC.live && /ERROR|TIMED_OUT|CLOSED/.test(String(status))) {
        clearTimeout(SYNC.rt); SYNC.rt = setTimeout(() => { if (!SYNC.live && navigator.onLine && ch === SYNC.ch) subscribe(); }, 5000);
      }
    });
  } catch (x) {}
  if (old) { try { sb.removeChannel(old); } catch (x) {} }
};

const syncWake = () => { if (st.gate !== 'app') return; syncAll(); if (SYNC.ch && !SYNC.live) subscribe(); };
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncWake(); });
window.addEventListener('online', syncWake);
window.addEventListener('pageshow', e => { if (e.persisted) syncWake(); });
setInterval(() => { if (document.visibilityState === 'visible') syncAll(); }, 60000);

function syncBtn() {
  const cls = SYNC.busy ? ' busy' : SYNC.stale ? ' stale' : '';
  const lab = SYNC.stale ? L('Są nowe dane — odśwież', 'Есть новые данные — обновить', 'New data — refresh') : L('Odśwież dane', 'Обновить данные', 'Refresh data');
  return `<button class="sync${cls}" data-sync="1" aria-label="${lab}" title="${lab}">${ic('sync', 18, 2.2)}</button>`;
}
document.addEventListener('click', e => { if (e.target.closest('[data-sync]')) syncAll(true); });
// the button goes into every main-screen header, before the account button (render comes from main.js, loaded later)
addEventListener('DOMContentLoaded', () => {
  const _renderS = render;
  render = function () { _renderS(); document.querySelectorAll('.hd > .me').forEach(m => m.insertAdjacentHTML('beforebegin', syncBtn())); };
  render();
});

document.head.insertAdjacentHTML('beforeend', `<style>
.hd .sync{margin-left:auto;flex:none;position:relative;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--card);box-shadow:var(--shadow-card);color:var(--muted)}
.hd .sync + .me{margin-left:0}
.hd .sync.busy svg{animation:syncspin .9s linear infinite}
.hd .sync.stale{background:var(--accent);color:var(--on-accent)}
.hd .sync.stale::after{content:'';position:absolute;top:0;right:0;width:10px;height:10px;border-radius:50%;background:var(--health);box-shadow:0 0 0 2px var(--bg)}
@keyframes syncspin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.hd .sync.busy svg{animation:none;opacity:.5}}
</style>`);
