// base.js — v2: config, helpers, language, state, loading and saving data (Supabase)
const SB_URL = 'https://nszeqgopzonpplfznaat.supabase.co';
const SB_KEY = 'sb_publishable_r_fN0QxiDijqW4t-Qnv9pA_SAzpKvdp';
const BUCKET = 'journal-photos';
const LOGIN_DOMAIN = 'zoo-log.invalid';
const DAY = 864e5;

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const ic = (n, s = 20, w = 2) => BirdLog.icon(n, s, w);
const uuid = () => crypto.randomUUID();
const store = {get: k => { try { return localStorage.getItem(k); } catch (x) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (x) {} }};

/* ---------- language: every string is written in three languages: L(pl, ru, en) ---------- */
let lang = (() => { const v = store.get('zoo-log-lang2'); return ['pl', 'ru', 'en'].includes(v) ? v : 'pl'; })();
const L = (pl, ru, en) => lang === 'ru' ? ru : lang === 'en' ? (en ?? pl) : pl;
const LA = (pl, ru, en) => lang === 'ru' ? ru : lang === 'en' ? (en || pl) : pl; // arrays
const LOC = () => ({pl: 'pl-PL', ru: 'ru-RU', en: 'en-GB'})[lang];
const fTime = ms => new Date(ms).toLocaleTimeString(LOC(), {hour: '2-digit', minute: '2-digit'});
const fDate = ms => new Date(ms).toLocaleDateString(LOC(), {day: '2-digit', month: '2-digit'});
const fDay = ms => new Date(ms).toLocaleDateString(LOC(), {day: 'numeric', month: 'long'});
const fWeekday = ms => new Date(ms).toLocaleDateString(LOC(), {weekday: 'long', day: 'numeric', month: 'long'});
const midnight = ms => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
const today0 = () => midnight(Date.now());
const dayKey = ms => { const d = new Date(ms); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
const ymd = ms => { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const relDay = ms => { const d = Math.round((today0() - midnight(ms)) / DAY); return d === 0 ? L('Dziś', 'Сегодня', 'Today') : d === 1 ? L('Wczoraj', 'Вчера', 'Yesterday') : fDay(ms); };
const key = s => String(s || '').trim().toLowerCase();
const num = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : null; };

/* ---------- state ---------- */
let sb = null, me = null, myProfile = null, commentsOn = false;
const D = {sp: new Map(), pl: [], an: [], rec: [], ph: [], prof: new Map(), log: [], com: new Map()};
const role = () => myProfile ? myProfile.role : null;
const canWrite = () => ['admin', 'staff'].includes(role());
const isAdmin = () => role() === 'admin';
const canEditRec = r => isAdmin() || (canWrite() && r.by === me);
const nameOf = id => { const p = id && D.prof.get(id); return p ? (p.display_name || p.login) : (id ? '—' : 'AI'); };

/* ---------- loading ---------- */
const must = res => { if (res && res.error) throw res.error; return res ? res.data : null; };
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
// new record kinds are stored as 'obs' with f.k = kind until the database knows them (old site shows them as observations)
const NATIVE = ['expo', 'obs', 'tstart', 'tdose', 'tend', 'lay', 'incub', 'hatch', 'fledge', 'birth'];
const fromRec = d => ({id: d.id, k: d.type === 'obs' && d.f && d.f.k ? d.f.k : d.type, type: d.type, sp: d.species_id || '', bird: String(d.bird || ''),
  at: new Date(d.event_at).getTime(), f: d.f && typeof d.f === 'object' ? d.f : {}, note: d.note || '', by: d.created_by || null, created: new Date(d.created_at).getTime()});
const LOAD = {
  species: async () => { D.sp = new Map((await fetchAll('species', 'created_at')).map(r => [r.id, r])); },
  enclosures: async () => { D.pl = await fetchAll('enclosures', 'created_at'); },
  collection: async () => { D.an = await fetchAll('collection', 'created_at'); },
  records: async () => { D.rec = (await fetchAll('records', 'event_at')).map(fromRec); },
  photos: async () => { D.ph = await fetchAll('photos', 'created_at'); },
  profiles: async () => { D.prof = new Map((await fetchAll('profiles', 'created_at')).map(p => [p.id, p])); myProfile = D.prof.get(me) || null; },
  change_log: async () => { D.log = must(await sb.from('change_log').select('*').order('at', {ascending: false}).limit(300)) || []; },
  comments: async () => {
    const res = await sb.from('comments').select('*').order('created_at', {ascending: true}).range(0, 4999);
    commentsOn = !res.error; D.com = new Map();
    for (const c of res.data || []) { if (!D.com.has(c.record_id)) D.com.set(c.record_id, []); D.com.get(c.record_id).push(c); }
  }
};
async function loadAll() { await Promise.all(Object.values(LOAD).map(f => f().catch(e => { if (f !== LOAD.comments) throw e; }))); }
let reloadT = 0, pending = new Set();
function subscribe() {
  try {
    sb.channel('v2').on('postgres_changes', {event: '*', schema: 'public'}, p => {
      if (!LOAD[p.table]) return; pending.add(p.table); clearTimeout(reloadT);
      reloadT = setTimeout(async () => { const l = [...pending]; pending = new Set(); try { await Promise.all(l.map(x => LOAD[x]())); render(); } catch (x) {} }, 500);
    }).subscribe();
  } catch (x) {}
}

/* ---------- saving ---------- */
const errText = e => {
  const c = e && (e.code || '');
  if (c === '42501' || /row-level security|permission/i.test((e && e.message) || '')) return L('Brak uprawnień', 'Нет прав', 'No permission');
  if (c === '23505') return L('Taka nazwa już istnieje', 'Такое имя уже есть', 'This name already exists');
  if (!navigator.onLine || (e && /fetch|network/i.test(e.message || ''))) return L('Brak sieci — spróbuj ponownie', 'Нет сети — попробуй ещё раз', 'No network — try again');
  return L('Nie udało się zapisać', 'Не удалось сохранить', 'Could not save');
};
// one record; kind may be new (stored as obs + f.k)
async function addRecord(kind, bird, sp, f, note, at, id = uuid()) {
  const native = NATIVE.includes(kind);
  const row = {id, type: native ? kind : 'obs', species_id: sp || null, bird: bird || '—', event_at: new Date(at || Date.now()).toISOString(),
    f: native ? (f || {}) : Object.assign({k: kind}, f || {}), note: note || '', created_by: me};
  const x = fromRec(must(await sb.from('records').insert(row).select().single()));
  D.rec.push(x); return x;
}
async function updateRecord(r, f, note, at) {
  const row = {f: r.type === 'obs' && r.k !== 'obs' ? Object.assign({k: r.k}, f) : f, note: note ?? r.note, event_at: new Date(at || r.at).toISOString()};
  const x = fromRec(must(await sb.from('records').update(row).eq('id', r.id).select().single()));
  D.rec[D.rec.findIndex(y => y.id === r.id)] = x; return x;
}
async function dropRecord(id) { must(await sb.from('records').delete().eq('id', id)); D.rec = D.rec.filter(x => x.id !== id); }
async function putRow(table, list, id, patch, isNew) {
  const row = isNew ? must(await sb.from(table).insert(Object.assign({id, created_by: me}, patch)).select().single())
                    : must(await sb.from(table).update(patch).eq('id', id).select().single());
  const i = list.findIndex(x => x.id === id); if (i >= 0) list[i] = row; else list.push(row); return row;
}
const putAnimal = (id, patch, isNew) => putRow('collection', D.an, id, patch, isNew);
const putPlace = (id, patch, isNew) => putRow('enclosures', D.pl, id, patch, isNew);
async function putSpecies(id, patch, isNew) {
  const row = isNew ? must(await sb.from('species').insert(Object.assign({id, created_by: me}, patch)).select().single())
                    : must(await sb.from('species').update(patch).eq('id', id).select().single());
  D.sp.set(row.id, row); return row;
}
async function addComment(recId, body, parent) {
  const c = must(await sb.from('comments').insert({id: uuid(), record_id: recId, parent_id: parent || null, body, created_by: me}).select().single());
  if (!D.com.has(recId)) D.com.set(recId, []); D.com.get(recId).push(c); return c;
}
async function dropComment(c) { must(await sb.from('comments').delete().eq('id', c.id)); D.com.set(c.record_id, (D.com.get(c.record_id) || []).filter(x => x.id !== c.id)); }
async function callAdmin(body) {
  const {data, error} = await sb.functions.invoke('admin-users', {body});
  if (error) { let code = 'save'; try { const j = await error.context.json(); code = j.error || code; } catch (x) {} throw {appCode: code}; }
  return data;
}

/* ---------- photos ---------- */
const thumbOf = p => p.replace(/\.jpg$/, '_t.jpg');
const urls = new Map();
async function ensureUrls(paths) {
  const need = [...new Set(paths)].filter(p => p && !urls.has(p));
  for (let i = 0; i < need.length; i += 100) {
    try { const {data} = await sb.storage.from(BUCKET).createSignedUrls(need.slice(i, i + 100), 3600); (data || []).forEach(x => x.signedUrl && urls.set(x.path, x.signedUrl)); } catch (x) {}
  }
}
function shrink(file, max) {
  return new Promise((res, rej) => {
    const img = new Image(); img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(b => b ? res({b, w: c.width, h: c.height}) : rej(new Error('img')), 'image/jpeg', 0.85);
    }; img.onerror = rej; img.src = URL.createObjectURL(file);
  });
}
async function uploadPhoto(file, ownerType, ownerId) {
  const full = await shrink(file, 1600), th = await shrink(file, 360), path = `${me}/${uuid()}.jpg`;
  must(await sb.storage.from(BUCKET).upload(path, full.b, {contentType: 'image/jpeg', upsert: false}));
  must(await sb.storage.from(BUCKET).upload(thumbOf(path), th.b, {contentType: 'image/jpeg', upsert: false}));
  const row = must(await sb.from('photos').insert({id: uuid(), owner_type: ownerType, owner_id: ownerId, path, width: full.w, height: full.h, created_by: me}).select().single());
  D.ph.push(row); return row;
}
