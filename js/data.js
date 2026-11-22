// data.js — state, rows <-> app objects, groups, names, species info/texts, machine translation, place tree, species timings
/* ---------- state ---------- */
let sb = null, me = null, myProfile = null, channel = null;
let recs = [], species = [], coll = [], photos = [], profiles = new Map();
let spMap = new Map(), collMap = new Map(), collByName = new Map(), photosByOwner = new Map();
let curSp = null, editingSp = null, spDelArmed = false, sq = '', sg = 'all';
let curBird = null, editingBird = null, birdDelArmed = false, cq = '', cf = 'active', presetBird = null;
let tab = 'add', filt = 'all', q = '', curType = null, editing = null, delArmed = false, lastFocus = null, st = null;
let statusKey = '', statusKind = 'info', gateKey = 'loading', editingUser = null;
let phRec = null, phSp = null, phBird = null, phEncl = null;
let encls = [], enclMap = new Map(), enclByName = new Map(), curEncl = null, editingEncl = null, enclDelArmed = false, eq = '', ek = 'all';
let logRows = [], lgf = 'all', logDelArmed = '';
let calMode = (() => { try { return localStorage.getItem('zoo-cal-mode') === 'grid' ? 'grid' : 'list'; } catch (x) { return 'list'; } })(), calFrom = null, calTo = null, calObs = null, calObsOn = false;
let calM = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })(), calSel = '';
const DEF_BACK = {sp: 'species', bird: 'coll', encl: 'encls'}, backOf = {sp: 'species', bird: 'coll', encl: 'encls'};
const VIEW_KEY = {add: 'tab_add', now: 'tab_now', logs: 'logs', menu: 'menu', species: 'species_t', sp: 'spf_edit', coll: 'coll', bird: 'bf_edit', users: 'users_t', encls: 'encls_t', encl: 'ef_edit', cal: 'tab_cal', log: 'log_t'};

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
  if (src.nt) f.nt = 1;
  return {id: d.id, type: d.type, sp: d.species_id || '', bird: String(d.bird || ''), at: ms(d.event_at), f, note: String(d.note || ''), by: d.created_by || null, created: ms(d.created_at)};
}
const toRec = r => ({type: r.type, species_id: r.sp || null, bird: r.bird, event_at: new Date(r.at).toISOString(), f: r.f, note: r.note});
function fromSp(d) {
  if (!d) return null;
  const info = d.info && typeof d.info === 'object' && !Array.isArray(d.info) ? d.info : {};
  return {id: d.id, name: d.name_ru || '', pl: d.name_pl || '', en: d.name_en || '', latin: d.latin || '', note: d.note || '', info, by: d.created_by || null, created: ms(d.created_at)};
}
const toSp = s => ({name_ru: s.name || '', name_pl: s.pl || '', name_en: s.en || '', latin: s.latin || '', note: s.note || '', info: s.info || {}});
function fromBird(d) {
  if (!d) return null;
  return {id: d.id, name: d.name, sp: d.species_id || '', sex: d.sex || '', ring: d.ring || '', chip: d.chip || '', born: d.born || '', arrived: d.arrived || '',
    origin: d.origin || '', encl: d.encl || '', enclAt: ms(d.encl_at), status: d.status === 'out' ? 'out' : 'active', note: d.note || '', names: Array.isArray(d.names) ? d.names : [], locked: Array.isArray(d.locked) ? d.locked : [], by: d.created_by || null,
    grp: d.grp && typeof d.grp === 'object' ? {m: toN(d.grp.m) || 0, f: toN(d.grp.f) || 0, u: toN(d.grp.u) || 0, j: toN(d.grp.j) || 0} : null, parents: Array.isArray(d.parents) ? d.parents.filter(x => typeof x === 'string') : []};
}
// a group of animals kept together: adults by sex (m.f.u, as in zoo records) and juveniles
const grpTotal = g => g ? g.m + g.f + g.u + g.j : 0;
const grpText = g => '♂ ' + g.m + ' · ♀ ' + g.f + (g.u ? ' · ? ' + g.u : '') + (g.j ? ' · ' + t('juv') + ' ' + g.j : '') + ' (' + g.m + '.' + g.f + '.' + g.u + ', ' + t('grp_total', grpTotal(g)) + ')';
const toBird = b => ({name: b.name, species_id: b.sp || null, sex: b.sex || '', ring: b.ring || '', chip: b.chip || '', born: b.born || null, arrived: b.arrived || null,
  origin: b.origin || '', encl: b.encl || '', encl_at: b.enclAt ? new Date(b.enclAt).toISOString() : null, status: b.status, note: b.note || '', names: b.names || [], locked: b.locked || [], grp: b.grp || null, parents: b.parents || []});
const EK = ['building', 'aviary', 'enclosure', 'cage', 'incubator', 'brooder', 'room', 'quarantine', 'pond', 'other'];
const EK_IC = {building: ['building', 'blue'], aviary: ['tree', 'green'], enclosure: ['home', 'green'], cage: ['cage', 'blue'], incubator: ['egg', 'amber'], brooder: ['chick', 'amber'],
  room: ['home', 'grey'], quarantine: ['cross', 'red'], pond: ['drop', 'blue'], other: ['tag', 'grey']};
function fromEncl(d) {
  if (!d) return null;
  return {id: d.id, name: d.name, kind: EK.includes(d.kind) ? d.kind : 'other', area: d.area || '', size: d.size || '', cap: d.capacity || 0,
    active: d.active !== false, note: d.note || '', parent: d.parent_id || '', names: Array.isArray(d.names) ? d.names : [], locked: Array.isArray(d.locked) ? d.locked : [], by: d.created_by || null};
}
const toEncl = x => ({name: x.name, kind: x.kind, area: x.area || '', size: x.size || '', capacity: x.cap || null, active: x.active, note: x.note || '', parent_id: x.parent || null, names: x.names || [], locked: x.locked || []});
const fromPhoto = d => ({id: d.id, ownerType: d.owner_type, ownerId: d.owner_id, path: d.path, w: d.width, h: d.height, by: d.created_by || null, created: ms(d.created_at)});
const thumbOf = p => p.replace(/\.jpg$/, '_t.jpg');
const photosOf = (type, id) => photosByOwner.get(type + ':' + id) || [];
// which photo is the main one: the chosen one if it still exists, else Wikipedia, else the first uploaded
function mainOf(st2, wk) {
  const ids = st2.keep.map(p => p.id).concat(st2.added.map(a => a.id));
  if (st2.main === 'wiki' && wk) return 'wiki';
  if (st2.main && ids.includes(st2.main)) return st2.main;
  return wk ? 'wiki' : ids[0] || '';
}

// names in several languages: the main name is the stable key, the others are shown when the app is in that language
const LANGS = ['pl', 'en', 'ru'], LANG_NAME = {ru: 'Русский', pl: 'Polski', en: 'English'};
const altNames = x => (x && Array.isArray(x.names) ? x.names : []).filter(n => n && LANGS.includes(n.l) && String(n.v || '').trim());
const dn = x => { if (!x) return ''; const a = altNames(x).find(n => n.l === lang); return a ? a.v : x.name; };
const allNames = x => [x.name].concat(altNames(x).map(n => n.v));
const otherNames = x => { const shown = dn(x); return (x.name !== shown ? [t('alt_main') + ': ' + x.name] : []).concat(altNames(x).filter(n => n.v !== shown).map(n => n.l.toUpperCase() + ': ' + n.v)).join(' · '); };
const bn = name => { const cb = collByName.get(key(name)); return cb ? dn(cb) : name; };
const enDn = name => { const x = name && enclByName.get(key(name)); return x ? dn(x) : (name || ''); };
const canonBird = v => { if (collByName.has(key(v))) return v; const cb = coll.find(x => altNames(x).some(n => key(n.v) === key(v))); return cb ? cb.name : v; };
const spById = id => (id && spMap.get(id)) || null;
const spName = s => !s ? '' : s[LANG_FIELD[lang]] || s.pl || s.en || s.name || s.latin;
const spNames = s => [s.name, s.latin, s.pl, s.en].filter(Boolean);
const spOther = s => { const main = spName(s); return [['PL', s.pl], ['EN', s.en], ['RU', s.name]].filter(([, v]) => v && v !== main).map(([c, v]) => c + ' ' + v).join(' · '); };
const bySp = (a, b) => spName(a).localeCompare(spName(b), LOCALE[lang]);
const byName = (a, b) => a.name.localeCompare(b.name, LOCALE[lang]);
const findSpByAnyName = n => species.find(x => spNames(x).some(v => key(v) === key(n)));
const spOfBird = name => { const cb = collByName.get(key(canonBird(name))); if (cb && spById(cb.sp)) return cb.sp; const b = st && st.birds.get(key(name)); return b && spById(b.sp) ? b.sp : ''; };
const nm = b => { const cb = collByName.get(key(b.name)); return cb ? `<button class="namelink" type="button" data-bc="${esc(cb.id)}">${esc(dn(cb))}</button>` : `<b>${esc(b.name)}</b>`; };
const backBtn = k => `<button class="backlink" type="button" data-view="${backOf[k]}">${ic('back', 18, 2.2)}${esc(t(VIEW_KEY[backOf[k]] || 'back'))}</button>`;
const matchQ = r => { if (key(r.bird).includes(q) || key(bn(r.bird)).includes(q)) return true; const s = spById(r.sp); return !!s && spNames(s).some(v => key(v).includes(q)); };
const spLink = b => { const s = spById(b.sp); return s ? `<button class="linkish" type="button" data-sp="${esc(s.id)}">${esc(spName(s))}</button>` : ''; };
const IUCN = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'DD'];
const spInfo = s => (s && s.info) || {};
const spGroup = s => spInfo(s).group === 'mammal' ? 'mammal' : 'bird';
const spPhoto = s => { const p = spInfo(s).photo; return p && /^https:\/\//.test(p.src || '') ? p : null; };
const spLocked = s => { const l = spInfo(s).locked; return Array.isArray(l) ? l : []; };
const lockMark = on => on ? `<span class="lk-i" title="${esc(t('lk_t'))}" aria-label="${esc(t('lk_t'))}">${ic('lock', 14, 2.2)}</span>` : '';
// the main photo of a species: {wiki} or {dept: photo row}, chosen with info.main
function spMain(s) {
  const wk = spPhoto(s), dp = photosOf('species', s.id), m = spInfo(s).main;
  if (m && m !== 'wiki') { const p = dp.find(x => x.id === m); if (p) return {dept: p}; }
  if (wk) return {wiki: wk};
  return dp[0] ? {dept: dp[0]} : null;
}
const iucnBadge = (c, long) => IUCN.includes(c) ? `<span class="iucn iucn-${c}" title="${esc(t('iucn_t') + ' ' + c + ' — ' + t('iucn_' + c))}"><b>${c}</b>${long ? `<span>${esc(t('iucn_' + c))}</span>` : ''}</span>` : '';
const SI_WILD = [['range', 'globe'], ['habitat', 'tree'], ['diet_wild', 'leaf'], ['behaviour', 'eye'], ['breeding', 'egg']];
const SI_ZOO = [['diet_zoo', 'bowl'], ['husbandry', 'home'], ['health', 'heart'], ['sex', 'sex']];
// species texts kept in three languages: {pl, en, ru, src, auto: [machine-translated languages]}; a plain string is an old Russian-only text
const TRK = ['size', 'life', 'order', 'family', 'range', 'habitat', 'diet_wild', 'behaviour', 'breeding', 'diet_zoo', 'husbandry', 'health', 'sex'];
const trObj = v => typeof v === 'string' ? (v.trim() ? {ru: v, src: 'ru'} : null) : v && typeof v === 'object' && !Array.isArray(v) ? v : null;
function trPick(v, L = lang) {
  const o = trObj(v); if (!o) return null;
  const s0 = typeof o[L] === 'string' ? o[L].trim() : '';
  if (s0) return {txt: s0, auto: Array.isArray(o.auto) && o.auto.includes(L) ? o.src || 'ru' : ''};
  for (const l of [o.src].concat(LANG_ORDER)) if (l && typeof o[l] === 'string' && o[l].trim()) return {txt: o[l].trim(), only: l};
  return null;
}
const trText = v => { const p = trPick(v); return p ? p.txt : ''; };
const trNote = p => p && p.auto ? `<span class="tr-note">${ic('globe', 13)}${esc(t('tr_from', p.auto))}</span>` : p && p.only && p.only !== lang ? `<span class="tr-note">${ic('globe', 13)}${esc(t('tr_orig', p.only))}</span>` : '';
const decodeHtml = s0 => { const d = document.createElement('textarea'); d.innerHTML = s0; return d.value; };
// machine translation through the free MyMemory service, in pieces of up to ~450 bytes
async function mt(text, from, to) {
  const enc = new TextEncoder(), sz = x => enc.encode(x).length, out = [];
  for (const para of text.split('\n')) {
    if (!para.trim()) { out.push(para); continue; }
    const parts = []; let cur = '';
    for (let sen of para.split(/(?<=[.!?…;])\s+/)) {
      while (sz(sen) > 450) { let cut = sen.lastIndexOf(' ', 200); if (cut < 40) cut = 200; if (cur) { parts.push(cur); cur = ''; } parts.push(sen.slice(0, cut)); sen = sen.slice(cut).trim(); }
      if (cur && sz(cur + ' ' + sen) > 450) { parts.push(cur); cur = sen; } else cur = cur ? cur + ' ' + sen : sen;
    }
    if (cur) parts.push(cur);
    const tr = [];
    for (const q0 of parts) {
      const r = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(q0) + '&langpair=' + from + '|' + to);
      const j = await r.json();
      const v = j && j.responseData && j.responseData.translatedText;
      if (!r.ok || Number(j.responseStatus) !== 200 || !v || /MYMEMORY WARNING/i.test(v)) throw new Error('mt');
      tr.push(decodeHtml(v));
    }
    out.push(tr.join(' '));
  }
  return out.join('\n');
}
const enclTile = (x, sm) => { const [i, tone] = EK_IC[x ? x.kind : 'other']; return `<span class="tile${sm ? ' sm' : ''} t-${x && !x.active ? 'grey' : tone}">${ic(i, sm ? 18 : 24)}</span>`; };
const enclLink = n => { const x = n && enclByName.get(key(n)); return x ? `<button class="linkish" type="button" data-ec="${esc(x.id)}">${esc(dn(x))}</button>` : esc(n || ''); };
// places can sit inside other places: building › room › enclosure
const kidsOf = id => encls.filter(x => x.parent === id && x.parent !== x.id);
const pathOf = x => { const out = [], seen = new Set(); let p = x && enclMap.get(x.parent); while (p && !seen.has(p.id)) { seen.add(p.id); out.unshift(p); p = enclMap.get(p.parent); } return out; };
const descOf = x => { const out = [], seen = new Set([x.id]), stack = [x.id]; while (stack.length) { for (const c of kidsOf(stack.pop())) if (!seen.has(c.id)) { seen.add(c.id); out.push(c); stack.push(c.id); } } return out; };
const pathText = x => pathOf(x).map(p => p.name).concat(x.name).join(' › ');
const enclPath = n => { const x = n && enclByName.get(key(n)); return x ? pathOf(x).map(p => `<button class="linkish" type="button" data-ec="${esc(p.id)}">${esc(dn(p))}</button> › `).join('') + enclLink(n) : esc(n || ''); };
const INDENT = d => String.fromCharCode(160).repeat(3 * d);
const byPlace = (a, b) => EK.indexOf(a.kind) - EK.indexOf(b.kind) || a.name.localeCompare(b.name, LOCALE[lang], {numeric: true});
// places in tree order with depth; roots are places without a (shown) parent
function treeOrder(list) {
  const ids = new Set(list.map(x => x.id)), out = [], seen = new Set();
  const walk = (x, d) => { if (seen.has(x.id)) return; seen.add(x.id); out.push([x, d]); list.filter(c => c.parent === x.id).sort(byPlace).forEach(c => walk(c, d + 1)); };
  list.filter(x => !x.parent || !ids.has(x.parent)).sort(byPlace).forEach(x => walk(x, 0));
  list.filter(x => !seen.has(x.id)).forEach(x => walk(x, 0));
  return out;
}
// where an animal is now: the latest of its card's enclosure and its latest transfer record
const placeOf = cb => { const b = (st && st.birds.get(key(cb.name))) || {}; return b.encl && b.enclAt >= cb.enclAt ? {name: b.encl, at: b.enclAt} : {name: cb.encl, at: cb.enclAt}; };
const incubDays = spId => toN(spInfo(spById(spId)).incub_days);
// species timings for the expected (calculated, not stored) dates: hatching -> leaving the nest, gestation -> fertilisation
const fledgeDays = spId => toN(spInfo(spById(spId)).fledge_days);
const gestDays = spId => toN(spInfo(spById(spId)).gest_days);
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
      case 'tdose': if (b.treat) { b.treat.last = r.at; b.treat.lastNt = !!r.f.nt; } break;
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
    case 'expo': return (f.from ? enDn(f.from) + ' → ' : '→ ') + enDn(f.to || '');
    case 'tstart': return [f.reason, f.drug, f.days ? t('d_course', f.days) : ''].filter(Boolean).join(' · ');
    case 'tdose': return f.drug || '';
    case 'tend': return f.result || '';
    case 'lay': return t('d_eggs', f.n || 1);
    case 'incub': { const fd = f.days && fledgeDays(r.sp); return f.days ? t('d_incub', f.days, fDay.format(r.at + f.days * 864e5)) + (fd ? ', ' + t('d_fledge_p', fDay.format(r.at + (f.days + fd) * 864e5)) : '') : ''; }
    case 'hatch': { const fd = fledgeDays(r.sp); return t('d_chicks', f.n || 1) + (fd ? ' · ' + t('d_fledge_p', fDay.format(r.at + fd * 864e5)) : ''); }
    case 'fledge': return t('d_chicks', f.n || 1);
    case 'birth': { const gd = gestDays(r.sp); return t('d_young', f.n || 1) + (gd ? ' · ' + t('d_fert_p', fDay.format(r.at - gd * 864e5)) : ''); }
    default: return '';
  }
}
function occupancy() {
  const occ = new Map(), add = (n, item) => { const k = key(n); if (!k) return; if (!occ.has(k)) occ.set(k, []); occ.get(k).push(item); };
  for (const cb of coll) if (cb.status !== 'out') { const pl = placeOf(cb); if (pl.name) add(pl.name, {name: cb.name, sp: cb.sp, cb, since: pl.at}); }
  for (const b of st.birds.values()) if (!collByName.has(key(b.name)) && b.encl) add(b.encl, {name: b.name, sp: b.sp, cb: null, since: b.enclAt});
  return occ;
}
const occOf = x => (st && st.occ && st.occ.get(key(x.name))) || [];
const stat = b => [b.treat ? t('c_treat') : '', b.inc ? t('st_inc') : '', b.chicks ? t('in_nest', b.chicks) : ''].filter(Boolean).join(' · ') || t('st_none');
