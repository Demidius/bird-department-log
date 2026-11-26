// Feeding plans recur daily until the selected end or a manual stop.
KINDS.feed = ['keep', 'bowl', () => L('Dodatkowe karmienie', 'Дополнительное кормление', 'Supplemental feeding')];
KINDS.feed_given = ['keep', 'check', () => L('Podano dodatkowy pokarm', 'Дополнительный корм подан', 'Supplemental feed given')];
KINDS.feed_end = ['keep', 'check', () => L('Zakończono dodatkowe karmienie', 'Дополнительное кормление завершено', 'Supplemental feeding ended')];
WHAT.keep.splice(WHAT.keep.indexOf('diet') + 1, 0, 'feed');

const FEED_MAX = 24;
const isFeedTime = t => typeof t === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t);
const feedTimes = r => Array.isArray(r.f.feedTimes) ? [...new Set(r.f.feedTimes.filter(isFeedTime))].sort() : [];
const feedTimesLabel = () => L('Godziny karmienia', 'Время кормлений', 'Feeding times');
const feedTimeLabel = i => L('Karmienie ', 'Кормление ', 'Feeding ') + (i + 1);
const feedFormKind = f => f && ['feed', 'incub'].includes(f.kind);
const feedDayBoundary = (at, days) => {
  const date = new Date(midnight(at));
  return date.setDate(date.getDate() + days);
};
const feedDayCount = days => Number.isSafeInteger(days) && days > 0;
const feedModes = kind => kind === 'incub' ? ['days', 'open', 'incub'] : ['days', 'open'];
const feedModeLabel = mode => ({
  days: L('Przez określoną liczbę dni', 'В течение нескольких дней', 'For a set number of days'),
  open: L('Do odwołania', 'До отмены', 'Until cancelled'),
  incub: L('Do końca wysiadywania', 'До окончания насиживания', 'Until incubation ends')
})[mode];
const feedDurationLabel = () => L('Okres karmienia', 'Срок кормления', 'Feeding period');
function feedDuration(r) {
  const value = r.f.feedDuration;
  if (feedDayCount(value) || value === 'open') return value;
  return r.k === 'incub' ? 'incub' : 'open';
}
function feedDraft(f) {
  if (!f.feedDraft) {
    const times = feedTimes({f: f.fv});
    const duration = feedDuration({k: f.kind, f: f.fv});
    f.feedDraft = {enabled: f.kind === 'feed' || f.feedOnly || times.length > 0, count: times.length || 1, times,
      mode: feedDayCount(duration) ? 'days' : duration, days: feedDayCount(duration) ? duration : ''};
  }
  return f.feedDraft;
}
function feedingFields(f) {
  const draft = feedDraft(f), n = +draft.count;
  const toggle = f.kind === 'incub' && !f.feedOnly ? `<button type="button" class="tgl2 ${draft.enabled ? 'on' : ''}" role="checkbox" aria-checked="${draft.enabled}" data-feed-toggle="1"><span class="box">${draft.enabled ? ic('check', 14, 3) : ''}</span><span><b>${kName('feed')}</b></span></button>` : '';
  if (!draft.enabled) return toggle;
  const count = fld(L('Ile razy dziennie', 'Сколько раз в день', 'Times per day'),
    inpt('feedDraft.count', draft.count, '', `id="feed-count" type="number" min="1" max="${FEED_MAX}" step="1" data-feed-count="1" aria-label="${L('Ile razy dziennie', 'Сколько раз в день', 'Times per day')}"`));
  const rows = Number.isInteger(n) && n >= 1 && n <= FEED_MAX ? Array.from({length: n}, (_, i) =>
    `<label class="tmi"><em>${i + 1}</em><input type="time" class="inp" data-feed-time-input="${i}" value="${esc(draft.times[i] || '')}" aria-label="${feedTimeLabel(i)}"></label>`).join('') : '';
  const choices = feedModes(f.kind).map(mode => `<button type="button" class="bl-chip phrase" data-feed-mode="${mode}" aria-pressed="${draft.mode === mode}">${feedModeLabel(mode)}</button>`).join('');
  const daysLabel = L('Liczba dni', 'Количество дней', 'Number of days');
  const days = draft.mode === 'days' ? fld(daysLabel,
    inpt('feedDraft.days', draft.days, '', `id="feed-days" type="number" min="1" step="1" data-feed-days="1" aria-label="${daysLabel}"`)) : '';
  return toggle + count + (rows ? fld(feedTimesLabel(), `<div class="feed-times">${rows}</div>`) : '') +
    fld(feedDurationLabel(), `<div class="bl-chips">${choices}</div>`) + days;
}
const _genericFormFeed = genericForm;
genericForm = function () {
  const f = F();
  if (f.feedOnly) {
    const note = f.kind === 'feed' ? `<label class="bl-field"><span>${descLbl()}</span>${area('note', f.note)}</label>` : '';
    return `<div class="formbody">${targetChip(true)}${feedingFields(f)}${note}</div>${saveBtn()}`;
  }
  const html = _genericFormFeed();
  if (!feedFormKind(f)) return html;
  const marker = '<label class="bl-field"><span>' + descLbl();
  return html.replace(marker, () => feedingFields(f) + marker);
};

const _saveFormFeed = saveForm;
saveForm = function () {
  const f = F();
  if (!feedFormKind(f)) return _saveFormFeed();
  const draft = feedDraft(f);
  if (!draft.enabled) {
    delete f.fv.feedTimes;
    delete f.fv.feedDuration;
  } else {
    const n = +draft.count;
    const times = Array.from({length: Number.isInteger(n) && n >= 1 && n <= FEED_MAX ? n : 0}, (_, i) => draft.times[i]);
    if (!times.length || !times.every(isFeedTime) || new Set(times).size !== times.length) {
      f.err = L(`Podaj od 1 do ${FEED_MAX} karmień i inną godzinę dla każdego.`, `Укажи от 1 до ${FEED_MAX} кормлений и отдельное время для каждого.`, `Enter 1 to ${FEED_MAX} feedings and a distinct time for each.`);
      return render();
    }
    const duration = draft.mode === 'days' ? Number(draft.days) : draft.mode;
    if (draft.mode === 'days' && (!feedDayCount(duration) || !Number.isFinite(feedDayBoundary(atMs(), duration)))) {
      f.err = L('Podaj liczbę dni karmienia.', 'Укажи целое количество дней кормления.', 'Enter a whole number of feeding days.');
      return render();
    }
    f.fv.feedTimes = times.sort();
    f.fv.feedDuration = duration;
  }
  return _saveFormFeed();
};

document.addEventListener('input', e => {
  const f = F(), d = e.target.dataset;
  if (!feedFormKind(f)) return;
  if (d.feedCount) {
    const draft = feedDraft(f);
    draft.count = e.target.value;
    draft.dirty = true;
    render();
  } else if (d.feedTimeInput != null) {
    const draft = feedDraft(f);
    draft.times[Number(d.feedTimeInput)] = e.target.value;
    draft.dirty = true;
  } else if (d.feedDays) {
    const draft = feedDraft(f);
    draft.days = e.target.value;
    draft.dirty = true;
  }
});

function feedingPlans(now) {
  const latestIncub = new Map(), lastHatch = new Map(), stopped = new Set(), separate = [];
  for (const r of D.rec) {
    if (r.at > now) continue;
    const subject = key(r.bird);
    if (r.k === 'incub') {
      if (!latestIncub.has(subject) || latestIncub.get(subject).at <= r.at) latestIncub.set(subject, r);
      if (feedDuration(r) !== 'incub') separate.push(r);
    } else if (r.k === 'hatch') {
      const parents = Array.isArray(r.f.par) ? r.f.par : [];
      for (const name of [r.bird, ...parents].map(key)) lastHatch.set(name, Math.max(lastHatch.get(name) ?? -Infinity, r.at));
    } else if (r.k === 'feed') separate.push(r);
    else if (r.k === 'feed_end') stopped.add(r.f.feedPlan);
  }
  const incubation = [...latestIncub.values()].filter(r => feedDuration(r) === 'incub' &&
    (lastHatch.get(key(r.bird)) ?? -Infinity) < r.at);
  return [...separate, ...incubation].filter(r => {
    if (stopped.has(r.id) || !feedTimes(r).length) return false;
    const duration = feedDuration(r);
    if (feedDayCount(duration) && now >= feedDayBoundary(r.at, duration)) return false;
    return r.f.place ? plByName(r.f.place)?.active !== false : !gone(r.bird);
  });
}

const feedPending = new Set();
const feedActionKey = (plan, day, time) => `${plan.id}:${day}:${time}`;
const feedSlotAt = (now, time) => {
  const [h, m] = time.split(':').map(Number), date = new Date(now);
  return date.setHours(h, m, 0, 0);
};
const feedReady = (at, now) => now >= at - 30 * 60000;
let feedTaskMinute;

function feedingCards() {
  const now = Date.now(), day = ymd(now);
  feedTaskMinute = Math.floor(now / 60000);
  const done = new Map();
  for (const r of D.rec.filter(r => r.k === 'feed_given' && r.f.feedDay === day)) {
    if (!done.has(r.f.feedPlan)) done.set(r.f.feedPlan, []);
    done.get(r.f.feedPlan).push(r);
  }
  const feeding = [];
  const writable = canWrite();
  for (const plan of feedingPlans(now)) {
    const a = plan.f.place ? null : anByName(plan.bird);
    const slots = feedTimes(plan).map(time => ({time, at: feedSlotAt(now, time)})).filter(slot => slot.at + 60000 > plan.at);
    const records = (done.get(plan.id) || []).sort((a, b) => a.at - b.at);
    const givenByTime = new Map(records.map(r => [r.f.feedTime, r]));
    const next = slots.find(slot => !givenByTime.has(slot.time));
    const last = records.at(-1);
    const more = `<button type="button" class="bl-btn icon" data-feed-menu="${esc(plan.id)}" aria-label="${L('Więcej', 'Ещё', 'More')}">${ic('more', 18)}</button>`;
    for (const {time, at} of slots) {
      const given = givenByTime.get(time), ready = feedReady(at, now);
      const pending = feedPending.has(feedActionKey(plan, day, time));
      const give = ready ? `<button type="button" class="bl-btn solid grow" data-feed-give="${esc(plan.id)}" data-feed-day="${day}" data-feed-time="${time}" ${pending ? 'disabled' : ''}>${ic('check', 18, 2.4)}${L('Podaj', 'Подать', 'Give')} · ${time}</button>`
        : `<span class="slotw">${ic('clock', 16)}${L('Podać o ', 'Подать в ', 'Give at ')}<b>${time}</b></span>`;
      const action = given ? givenTodayHTML(L('dziś podano', 'сегодня подано', 'given today'), given)
        : give + (time === next?.time ? undoLastGiveButton(last) : '');
      feeding.push({g: 'keep', i: 'bowl', a, who: recWho(plan), what: kName('feed'), rec: plan.id,
        when: time, meta: given && !writable ? L('Podano', 'Подано', 'Given') : plan.note,
        need: !given && ready, actions: `<div class="acts">${action}${more}</div>`});
    }
  }
  return feeding.sort((a, b) => a.when.localeCompare(b.when));
}

function refreshFeedingTasks() {
  if (st.gate !== 'app' || st.scr !== 'now' || overlayOpen()) return;
  if (feedTaskMinute !== Math.floor(Date.now() / 60000) &&
      D.rec.some(r => ['feed', 'incub'].includes(r.k) && feedTimes(r).length)) render();
}
setInterval(() => {
  if (document.visibilityState === 'visible') refreshFeedingTasks();
}, 15000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refreshFeedingTasks();
});

const _recDetailsFeed = recDetails;
function feedingDetails(r) {
  const times = feedTimes(r);
  if (!times.length) return [];
  const duration = feedDuration(r);
  const period = feedDayCount(duration)
    ? `${duration} ${duration === 1 ? L('dzień', 'дн.', 'day') : L('dni', 'дн.', 'days')} · ${L('do ', 'до ', 'through ')}${fDate(feedDayBoundary(r.at, duration - 1))}`
    : feedModeLabel(duration);
  const details = [[feedTimesLabel(), times.join(', ')], [feedDurationLabel(), period]];
  if (D.rec.some(x => x.k === 'feed_end' && x.f.feedPlan === r.id && x.at <= Date.now())) {
    details.push([L('Status', 'Статус', 'Status'), L('Zakończone', 'Завершено', 'Ended')]);
  }
  return details;
}
recDetails = function (r) {
  const details = _recDetailsFeed(r).concat(feedingDetails(r));
  if (r.k === 'feed_given' && isFeedTime(r.f.feedTime)) details.push([L('Planowana godzina', 'Время по расписанию', 'Scheduled time'), r.f.feedTime]);
  return details;
};
const feedCanStop = r => canWrite() && ['feed', 'incub'].includes(r.k) && feedTimes(r).length &&
  feedingPlans(Date.now()).some(plan => plan.id === r.id);
const feedStopLabel = () => L('Zakończ dodatkowe karmienie', 'Завершить дополнительное кормление', 'End supplemental feeding');
const feedStopAttrs = r => `data-feed-stop="${esc(r.id)}" ${feedPending.has(feedActionKey(r, '', 'end')) ? 'disabled' : ''}`;
function feedStopButton(r) {
  return feedCanStop(r) ? `<button type="button" class="bl-btn wide" style="margin-top:10px" ${feedStopAttrs(r)}>${ic('check', 18)}${feedStopLabel()}</button>` : '';
}
function feedingMenu() {
  const r = D.rec.find(x => x.id === st.feedMenu);
  const close = L('Zamknij', 'Закрыть', 'Close');
  return `<div class="scrim" data-close="feedMenu"></div><div class="bl-sheet g-keep menu" role="dialog" aria-label="${kName('feed')}"><div class="grip"></div><div class="head"><h3>${ic('bowl', 20)}${kName('feed')}</h3><button class="bl-x" data-close="feedMenu" aria-label="${close}">${ic('x', 18)}</button></div>
  ${r ? `<p class="msub">${esc(recWho(r))}</p><div class="mlist">
    ${feedCanStop(r) ? `<button ${feedStopAttrs(r)}>${ic('check', 18)}<span><b>${feedStopLabel()}</b><small>${L('zniknie z „Teraz”, zostanie w historii', 'уйдёт из «Сейчас», останется в истории', 'leaves “Now”, stays in the history')}</small></span></button>` : ''}
    ${canEditRec(r) ? `<button data-feed-edit="${esc(r.id)}">${ic('pen', 18)}<span><b>${L('Edytuj karmienie', 'Редактировать кормление', 'Edit feeding')}</b><small>${L('godziny, częstotliwość i okres', 'время, частота и срок', 'times, frequency and duration')}</small></span></button>` : ''}
    <button data-rec="${esc(r.id)}" data-feed-card="1">${ic('list', 18)}<span><b>${L('Karta karmienia', 'Карточка кормления', 'Feeding card')}</b><small>${L('harmonogram i komentarze', 'расписание и комментарии', 'schedule and comments')}</small></span></button>
  </div>` : ''}</div>`;
}

// The same plan/date/time always yields the same record ID, including across devices.
async function feedingRecordId(key) {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('bird-log-feeding:' + key)));
  hash[6] = (hash[6] & 0x0f) | 0x80;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = Array.from(hash.slice(0, 16), x => x.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}
async function saveFeedingAction(planId, day, time, end) {
  const now = Date.now(), plan = feedingPlans(now).find(r => r.id === planId);
  if (!plan || !canWrite()) return;
  const pendingKey = feedActionKey(plan, end ? '' : day, end ? 'end' : time);
  if (feedPending.has(pendingKey)) return;
  if (!end) {
    if (day !== ymd(now) || !feedTimes(plan).includes(time)) return render();
    const at = feedSlotAt(now, time);
    if (at + 60000 <= plan.at || !feedReady(at, now)) return render();
  }
  feedPending.add(pendingKey);
  render();
  try {
    const f = {feedPlan: plan.id};
    if (plan.f.place) f.place = plan.f.place;
    if (!end) Object.assign(f, {feedDay: day, feedTime: time});
    const id = await feedingRecordId(pendingKey);
    if (D.rec.some(r => r.id === id)) return;
    await addRecord(end ? 'feed_end' : 'feed_given', plan.bird, plan.sp, f, '', now, id);
    toast(end ? kName('feed_end') : L('Zapisano', 'Записано', 'Saved'), {recs: [id]});
  } catch (e) {
    if (e.code === '23505') {
      try { await LOAD.records(); } catch (reloadError) { toast(errText(reloadError)); }
    } else toast(errText(e));
  } finally {
    feedPending.delete(pendingKey);
    if (end && st.feedMenu === plan.id && !feedCanStop(plan)) st.feedMenu = null;
    render();
  }
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-feed-toggle],[data-feed-mode],[data-feed-edit],[data-feed-give],[data-feed-stop],[data-feed-menu]');
  if (!b || b.disabled) return;
  const f = F();
  if (b.dataset.feedToggle && f?.kind === 'incub') {
    const draft = feedDraft(f);
    draft.enabled = !draft.enabled;
    draft.dirty = true;
    render();
  } else if (b.dataset.feedMode && feedFormKind(f) && feedModes(f.kind).includes(b.dataset.feedMode)) {
    const draft = feedDraft(f);
    draft.mode = b.dataset.feedMode;
    draft.dirty = true;
    render();
  } else if (b.dataset.feedEdit) {
    const plan = D.rec.find(r => r.id === b.dataset.feedEdit);
    if (!plan || !canEditRec(plan)) return;
    st.feedMenu = null;
    openEdit(plan);
    F().feedOnly = true;
    render();
  } else if (b.dataset.feedMenu && canWrite()) {
    st.feedMenu = b.dataset.feedMenu;
    render();
    $('.bl-sheet [data-close="feedMenu"]')?.focus();
  } else if (b.dataset.feedGive) saveFeedingAction(b.dataset.feedGive, b.dataset.feedDay, b.dataset.feedTime, false);
  else if (b.dataset.feedStop) saveFeedingAction(b.dataset.feedStop, '', '', true);
});
