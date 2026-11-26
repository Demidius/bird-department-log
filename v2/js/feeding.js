// Feeding plans are daily. Incubation plans stop at a recorded hatch or when stopped manually.
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
function feedDraft(f) {
  if (!f.feedDraft) {
    const times = feedTimes({f: f.fv});
    f.feedDraft = {enabled: f.kind === 'feed' || times.length > 0, count: times.length || 1, times};
  }
  return f.feedDraft;
}
function feedingFields(f) {
  const draft = feedDraft(f), n = +draft.count;
  const toggle = f.kind === 'incub' ? `<button type="button" class="tgl2 ${draft.enabled ? 'on' : ''}" role="checkbox" aria-checked="${draft.enabled}" data-feed-toggle="1"><span class="box">${draft.enabled ? ic('check', 14, 3) : ''}</span><span><b>${kName('feed')}</b></span></button>` : '';
  if (!draft.enabled) return toggle;
  const count = fld(L('Ile razy dziennie', 'Сколько раз в день', 'Times per day'),
    inpt('feedDraft.count', draft.count, '', `id="feed-count" type="number" min="1" max="${FEED_MAX}" step="1" data-feed-count="1" aria-label="${L('Ile razy dziennie', 'Сколько раз в день', 'Times per day')}"`));
  const rows = Number.isInteger(n) && n >= 1 && n <= FEED_MAX ? Array.from({length: n}, (_, i) =>
    `<label class="tmi"><em>${i + 1}</em><input type="time" class="inp" data-feed-time-input="${i}" value="${esc(draft.times[i] || '')}" aria-label="${feedTimeLabel(i)}"></label>`).join('') : '';
  return toggle + count + (rows ? fld(feedTimesLabel(), `<div class="feed-times">${rows}</div>`) : '');
}
const _genericFormFeed = genericForm;
genericForm = function () {
  const html = _genericFormFeed(), f = F();
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
  } else {
    const n = +draft.count;
    const times = Array.from({length: Number.isInteger(n) && n >= 1 && n <= FEED_MAX ? n : 0}, (_, i) => draft.times[i]);
    if (!times.length || !times.every(isFeedTime) || new Set(times).size !== times.length) {
      f.err = L(`Podaj od 1 do ${FEED_MAX} karmień i inną godzinę dla każdego.`, `Укажи от 1 до ${FEED_MAX} кормлений и отдельное время для каждого.`, `Enter 1 to ${FEED_MAX} feedings and a distinct time for each.`);
      return render();
    }
    f.fv.feedTimes = times.sort();
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
  }
});

function feedingPlans(now) {
  const latestIncub = new Map(), lastHatch = new Map(), stopped = new Set(), separate = [];
  for (const r of D.rec) {
    if (r.at > now) continue;
    const subject = key(r.bird);
    if (r.k === 'incub') {
      if (!latestIncub.has(subject) || latestIncub.get(subject).at <= r.at) latestIncub.set(subject, r);
    } else if (r.k === 'hatch') {
      const parents = Array.isArray(r.f.par) ? r.f.par : [];
      for (const name of [r.bird, ...parents].map(key)) lastHatch.set(name, Math.max(lastHatch.get(name) ?? -Infinity, r.at));
    } else if (r.k === 'feed') separate.push(r);
    else if (r.k === 'feed_end') stopped.add(r.f.feedPlan);
  }
  const incubation = [...latestIncub.values()].filter(r => (lastHatch.get(key(r.bird)) ?? -Infinity) < r.at);
  return [...separate, ...incubation].filter(r => !stopped.has(r.id) && feedTimes(r).length &&
    (r.f.place ? plByName(r.f.place)?.active !== false : !gone(r.bird)));
}

const feedPending = new Set();
const feedActionKey = (plan, day, time) => `${plan.id}:${day}:${time}`;
const feedSlotAt = (now, time) => {
  const [h, m] = time.split(':').map(Number), date = new Date(now);
  return date.setHours(h, m, 0, 0);
};
const feedReady = (at, now) => now >= at - 30 * 60000;
let feedTaskMinute;

const _taskCardsFeed = taskCards;
taskCards = function () {
  const tasks = _taskCardsFeed(), now = Date.now(), day = ymd(now);
  feedTaskMinute = Math.floor(now / 60000);
  const done = new Set(D.rec.filter(r => r.k === 'feed_given' && r.f.feedDay === day).map(r => `${r.f.feedPlan}:${r.f.feedTime}`));
  const feeding = [];
  for (const plan of feedingPlans(now)) {
    const a = plan.f.place ? null : anByName(plan.bird);
    for (const time of feedTimes(plan)) {
      const at = feedSlotAt(now, time);
      if (at + 60000 <= plan.at) continue;
      const given = done.has(`${plan.id}:${time}`), ready = feedReady(at, now);
      const pending = feedPending.has(feedActionKey(plan, day, time));
      const action = ready ? `<button type="button" class="bl-btn solid grow" data-feed-give="${esc(plan.id)}" data-feed-day="${day}" data-feed-time="${time}" ${pending ? 'disabled' : ''}>${ic('check', 18, 2.4)}${L('Podaj', 'Подать', 'Give')} · ${time}</button>`
        : `<span class="slotw">${ic('clock', 16)}${L('Podać o ', 'Подать в ', 'Give at ')}<b>${time}</b></span>`;
      feeding.push({g: 'keep', i: 'bowl', a, who: recWho(plan), what: kName('feed'), rec: plan.id,
        when: time, meta: given ? L('Podano', 'Подано', 'Given') : plan.note,
        need: !given && ready, actions: given ? '' : `<div class="acts">${action}</div>`});
    }
  }
  return tasks.concat(feeding.sort((a, b) => a.when.localeCompare(b.when)));
};

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
recDetails = function (r) {
  const details = _recDetailsFeed(r), times = feedTimes(r);
  if (times.length) details.push([kName('feed'), times.join(', ')]);
  if (r.k === 'feed_given' && isFeedTime(r.f.feedTime)) details.push([L('Planowana godzina', 'Время по расписанию', 'Scheduled time'), r.f.feedTime]);
  return details;
};
function feedStopButton(r) {
  const now = Date.now();
  if (!canWrite() || !['feed', 'incub'].includes(r.k) || !feedTimes(r).length || !feedingPlans(now).some(plan => plan.id === r.id)) return '';
  const pending = feedPending.has(feedActionKey(r, '', 'end'));
  return `<button type="button" class="bl-btn wide" style="margin-top:10px" data-feed-stop="${esc(r.id)}" ${pending ? 'disabled' : ''}>${ic('check', 18)}${L('Zakończ dodatkowe karmienie', 'Завершить дополнительное кормление', 'End supplemental feeding')}</button>`;
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
    toast(L('Zapisano', 'Записано', 'Saved'), {recs: [id]});
  } catch (e) {
    if (e.code === '23505') {
      try { await LOAD.records(); } catch (reloadError) { toast(errText(reloadError)); }
    } else toast(errText(e));
  } finally {
    feedPending.delete(pendingKey);
    render();
  }
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-feed-toggle],[data-feed-give],[data-feed-stop]');
  if (!b || b.disabled) return;
  const f = F();
  if (b.dataset.feedToggle && f?.kind === 'incub') {
    const draft = feedDraft(f);
    draft.enabled = !draft.enabled;
    draft.dirty = true;
    render();
  } else if (b.dataset.feedGive) saveFeedingAction(b.dataset.feedGive, b.dataset.feedDay, b.dataset.feedTime, false);
  else if (b.dataset.feedStop) saveFeedingAction(b.dataset.feedStop, '', '', true);
});
