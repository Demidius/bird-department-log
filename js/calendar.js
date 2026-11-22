// calendar.js — calendar: list and month grid, expected dates, day sheet
/* ---------- calendar ---------- */
const DAY = 864e5;
const midnight = ms => { const d = new Date(ms); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
const dayDiff = (a, b) => Math.round((midnight(b) - midnight(a)) / DAY);
const CAL_DOT = ['lay', 'incub', 'hatch', 'fledge', 'birth', 'tstart', 'tend', 'expo'];
// points are single events, bars are periods (incubation until hatching, a course of treatment)
// events show their own icon in the calendar; expected dates get the icon of the event they predict, in a dashed frame
const GUESS_IC = {hatch: 'crack', fledge: 'out', fert: 'heart', incub: 'sit'};
const calIc = (x, sz) => ic(x.icon || 'egg', sz, 2.2);
function calItems() {
  const out = [], byBird = new Map();
  for (const r of recs) { const k = key(r.bird); if (!byBird.has(k)) byBird.set(k, []); byBird.get(k).push(r); }
  const nextOf = (r, type, until) => (byBird.get(key(r.bird)) || []).filter(x => x.type === type && x.at > r.at && x.at <= until).sort((a, b) => a.at - b.at)[0];
  // expected dates are calculated from species timings and vanish once the real event is recorded
  const guess = (r, kind, at) => out.push({k: 'g' + kind + ':' + r.id, bar: 0, guess: 1, icon: GUESS_IC[kind], s: at, e: at, r, tone: 'amber', txt: bn(r.bird) + ', ' + t('cl_p_' + kind)});
  const fledgeGuess = (r, from) => { const fd = fledgeDays(r.sp); if (!fd) return; const at = from + fd * DAY; if (!nextOf(r, 'fledge', at + 30 * DAY)) guess(r, 'fledge', at); };
  for (const r of recs) {
    if (r.type === 'hatch') {
      fledgeGuess(r, r.at);
      // counted back from the hatching: when incubation should have started, unless it was recorded
      const id = incubDays(r.sp);
      if (id && !(byBird.get(key(r.bird)) || []).some(x => x.type === 'incub' && x.at < r.at && x.at >= r.at - (id + 21) * DAY)) guess(r, 'incub', r.at - id * DAY);
    }
    if (r.type === 'birth') { const gd = gestDays(r.sp); if (gd) guess(r, 'fert', r.at - gd * DAY); }
    if (CAL_DOT.includes(r.type)) out.push({k: 'd:' + r.id, bar: 0, icon: T[r.type].icon, s: r.at, e: r.at, r, tone: T[r.type].tone, txt: bn(r.bird) + ', ' + t('cl_' + r.type)});
    if (r.type === 'incub') {
      const days = r.f.days || incubDays(r.sp);
      if (!days) continue;
      const exp = r.at + days * DAY, h = nextOf(r, 'hatch', exp + 21 * DAY), inc2 = nextOf(r, 'incub', exp);
      const end = h ? h.at : inc2 ? inc2.at : exp;
      out.push({k: 'i:' + r.id, bar: 1, s: r.at, e: end, r, tone: 'amber', pend: !h && !inc2, txt: bn(r.bird) + ', ' + (h ? t('cl_incub_done') : t('cl_incub_p', fDay.format(exp)))});
      if (!h && !inc2) { guess(r, 'hatch', exp); fledgeGuess(r, exp); }
    }
    if (r.type === 'tstart' && r.f.days) {
      const exp = r.at + (r.f.days - 1) * DAY, en = nextOf(r, 'tend', exp + 60 * DAY);
      out.push({k: 't:' + r.id, bar: 1, s: r.at, e: en ? Math.min(en.at, Math.max(exp, r.at)) : exp, r, tone: 'red', pend: !en, txt: bn(r.bird) + ', ' + t('cl_treat_p') + (r.f.drug ? ' · ' + r.f.drug : '')});
    }
  }
  return out;
}
const mIdx = d => d.getFullYear() * 12 + d.getMonth();
// one month as week rows; in the scrolling view days of other months stay empty and bars are cut at the month edge
function weeksHTML(y, m, dots, bars, clip) {
  const first = new Date(y, m, 1), lead = (first.getDay() + 6) % 7, last = new Date(y, m + 1, 0);
  const weeks = Math.ceil((lead + last.getDate()) / 7), today = midnight(Date.now());
  let h = '';
  for (let w = 0; w < weeks; w++) {
    const ws = new Date(y, m, 1 - lead + w * 7).getTime();
    const lo = clip ? Math.max(0, dayDiff(ws, first.getTime())) : 0, hi = clip ? Math.min(6, dayDiff(ws, last.getTime())) : 6;
    const segs = bars.map(b => ({b, a: dayDiff(ws, b.s), z: dayDiff(ws, b.e)})).filter(g => g.z >= lo && g.a <= hi).sort((p, q) => p.a - q.a || q.z - p.z);
    const lanes = [];
    for (const g of segs) { let l = lanes.findIndex(end => end < Math.max(lo, g.a)); if (l < 0) { l = lanes.length; lanes.push(-1); } lanes[l] = Math.min(hi, g.z); g.l = l; }
    const nl = Math.min(lanes.length, 4);
    let cells = '';
    for (let i = 0; i < 7; i++) {
      const dms = new Date(y, m, 1 - lead + w * 7 + i).getTime(), dd = new Date(dms), out = dd.getMonth() !== m;
      if (clip && out) { cells += `<div class="cd blank" style="grid-column:${i + 1};grid-row:1/span ${nl + 2}"></div>`; continue; }
      const ds = dots.filter(x => midnight(x.s) === dms).sort((p, q) => p.s - q.s);
      const shown = ds.slice(0, ds.length > 4 ? 3 : 4);
      const lab = esc(t('cal_day_open') + ': ' + cap(fDate.format(dms)));
      cells += `<div class="cd${out ? ' out' : ''}" data-day="${dms}" style="grid-column:${i + 1};grid-row:1/span ${nl + 2}"></div><div class="cc${out ? ' out' : ''}${dms === today ? ' now' : ''}" data-day="${dms}" style="grid-column:${i + 1};grid-row:1"><button type="button" class="cn" data-day="${dms}" aria-label="${lab}">${dd.getDate()}</button><span class="cds">${shown.map(x => `<button type="button" class="cdot cic t-${x.tone}${x.guess ? ' guess' : ''}${calSel === x.k ? ' sel' : ''}" data-ci="${esc(x.k)}" aria-label="${esc(x.txt)}">${calIc(x, 14)}</button>`).join('')}${ds.length > shown.length ? `<button type="button" class="cmore" data-day="${dms}" aria-label="${lab}">${esc(t('cal_more', ds.length - shown.length))}</button>` : ''}</span></div>`;
    }
    const barsH = segs.filter(g => g.l < 4).map(g => `<button type="button" class="cbar k-${g.b.tone}${g.b.pend ? ' pend' : ''}${g.a < lo ? ' cl' : ''}${g.z > hi ? ' cr' : ''}${calSel === g.b.k ? ' sel' : ''}" data-ci="${esc(g.b.k)}" aria-label="${esc(g.b.txt)}" style="grid-column:${Math.max(lo, g.a) + 1}/${Math.min(hi, g.z) + 2};grid-row:${g.l + 2}"></button>`).join('');
    h += `<div class="cw" style="grid-template-rows:minmax(30px,auto)${' 13px'.repeat(nl)} 6px">${cells}${barsH}</div>`;
  }
  return h;
}
function renderCal() {
  if (!$('#cal-months')) return;
  const L = LOCALE[lang], grid = calMode === 'grid', items = calItems(), dots = items.filter(i => !i.bar), bars = items.filter(i => i.bar);
  $('#view-cal').classList.toggle('cal-scroll', grid);
  $$('#cal-modes [data-cal-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.calMode === calMode)));
  const fmtM = new Intl.DateTimeFormat(L, {month: 'long', year: 'numeric'});
  if (grid) {
    $('#cal-title').textContent = t('tab_cal');
    const now = mIdx(new Date());
    if (calFrom == null) { calFrom = now; calTo = now + 6; }
    const wd = new Intl.DateTimeFormat(L, {weekday: 'short'}), dow = [0, 1, 2, 3, 4, 5, 6].map(i => `<span>${esc(wd.format(new Date(2024, 0, 1 + i)))}</span>`).join('');
    let h = calFrom > now - 120 ? `<button class="mini ghost cal-earlier" type="button" data-cal-earlier>${ic('chevl', 16, 2.4)}${esc(t('cal_earlier'))}</button>` : '';
    for (let i = calFrom; i <= calTo; i++) {
      const y = Math.floor(i / 12), m = i % 12;
      h += `<section class="cal-month${i === now ? ' cur' : ''}" data-mi="${i}"><h2 class="cal-mt">${esc(cap(fmtM.format(new Date(y, m, 1))))}</h2><div class="cal-box"><div class="cal-dow">${dow}</div>${weeksHTML(y, m, dots, bars, true)}</div></section>`;
    }
    $('#cal-months').innerHTML = h + '<div class="cal-more" data-cal-more="1"></div>';
    // more months appear as the end (or the start) of the list scrolls into view
    if (calObs) calObs.disconnect();
    if ('IntersectionObserver' in window) {
      calObs = new IntersectionObserver(es => {
        if (!calObsOn || tab !== 'cal') return;
        for (const e of es) if (e.isIntersecting) {
          const dir = +e.target.dataset.calMore, now2 = mIdx(new Date());
          if (dir > 0 && calTo < now2 + 60) { calTo += 6; renderCal(); }
          return;
        }
      }, {rootMargin: '600px 0px'});
      $$('#cal-months [data-cal-more]').forEach(x => calObs.observe(x));
    }
  } else {
    $('#cal-title').textContent = cap(fmtM.format(calM));
    $('#cal-months').innerHTML = '';
  }
  const y = calM.getFullYear(), m = calM.getMonth(), ms0 = new Date(y, m, 1).getTime(), ms1 = new Date(y, m + 1, 1).getTime();
  const inMonth = grid ? [] : items.filter(x => x.e >= ms0 && x.s < ms1).sort((p, q) => p.s - q.s || p.bar - q.bar);
  $('#cal-n').textContent = inMonth.length;
  $('#cal-list').innerHTML = inMonth.length ? inMonth.map(x => `<button class="row cal-row" type="button" data-co="${esc(x.k)}"><span class="cl-d">${esc(fDay.format(x.s))}${x.bar ? ' – ' + esc(fDay.format(x.e)) : ''}</span>${x.bar ? `<span class="cleg k-${x.tone}${x.pend ? ' pend' : ''}"></span>` : `<span class="cdot cic t-${x.tone}${x.guess ? ' guess' : ''}">${calIc(x, 16)}</span>`}<span class="rt"><b>${esc(x.txt)}</b></span><span class="chev">${ic('chev', 18)}</span></button>`).join('') : `<p class="empty">${esc(t('cal_none'))}</p>`;
  const tip = $('#cal-tip'), sel = grid && calSel && $(`#cal-months [data-ci="${CSS.escape(calSel)}"]`);
  if (!sel) { tip.hidden = true; return; }
  const it = items.find(x => x.k === calSel);
  const txt = it ? esc(it.txt) : dots.filter(x => 'm:' + midnight(x.s) === calSel).map(x => esc(x.txt)).join('<br>');
  tip.innerHTML = `<b>${txt}</b>${it ? `<small>${esc(t('cal_tap2'))}</small>` : ''}`;
  tip.hidden = false;
  const box = $('.cal-wrap').getBoundingClientRect(), r = sel.getBoundingClientRect();
  tip.style.left = Math.max(4, Math.min(box.width - 244, r.left - box.left + r.width / 2 - 120)) + 'px';
  tip.style.top = (r.bottom - box.top + 6) + 'px';
}
// scrolls the month grids to the current month
function calJump() {
  calObsOn = false;
  const el = $(`#cal-months [data-mi="${mIdx(new Date())}"]`);
  if (el) el.scrollIntoView({block: 'start'});
  setTimeout(() => { calObsOn = true; }, 400);
}
// opens the animal card scrolled to the record (or the record itself when the animal has no card)
function openCalItem(k) {
  const it = calItems().find(x => x.k === k);
  if (!it) return;
  const r = it.r, cb = collByName.get(key(r.bird));
  calSel = '';
  if ($('#sheet-day.open')) closeSheets();
  if (!cb) { openForm(r.type, null, r); return; }
  openCard('bird', cb.id);
  requestAnimationFrame(() => { const el = $(`#bird-body [data-edit="${CSS.escape(r.id)}"]`); if (el) { el.scrollIntoView({block: 'center'}); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 2400); } });
}

// the day sheet: all records of a day, periods going on that day and, for staff, adding a record on that date
let calDay = null;
function renderDay() {
  if (calDay == null) return;
  const d0 = calDay, d1 = new Date(new Date(d0).getFullYear(), new Date(d0).getMonth(), new Date(d0).getDate() + 1).getTime();
  const rs = recs.filter(r => r.at >= d0 && r.at < d1).sort((a, b) => a.at - b.at);
  const ci = calItems(), per = ci.filter(x => x.bar && midnight(x.s) <= d0 && midnight(x.e) >= d0), exp = ci.filter(x => x.guess && midnight(x.s) === d0);
  $('#dy-title').textContent = cap(fLong.format(d0));
  $('#dy-sub').textContent = rs.length ? t('cal_day_recs') + ': ' + rs.length : t('cal_day_none');
  let h = '';
  if (rs.length) h += `<section class="nsec"><h2 class="nh">${esc(t('cal_day_recs'))}<span class="nc">${rs.length}</span></h2>${rs.map(r => card(r)).join('')}</section>`;
  if (per.length) h += `<section class="nsec"><h2 class="nh">${esc(t('cal_day_per'))}<span class="nc">${per.length}</span></h2>${per.map(x => `<button class="row cal-row" type="button" data-co="${esc(x.k)}"><span class="cl-d">${esc(fDay.format(x.s))} – ${esc(fDay.format(x.e))}</span><span class="cleg k-${x.tone}${x.pend ? ' pend' : ''}"></span><span class="rt"><b>${esc(x.txt)}</b></span><span class="chev">${ic('chev', 18)}</span></button>`).join('')}</section>`;
  if (exp.length) h += `<section class="nsec"><h2 class="nh">${esc(t('cal_day_exp'))}<span class="nc">${exp.length}</span></h2>${exp.map(x => `<button class="row cal-row" type="button" data-co="${esc(x.k)}"><span class="cl-d">≈ ${esc(fDay.format(x.s))}</span><span class="cdot cic t-${x.tone} guess">${calIc(x, 16)}</span><span class="rt"><b>${esc(x.txt)}</b></span><span class="chev">${ic('chev', 18)}</span></button>`).join('')}</section>`;
  if (!rs.length && !per.length && !exp.length && !canWrite()) h += `<p class="empty">${esc(t('cal_day_none'))}</p>`;
  if (canWrite()) {
    // the new record gets this date and the current time of day
    const n = new Date(), at = new Date(new Date(d0).getFullYear(), new Date(d0).getMonth(), new Date(d0).getDate(), n.getHours(), n.getMinutes()).getTime();
    h += `<section class="nsec dy-add"><h2 class="nh">${esc(t('cal_day_add'))}</h2><div class="steps">${Object.keys(T).map(k => `<button class="step" type="button" data-new="${k}" data-at="${at}"><span class="tile t-${T[k].tone}">${ic(T[k].icon)}</span><span class="rt"><b>${esc(evLabel(k))}</b></span><span class="chev">${ic('chev', 20)}</span></button>`).join('')}</div></section>`;
  }
  $('#dy-body').innerHTML = h;
  paintPhotos();
}
function openDay(ms) { calDay = midnight(ms); renderDay(); openSheet('day'); }

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
  if (kind === 'sp') { curSp = id; renderSpCard(); } else if (kind === 'encl') { curEncl = id; renderEnclCard(); } else { curBird = id; renderBirdCard(); }
  setTab(kind);
}

function index() {
  spMap = new Map(species.map(s => [s.id, s]));
  collMap = new Map(coll.map(b => [b.id, b]));
  collByName = new Map(coll.map(b => [key(b.name), b]));
  enclMap = new Map(encls.map(x => [x.id, x]));
  enclByName = new Map(encls.map(x => [key(x.name), x]));
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
  st.occ = occupancy();
  $('#n-treat').textContent = st.treat.length;
  $('#n-inc').textContent = st.inc.length;
  $('#n-chick').textContent = st.chicks;
  $('#n-chick-l').textContent = pw(st.chicks, 'chick');
  const fs = $('#fld-sp');
  fillBirds(fs && $('#sheet-form.open') ? fs.value : '');
  renderNow();
  renderLogs();
  renderSpecies();
  renderGaps();
  renderSpCard();
  renderColl();
  renderBirdCard();
  renderEncls();
  renderEnclCard();
  renderCal();
  if ($('#sheet-day.open')) renderDay();
  renderLog();
  renderUsers();
  renderAccount();
  paintPhotos();
}
