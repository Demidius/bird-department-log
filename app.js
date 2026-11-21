{
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
  person:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>'
};
const ic = (n, s = 24, w = 2) => `<svg aria-hidden="true" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${I[n] || ''}</svg>`;
const paintIcons = root => $$('[data-ic]', root).forEach(e => { e.innerHTML = ic(e.dataset.ic, e.dataset.s || 24, e.dataset.w || 2); });

/* ---------- i18n ---------- */
const LOCALE = {ru: 'ru-RU', pl: 'pl-PL', en: 'en-GB'};
const LANG_FIELD = {ru: 'name', pl: 'pl', en: 'en'};
let lang = 'ru';
try {
  const saved = localStorage.getItem('zoo-log-lang');
  if (DICT[saved]) lang = saved;
  else { const nl = String(navigator.language || '').slice(0, 2).toLowerCase(); if (DICT[nl]) lang = nl; }
} catch (x) {}
const t = (k, ...a) => { let v = DICT[lang][k]; if (v === undefined) v = DICT.ru[k]; if (v === undefined) return k; return typeof v === 'function' ? v(...a) : v; };
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
  incub: {g:'breed', tone:'amber', icon:'sit', fields:[]},
  hatch: {g:'breed', tone:'amber', icon:'crack', fields:[{k:'n',l:'f_chicks',t:'number',min:1,def:1}]},
  fledge:{g:'breed', tone:'amber', icon:'out', fields:[{k:'n',l:'f_chicks',t:'number',min:1,def:1}]}
};
const evLabel = type => t('ev_' + type);

/* ---------- dates ---------- */
const dayKey = ms => { const d = new Date(ms); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); };
const isToday = ms => dayKey(ms) === dayKey(Date.now());
const isYest = ms => dayKey(ms) === dayKey(Date.now() - 864e5);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const when = ms => (isToday(ms) ? t('today_l') : isYest(ms) ? t('yest_l') : fDay.format(ms)) + ', ' + fTime.format(ms);
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

/* ---------- state ---------- */
let sb = null, me = null, myProfile = null, channel = null;
let recs = [], species = [], coll = [], photos = [], profiles = new Map();
let spMap = new Map(), collMap = new Map(), collByName = new Map(), photosByOwner = new Map();
let curSp = null, editingSp = null, spDelArmed = false, sq = '';
let curBird = null, editingBird = null, birdDelArmed = false, cq = '', cf = 'active', presetBird = null;
let tab = 'add', filt = 'all', q = '', curType = null, editing = null, delArmed = false, lastFocus = null, st = null;
let statusKey = '', statusKind = 'info', gateKey = 'loading', editingUser = null;
let phRec = null, phSp = null, phBird = null;
const DEF_BACK = {sp: 'species', bird: 'coll'}, backOf = {sp: 'species', bird: 'coll'};
const VIEW_KEY = {add: 'tab_add', now: 'tab_now', logs: 'logs', menu: 'menu', species: 'species_t', sp: 'spf_edit', coll: 'coll', bird: 'bf_edit', users: 'users_t'};

const role = () => myProfile ? myProfile.role : null;
const canWrite = () => role() === 'admin' || role() === 'staff';
const isAdmin = () => role() === 'admin';
const canEditRec = r => isAdmin() || (canWrite() && r.by === me);
const canRmPhoto = p => isAdmin() || (canWrite() && p.by === me);

/* ---------- rows <-> app objects ---------- */
const ms = v => v ? new Date(v).getTime() : 0;
function fromRec(d) {
  if (!d || !T[d.type]) return null;
  const src = d.f && typeof d.f === 'object' ? d.f : {}, f = {};
  for (const k of ['from','to','reason','drug','result']) if (src[k] != null && src[k] !== '') f[k] = String(src[k]).slice(0, 300);
  for (const k of ['n','days']) if (src[k] != null && src[k] !== '') f[k] = toN(src[k]);
  return {id: d.id, type: d.type, sp: d.species_id || '', bird: String(d.bird || ''), at: ms(d.event_at), f, note: String(d.note || ''), by: d.created_by || null, created: ms(d.created_at)};
}
const toRec = r => ({type: r.type, species_id: r.sp || null, bird: r.bird, event_at: new Date(r.at).toISOString(), f: r.f, note: r.note});
function fromSp(d) {
  if (!d) return null;
  return {id: d.id, name: d.name_ru || '', pl: d.name_pl || '', en: d.name_en || '', latin: d.latin || '', note: d.note || '', by: d.created_by || null, created: ms(d.created_at)};
}
const toSp = s => ({name_ru: s.name || '', name_pl: s.pl || '', name_en: s.en || '', latin: s.latin || '', note: s.note || ''});
function fromBird(d) {
  if (!d) return null;
  return {id: d.id, name: d.name, sp: d.species_id || '', sex: d.sex || '', ring: d.ring || '', chip: d.chip || '', born: d.born || '', arrived: d.arrived || '',
    origin: d.origin || '', encl: d.encl || '', enclAt: ms(d.encl_at), status: d.status === 'out' ? 'out' : 'active', note: d.note || '', by: d.created_by || null};
}
const toBird = b => ({name: b.name, species_id: b.sp || null, sex: b.sex || '', ring: b.ring || '', chip: b.chip || '', born: b.born || null, arrived: b.arrived || null,
  origin: b.origin || '', encl: b.encl || '', encl_at: b.enclAt ? new Date(b.enclAt).toISOString() : null, status: b.status, note: b.note || ''});
const fromPhoto = d => ({id: d.id, ownerType: d.owner_type, ownerId: d.owner_id, path: d.path, w: d.width, h: d.height, by: d.created_by || null, created: ms(d.created_at)});
const thumbOf = p => p.replace(/\.jpg$/, '_t.jpg');
const photosOf = (type, id) => photosByOwner.get(type + ':' + id) || [];

const spById = id => (id && spMap.get(id)) || null;
const spName = s => !s ? '' : s[LANG_FIELD[lang]] || s.latin || s.name || s.pl || s.en;
const spNames = s => [s.name, s.latin, s.pl, s.en].filter(Boolean);
const spOther = s => { const main = spName(s); return [['RU', s.name], ['PL', s.pl], ['EN', s.en]].filter(([, v]) => v && v !== main).map(([c, v]) => c + ' ' + v).join(' · '); };
const bySp = (a, b) => spName(a).localeCompare(spName(b), LOCALE[lang]);
const byName = (a, b) => a.name.localeCompare(b.name, LOCALE[lang]);
const findSpByAnyName = n => species.find(x => spNames(x).some(v => key(v) === key(n)));
const spOfBird = name => { const cb = collByName.get(key(name)); if (cb && spById(cb.sp)) return cb.sp; const b = st && st.birds.get(key(name)); return b && spById(b.sp) ? b.sp : ''; };
const nm = b => { const cb = collByName.get(key(b.name)); return cb ? `<button class="namelink" type="button" data-bc="${esc(cb.id)}">${esc(b.name)}</button>` : `<b>${esc(b.name)}</b>`; };
const backBtn = k => `<button class="backlink" type="button" data-view="${backOf[k]}">${ic('back', 18, 2.2)}${esc(t(VIEW_KEY[backOf[k]] || 'back'))}</button>`;
const matchQ = r => { if (key(r.bird).includes(q)) return true; const s = spById(r.sp); return !!s && spNames(s).some(v => key(v).includes(q)); };
const spLink = b => { const s = spById(b.sp); return s ? `<button class="linkish" type="button" data-sp="${esc(s.id)}">${esc(spName(s))}</button>` : ''; };
const sexText = s => s === 'f' ? t('sex_f') : s === 'm' ? t('sex_m') : '';
const authorName = id => { const p = profiles.get(id); return p ? (p.display_name || p.login) : ''; };
const roleText = r => t('role_' + r);

function compute() {
  const birds = new Map();
  for (const r of [...recs].sort((a, b) => a.at - b.at)) {
    const k = key(r.bird);
    if (!k) continue;
    let b = birds.get(k);
    if (!b) { b = {name: r.bird.trim(), sp: '', treat: null, inc: null, eggs: 0, chicks: 0}; birds.set(k, b); }
    if (r.sp) b.sp = r.sp;
    const n = r.f.n || 1;
    switch (r.type) {
      case 'tstart': b.treat = {since: r.at, drug: r.f.drug || '', reason: r.f.reason || '', last: null}; break;
      case 'tdose': if (b.treat) b.treat.last = r.at; break;
      case 'tend': b.treat = null; break;
      case 'expo': if (r.f.to) { b.encl = r.f.to; b.enclAt = r.at; } break;
      case 'lay': b.eggs += n; break;
      case 'incub': b.inc = {since: r.at}; break;
      case 'hatch': b.inc = null; b.chicks += n; b.eggs = Math.max(0, b.eggs - n); break;
      case 'fledge': b.chicks = Math.max(0, b.chicks - n); break;
    }
  }
  for (const cb of coll) { const b = birds.get(key(cb.name)); if (b && cb.sp) b.sp = cb.sp; }
  const all = [...birds.values()];
  return {birds, treat: all.filter(b => b.treat), inc: all.filter(b => b.inc), chickBirds: all.filter(b => b.chicks > 0),
    chicks: all.reduce((s, b) => s + b.chicks, 0)};
}

function details(r) {
  const f = r.f;
  switch (r.type) {
    case 'expo': return (f.from ? f.from + ' → ' : '→ ') + (f.to || '');
    case 'tstart': return [f.reason, f.drug, f.days ? t('d_course', f.days) : ''].filter(Boolean).join(' · ');
    case 'tdose': return f.drug || '';
    case 'tend': return f.result || '';
    case 'lay': return t('d_eggs', f.n || 1);
    case 'hatch': case 'fledge': return t('d_chicks', f.n || 1);
    default: return '';
  }
}
const stat = b => [b.treat ? t('c_treat') : '', b.inc ? t('st_inc') : '', b.chicks ? t('in_nest', b.chicks) : ''].filter(Boolean).join(' · ') || t('st_none');

/* ---------- photos: signed links, thumbnails, lightbox ---------- */
const urlCache = new Map();
async function ensureUrls(paths) {
  const now = Date.now(), need = [...new Set(paths)].filter(p => { const c = urlCache.get(p); return !c || c.exp < now + 60e3; });
  for (let i = 0; i < need.length; i += 100) {
    const {data, error} = await sb.storage.from(BUCKET).createSignedUrls(need.slice(i, i + 100), 3600);
    if (error || !data) continue;
    for (const d of data) if (d.signedUrl) urlCache.set(d.path, {url: d.signedUrl, exp: now + 3500e3});
  }
}
function paintPhotos(root = document) {
  if (!sb) return;
  const els = $$('img[data-path]', root).filter(e => !e.getAttribute('src'));
  if (!els.length) return;
  ensureUrls(els.map(e => e.dataset.path)).then(() => els.forEach(e => { const c = urlCache.get(e.dataset.path); if (c) e.src = c.url; })).catch(() => {});
}
const thumbImg = p => `<img data-path="${esc(thumbOf(p.path))}" alt="" loading="lazy">`;
const thumbs = list => {
  if (!list.length) return '';
  const more = list.length - 3;
  return `<span class="thumbs">${list.slice(0, 3).map(thumbImg).join('')}${more > 0 ? `<span class="more">+${more}</span>` : ''}</span>`;
};
const gallery = list => list.length ? `<div class="pgrid gallery">${list.map(p => `<div class="ph"><button type="button" class="ph-open" data-lb="${esc(p.path)}" aria-label="${esc(t('open_photo'))}">${thumbImg(p)}</button></div>`).join('')}</div>` : '';
function openLightbox(path) {
  const lb = $('#lightbox'), img = $('#lb-img');
  img.removeAttribute('src'); img.dataset.path = path;
  lb.hidden = false;
  const c = urlCache.get(path);
  if (c && c.exp > Date.now()) img.src = c.url; else paintPhotos(lb);
  setTimeout(() => $('[data-lb-close]').focus({preventScroll: true}), 30);
}
const closeLightbox = () => { $('#lightbox').hidden = true; $('#lb-img').removeAttribute('src'); };

async function shrink(file, max, quality) {
  let src = null;
  try { src = await createImageBitmap(file, {imageOrientation: 'from-image'}); }
  catch (x) {
    src = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(file); });
  }
  const w0 = src.width || src.naturalWidth, h0 = src.height || src.naturalHeight, k = Math.min(1, max / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(src, 0, 0, w, h);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', quality));
  if (!blob) throw new Error('encode');
  return {blob, w, h};
}

// a photo field inside a form: existing photos, new ones waiting to be uploaded, removals
function photoBox(boxId, ownerType, ownerId, editable) {
  const box = $('#' + boxId);
  const st2 = {ownerType, ownerId, keep: ownerId ? photosOf(ownerType, ownerId).slice() : [], removed: [], added: [], busy: 0};
  const draw = () => {
    const show = editable || st2.keep.length;
    box.hidden = !show;
    if (!show) { box.innerHTML = ''; return; }
    box.innerHTML = `<span class="lbl">${esc(t('photos'))}</span><div class="pgrid">`
      + st2.keep.map(p => `<div class="ph"><button type="button" class="ph-open" data-lb="${esc(p.path)}" aria-label="${esc(t('open_photo'))}">${thumbImg(p)}</button>${editable && canRmPhoto(p) ? `<button type="button" class="ph-x" data-rmk="${esc(p.id)}" aria-label="${esc(t('rm_photo'))}">${ic('x', 18, 2.4)}</button>` : ''}</div>`).join('')
      + st2.added.map(a => `<div class="ph"><img src="${a.url}" alt=""><button type="button" class="ph-x" data-rma="${a.key}" aria-label="${esc(t('rm_photo'))}">${ic('x', 18, 2.4)}</button></div>`).join('')
      + (editable ? `<label class="ph-add"><input class="vh" type="file" accept="image/*" multiple>${ic('plus', 22, 2.2)}<span>${esc(t('add_photo'))}</span></label>` : '')
      + `</div>`;
    paintPhotos(box);
  };
  box.onclick = e => {
    const k = e.target.closest('[data-rmk]'), a = e.target.closest('[data-rma]');
    if (k) { const i = st2.keep.findIndex(p => p.id === k.dataset.rmk); if (i >= 0) st2.removed.push(st2.keep.splice(i, 1)[0]); draw(); }
    else if (a) { const i = st2.added.findIndex(x => x.key === a.dataset.rma); if (i >= 0) { URL.revokeObjectURL(st2.added[i].url); st2.added.splice(i, 1); } draw(); }
  };
  box.onchange = async e => {
    const inp = e.target.closest('input[type=file]');
    if (!inp || !inp.files || !inp.files.length) return;
    const files = [...inp.files];
    for (const f of files) {
      st2.busy++;
      try {
        const full = await shrink(f, 1600, 0.82), th = await shrink(full.blob, 360, 0.78);
        st2.added.push({key: uuid(), full: full.blob, thumb: th.blob, w: full.w, h: full.h, url: URL.createObjectURL(th.blob)});
      } catch (x) { toast(t('e_photo_read')); }
      finally { st2.busy--; }
    }
    draw();
  };
  draw();
  return st2;
}
async function commitPhotos(st2, ownerId) {
  if (!st2) return 0;
  let failed = 0;
  for (const p of st2.removed) {
    try { await sb.storage.from(BUCKET).remove([p.path, thumbOf(p.path)]); must(await sb.from('photos').delete().eq('id', p.id)); photos = photos.filter(x => x.id !== p.id); }
    catch (x) { failed++; }
  }
  for (const a of st2.added) {
    try {
      const id = uuid(), path = me + '/' + id + '.jpg';
      must(await sb.storage.from(BUCKET).upload(path, a.full, {contentType: 'image/jpeg', upsert: false}));
      must(await sb.storage.from(BUCKET).upload(thumbOf(path), a.thumb, {contentType: 'image/jpeg', upsert: false}));
      const row = must(await sb.from('photos').insert({id, owner_type: st2.ownerType, owner_id: ownerId, path, width: a.w, height: a.h, created_by: me}).select().single());
      photos.push(fromPhoto(row));
      urlCache.set(thumbOf(path), {url: a.url, exp: Date.now() + 3600e3});
    } catch (x) { failed++; }
  }
  st2.added = []; st2.removed = [];
  return failed;
}
async function dropPhotosOf(type, id) {
  const list = photosOf(type, id).filter(canRmPhoto);
  if (!list.length) return;
  try { await sb.storage.from(BUCKET).remove(list.flatMap(p => [p.path, thumbOf(p.path)])); } catch (x) {}
}

/* ---------- render ---------- */
const card = (r, full) => {
  const tp = T[r.type], d = details(r), s = spById(r.sp), au = r.by ? authorName(r.by) : '';
  return `<button class="rec" type="button" data-edit="${esc(r.id)}"><span class="tile sm t-${tp.tone}">${ic(tp.icon, 18)}</span><span class="rb"><span class="rh"><b>${esc(evLabel(r.type))}</b><time>${full ? when(r.at) : fTime.format(r.at)}</time></span><span class="bird">${esc(r.bird)}${s ? ` <span class="spn">· ${esc(spName(s))}</span>` : ''}</span>${d ? `<span class="det">${esc(d)}</span>` : ''}${r.note ? `<span class="note">${esc(r.note)}</span>` : ''}${thumbs(photosOf('record', r.id))}${au ? `<span class="by">${esc(t('author') + au)}</span>` : ''}</span></button>`;
};

function renderNow() {
  const sec = (id, tone, icon, title, items, empty) =>
    `<section class="nsec" id="${id}"><h2 class="nh"><span class="tile sm t-${tone}">${ic(icon, 18)}</span>${esc(title)}<span class="nc">${items.length}</span></h2>${items.length ? items.join('') : `<p class="empty">${esc(empty)}</p>`}</section>`;
  const b2 = (type, b, txt, ghost) => `<button class="mini w-only${ghost ? ' ghost' : ''}" type="button" data-new="${type}" data-bird="${esc(b.name)}">${esc(txt)}</button>`;
  const treat = st.treat.map(b => `<div class="ncard"><div class="nl">${nm(b)}${spLink(b)}<small>${esc([t('since', fDay.format(b.treat.since)), b.treat.drug].filter(Boolean).join(' · '))}</small><small>${esc(b.treat.last ? t('last_dose', when(b.treat.last)) : t('no_dose'))}</small></div><div class="na">${b2('tdose', b, t('b_dose'))}${b2('tend', b, t('b_end'), 1)}</div></div>`);
  const inc = st.inc.map(b => `<div class="ncard"><div class="nl">${nm(b)}${spLink(b)}<small>${esc(t('since', fDay.format(b.inc.since)) + (b.eggs ? ' · ' + t('eggs_n', b.eggs) : ''))}</small></div><div class="na">${b2('hatch', b, evLabel('hatch'))}</div></div>`);
  const ch = st.chickBirds.map(b => `<div class="ncard"><div class="nl">${nm(b)}${spLink(b)}<small>${esc(t('in_nest', b.chicks))}</small></div><div class="na">${b2('fledge', b, evLabel('fledge'))}</div></div>`);
  const today = recs.filter(r => isToday(r.at)).sort((a, b) => b.at - a.at).map(r => card(r));
  $('#now-body').innerHTML =
    sec('sec-treat', 'red', 'cross', t('n_treat'), treat, t('e_treat')) +
    sec('sec-inc', 'amber', 'egg', t('n_inc'), inc, t('e_inc')) +
    sec('sec-chick', 'blue', 'chick', t('n_chick'), ch, t('e_chick')) +
    sec('sec-today', 'green', 'book', t('n_today'), today, t('e_today'));
}

function renderLogs() {
  const list = recs.filter(r => (filt === 'all' || T[r.type].g === filt) && (!q || matchQ(r))).sort((a, b) => b.at - a.at);
  if (!list.length) { $('#logs-body').innerHTML = `<p class="empty" style="margin-top:16px">${esc(recs.length ? t('none_found') : t('logs_empty'))}</p>`; return; }
  let h = '', last = '';
  for (const r of list.slice(0, 500)) {
    const k = dayKey(r.at);
    if (k !== last) { h += `<h2 class="day">${esc(dayTitle(r.at))}</h2>`; last = k; }
    h += card(r);
  }
  $('#logs-body').innerHTML = h;
}

function fillBirds(spId) {
  const ok = sp => !spId || spId === '__new' || sp === spId, names = new Map();
  coll.filter(b => b.status !== 'out' && ok(b.sp)).forEach(b => names.set(key(b.name), b.name));
  if (st) for (const b of st.birds.values()) if (ok(b.sp) && !names.has(key(b.name))) names.set(key(b.name), b.name);
  $('#birds').innerHTML = [...names.values()].map(n => `<option value="${esc(n)}"></option>`).join('');
}

function renderSpecies() {
  const n = species.length;
  $('#sp-count').textContent = n ? t('sp_count', n) : t('sp_count0');
  const list = species.filter(s => !sq || spNames(s).some(v => key(v).includes(sq))).sort(bySp);
  $('#species-body').innerHTML = list.length ? list.map(s => {
    const nb = coll.filter(b => b.sp === s.id && b.status !== 'out').length, main = spName(s);
    const sub = [s.latin && s.latin !== main ? s.latin : '', nb ? t('in_coll', nb) : t('not_in_coll')].filter(Boolean).join(' · ');
    return `<button class="row" type="button" data-sp="${esc(s.id)}"><span class="tile t-grey">${ic('tag')}</span><span class="rt"><b>${esc(main)}</b><small>${esc(sub)}</small></span><span class="chev">${ic('chev', 20)}</span></button>`;
  }).join('') : `<p class="empty">${esc(n ? t('none_found') : t('sp_none'))}</p>`;
}

function renderSpCard() {
  const box = $('#sp-body');
  if (!curSp) { box.innerHTML = ''; return; }
  const s = spById(curSp);
  if (!s) { box.innerHTML = backBtn('sp') + `<h1>${esc(t('sp_deleted'))}</h1><p class="lead">${esc(t('sp_deleted_p'))}</p>`; return; }
  const birds = [...st.birds.values()].filter(b => b.sp === s.id).sort(byName);
  const nt = birds.filter(b => b.treat).length, ni = birds.filter(b => b.inc).length, nc = birds.reduce((a, b) => a + b.chicks, 0);
  const rs = recs.filter(r => r.sp === s.id).sort((a, b) => b.at - a.at);
  const cbs = coll.filter(b => b.sp === s.id).sort(byName), cnames = new Set(cbs.map(b => key(b.name)));
  const others = birds.filter(b => !cnames.has(key(b.name)));
  const bItems = cbs.map(cb => `<div class="ncard"><div class="nl"><button class="namelink" type="button" data-bc="${esc(cb.id)}">${esc(cb.name)}</button><small>${esc([cb.status === 'out' ? t('st_out') : '', stat(st.birds.get(key(cb.name)) || {})].filter(Boolean).join(' · '))}</small></div></div>`)
    .concat(others.map(b => `<div class="ncard"><div class="nl"><b>${esc(b.name)}</b><small>${esc(stat(b) + ' · ' + t('not_in_coll_b'))}</small></div></div>`));
  const main = spName(s), other = spOther(s);
  box.innerHTML = backBtn('sp') + `<h1>${esc(main)}</h1>${s.latin && s.latin !== main ? `<p class="latin" lang="la">${esc(s.latin)}</p>` : ''}${other ? `<p class="sp-meta">${esc(other)}</p>` : ''}${s.note ? `<p class="sp-note">${esc(s.note)}</p>` : ''}
${gallery(photosOf('species', s.id))}
<div class="stats"><div class="stat c-red"><b>${nt}</b><span class="l">${esc(t('c_treat'))}</span></div><div class="stat c-amber"><b>${ni}</b><span class="l">${esc(t('c_inc'))}</span></div><div class="stat c-blue"><b>${nc}</b><span class="l">${esc(pw(nc, 'chick'))}</span></div></div>
<div class="top-acts w-only"><button class="btn sec" type="button" data-sp-edit>${esc(t('edit_card'))}</button><button class="btn sec" type="button" data-bird-new>${esc(t('add_bird'))}</button></div>
<section class="nsec"><h2 class="nh">${esc(t('birds_pairs'))}<span class="nc">${bItems.length}</span></h2>${bItems.length ? bItems.join('') : `<p class="empty">${esc(t('no_birds_sp'))}</p>`}</section>
<section class="nsec"><h2 class="nh">${esc(t('records'))}<span class="nc">${rs.length}</span></h2>${rs.length ? rs.slice(0, 50).map(r => card(r, true)).join('') : `<p class="empty">${esc(t('no_records'))}</p>`}</section>`;
}

function renderColl() {
  const act = coll.filter(b => b.status !== 'out').length;
  $('#coll-count').textContent = coll.length ? t('coll_count', act) : t('coll_count0');
  const sn = b => spName(spById(b.sp));
  const list = coll.filter(b => (cf === 'all' || (cf === 'out') === (b.status === 'out'))
      && (!cq || [b.name, b.ring, b.chip].concat(spById(b.sp) ? spNames(spById(b.sp)) : []).some(x => key(x).includes(cq))))
    .sort((a, b) => (sn(a) || '￿').localeCompare(sn(b) || '￿', LOCALE[lang]) || byName(a, b));
  if (!list.length) { $('#coll-body').innerHTML = `<p class="empty" style="margin-top:16px">${esc(coll.length ? t('none_found') : t('coll_empty'))}</p>`; return; }
  let h = '', last = null;
  for (const b of list) {
    const g = sn(b) || t('no_sp');
    if (g !== last) { h += `<h2 class="day">${esc(g)}</h2>`; last = g; }
    const sb2 = st.birds.get(key(b.name)) || {};
    const encl = sb2.encl && sb2.enclAt >= b.enclAt ? sb2.encl : b.encl;
    const sub = [sexText(b.sex), b.ring ? t('ring_n', b.ring) : '', encl].filter(Boolean).join(' · ');
    const flags = [b.status === 'out' ? t('st_out') : '', sb2.treat ? t('c_treat') : '', sb2.inc ? t('st_inc') : '', sb2.chicks ? sb2.chicks + ' ' + pw(sb2.chicks, 'chick') : ''].filter(Boolean).join(' · ');
    const ph = photosOf('bird', b.id)[0];
    const tile = ph ? `<span class="tile t-green" style="overflow:hidden">${thumbImg(ph).replace('<img', '<img style="width:100%;height:100%;object-fit:cover"')}</span>` : `<span class="tile t-green">${ic('bird')}</span>`;
    h += `<button class="row" type="button" data-bc="${esc(b.id)}" style="margin-bottom:8px">${tile}<span class="rt"><b>${esc(b.name)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}${flags ? `<small>${esc(flags)}</small>` : ''}</span><span class="chev">${ic('chev', 20)}</span></button>`;
  }
  $('#coll-body').innerHTML = h;
}

function renderBirdCard() {
  const box = $('#bird-body');
  if (!curBird) { box.innerHTML = ''; return; }
  const cb = collMap.get(curBird);
  if (!cb) { box.innerHTML = backBtn('bird') + `<h1>${esc(t('bird_deleted'))}</h1><p class="lead">${esc(t('bird_deleted_p'))}</p>`; return; }
  const sb2 = st.birds.get(key(cb.name)) || {}, s = spById(cb.sp);
  const rs = recs.filter(r => key(r.bird) === key(cb.name)).sort((a, b) => b.at - a.at);
  const encl = sb2.encl && sb2.enclAt >= cb.enclAt ? sb2.encl : cb.encl;
  const pill = (c, txt) => `<span class="pill ${c}">${esc(txt)}</span>`;
  const pills = [cb.status === 'out' ? pill('p-grey', t('st_out')) : '', sb2.treat ? pill('p-red', t('c_treat')) : '',
    sb2.inc ? pill('p-amber', t('st_inc')) : '', sb2.chicks ? pill('p-blue', t('in_nest', sb2.chicks)) : ''].join('');
  const fact = (l, v) => v ? `<div><dt>${esc(t(l))}</dt><dd>${esc(v)}</dd></div>` : '';
  const n = esc(cb.name), main = spName(s);
  box.innerHTML = backBtn('bird') + `<h1>${n}</h1>${s ? `<button class="linkish" type="button" data-sp="${esc(s.id)}">${esc(main)}${s.latin && s.latin !== main ? ' · ' + esc(s.latin) : ''}</button>` : `<p class="sp-meta">${esc(t('no_sp'))}</p>`}
${pills ? `<div class="pills">${pills}</div>` : ''}
${gallery(photosOf('bird', cb.id))}
<dl class="facts">${fact('fa_sex', cap(sexText(cb.sex)))}${fact('fa_ring', cb.ring)}${fact('fa_chip', cb.chip)}${fact('fa_encl', encl)}${fact('fa_born', cb.born ? fDate.format(ymd(cb.born)) + age(cb.born) : '')}${fact('fa_arrived', cb.arrived ? fDate.format(ymd(cb.arrived)) : '')}${fact('fa_origin', cb.origin)}</dl>
${cb.note ? `<p class="sp-note">${esc(cb.note)}</p>` : ''}
<div class="top-acts w-only"><button class="btn sec" type="button" data-bird-edit>${esc(t('edit_card'))}</button></div>
<section class="nsec w-only"><h2 class="nh">${esc(t('add_title'))}</h2><div class="na">
<button class="mini ghost" type="button" data-new="obs" data-bird="${n}">${esc(evLabel('obs'))}</button>
<button class="mini ghost" type="button" data-new="expo" data-bird="${n}" data-from="${esc(encl || '')}">${esc(evLabel('expo'))}</button>
<button class="mini ghost" type="button" data-sheet="vet" data-preset="${n}">${esc(t('vet'))}</button>
<button class="mini ghost" type="button" data-sheet="breed" data-preset="${n}">${esc(t('breed'))}</button>
</div></section>
<section class="nsec"><h2 class="nh">${esc(t('history'))}<span class="nc">${rs.length}</span></h2>${rs.length ? rs.slice(0, 100).map(r => card(r, true)).join('') : `<p class="empty">${esc(t('no_hist'))}</p>`}</section>`;
}

function renderUsers() {
  const list = [...profiles.values()].sort((a, b) => (a.display_name || a.login).localeCompare(b.display_name || b.login, LOCALE[lang]));
  const act = list.filter(p => p.active).length;
  $('#users-count').textContent = t('users_count', act);
  $('#users-body').innerHTML = list.map(p => {
    const sub = [t('login_l') + ': ' + p.login, roleText(p.role), p.active ? '' : t('u_off'), p.id === me ? t('u_you') : ''].filter(Boolean).join(' · ');
    return `<button class="row" type="button" data-user="${esc(p.id)}"><span class="tile ${p.active ? 't-blue' : 't-grey'}">${ic('person')}</span><span class="rt"><b>${esc(p.display_name || p.login)}</b><small>${esc(sub)}</small></span><span class="chev">${ic('chev', 20)}</span></button>`;
  }).join('');
}

function renderAccount() {
  if (!myProfile) return;
  $('#acc-line').innerHTML = `<b>${esc(myProfile.display_name || myProfile.login)}</b><br>${esc(t('login_l') + ': ' + myProfile.login + ' · ' + roleText(myProfile.role))}`;
}

function openCard(kind, id) {
  if (tab !== kind) { if (backOf[tab] === kind) backOf[tab] = DEF_BACK[tab]; backOf[kind] = tab; }
  if (kind === 'sp') { curSp = id; renderSpCard(); } else { curBird = id; renderBirdCard(); }
  setTab(kind);
}

function index() {
  spMap = new Map(species.map(s => [s.id, s]));
  collMap = new Map(coll.map(b => [b.id, b]));
  collByName = new Map(coll.map(b => [key(b.name), b]));
  photosByOwner = new Map();
  for (const p of [...photos].sort((a, b) => a.created - b.created)) {
    const k = p.ownerType + ':' + p.ownerId;
    if (!photosByOwner.has(k)) photosByOwner.set(k, []);
    photosByOwner.get(k).push(p);
  }
}

function render() {
  if (!myProfile) return;
  index();
  st = compute();
  $('#n-treat').textContent = st.treat.length;
  $('#n-inc').textContent = st.inc.length;
  $('#n-chick').textContent = st.chicks;
  $('#n-chick-l').textContent = pw(st.chicks, 'chick');
  const fs = $('#fld-sp');
  fillBirds(fs && $('#sheet-form.open') ? fs.value : '');
  renderNow();
  renderLogs();
  renderSpecies();
  renderSpCard();
  renderColl();
  renderBirdCard();
  renderUsers();
  renderAccount();
  paintPhotos();
}

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
  try { localStorage.setItem('zoo-log-lang', l); } catch (x) {}
  $('#lg-err').textContent = ''; $('#claim-err').textContent = '';
  mkFmt(); applyStatic(); render();
}

const TAB_OF = {species: 'menu', sp: 'menu', coll: 'menu', bird: 'menu', users: 'menu'};
function setTab(v) {
  tab = v;
  const hi = TAB_OF[v] || v;
  $$('.view').forEach(x => { x.hidden = x.id !== 'view-' + v; });
  $$('.tab').forEach(b => { const on = b.dataset.tab === hi; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  window.scrollTo(0, 0);
}

function hideSheet(s) { s.classList.remove('open'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('inert', ''); }
function openSheet(name) {
  const s = $('#sheet-' + name);
  if (!$('.sheet.open')) lastFocus = document.activeElement;
  $$('.sheet.open').forEach(x => { if (x !== s) hideSheet(x); });
  $('#overlay').classList.add('on');
  s.removeAttribute('inert'); s.setAttribute('aria-hidden', 'false'); s.classList.add('open'); s.scrollTop = 0;
  setTimeout(() => s.focus({preventScroll: true}), 40);
}
function closeSheets() {
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
  const opts = species.slice().sort(bySp).map(s => `<option value="${esc(s.id)}"${s.id === val ? ' selected' : ''}>${esc(spName(s))}</option>`).join('');
  return `<div class="fld"><label for="${p}-sp">${esc(t('f_species'))}&nbsp;<span class="req" aria-hidden="true">*</span></label><select id="${p}-sp" name="sp" aria-required="true"><option value="">${esc(t('f_pick_sp'))}</option>${opts}<option value="__new">${esc(t('f_new_sp'))}</option></select></div>`
    + `<div class="fld" id="${p}-newsp-wrap" hidden><label for="${p}-newsp">${esc(t('f_new_sp_name'))}</label><input id="${p}-newsp" name="newsp" type="text" autocomplete="off"></div>`;
}

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
  const v = rec ? Object.assign({bird: rec.bird, at: rec.at, note: rec.note, sp: rec.sp}, rec.f) : Object.assign({at: Date.now()}, pre2);
  if (!rec) {
    for (const f of tp.fields) if (v[f.k] == null && f.def != null) v[f.k] = f.def;
    if (type === 'tdose' && v.bird && !v.drug) v.drug = activeDrug(v.bird);
    if (v.bird && !v.sp) v.sp = spOfBird(v.bird);
  }
  let h = spSelect(v.sp) + field({k:'bird', l:'f_bird', t:'text', req:1, list:'birds'}, v.bird);
  for (const f of tp.fields) h += field(f, v[f.k]);
  h += field({k:'at', l:'f_at', t:'datetime-local', req:1}, toInput(v.at));
  h += field({k:'note', l:tp.noteLabel || 'f_note', t:'textarea', req:tp.noteReq}, v.note);
  $('#f-fields').innerHTML = h;
  $('#f-fs').disabled = !editable;
  $('#f-ro').hidden = editable;
  $('#f-save').hidden = !editable;
  $('#f-err').textContent = '';
  const del = $('#f-del'); del.hidden = !rec || !editable; del.textContent = t('del_rec');
  phRec = photoBox('f-ph', 'record', rec ? rec.id : null, editable);
  const bird = $('#fld-bird'), sel = $('#fld-sp'), wrap = $('#fld-newsp-wrap');
  const syncSp = () => { wrap.hidden = sel.value !== '__new'; fillBirds(sel.value); };
  if (!species.length && !rec) sel.value = '__new';
  syncSp();
  sel.addEventListener('change', () => { syncSp(); if (sel.value === '__new') $('#fld-newsp').focus(); });
  bird.addEventListener('change', () => {
    const bs = spOfBird(bird.value);
    if (bs && (!sel.value || sel.value === '__new')) { sel.value = bs; syncSp(); }
    if (type === 'tdose') { const d = $('#fld-drug'); if (d && !d.value) d.value = activeDrug(bird.value); }
  });
  openSheet('form');
}

/* ---------- server calls ---------- */
const must = res => { if (res && res.error) throw res.error; return res ? res.data : null; };
const errMsg = e => {
  const c = e && (e.code || '');
  if (c === '42501' || c === 'PGRST301' || /row-level security|permission/i.test((e && e.message) || '')) return t('e_perm');
  if (c === '23505') return t('e_spdup');
  if (e && (e.name === 'TypeError' || /fetch|network/i.test(e.message || ''))) return t('e_net');
  return t('e_save');
};

async function fetchAll(table, order) {
  let out = [], from = 0;
  for (;;) {
    const rows = must(await sb.from(table).select('*').order(order, {ascending: true}).range(from, from + 999));
    out = out.concat(rows || []);
    if (!rows || rows.length < 1000) break;
    from += 1000;
  }
  return out;
}
const LOADERS = {
  records: async () => { recs = (await fetchAll('records', 'event_at')).map(fromRec).filter(Boolean); },
  species: async () => { species = (await fetchAll('species', 'created_at')).map(fromSp).filter(Boolean); },
  collection: async () => { coll = (await fetchAll('collection', 'created_at')).map(fromBird).filter(Boolean); },
  photos: async () => { photos = (await fetchAll('photos', 'created_at')).map(fromPhoto); },
  profiles: async () => {
    const rows = await fetchAll('profiles', 'created_at');
    profiles = new Map(rows.map(p => [p.id, p]));
    const mine = profiles.get(me);
    if (mine) { myProfile = mine; applyRole(); }
    if (!mine || !mine.active) { sb.auth.signOut(); }
  }
};
async function loadAll() { await Promise.all(Object.values(LOADERS).map(f => f())); }

let pending = new Set(), reloadT = 0;
function scheduleReload(table) {
  if (!LOADERS[table]) return;
  pending.add(table);
  clearTimeout(reloadT);
  reloadT = setTimeout(async () => {
    const list = [...pending]; pending = new Set();
    try { await Promise.all(list.map(x => LOADERS[x]())); render(); } catch (x) { setStatus('e_net', 'warn'); }
  }, 400);
}
function subscribe() {
  if (channel) sb.removeChannel(channel);
  channel = sb.channel('journal')
    .on('postgres_changes', {event: '*', schema: 'public'}, p => scheduleReload(p.table))
    .subscribe(s => { if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('s_live_err', 'warn'); else if (s === 'SUBSCRIBED' && statusKey === 's_live_err') setStatus('', 'info'); });
}

async function putRec(id, r, isNew) {
  const row = isNew ? must(await sb.from('records').insert(Object.assign(toRec(r), {id, created_by: me})).select().single())
                    : must(await sb.from('records').update(toRec(r)).eq('id', id).select().single());
  const x = fromRec(row), i = recs.findIndex(y => y.id === id);
  if (i >= 0) recs[i] = x; else recs.push(x);
}
async function dropRec(id) {
  await dropPhotosOf('record', id);
  must(await sb.from('records').delete().eq('id', id));
  recs = recs.filter(x => x.id !== id); photos = photos.filter(p => !(p.ownerType === 'record' && p.ownerId === id));
}
async function putSp(id, s, isNew) {
  const row = isNew ? must(await sb.from('species').insert(Object.assign(toSp(s), {id, created_by: me})).select().single())
                    : must(await sb.from('species').update(toSp(s)).eq('id', id).select().single());
  const x = fromSp(row), i = species.findIndex(y => y.id === id);
  if (i >= 0) species[i] = x; else species.push(x);
}
async function dropSp(id) {
  await dropPhotosOf('species', id);
  must(await sb.from('species').delete().eq('id', id));
  species = species.filter(x => x.id !== id);
}
async function putBird(id, b, isNew) {
  const row = isNew ? must(await sb.from('collection').insert(Object.assign(toBird(b), {id, created_by: me})).select().single())
                    : must(await sb.from('collection').update(toBird(b)).eq('id', id).select().single());
  const x = fromBird(row), i = coll.findIndex(y => y.id === id);
  if (i >= 0) coll[i] = x; else coll.push(x);
}
async function dropBird(id) {
  await dropPhotosOf('bird', id);
  must(await sb.from('collection').delete().eq('id', id));
  coll = coll.filter(x => x.id !== id);
}
async function ensureSpecies(newName) {
  const ex = findSpByAnyName(newName);
  if (ex) return ex.id;
  const id = uuid(), s = {name: '', latin: '', pl: '', en: '', note: ''};
  s[LANG_FIELD[lang]] = newName;
  await putSp(id, s, true);
  return id;
}
async function callAdmin(body) {
  const {data, error} = await sb.functions.invoke('admin-users', {body});
  if (error) {
    let code = 'save';
    try { const j = await error.context.json(); code = j.error || code; } catch (x) { if (/fetch|network/i.test(String(error.message))) code = 'net'; }
    throw {appCode: code};
  }
  return data;
}
const adminErr = e => ({bad_login: t('e_bad_login'), short_password: t('e_short_pass'), login_taken: t('e_login_taken'), self_lock: t('e_self_lock'),
  forbidden: t('e_perm'), unauthorized: t('e_perm'), net: t('e_net')})[e && e.appCode] || t('e_save');

async function withBusy(btn, fn) { btn.disabled = true; try { return await fn(); } finally { btn.disabled = false; } }

/* ---------- forms ---------- */
$('#form').addEventListener('submit', async e => {
  e.preventDefault();
  if (editing && !canEditRec(editing)) return;
  const tp = T[curType], fd = new FormData(e.target), err = m => { $('#f-err').textContent = m; };
  const spSel = String(fd.get('sp') || ''), newName = String(fd.get('newsp') || '').trim();
  if (!spSel) return err(t('e_pick_sp'));
  if (spSel === '__new' && !newName) return err(t('e_new_sp'));
  const bird = String(fd.get('bird') || '').trim();
  if (!bird) return err(t('e_bird'));
  const at = fromInput(fd.get('at'));
  if (!isFinite(at)) return err(t('e_at'));
  const f = {};
  for (const x of tp.fields) {
    const val = String(fd.get(x.k) || '').trim();
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
      const id = editing ? editing.id : uuid(), wasEdit = !!editing;
      await putRec(id, r, !wasEdit);
      if (phRec && (phRec.added.length || phRec.removed.length)) err(t('ph_saving'));
      const failed = await commitPhotos(phRec, id);
      closeSheets(); render();
      toast(failed ? t('e_photo', failed) : wasEdit ? t('t_updated') : t('t_saved'));
    } catch (x) { err(errMsg(x)); }
  });
});

$('#f-del').addEventListener('click', async () => {
  if (!editing || !canEditRec(editing)) return;
  if (!delArmed) { delArmed = true; $('#f-del').textContent = t('del_confirm'); return; }
  try { await dropRec(editing.id); closeSheets(); render(); toast(t('t_deleted')); }
  catch (x) { $('#f-err').textContent = errMsg(x); }
});

function openBirdForm(cb) {
  if (!canWrite()) return;
  editingBird = cb || null; birdDelArmed = false;
  $('#bf-title').textContent = cb ? t('bf_edit') : t('bf_new');
  $('#bf-sub').textContent = cb ? t('editing') : t('bf_sub_new');
  const v = cb || {sp: tab === 'sp' ? curSp : '', status: 'active'};
  const opt = (val, cur, label) => `<option value="${val}"${val === (cur || '') ? ' selected' : ''}>${esc(label)}</option>`;
  $('#bf-fields').innerHTML = field({k: 'name', l: 'bf_name', t: 'text', req: 1, id: 'bf-name'}, v.name) + spSelect(v.sp, 'bf')
    + `<div class="fld"><label for="bf-sex">${esc(t('fa_sex'))}</label><select id="bf-sex" name="sex">${opt('', v.sex, t('sex_u'))}${opt('f', v.sex, cap(t('sex_f')))}${opt('m', v.sex, cap(t('sex_m')))}</select></div>`
    + field({k: 'ring', l: 'bf_ring', t: 'text', id: 'bf-ring'}, v.ring) + field({k: 'chip', l: 'bf_chip', t: 'text', id: 'bf-chip'}, v.chip)
    + field({k: 'born', l: 'fa_born', t: 'date', id: 'bf-born'}, v.born) + field({k: 'arrived', l: 'bf_arrived', t: 'date', id: 'bf-arrived'}, v.arrived)
    + field({k: 'origin', l: 'fa_origin', t: 'text', id: 'bf-origin', ph: 'bf_origin_ph'}, v.origin)
    + field({k: 'encl', l: 'fa_encl', t: 'text', id: 'bf-encl'}, v.encl)
    + `<div class="fld"><label for="bf-status">${esc(t('bf_status'))}</label><select id="bf-status" name="status">${opt('active', v.status, t('cf_active'))}${opt('out', v.status, t('st_out_opt'))}</select></div>`
    + field({k: 'note', l: 'bf_note', t: 'textarea', id: 'bf-note'}, v.note);
  const sel = $('#bf-sp'), wrap = $('#bf-newsp-wrap'), sync = () => { wrap.hidden = sel.value !== '__new'; };
  if (!species.length && !cb) sel.value = '__new';
  sync();
  sel.addEventListener('change', () => { sync(); if (sel.value === '__new') $('#bf-newsp').focus(); });
  $('#bf-err').textContent = '';
  const d = $('#bf-del'); d.hidden = !cb || !isAdmin(); d.textContent = t('del_card');
  phBird = photoBox('bf-ph', 'bird', cb ? cb.id : null, true);
  openSheet('bird');
}
$('#bird-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target), err = m => { $('#bf-err').textContent = m; }, g = k => String(fd.get(k) || '').trim();
  const name = g('name'), spSel = g('sp'), newName = g('newsp'), old = editingBird;
  if (!name) return err(t('e_bname'));
  if (!spSel) return err(t('e_pick_sp'));
  if (spSel === '__new' && !newName) return err(t('e_new_sp'));
  if (coll.some(x => key(x.name) === key(name) && (!old || x.id !== old.id))) return err(t('e_bdup'));
  if (phBird && phBird.busy) return;
  const date = k => /^\d{4}-\d{2}-\d{2}$/.test(g(k)) ? g(k) : '', now = Date.now(), encl = g('encl');
  const b = {name, sp: spSel, sex: g('sex'), ring: g('ring'), chip: g('chip'), born: date('born'), arrived: date('arrived'), origin: g('origin'),
    encl, enclAt: old && old.encl === encl ? old.enclAt : (encl ? Math.floor(now / 60000) * 60000 : 0), status: g('status') === 'out' ? 'out' : 'active', note: g('note')};
  await withBusy($('#bf-save'), async () => {
    try {
      if (spSel === '__new') b.sp = await ensureSpecies(newName);
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

const SPF = ['name', 'latin', 'pl', 'en'];
function openSpForm(s) {
  if (!canWrite()) return;
  editingSp = s || null; spDelArmed = false;
  $('#sp-f-title').textContent = s ? t('spf_edit') : t('spf_new');
  $('#sp-f-sub').textContent = s ? t('editing') : t('spf_sub_new');
  for (const k of SPF) $('#sp-' + k).value = s ? s[k] : '';
  $('#sp-note').value = s ? s.note : '';
  $('#sp-err').textContent = '';
  const d = $('#sp-del'); d.hidden = !s || !isAdmin(); d.textContent = t('del_sp');
  phSp = photoBox('sp-ph', 'species', s ? s.id : null, true);
  openSheet('sp');
}
$('#sp-form').addEventListener('submit', async e => {
  e.preventDefault();
  const err = m => { $('#sp-err').textContent = m; };
  const v = {};
  for (const k of SPF) v[k] = $('#sp-' + k).value.trim();
  if (!SPF.some(k => v[k])) return err(t('e_spname'));
  if (species.some(x => (!editingSp || x.id !== editingSp.id) && SPF.some(k => v[k] && key(x[k]) === key(v[k])))) return err(t('e_spdup'));
  if (phSp && phSp.busy) return;
  v.note = $('#sp-note').value.trim();
  await withBusy($('#sp-save'), async () => {
    try {
      const wasEdit = !!editingSp, id = wasEdit ? editingSp.id : uuid();
      await putSp(id, v, !wasEdit);
      if (phSp && (phSp.added.length || phSp.removed.length)) err(t('ph_saving'));
      const failed = await commitPhotos(phSp, id);
      closeSheets();
      toast(failed ? t('e_photo', failed) : wasEdit ? t('t_card_upd') : t('t_sp_added'));
      openCard('sp', id);
      render();
    } catch (x) { err(errMsg(x)); }
  });
});
$('#sp-del').addEventListener('click', async () => {
  if (!editingSp || !isAdmin()) return;
  const n = recs.filter(r => r.sp === editingSp.id).length;
  if (!spDelArmed) { spDelArmed = true; $('#sp-del').textContent = n ? t('del_sp_n', n) : t('del_confirm'); return; }
  try { await dropSp(editingSp.id); closeSheets(); render(); toast(t('t_sp_del')); setTab('species'); }
  catch (x) { $('#sp-err').textContent = errMsg(x); }
});

/* ---------- staff accounts (admin) ---------- */
function openUserForm(p) {
  if (!isAdmin()) return;
  editingUser = p || null;
  $('#uf-title').textContent = p ? (p.display_name || p.login) : t('uf_new');
  $('#uf-sub').textContent = p ? t('uf_edit') : t('uf_hint');
  const opt = (val, cur, label) => `<option value="${val}"${val === cur ? ' selected' : ''}>${esc(label)}</option>`;
  const roleSel = `<div class="fld"><label for="uf-role">${esc(t('uf_role'))}</label><select id="uf-role" name="role">${['staff', 'viewer', 'admin'].map(r => opt(r, p ? p.role : 'staff', cap(roleText(r)))).join('')}</select></div>`;
  $('#uf-fields').innerHTML = field({k: 'name', l: 'uf_name', t: 'text', req: 1, id: 'uf-name'}, p ? p.display_name : '')
    + field({k: 'login', l: 'uf_login', t: 'text', req: !p, id: 'uf-login', dis: !!p, ac: 'off'}, p ? p.login : '')
    + (p ? '' : `<p class="hint">${esc(t('uf_login_hint'))}</p>`)
    + field({k: 'password', l: p ? 'uf_newpass' : 'uf_pass', t: 'text', req: !p, id: 'uf-pass', ac: 'new-password'}, '')
    + roleSel
    + (p ? `<div class="fld"><label for="uf-state">${esc(t('uf_state'))}</label><select id="uf-state" name="state">${opt('on', p.active ? 'on' : 'off', t('st_on'))}${opt('off', p.active ? 'on' : 'off', t('st_off'))}</select></div>` : '');
  $('#uf-err').textContent = '';
  openSheet('user');
}
$('#user-form').addEventListener('submit', async e => {
  e.preventDefault();
  const err = m => { $('#uf-err').textContent = m; }, g = id => ($('#' + id) ? $('#' + id).value.trim() : '');
  const name = g('uf-name'), login = g('uf-login').toLowerCase(), pass = $('#uf-pass').value, roleV = g('uf-role');
  if (!name) return err(t('e_name_req'));
  if (!editingUser && !/^[a-z0-9._-]{2,32}$/.test(login)) return err(t('e_bad_login'));
  if ((!editingUser || pass) && pass.length < 8) return err(t('e_short_pass'));
  await withBusy($('#uf-save'), async () => {
    try {
      if (editingUser) {
        const body = {action: 'update', id: editingUser.id, display_name: name, role: roleV, active: g('uf-state') !== 'off'};
        if (pass) body.password = pass;
        await callAdmin(body);
      } else {
        await callAdmin({action: 'create', login, password: pass, display_name: name, role: roleV});
      }
      await LOADERS.profiles();
      closeSheets(); render();
      toast(editingUser ? t('t_user_saved') : t('t_user_added'));
    } catch (x) { err(adminErr(x)); }
  });
});

$('#pass-form').addEventListener('submit', async e => {
  e.preventDefault();
  const err = m => { $('#pf-err').textContent = m; }, a = $('#pf-new').value, b = $('#pf-rep').value;
  if (a.length < 8) return err(t('e_short_pass'));
  if (a !== b) return err(t('e_pass_match'));
  await withBusy($('#pf-save'), async () => {
    const {error} = await sb.auth.updateUser({password: a});
    if (error) return err(/different|same/i.test(error.message || '') ? t('e_save') : errMsg(error));
    $('#pf-new').value = ''; $('#pf-rep').value = '';
    closeSheets(); toast(t('t_pass_changed'));
  });
});

/* ---------- clicks ---------- */
document.addEventListener('click', e => {
  const lb = e.target.closest('[data-lb]');
  if (lb) { e.preventDefault(); e.stopPropagation(); openLightbox(lb.dataset.lb); return; }
  if (e.target.closest('[data-lb-close]') || e.target.id === 'lightbox' || e.target.id === 'lb-img') { closeLightbox(); return; }
  const el = e.target.closest('[data-new],[data-sheet],[data-tab],[data-edit],[data-close],[data-goto],[data-f],[data-view],[data-sp],[data-sp-new],[data-sp-edit],[data-bc],[data-cf],[data-bird-new],[data-bird-edit],[data-lang],[data-user],[data-user-new],[data-logout],[data-pass]');
  if (!el) return;
  const d = el.dataset;
  if (d.lang) setLang(d.lang);
  else if (d.logout !== undefined) { closeSheets(); sb && sb.auth.signOut(); }
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
  else if (d.new) { if (!canWrite()) return; const pre = {}; if (d.bird) pre.bird = d.bird; if (d.from) pre.from = d.from; openForm(d.new, pre); }
  else if (d.sheet) { if (!canWrite()) return; presetBird = d.preset || null; openSheet(d.sheet); }
  else if (d.tab) setTab(d.tab);
  else if (d.edit) { const r = recs.find(x => x.id === d.edit); if (r) openForm(r.type, null, r); }
  else if (d.close !== undefined) closeSheets();
  else if (d.goto) { setTab('now'); const s = $('#' + d.goto); if (s) s.scrollIntoView({block: 'start'}); }
  else if (d.f) { filt = d.f; $$('#view-logs .chip').forEach(c => c.setAttribute('aria-pressed', String(c === el))); renderLogs(); paintPhotos(); }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#lightbox').hidden) closeLightbox(); else if ($('.sheet.open')) closeSheets();
});
[['#form', '#f-err'], ['#sp-form', '#sp-err'], ['#bird-form', '#bf-err'], ['#user-form', '#uf-err'], ['#pass-form', '#pf-err'], ['#login-form', '#lg-err']]
  .forEach(([f, er]) => $(f).addEventListener('input', () => { $(er).textContent = ''; }));
$('#q').addEventListener('input', e => { q = key(e.target.value); renderLogs(); paintPhotos(); });
$('#sq').addEventListener('input', e => { sq = key(e.target.value); renderSpecies(); });
$('#cq').addEventListener('input', e => { cq = key(e.target.value); renderColl(); paintPhotos(); });

/* ---------- export ---------- */
function csv() {
  const rows = [t('csv_h')];
  [...recs].sort((a, b) => a.at - b.at).forEach(r => {
    const s = spById(r.sp);
    rows.push([new Date(r.at).toLocaleDateString(LOCALE[lang]), fTime.format(r.at), t('g_' + T[r.type].g), evLabel(r.type), spName(s), s ? s.latin : '', r.bird, details(r), r.note, r.by ? authorName(r.by) : '', photosOf('record', r.id).length || '']);
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
function gate(mode, msgKey) {
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
  me = null; myProfile = null; recs = []; species = []; coll = []; photos = []; profiles = new Map(); urlCache.clear();
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

/* ---------- start ---------- */
paintIcons(document);
$('#today').textContent = new Date().getDate();
applyStatic();
setStatus('', 'info');
if (!window.supabase || !window.supabase.createClient) {
  gate('loading', 'e_lib');
} else {
  sb = window.supabase.createClient(SB_URL, SB_KEY, {auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: false}});
  sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') { resetState(); closeSheets(); gate('login'); } });
  boot();
}
}
