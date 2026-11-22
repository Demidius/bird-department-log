// render.js — rendering of screens and cards (now, species, animal, place)
/* ---------- render ---------- */
const card = (r, full) => {
  const tp = T[r.type], d = details(r), s = spById(r.sp), au = r.by ? authorName(r.by) : '';
  return `<button class="rec" type="button" data-edit="${esc(r.id)}"><span class="tile sm t-${tp.tone}">${ic(tp.icon, 18)}</span><span class="rb"><span class="rh"><b>${esc(evLabel(r.type))}</b><time>${full ? when(r.at, r.f && r.f.nt) : recTime(r)}</time></span><span class="bird">${esc(bn(r.bird))}${s ? ` <span class="spn">· ${esc(spName(s))}</span>` : ''}</span>${d ? `<span class="det">${esc(d)}</span>` : ''}${r.note ? `<span class="note">${esc(r.note)}</span>` : ''}${thumbs(photosOf('record', r.id))}${au ? `<span class="by">${esc(t('author') + au)}</span>` : ''}</span></button>`;
};

function renderNow() {
  const sec = (id, tone, icon, title, items, empty) =>
    `<section class="nsec" id="${id}"><h2 class="nh"><span class="tile sm t-${tone}">${ic(icon, 18)}</span>${esc(title)}<span class="nc">${items.length}</span></h2>${items.length ? items.join('') : `<p class="empty">${esc(empty)}</p>`}</section>`;
  const b2 = (type, b, txt, ghost) => `<button class="mini w-only${ghost ? ' ghost' : ''}" type="button" data-new="${type}" data-bird="${esc(b.name)}">${esc(txt)}</button>`;
  const treat = st.treat.map(b => `<div class="ncard"><div class="nl">${nm(b)}${spLink(b)}<small>${esc([t('since', fDay.format(b.treat.since)), b.treat.drug].filter(Boolean).join(' · '))}</small><small>${esc(b.treat.last ? t('last_dose', when(b.treat.last, b.treat.lastNt)) : t('no_dose'))}</small></div><div class="na">${b2('tdose', b, t('b_dose'))}${b2('tend', b, t('b_end'), 1)}</div></div>`);
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
  coll.filter(b => b.status !== 'out' && ok(b.sp)).forEach(b => names.set(key(b.name), [b.name, dn(b) + (b.grp ? ' (' + t('grp_w') + ')' : '')]));
  if (st) for (const b of st.birds.values()) if (ok(b.sp) && !names.has(key(b.name))) names.set(key(b.name), [b.name, b.name]);
  $('#birds').innerHTML = [...names.values()].map(n => `<option value="${esc(n[1])}"></option>`).join('');
  // the record form shows a real list of the animals (a datalist is barely visible on phones) plus "other" for free text
  const ps = $('#fld-birdsel'), bird = $('#fld-bird');
  if (!ps || !bird) return;
  const list = [...names.values()].sort((a, b) => a[1].localeCompare(b[1], LOCALE[lang], {numeric: true})), cur = key(canonBird(bird.value));
  const has = list.some(n => key(n[0]) === cur);
  ps.innerHTML = `<option value="">${esc(t('bird_pick'))}</option>` + list.map(n => `<option value="${esc(n[0])}"${key(n[0]) === cur ? ' selected' : ''}>${esc(n[1])}</option>`).join('') + `<option value="__other"${bird.value && !has ? ' selected' : ''}>${esc(t('bird_other'))}</option>`;
  if (!list.length && !bird.value) ps.value = '__other';
  $('#fld-bird').closest('.fld').hidden = ps.value !== '__other';
}

function renderSpecies() {
  const n = species.length;
  $('#sp-count').textContent = n ? t('sp_count', n) : t('sp_count0');
  const cnt = g => species.filter(x => g === 'all' || spGroup(x) === g).length;
  $('#sg-chips').innerHTML = ['all', 'bird', 'mammal'].filter(g => g === 'all' || cnt(g)).map(g =>
    `<button class="chip" type="button" data-sg="${g}" aria-pressed="${sg === g}">${esc(t('sg_' + g))} <span class="chip-n">${cnt(g)}</span></button>`).join('');
  $('#sg-chips').hidden = cnt('mammal') === 0 || cnt('bird') === 0;
  const list = species.filter(s => (sg === 'all' || spGroup(s) === sg)
    && (!sq || spNames(s).concat(spInfo(s).syn || []).some(v => key(v).includes(sq)))).sort(bySp);
  $('#species-body').innerHTML = list.length ? list.map(s => {
    const nb = coll.filter(b => b.sp === s.id && b.status !== 'out').length, main = spName(s), mp = spMain(s);
    const th = mp && mp.wiki ? `<img src="${esc(mp.wiki.thumb || mp.wiki.src)}" alt="" loading="lazy">` : mp ? thumbImg(mp.dept) : ic(spGroup(s) === 'mammal' ? 'paw' : 'bird', 26);
    return `<button class="row sp-row" type="button" data-sp="${esc(s.id)}"><span class="sp-thumb">${th}</span><span class="rt"><b>${esc(main)}</b>${s.latin && s.latin !== main ? `<small class="lat" lang="la">${esc(s.latin)}</small>` : ''}<small>${esc(nb ? t('in_coll', nb) : t('not_in_coll'))}</small></span>${iucnBadge(spInfo(s).iucn)}<span class="chev">${ic('chev', 20)}</span></button>`;
  }).join('') : `<p class="empty">${esc(n ? t('none_found') : t('sp_none'))}</p>`;
}

function renderSpCard() {
  const box = $('#sp-body');
  if (!curSp) { box.innerHTML = ''; return; }
  const s = spById(curSp);
  if (!s) { box.innerHTML = backBtn('sp') + `<h1>${esc(t('sp_deleted'))}</h1><p class="lead">${esc(t('sp_deleted_p'))}</p>`; return; }
  const inf = spInfo(s), ph = spPhoto(s), grp = spGroup(s);
  const birds = [...st.birds.values()].filter(b => b.sp === s.id).sort(byName);
  const nt = birds.filter(b => b.treat).length, ni = birds.filter(b => b.inc).length, nc = birds.reduce((a, b) => a + b.chicks, 0);
  const rs = recs.filter(r => r.sp === s.id).sort((a, b) => b.at - a.at);
  const cbs = coll.filter(b => b.sp === s.id).sort(byName), cnames = new Set(cbs.map(b => key(b.name)));
  const others = birds.filter(b => !cnames.has(key(b.name)));
  const bItems = cbs.map(cb => `<div class="ncard"><div class="nl"><button class="namelink" type="button" data-bc="${esc(cb.id)}">${esc(dn(cb))}</button><small>${esc([cb.status === 'out' ? t('st_out') : '', stat(st.birds.get(key(cb.name)) || {})].filter(Boolean).join(' · '))}</small></div></div>`)
    .concat(others.map(b => `<div class="ncard"><div class="nl"><b>${esc(b.name)}</b><small>${esc(stat(b) + ' · ' + t('not_in_coll_b'))}</small></div></div>`));
  const main = spName(s), txt = v => typeof v === 'string' ? v.trim() : trText(v);
  const lk = spLocked(s), secCard = (k, icn, tone) => { const p = trPick(inf[k]); return p ? `<article class="si-card"><h3><span class="tile sm t-${tone}">${ic(icn, 18)}</span>${esc(t('si_' + k))}${lockMark(lk.includes(k))}</h3><p>${esc(p.txt)}</p>${trNote(p)}</article>` : ''; };
  const wild = SI_WILD.map(([k, i]) => secCard(k, i, 'green')).join('');
  const zoo = SI_ZOO.map(([k, i]) => secCard(k, i, k === 'health' ? 'red' : 'amber')).join('');
  const facts = [['si_tax', [txt(inf.order), txt(inf.family)].filter(Boolean).join(' · '), 'tag'], ['si_size', txt(inf.size), 'ruler'], ['si_life', txt(inf.life), 'clock'], ['si_incub', toN(inf.incub_days) ? t('si_incub_v', toN(inf.incub_days)) + (txt(inf.incub_range) && txt(inf.incub_range) !== String(toN(inf.incub_days)) ? ' (' + txt(inf.incub_range) + ')' : '') : '', 'egg'], ['si_fledge', toN(inf.fledge_days) ? t('si_incub_v', toN(inf.fledge_days)) : '', 'chick'], ['si_gest', toN(inf.gest_days) ? t('si_incub_v', toN(inf.gest_days)) : '', 'paw']].filter(f => f[1]);
  const names = [['PL', s.pl, 'pl'], ['EN', s.en, 'en'], ['RU', s.name, 'ru']].filter(v => v[1]);
  const mp = spMain(s), dPhotos = photosOf('species', s.id);
  const wikiCap = ph && (ph.credit || ph.page) ? `<figcaption>${esc(t('si_photo_by') + (ph.credit || ''))}${ph.page ? ` · <a href="${esc(ph.page)}" target="_blank" rel="noopener">Wikimedia Commons</a>` : ''}</figcaption>` : '';
  const strip = (mp && mp.wiki ? [] : ph ? [`<button type="button" class="ph-open" data-lbu="${esc(ph.src)}" aria-label="${esc(t('open_photo'))}"><img src="${esc(ph.thumb || ph.src)}" alt=""></button>`] : [])
    .concat(dPhotos.filter(p => !(mp && mp.dept === p)).map(p => `<button type="button" class="ph-open" data-lb="${esc(p.path)}" aria-label="${esc(t('open_photo'))}">${thumbImg(p)}</button>`));
  const stripH = strip.length ? `<div class="sp-strip">${strip.join('')}</div>` : '';
  const photo = mp && mp.wiki
    ? `<figure class="sp-photo"><button type="button" class="ph-open" data-lbu="${esc(ph.src)}" aria-label="${esc(t('open_photo'))}"><img src="${esc(ph.src)}" alt="${esc(main)}"></button>${lockMark(lk.includes('photo'))}${wikiCap}${stripH}</figure>`
    : mp ? `<figure class="sp-photo"><button type="button" class="ph-open" data-lb="${esc(mp.dept.path)}" aria-label="${esc(t('open_photo'))}"><img data-path="${esc(mp.dept.path)}" alt="${esc(main)}"></button>${lockMark(lk.includes('photo'))}${stripH}</figure>`
    : `<figure class="sp-photo sp-photo-empty"><span>${ic(grp === 'mammal' ? 'paw' : 'bird', 44, 1.6)}</span><figcaption>${esc(t('si_no_photo'))}</figcaption></figure>`;
  const jump = [wild && 'si-wild', zoo && 'si-zoo', 'si-dept'].filter(Boolean);
  box.innerHTML = backBtn('sp') + `<div class="sp-head">${photo}<div class="sp-id">
<h1>${esc(main)}${lockMark(lk.includes('*'))}</h1>${s.latin && s.latin !== main ? `<p class="latin" lang="la">${esc(s.latin)}</p>` : ''}${txt(inf.syn) ? `<p class="sp-syn">${esc(t('si_syn'))}: <i lang="la">${esc(txt(inf.syn))}</i></p>` : ''}
${names.length ? `<dl class="sp-names">${names.map(([c, v, l]) => `<div><dt>${c}</dt><dd lang="${l}">${esc(v)}</dd></div>`).join('')}</dl>` : ''}
<div class="sp-badges">${iucnBadge(inf.iucn, true)}<span class="pill p-grey">${esc(t('sg_' + grp))}</span>${txt(inf.cites) ? `<span class="pill p-blue">${esc(t('si_cites') + ' ' + txt(inf.cites))}</span>` : ''}</div>
${facts.length ? `<dl class="sp-facts">${facts.map(([l, v, i]) => `<div><dt>${ic(i, 15)}${esc(t(l))}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
</div></div>
${jump.length > 1 ? `<div class="chips sp-jump">${jump.map(j => `<button class="chip" type="button" data-jump="${j}">${esc(t(j.replace('-', '_')))}</button>`).join('')}</div>` : ''}
${wild ? `<section class="si-group" id="si-wild"><h2 class="si-gh">${esc(t('si_wild'))}</h2><div class="si-grid">${wild}</div></section>` : ''}
${zoo ? `<section class="si-group si-zoo" id="si-zoo"><h2 class="si-gh">${esc(t('si_zoo'))}</h2><div class="si-grid">${zoo}</div></section>` : ''}
<section class="si-group si-dept" id="si-dept"><h2 class="si-gh">${esc(t('si_dept'))}</h2>
<div class="stats"><div class="stat c-red"><b>${nt}</b><span class="l">${esc(t('c_treat'))}</span></div><div class="stat c-amber"><b>${ni}</b><span class="l">${esc(t('c_inc'))}</span></div><div class="stat c-blue"><b>${nc}</b><span class="l">${esc(pw(nc, 'chick'))}</span></div></div>
<div class="top-acts w-only"><button class="btn sec" type="button" data-sp-edit>${esc(t('edit_card'))}</button><button class="btn sec" type="button" data-bird-new>${esc(t('add_bird'))}</button></div>
${s.note ? `<article class="si-card si-notes"><h3><span class="tile sm t-blue">${ic('book', 18)}</span>${esc(t('si_notes'))}${lockMark(lk.includes('note'))}</h3><p>${esc(s.note)}</p></article>` : ''}
<section class="nsec"><h2 class="nh">${esc(t('birds_pairs'))}<span class="nc">${bItems.length}</span></h2>${bItems.length ? bItems.join('') : `<p class="empty">${esc(t('no_birds_sp'))}</p>`}</section>
<section class="nsec"><h2 class="nh">${esc(t('records'))}<span class="nc">${rs.length}</span></h2>${rs.length ? rs.slice(0, 50).map(r => card(r, true)).join('') : `<p class="empty">${esc(t('no_records'))}</p>`}</section>
</section>`;
}

function renderColl() {
  const act = coll.filter(b => b.status !== 'out').length;
  $('#coll-count').textContent = coll.length ? t('coll_count', act) : t('coll_count0');
  const sn = b => spName(spById(b.sp));
  const list = coll.filter(b => (cf === 'all' || (cf === 'out') === (b.status === 'out'))
      && (!cq || allNames(b).concat(b.ring, b.chip).concat(spById(b.sp) ? spNames(spById(b.sp)) : []).some(x => key(x).includes(cq))))
    .sort((a, b) => (sn(a) || '￿').localeCompare(sn(b) || '￿', LOCALE[lang]) || byName(a, b));
  if (!list.length) { $('#coll-body').innerHTML = `<p class="empty" style="margin-top:16px">${esc(coll.length ? t('none_found') : t('coll_empty'))}</p>`; return; }
  let h = '', last = null;
  for (const b of list) {
    const g = sn(b) || t('no_sp');
    if (g !== last) { h += `<h2 class="day">${esc(g)}</h2>`; last = g; }
    const sb2 = st.birds.get(key(b.name)) || {};
    const encl = placeOf(b).name;
    const sub = [b.grp ? cap(t('grp_w')) + ': ' + grpText(b.grp) : sexText(b.sex), b.ring ? t('ring_n', b.ring) : '', enDn(encl)].filter(Boolean).join(' · ');
    const flags = [b.status === 'out' ? t('st_out') : '', sb2.treat ? t('c_treat') : '', sb2.inc ? t('st_inc') : '', sb2.chicks ? sb2.chicks + ' ' + pw(sb2.chicks, 'chick') : ''].filter(Boolean).join(' · ');
    const ph = photosOf('bird', b.id)[0];
    const tile = ph ? `<span class="tile t-green" style="overflow:hidden">${thumbImg(ph).replace('<img', '<img style="width:100%;height:100%;object-fit:cover"')}</span>` : `<span class="tile t-green">${ic(b.grp ? 'users' : 'bird')}</span>`;
    h += `<button class="row" type="button" data-bc="${esc(b.id)}" style="margin-bottom:8px">${tile}<span class="rt"><b>${esc(dn(b))}</b>${sub ? `<small>${esc(sub)}</small>` : ''}${flags ? `<small>${esc(flags)}</small>` : ''}</span><span class="chev">${ic('chev', 20)}</span></button>`;
  }
  $('#coll-body').innerHTML = h;
}

const links = list => list.filter(Boolean).map(b => `<button class="linkish" type="button" data-bc="${esc(b.id)}">${esc(dn(b) + (b.grp ? ' (' + t('grp_w') + ')' : ''))}</button>`).join(', ');
function renderBirdCard() {
  const box = $('#bird-body');
  if (!curBird) { box.innerHTML = ''; return; }
  const cb = collMap.get(curBird);
  if (!cb) { box.innerHTML = backBtn('bird') + `<h1>${esc(t('bird_deleted'))}</h1><p class="lead">${esc(t('bird_deleted_p'))}</p>`; return; }
  const sb2 = st.birds.get(key(cb.name)) || {}, s = spById(cb.sp);
  const rs = recs.filter(r => key(r.bird) === key(cb.name)).sort((a, b) => b.at - a.at);
  const pl = placeOf(cb), encl = pl.name;
  const pill = (c, txt) => `<span class="pill ${c}">${esc(txt)}</span>`;
  const pills = [cb.status === 'out' ? pill('p-grey', t('st_out')) : '', sb2.treat ? pill('p-red', t('c_treat')) : '',
    sb2.inc ? pill('p-amber', t('st_inc')) : '', sb2.chicks ? pill('p-blue', t('in_nest', sb2.chicks)) : ''].join('');
  const fact = (l, v, raw) => v ? `<div><dt>${esc(t(l))}</dt><dd>${raw ? v : esc(v)}</dd></div>` : '';
  const n = esc(cb.name), main = spName(s);
  const enclDd = encl ? enclPath(encl) + (pl.at ? ` <small class="muted">· ${esc(t('en_since', fDate.format(pl.at)))}</small>` : '') : '';
  const other = otherNames(cb);
  box.innerHTML = backBtn('bird') + `<h1>${esc(dn(cb))}</h1>${other ? `<p class="sp-meta">${esc(other)}</p>` : ''}${s ? `<button class="linkish" type="button" data-sp="${esc(s.id)}">${esc(main)}${s.latin && s.latin !== main ? ' · ' + esc(s.latin) : ''}</button>` : `<p class="sp-meta">${esc(t('no_sp'))}</p>`}
${pills ? `<div class="pills">${pills}</div>` : ''}
${gallery(photosOf('bird', cb.id))}
<dl class="facts">${fact('fa_grp', cb.grp ? grpText(cb.grp) : '')}${fact('fa_sex', cap(sexText(cb.sex)))}${fact('fa_ring', cb.ring)}${fact('fa_chip', cb.chip)}${fact('fa_encl', enclDd, 1)}${fact('fa_born', cb.born ? fDate.format(ymd(cb.born)) + age(cb.born) : '')}${fact('fa_arrived', cb.arrived ? fDate.format(ymd(cb.arrived)) : '')}${fact('fa_origin', cb.origin)}${fact('fa_parents', links(cb.parents.map(id => collMap.get(id))), 1)}${fact('fa_kids', links(coll.filter(x => x.parents.includes(cb.id))), 1)}</dl>
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

function renderEncls() {
  const act = encls.filter(x => x.active);
  $('#encl-count').textContent = encls.length ? t('encl_count', act.length) : t('encl_count0');
  const cnt = k => k === 'off' ? encls.filter(x => !x.active).length : act.filter(x => k === 'all' || x.kind === k).length;
  if (ek !== 'all' && !cnt(ek)) ek = 'all';
  const chips = ['all'].concat(EK.filter(k => cnt(k)), cnt('off') ? ['off'] : []);
  $('#ek-chips').innerHTML = chips.map(k => `<button class="chip" type="button" data-ek="${k}" aria-pressed="${ek === k}">${esc(t('ek_' + k))} <span class="chip-n">${cnt(k)}</span></button>`).join('');
  $('#ek-chips').hidden = chips.length < 3;
  const list = encls.filter(x => (ek === 'off' ? !x.active : x.active && (ek === 'all' || x.kind === ek))
      && (!eq || allNames(x).concat(x.area, t('ek_' + x.kind)).concat(...pathOf(x).map(allNames)).some(v => key(v).includes(eq))))
    .sort(byPlace);
  if (!list.length) { $('#encls-body').innerHTML = `<p class="empty" style="margin-top:16px">${esc(encls.length ? t('none_found') : t('encl_empty'))}</p>`; return; }
  const tree = ek === 'all' && !eq, rows = tree ? treeOrder(list) : list.map(x => [x, 0]);
  let h = '';
  for (const [x, d] of rows) {
    const n = occOf(x).length, over = x.cap && n > x.cap, desc = descOf(x), all = n + desc.reduce((s, c) => s + occOf(c).length, 0);
    const where = tree ? '' : pathOf(x).map(dn).join(' › ');
    const sub = [t('ek_' + x.kind), where || x.area].filter(Boolean).join(' · ');
    const occ = desc.length ? [t('en_kids', kidsOf(x.id).length), t('en_total') + ': ' + t('en_n', all)].join(' · ')
      : n ? t('en_n', n) + (x.cap ? ' · ' + t('en_occ', n, x.cap) : '') : t('en_empty') + (x.cap ? ' · ' + t('en_occ', 0, x.cap) : '');
    h += `<button class="row${d ? ' en-sub' : ''}" type="button" data-ec="${esc(x.id)}" style="margin-bottom:8px${d ? `;margin-left:${Math.min(d, 4) * 20}px;width:calc(100% - ${Math.min(d, 4) * 20}px)` : ''}">${enclTile(x, d > 0)}<span class="rt"><b>${esc(dn(x))}</b>${sub ? `<small>${esc(sub)}</small>` : ''}<small${over ? ' class="warn-t"' : ''}>${esc(occ + (over ? ' · ' + t('en_full') : ''))}</small></span><span class="chev">${ic('chev', 20)}</span></button>`;
  }
  $('#encls-body').innerHTML = h;
}

function renderEnclCard() {
  const box = $('#encl-body');
  if (!curEncl) { box.innerHTML = ''; return; }
  const x = enclMap.get(curEncl);
  if (!x) { box.innerHTML = backBtn('encl') + `<h1>${esc(t('en_deleted'))}</h1><p class="lead">${esc(t('en_deleted_p'))}</p>`; return; }
  const desc = descOf(x), kids = kidsOf(x.id).sort(byPlace);
  const occ = occOf(x).concat(...desc.map(c => occOf(c).map(o => Object.assign({}, o, {at: c})))).sort((a, b) => (spName(spById(a.sp)) || '￿').localeCompare(spName(spById(b.sp)) || '￿', LOCALE[lang]) || a.name.localeCompare(b.name, LOCALE[lang]));
  const n = occ.length, over = x.cap && occOf(x).length > x.cap, k = key(x.name);
  const moves = recs.filter(r => r.type === 'expo' && (key(r.f.to) === k || key(r.f.from) === k)).sort((a, b) => b.at - a.at);
  const fact = (l, v) => v ? `<div><dt>${esc(t(l))}</dt><dd>${esc(v)}</dd></div>` : '';
  const pills = `<span class="pill p-grey">${esc(t('ek_' + x.kind))}</span>${x.active ? '' : `<span class="pill p-grey">${esc(t('en_off_pill'))}</span>`}${over ? `<span class="pill p-red">${esc(t('en_full'))}</span>` : ''}`;
  const items = occ.map(o => {
    const s = spById(o.sp), cb = o.cb;
    const nmh = cb ? `<button class="namelink" type="button" data-bc="${esc(cb.id)}">${esc(dn(cb))}</button>` : `<b>${esc(o.name)}</b>`;
    const sub = [cb ? sexText(cb.sex) : t('not_in_coll_b'), cb && cb.ring ? t('ring_n', cb.ring) : '', o.since ? t('en_since', fDay.format(o.since)) : ''].filter(Boolean).join(' · ');
    const here = o.at || x;
    return `<div class="ncard"><div class="nl">${nmh}${s ? `<button class="linkish" type="button" data-sp="${esc(s.id)}">${esc(spName(s))}</button>` : ''}${o.at ? `<small>${esc(t('en_in', ''))}<button class="linkish" type="button" data-ec="${esc(o.at.id)}">${esc(dn(o.at))}</button></small>` : ''}${sub ? `<small>${esc(sub)}</small>` : ''}</div><div class="na"><button class="mini ghost w-only" type="button" data-new="expo" data-bird="${esc(o.name)}" data-from="${esc(here.name)}">${esc(t('en_move'))}</button></div></div>`;
  });
  const crumbs = pathOf(x).map(p => `<button class="linkish" type="button" data-ec="${esc(p.id)}">${esc(dn(p))}</button>`).join(' › ');
  const kidRows = kids.map(c => { const m = occOf(c).length + descOf(c).reduce((a, z) => a + occOf(z).length, 0); return `<button class="row" type="button" data-ec="${esc(c.id)}" style="margin-bottom:8px">${enclTile(c, 1)}<span class="rt"><b>${esc(dn(c))}</b><small>${esc([t('ek_' + c.kind), kidsOf(c.id).length ? t('en_kids', kidsOf(c.id).length) : '', m ? t('en_n', m) : t('en_empty')].filter(Boolean).join(' · '))}</small></span><span class="chev">${ic('chev', 20)}</span></button>`; }).join('');
  box.innerHTML = backBtn('encl') + `${crumbs ? `<p class="en-crumbs">${crumbs} ›</p>` : ''}<div class="en-head">${enclTile(x)}<div><h1>${esc(dn(x))}</h1>${otherNames(x) ? `<p class="sp-meta">${esc(otherNames(x))}</p>` : ''}<div class="pills">${pills}</div></div></div>
${gallery(photosOf('encl', x.id))}
<dl class="facts">${fact('ef_area', x.area)}${fact('ef_size', x.size)}${fact('en_fill', x.cap ? t('en_occ', occOf(x).length, x.cap) : '')}${desc.length ? fact('en_total', t('en_n', n)) : ''}</dl>
${x.note ? `<p class="sp-note">${esc(x.note)}</p>` : ''}
<div class="top-acts w-only"><button class="btn sec" type="button" data-encl-edit>${esc(t('edit_card'))}</button>${x.active ? `<button class="btn sec" type="button" data-new="expo" data-to="${esc(x.name)}">${esc(t('en_move_here'))}</button>` : ''}</div>
${kids.length || ['building', 'room', 'aviary'].includes(x.kind) ? `<section class="nsec"><h2 class="nh">${esc(t('en_inside'))}<span class="nc">${kids.length}</span></h2>${kidRows || `<p class="empty">${esc(t('en_no_kids'))}</p>`}<button class="mini ghost w-only" type="button" data-encl-new data-parent="${esc(x.id)}" style="margin-top:4px">${esc('+ ' + t('en_add_inside'))}</button></section>` : ''}
<section class="nsec"><h2 class="nh">${esc(t('en_now'))}<span class="nc">${n}</span></h2>${n ? items.join('') : `<p class="empty">${esc(t('en_none'))}</p>`}</section>
<section class="nsec"><h2 class="nh">${esc(t('en_hist'))}<span class="nc">${moves.length}</span></h2>${moves.length ? moves.slice(0, 100).map(r => card(r, true)).join('') : `<p class="empty">${esc(t('en_nohist'))}</p>`}</section>`;
}
