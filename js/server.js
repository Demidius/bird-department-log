// server.js — Supabase calls: loaders, saves, deletes, photo upload
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
  enclosures: async () => { encls = (await fetchAll('enclosures', 'created_at')).map(fromEncl).filter(Boolean); },
  collection: async () => { coll = (await fetchAll('collection', 'created_at')).map(fromBird).filter(Boolean); },
  photos: async () => { photos = (await fetchAll('photos', 'created_at')).map(fromPhoto); },
  change_log: async () => { logRows = (must(await sb.from('change_log').select('*').order('at', {ascending: false}).limit(1000)) || []).map(x => Object.assign({}, x, {at: ms(x.at)})); },
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
async function putEncl(id, x, isNew) {
  const row = isNew ? must(await sb.from('enclosures').insert(Object.assign(toEncl(x), {id, created_by: me})).select().single())
                    : must(await sb.from('enclosures').update(toEncl(x)).eq('id', id).select().single());
  const y = fromEncl(row), i = encls.findIndex(z => z.id === id);
  if (i >= 0) encls[i] = y; else encls.push(y);
  enclByName.set(key(y.name), y); enclMap.set(y.id, y);
}
async function dropEncl(id) {
  await dropPhotosOf('encl', id);
  must(await sb.from('enclosures').delete().eq('id', id));
  encls = encls.filter(x => x.id !== id);
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
