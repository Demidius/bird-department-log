// In-memory stand-in for supabase-js, used only by the browser tests.
// Mirrors the database rules of the real project closely enough to test the interface.
(function () {
  const DOMAIN = 'zoo-log.invalid';
  const now = () => new Date().toISOString();
  const id = () => crypto.randomUUID();
  const db = {profiles: [], species: [], collection: [], records: [], photos: [], enclosures: [], change_log: [], comments: [], drugs: [], account_passwords: []};
  const REC_TYPES = ['expo', 'obs', 'tstart', 'tdose', 'tend', 'lay', 'incub', 'hatch', 'fledge', 'birth'];
  const files = new Map();
  const users = [{id: id(), email: 'diomid13a@gmail.com', password: 'secret123', confirmed: true, banned: false}];
  window.__mock = {db, users, files, calls: []};
  let session = null;
  const listeners = [];
  const emit = ev => listeners.forEach(cb => cb(ev, session));
  const uidNow = () => session && session.user.id;
  const roleOf = u => { const p = db.profiles.find(p => p.id === u && p.active); return p ? p.role : null; };
  const canRead = () => !!roleOf(uidNow());
  const canWrite = () => ['admin', 'staff'].includes(roleOf(uidNow()));
  const isAdmin = () => roleOf(uidNow()) === 'admin';
  const err = (code, message) => ({code, message});
  const clone = o => JSON.parse(JSON.stringify(o));

  function visible(table, row) {
    if (!uidNow()) return false;
    if (table === 'profiles') return canRead() || row.id === uidNow();
    return canRead();
  }
  function mayUpdate(table, row) {
    if (table === 'records') return isAdmin() || (canWrite() && row.created_by === uidNow());
    if (table === 'species' || table === 'collection' || table === 'enclosures' || table === 'drugs') return canWrite();
    return false;
  }
  function mayDelete(table, row) {
    if (table === 'records' || table === 'photos' || table === 'comments') return isAdmin() || (canWrite() && row.created_by === uidNow());
    if (table === 'species' || table === 'collection' || table === 'enclosures' || table === 'drugs' || table === 'change_log') return isAdmin();
    return false;
  }

  class Q {
    constructor(table) { this.t = table; this.op = 'select'; this.f = []; this.one = false; this.maybe = false; this.rng = null; this.ord = null; }
    select(c, o) { if (o && o.count) this.cnt = 1; return this; }
    insert(o) { this.op = 'insert'; this.p = o; return this; }
    update(o) { this.op = 'update'; this.p = o; return this; }
    delete() { this.op = 'delete'; return this; }
    eq(c, v) { this.f.push([c, v]); return this; }
    order(c, o) { this.ord = [c, !(o && o.ascending === false)]; return this; }
    range(a, b) { this.rng = [a, b]; return this; }
    limit(n) { this.rng = [0, n - 1]; return this; }
    single() { this.one = true; return this; }
    maybeSingle() { this.maybe = true; return this; }
    then(res, rej) { return new Promise(r => setTimeout(r, 5)).then(() => this.run()).then(res, rej); }
    match(row) { return this.f.every(([c, v]) => row[c] === v); }
    out(rows) {
      if (this.one) return rows.length === 1 ? {data: clone(rows[0]), error: null} : {data: null, error: err('PGRST116', 'JSON object requested, multiple (or no) rows returned')};
      if (this.maybe) return rows.length <= 1 ? {data: rows[0] ? clone(rows[0]) : null, error: null} : {data: null, error: err('PGRST116', 'multiple rows')};
      return {data: clone(rows), error: null};
    }
    run() {
      const T = db[this.t];
      window.__mock.calls.push(this.op + ':' + this.t);
      if (this.op === 'select') {
        let rows = T.filter(r => visible(this.t, r) && this.match(r));
        if (this.ord) { const [c, asc] = this.ord; rows.sort((a, b) => (a[c] > b[c] ? 1 : a[c] < b[c] ? -1 : 0) * (asc ? 1 : -1)); }
        const total = rows.length;
        if (this.rng) rows = rows.slice(this.rng[0], this.rng[1] + 1);
        const res = this.out(rows); if (this.cnt) res.count = total; return res;
      }
      if (this.op === 'insert') {
        const row = Object.assign({id: id(), created_at: now(), updated_at: now()}, clone(this.p));
        if (this.t === 'profiles' || !canWrite() || row.created_by !== uidNow()) return {data: null, error: err('42501', 'new row violates row-level security policy')};
        if ((this.t === 'collection' || this.t === 'enclosures') && T.some(r => r.name.trim().toLowerCase() === row.name.trim().toLowerCase())) return {data: null, error: err('23505', 'duplicate key value')};
        if (this.t === 'photos' && row.path.split('/')[0] !== uidNow()) return {data: null, error: err('42501', 'rls')};
        if (this.t === 'records' && (!REC_TYPES.includes(row.type) || !String(row.bird || '').trim())) return {data: null, error: err('23514', 'check constraint')};
        if (this.t === 'comments' && !db.records.some(r => r.id === row.record_id)) return {data: null, error: err('23503', 'foreign key')};
        T.push(row);
        return this.out([row]);
      }
      if (this.op === 'update') {
        const rows = T.filter(r => visible(this.t, r) && this.match(r) && mayUpdate(this.t, r));
        for (const r of rows) {
          const old = clone(r);
          Object.assign(r, clone(this.p), {created_by: old.created_by, created_at: old.created_at, updated_at: now()});
          const lk = v => String(v || '').trim().toLowerCase();
          if (this.t === 'enclosures' && r.name.trim() !== old.name.trim()) {
            db.collection.filter(x => lk(x.encl) === lk(old.name)).forEach(x => { x.encl = r.name.trim(); });
            db.records.filter(x => x.type === 'expo').forEach(x => { if (lk(x.f.to) === lk(old.name)) x.f.to = r.name.trim(); if (lk(x.f.from) === lk(old.name)) x.f.from = r.name.trim(); });
          }
          if (this.t === 'collection' && (r.name.trim().toLowerCase() !== old.name.trim().toLowerCase() || r.species_id !== old.species_id)) {
            db.records.filter(x => x.bird.trim().toLowerCase() === old.name.trim().toLowerCase()).forEach(x => { x.bird = r.name; x.species_id = r.species_id || x.species_id; });
          }
        }
        return this.out(rows);
      }
      if (this.op === 'delete') {
        const rows = T.filter(r => visible(this.t, r) && this.match(r) && mayDelete(this.t, r));
        for (const r of rows) {
          T.splice(T.indexOf(r), 1);
          const ot = {records: 'record', collection: 'bird', species: 'species', enclosures: 'encl', drugs: 'drug'}[this.t];
          if (ot) db.photos = db.photos.filter(p => !(p.owner_type === ot && p.owner_id === r.id));
        }
        if (this.t !== 'photos') window.__mock.db.photos = db.photos;
        return {data: null, error: null};
      }
    }
  }

  const client = {
    from: t => new Q(t),
    rpc: async (name, args) => {
      await new Promise(r => setTimeout(r, 5));
      if (name === 'split_collection_group') {
        __mock.calls.push({name, args});
        const denied = () => ({data: null, error: err('42501', 'no permission')});
        if (!canWrite()) return denied();
        const group = db.collection.find(a => a.id === args.p_id);
        if (group?.status !== 'active' || !group.grp || group.updated_at !== args.p_version) {
          return {data: null, error: err('40001', 'Group has changed')};
        }
        const grp = {...group.grp};
        const cards = [];
        const move = db.records.filter(r => r.type === 'expo' && r.bird === group.name && r.f.to && r.event_at >= group.encl_at)
          .sort((a, b) => b.event_at.localeCompare(a.event_at))[0];
        for (const k of ['m', 'f', 'u', 'j']) {
          const count = args.p_counts[k] || 0;
          grp[k] = (grp[k] || 0) - count;
          for (let i = 0; i < count; i++) {
            const uid = id();
            cards.push({...group, id: uid, name: group.name + ' ' + uid, grp: null, locked: [], ring: '', chip: '',
              encl: move?.f.to || group.encl, sex: ['m', 'f'].includes(k) ? k : '', age_class: k === 'j' ? 'young' : null});
          }
        }
        const status = ['m', 'f', 'u', 'j'].some(k => grp[k] > 0) ? 'active' : 'out';
        if (!isAdmin() && (group.locked.some(k => k === 'grp' || k === '*') ||
            (status === 'out' && group.locked.includes('status')))) return denied();
        Object.assign(group, {grp, status, updated_at: now()});
        db.collection.push(...cards);
        return {data: clone({group, individuals: cards}), error: null};
      }
      if (name === 'journal_has_admin') return {data: db.profiles.some(p => p.role === 'admin'), error: null};
      if (name === 'claim_first_admin') {
        if (!uidNow() || db.profiles.some(p => p.role === 'admin')) return {data: false, error: null};
        const u = users.find(u => u.id === uidNow());
        db.profiles.push({id: u.id, login: u.email, display_name: (args && args.p_name) || u.email.split('@')[0], role: 'admin', active: true, created_at: now()});
        return {data: true, error: null};
      }
      return {data: null, error: err('PGRST202', 'no function')};
    },
    auth: {
      getSession: async () => ({data: {session}, error: null}),
      signInWithPassword: async ({email, password}) => {
        await new Promise(r => setTimeout(r, 5));
        const u = users.find(u => u.email === email && u.password === password && !u.banned);
        if (!u) return {data: null, error: Object.assign(new Error('Invalid login credentials'), {status: 400, code: 'invalid_credentials'})};
        session = {user: {id: u.id, email: u.email, email_confirmed_at: u.confirmed ? now() : null}};
        emit('SIGNED_IN');
        return {data: {session}, error: null};
      },
      signOut: async () => { session = null; emit('SIGNED_OUT'); return {error: null}; },
      updateUser: async ({password}) => { const u = users.find(u => u.id === uidNow()); u.password = password; return {data: {}, error: null}; },
      onAuthStateChange: cb => { listeners.push(cb); return {data: {subscription: {unsubscribe() {}}}}; }
    },
    storage: {
      from: () => ({
        upload: async (path, blob) => {
          if (!canWrite() || path.split('/')[0] !== uidNow()) return {data: null, error: err('403', 'rls')};
          files.set(path, URL.createObjectURL(blob)); return {data: {path}, error: null};
        },
        remove: async paths => { paths.forEach(p => files.delete(p)); return {data: [], error: null}; },
        createSignedUrls: async paths => ({data: paths.map(p => ({path: p, signedUrl: files.get(p) || null, error: files.has(p) ? null : 'not found'})), error: null})
      })
    },
    functions: {
      invoke: async (name, {body}) => {
        const fail = (status, code) => ({data: null, error: Object.assign(new Error('Edge Function returned a non-2xx status code'), {context: {json: async () => ({error: code}), status}})});
        if (!isAdmin()) return fail(403, 'forbidden');
        if (body.action === 'create') {
          if (!/^[a-z0-9._-]{2,32}$/.test(body.login)) return fail(400, 'bad_login');
          if (String(body.password).length < 8) return fail(400, 'short_password');
          if (db.profiles.some(p => p.login === body.login)) return fail(409, 'login_taken');
          const u = {id: id(), email: body.login + '@' + DOMAIN, password: body.password, confirmed: true, banned: false};
          users.push(u);
          db.profiles.push({id: u.id, login: body.login, display_name: body.display_name || body.login, role: body.role, active: true, created_at: now()});
          db.account_passwords.push({user_id: u.id, password: body.password, updated_at: now()});
          return {data: {ok: true, id: u.id, password_saved: true}, error: null};
        }
        if (body.action === 'update') {
          const p = db.profiles.find(p => p.id === body.id);
          if (!p) return fail(404, 'not_found');
          if (body.id === uidNow() && ((body.role && body.role !== 'admin') || body.active === false)) return fail(400, 'self_lock');
          if (body.login !== undefined) {
            const login = String(body.login).trim().toLowerCase(), u = users.find(u => u.id === p.id);
            if (!/^[a-z0-9._-]{2,32}$/.test(login)) return fail(400, 'bad_login');
            if (!u.email.endsWith('@' + DOMAIN)) return fail(400, 'email_login');
            if (db.profiles.some(x => x.login === login && x.id !== p.id)) return fail(409, 'login_taken');
            u.email = login + '@' + DOMAIN; p.login = login;
          }
          if (body.password) { if (String(body.password).length < 8) return fail(400, 'short_password'); users.find(u => u.id === p.id).password = body.password;
            db.account_passwords = db.account_passwords.filter(x => x.user_id !== p.id).concat({user_id: p.id, password: body.password, updated_at: now()}); }
          if (body.display_name !== undefined) p.display_name = body.display_name;
          if (body.role) p.role = body.role;
          if (body.active !== undefined) { p.active = !!body.active; users.find(u => u.id === p.id).banned = !p.active; }
          return {data: {ok: true, password_changed: typeof body.password === 'string', password_saved: typeof body.password === 'string' || undefined}, error: null};
        }
        return fail(400, 'bad_action');
      }
    },
    channel: () => ({on() { return this; }, subscribe(cb) { setTimeout(() => cb && cb('SUBSCRIBED'), 5); return this; }}),
    removeChannel: () => {}
  };
  window.supabase = {createClient: () => client};
})();
