// core.js — config (Supabase URL/key), helpers $ $$ esc, language t()/pw(), dates
/* ---------- config ---------- */
const SB_URL = 'https://nszeqgopzonpplfznaat.supabase.co';
const SB_KEY = 'sb_publishable_r_fN0QxiDijqW4t-Qnv9pA_SAzpKvdp';
const BUCKET = 'journal-photos';
const LOGIN_DOMAIN = 'zoo-log.invalid';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const I = {
  cross:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  egg:'<path d="M12 3c-3.6 0-6.5 5.6-6.5 10.2a6.5 6.5 0 0 0 13 0C18.5 8.6 15.6 3 12 3z"/>',
  chick:'<circle cx="14" cy="7" r="3.5"/><path d="M10.8 9C6.5 9.6 4 12.3 4 15a6.5 5.5 0 0 0 13 .5c.8-1.7.6-3.8-.6-5.3"/><path d="M17.4 5.8 20 7l-2.6 1.2"/><path d="M9 20.5V22M13 20.5V22"/>',
  swap:'<path d="M4 7h15M15 3l4 4-4 4"/><path d="M20 17H5M9 13l-4 4 4 4"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  syringe:'<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>',
  nesteggs:'<ellipse cx="9" cy="10" rx="2.6" ry="3.4"/><ellipse cx="15" cy="10.5" rx="2.6" ry="3.4"/><path d="M3 13.5c0 4 4 7 9 7s9-3 9-7z"/>',
  clip:'<rect x="5" y="4.5" width="14" height="17" rx="2"/><path d="M9 2.5h6v4H9z"/><path d="M12 10.5v6M9 13.5h6"/>',
  pill:'<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/><path d="m8.5 8.5 7 7"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8 5.7-5.8"/>',
  eggplus:'<path d="M11 4c-3.3 0-6 5.2-6 9.5a6 6 0 0 0 12 0c0-1.2-.2-2.5-.6-3.7"/><path d="M19 2.5v6M16 5.5h6"/>',
  sit:'<path d="M3 15.5c0 3 4 5.5 9 5.5s9-2.5 9-5.5z"/><path d="M5.5 15.5c0-4 2.8-6.5 6.5-6.5 1.6 0 2.8-.9 3.4-2.2"/><path d="M15.8 9.4c1.6 1.2 2.5 3.2 2.7 6.1"/><circle cx="17.6" cy="6" r="2"/><path d="M19.6 6h2"/>',
  crack:'<path d="M5.5 14a6.5 6.5 0 0 0 13 0"/><path d="M5.5 14l2.2-1.6 2 1.8 2.3-2 2.3 2 2-1.8 2.2 1.6"/><path d="M7.6 8.6C8.7 5.5 10.2 3.5 12 3.5s3.3 2 4.4 5.1l-2.1 1.3-2.3-1.6-2.3 1.6z"/>',
  out:'<path d="M3 17c0 2.5 4 4.5 9 4.5s9-2 9-4.5z"/><path d="M8 13.5 17 4.5"/><path d="M11 4.5h6v6"/>',
  chev:'<path d="m9 6 6 6-6 6"/>', x:'<path d="M18 6 6 18M6 6l12 12"/>', back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  book:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h8M8 11h6"/>',
  tag:'<path d="M12.6 2.6a2 2 0 0 0-1.4-.6H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  bird:'<path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  key:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
  person:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  tree:'<path d="M12 22v-6"/><path d="M12 2 5 12h4l-3 4h12l-3-4h4z"/>',
  leaf:'<path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-10-1 12-5 16-10 16z"/><path d="M4 21c3-6 7-9 11-11"/>',
  bowl:'<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-1.5 1-2 1-3M12 7c0-1.5 1-2 1-3M16 7c0-1.5 1-2 1-3"/>',
  home:'<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/>',
  heart:'<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/><path d="M7.5 12h2l1.5-3 2 5 1.5-2h2"/>',
  sex:'<circle cx="10" cy="14" r="5"/><path d="M10 19v3M8 21h4"/><path d="M15 3h6v6M21 3l-7 7"/>',
  ruler:'<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 7v4M10 7v3M14 7v4M18 7v3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cage:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 5v16M12 5v16M16 5v16M9 2h6M12 2v3"/>',
  building:'<path d="M4 21V7l8-4 8 4v14"/><path d="M2 21h20M9 21v-4h6v4M8 10h2M14 10h2M8 14h2M14 14h2"/>',
  calgrid:'<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><circle cx="8" cy="14" r="1"/><path d="M11 17.5h7"/>',
  chevl:'<path d="m15 6-6 6 6 6"/>',
  star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
  unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  drop:'<path d="M12 3s-6.5 7-6.5 11.5a6.5 6.5 0 0 0 13 0C18.5 10 12 3 12 3z"/>',
  paw:'<circle cx="5.5" cy="10" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M12 12c-3 0-5.5 3.5-5.5 6 0 1.7 1.3 3 3 3 1 0 1.7-.5 2.5-.5s1.5.5 2.5.5c1.7 0 3-1.3 3-3 0-2.5-2.5-6-5.5-6z"/>'
};
const ic = (n, s = 24, w = 2) => `<svg aria-hidden="true" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${I[n] || ''}</svg>`;
const paintIcons = root => $$('[data-ic]', root).forEach(e => { e.innerHTML = ic(e.dataset.ic, e.dataset.s || 24, e.dataset.w || 2); });

/* ---------- i18n ---------- */
const LOCALE = {ru: 'ru-RU', pl: 'pl-PL', en: 'en-GB'};
const LANG_FIELD = {ru: 'name', pl: 'pl', en: 'en'};
// Polish is the main language, English the second, Russian the third
const LANG_ORDER = ['pl', 'en', 'ru'];
let lang = 'pl';
try { const saved = localStorage.getItem('zoo-log-lang2'); if (DICT[saved]) lang = saved; } catch (x) {}
const t = (k, ...a) => { let v = DICT[lang][k]; for (const l of LANG_ORDER) if (v === undefined) v = DICT[l][k]; if (v === undefined) return k; return typeof v === 'function' ? v(...a) : v; };
const pIdx = n => {
  const m = n % 10, h = n % 100;
  if (lang === 'en') return n === 1 ? 0 : 1;
  if (lang === 'pl') return n === 1 ? 0 : m >= 2 && m <= 4 && (h < 12 || h > 14) ? 1 : 2;
  return m === 1 && h !== 11 ? 0 : m >= 2 && m <= 4 && (h < 12 || h > 14) ? 1 : 2;
};
const pw = (n, k) => { const f = t(k); return f[Math.min(pIdx(Math.abs(n)), f.length - 1)]; };
window.pw = pw;
let fTime, fDay, fLong, fDate;
function mkFmt() {
  const L = LOCALE[lang];
  fTime = new Intl.DateTimeFormat(L, {hour: '2-digit', minute: '2-digit'});
  fDay = new Intl.DateTimeFormat(L, {day: 'numeric', month: 'short'});
  fLong = new Intl.DateTimeFormat(L, {weekday: 'long', day: 'numeric', month: 'long'});
  fDate = new Intl.DateTimeFormat(L, {day: 'numeric', month: 'long', year: 'numeric'});
}
mkFmt();

const T = {
  expo:  {g:'expo', tone:'green', icon:'swap', fields:[{k:'from',l:'f_from',t:'text'},{k:'to',l:'f_to',t:'text',req:1}]},
  obs:   {g:'obs', tone:'grey', icon:'eye', fields:[], noteReq:1, noteLabel:'f_obs_note'},
  tstart:{g:'vet', tone:'red', icon:'clip', fields:[{k:'reason',l:'f_reason',t:'text'},{k:'drug',l:'f_drug',t:'text',req:1},{k:'days',l:'f_days',t:'number',min:1}]},
  tdose: {g:'vet', tone:'red', icon:'pill', fields:[{k:'drug',l:'f_drug',t:'text',req:1}]},
  tend:  {g:'vet', tone:'red', icon:'check', fields:[{k:'result',l:'f_result',t:'text'}]},
  lay:   {g:'breed', tone:'amber', icon:'eggplus', fields:[{k:'n',l:'f_eggs',t:'number',min:1,def:1}]},
  incub: {g:'breed', tone:'amber', icon:'sit', fields:[{k:'days',l:'f_incub_days',t:'number',min:1}]},
  hatch: {g:'breed', tone:'amber', icon:'crack', fields:[{k:'n',l:'f_chicks',t:'number',min:1,def:1}]},
  fledge:{g:'breed', tone:'amber', icon:'out', fields:[{k:'n',l:'f_chicks',t:'number',min:1,def:1}]},
  birth: {g:'breed', tone:'amber', icon:'paw', fields:[{k:'n',l:'f_young',t:'number',min:1,def:1}]}
};
const evLabel = type => t('ev_' + type);

/* ---------- dates ---------- */
const dayKey = ms => { const d = new Date(ms); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); };
const isToday = ms => dayKey(ms) === dayKey(Date.now());
const isYest = ms => dayKey(ms) === dayKey(Date.now() - 864e5);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const when = (ms, noTime) => (isToday(ms) ? t('today_l') : isYest(ms) ? t('yest_l') : fDay.format(ms)) + (noTime ? '' : ', ' + fTime.format(ms));
// records entered without a time of day keep f.nt and are stored at noon
const recTime = r => r.f && r.f.nt ? '' : fTime.format(r.at);
const dayTitle = ms => isToday(ms) ? t('today_t') : isYest(ms) ? t('yest_t') : cap(fLong.format(ms));
const toInput = ms => { const d = new Date(ms), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
const fromInput = s => s ? new Date(s).getTime() : NaN;
const key = s => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const toN = v => Math.max(0, parseInt(v, 10) || 0);
const ymd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
function age(s) {
  const b = ymd(s), n = new Date();
  const mo = (n.getFullYear() - b.getFullYear()) * 12 + n.getMonth() - b.getMonth() - (n.getDate() < b.getDate() ? 1 : 0);
  if (mo < 0) return '';
  const y = Math.floor(mo / 12), m = mo % 12, parts = [];
  if (y) parts.push(y + ' ' + pw(y, 'w_year'));
  if (m || !y) parts.push(m + ' ' + t('mo'));
  return ' (' + parts.join(' ') + ')';
}
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
