// temp.js — v2: temperature in enclosures — "Указать температуру" record for a place and a temperature chart on the place card
BirdLog.icons.therm = '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 11v6"/>';
KINDS.temp = ['keep', 'therm', () => L('Temperatura', 'Температура', 'Temperature')];
const tFmt = v => (Math.round(v * 10) / 10).toLocaleString(LOC(), {maximumFractionDigits: 1}) + ' °C';
const tempRecs = p => D.rec.filter(r => r.k === 'temp' && key(r.f.place) === key(p.name) && typeof r.f.t === 'number').sort((a, b) => a.at - b.at);

/* ---------- "What to record": temperature only for a place ---------- */
stepWhat = function () {
  const f = F(), groups = f.target === 'place' ? ['health', 'obs', 'keep'] : ['health', 'obs', 'breed', 'keep'], m = tgtMammal(), b = tgtBird();
  const ok = k => !(f.target === 'place' && ['leave', 'mate', 'score'].includes(k)) && !(m && ['lay', 'incub', 'hatch', 'fledge'].includes(k)) && !(b && k === 'birth') && !(f.target === 'place' && k === 'tdose');
  const label = k => k === 'temp' ? L('Podaj temperaturę', 'Указать температуру', 'Record temperature') : kName(k);
  return targetChip() + groups.map(g => { const G = GROUPS.find(x => x.id === g), list = WHAT[g].filter(ok).concat(g === 'keep' && f.target === 'place' ? ['temp'] : []);
    return `<div class="g-${g}"><div class="bl-grouphead">${ic(G.ic, 18)}${G.n()}</div><div class="tgrid">${list.map(k => `<button class="tbtn" data-kind="${k}"><span class="bl-badge sm">${ic(kIcon(k), 18)}</span><span>${label(k)}</span></button>`).join('')}</div></div>`; }).join('');
};

/* ---------- the form ---------- */
const _genericFormT = genericForm;
genericForm = function () {
  const f = F(); if (f.kind !== 'temp') return _genericFormT();
  const p = plById(f.plc), last = p ? tempRecs(p).filter(r => !f.edit || r.id !== f.edit.id).pop() : null;
  const v = f.fv.t ?? '';
  return `<div class="formbody">${targetChip(!!f.edit)}
  ${fld(L('Temperatura', 'Температура', 'Temperature'), `<div class="numrow"><button class="bl-btn icon tsign" data-tsign="1" aria-label="±">±</button><input class="inp tval" data-in="fv.t" value="${esc(v)}" placeholder="21,5" inputmode="decimal" autocomplete="off"><em>°C</em></div>`)}
  ${last ? `<p class="tip">${L('Ostatnio', 'Последний раз', 'Last time')}: <b>${tFmt(last.f.t)}</b> · ${relDay(last.at)} ${fTime(last.at)}</p>` : ''}
  <label class="bl-field"><span>${L('Opis', 'Описание', 'Description')}</span>${area('note', f.note, L('np. termometr przy grzędach', 'напр. термометр у присад', 'e.g. thermometer by the perches'))}</label>${whenPhoto(true)}</div>${saveBtn()}`;
};
document.addEventListener('click', e => {
  if (!e.target.closest('[data-tsign]') || !st.add) return;
  const fv = st.add.fv, s = String(fv.t ?? '').trim();
  fv.t = s.startsWith('-') ? s.slice(1) : '-' + s; render();
  const i = document.querySelector('.tval'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
});
const _saveFormT = saveForm;
saveForm = async function () {
  const f = F();
  if (f && f.kind === 'temp') {
    const v = num(f.fv.t);
    if (v == null || v < -60 || v > 70) { f.err = L('Wpisz temperaturę (−60…70 °C)', 'Введи температуру (−60…70 °C)', 'Enter the temperature (−60…70 °C)'); return render(); }
    f.fv.t = v;
  }
  return _saveFormT();
};
const _recTitleT = recTitle;
recTitle = r => r.k === 'temp' && typeof r.f.t === 'number' ? `${kName('temp')}: ${tFmt(r.f.t)}` : _recTitleT(r);

/* ---------- chart on the place card ---------- */
const TPER = [[7, () => L('7 dni', '7 дней', '7 days')], [30, () => L('30 dni', '30 дней', '30 days')], [90, () => L('3 mies.', '3 мес.', '3 mo.')], [0, () => L('Wszystko', 'Всё', 'All')]];
const TW = 340, TH = 150, TP = {l: 34, r: 10, t: 10, b: 22};
function tempPts(p) {
  const per = st.tper ?? 30, from = per ? today0() - (per - 1) * DAY : 0;
  return tempRecs(p).filter(r => r.at >= from);
}
function tempGeom(pts) {
  const per = st.tper ?? 30, x0 = per ? today0() - (per - 1) * DAY : pts[0].at, x1 = Math.max(Date.now(), pts[pts.length - 1].at), xs = Math.max(x1 - x0, DAY);
  let lo = Math.min(...pts.map(r => r.f.t)), hi = Math.max(...pts.map(r => r.f.t));
  lo = Math.floor(lo - 1); hi = Math.ceil(hi + 1);
  const X = t => TP.l + (t - x0) / xs * (TW - TP.l - TP.r), Y = v => TP.t + (hi - v) / (hi - lo) * (TH - TP.t - TP.b);
  return {x0, x1, lo, hi, X, Y};
}
function tempChart(p) {
  const all = tempRecs(p), pts = tempPts(p), per = st.tper ?? 30;
  const segs = `<div class="bl-seg four tseg">${TPER.map(([d, l]) => `<button data-tper="${d}" aria-pressed="${per === d}">${l()}</button>`).join('')}</div>`;
  const add = canWrite() ? `<button class="secadd" data-tadd="${p.id}">${ic('plus', 15, 2.6)}${L('Podaj', 'Указать', 'Record')}</button>` : '';
  const head = `<div class="sec"><span>${L('Temperatura', 'Температура', 'Temperature')}</span>${add}</div>`;
  if (!all.length) return `${head}<p class="empty">${L('Brak pomiarów. Naciśnij „Podaj”, aby zapisać temperaturę.', 'Замеров пока нет. Нажми «Указать», чтобы записать температуру.', 'No readings yet. Tap “Record” to add the temperature.')}</p>`;
  const last = all[all.length - 1];
  const tiles = pts.length ? [[L('Ostatnio', 'Последняя', 'Last'), tFmt(last.f.t), relDay(last.at) + ' ' + fTime(last.at)], [L('Min', 'Мин', 'Min'), tFmt(Math.min(...pts.map(r => r.f.t))), ''], [L('Maks', 'Макс', 'Max'), tFmt(Math.max(...pts.map(r => r.f.t))), '']] : [[L('Ostatnio', 'Последняя', 'Last'), tFmt(last.f.t), relDay(last.at) + ' ' + fTime(last.at)]];
  let svg = `<p class="empty">${L('W tym okresie brak pomiarów', 'За этот период замеров нет', 'No readings in this period')}</p>`;
  if (pts.length) {
    const g = tempGeom(pts), ticks = [g.lo, (g.lo + g.hi) / 2, g.hi];
    const xl = [g.x0, (g.x0 + g.x1) / 2, g.x1].map((t, i) => `<text x="${g.X(t)}" y="${TH - 6}" text-anchor="${['start', 'middle', 'end'][i]}">${fDate(t)}</text>`).join('');
    const path = pts.map((r, i) => `${i ? 'L' : 'M'}${g.X(r.at).toFixed(1)},${g.Y(r.f.t).toFixed(1)}`).join('');
    svg = `<svg viewBox="0 0 ${TW} ${TH}" role="img" aria-label="${L('Wykres temperatury', 'График температуры', 'Temperature chart')}" data-tplc="${p.id}">
    ${ticks.map(v => `<line class="tg" x1="${TP.l}" x2="${TW - TP.r}" y1="${g.Y(v)}" y2="${g.Y(v)}"/><text x="${TP.l - 6}" y="${g.Y(v) + 4}" text-anchor="end">${(Math.round(v * 10) / 10).toLocaleString(LOC())}°</text>`).join('')}${xl}
    <line class="tx" x1="0" x2="0" y1="${TP.t}" y2="${TH - TP.b}" visibility="hidden"/>
    <path class="tl" d="${path}"/>${pts.map(r => `<circle class="tm" cx="${g.X(r.at).toFixed(1)}" cy="${g.Y(r.f.t).toFixed(1)}" r="4"/>`).join('')}
    <rect class="thit" x="${TP.l}" y="0" width="${TW - TP.l - TP.r}" height="${TH - TP.b}"/></svg><div class="ttip" hidden></div>`;
  }
  const rows = all.slice(-5).reverse().map(r => `<button class="trow2" data-rec="${r.id}"><b>${tFmt(r.f.t)}</b><span>${relDay(r.at)} ${fTime(r.at)}${r.note ? ' · ' + esc(r.note.slice(0, 60)) : ''}</span></button>`).join('');
  return `${head}<div class="tbox g-keep"><div class="ttiles">${tiles.map(([a, b, c]) => `<div><span>${a}</span><b>${b}</b>${c ? `<small>${c}</small>` : ''}</div>`).join('')}</div>${segs}<div class="tchart">${svg}</div><div class="tlist">${rows}</div></div>`;
}
const _placeCardT = placeCard;
placeCard = function () {
  const h = _placeCardT(), p = plById(st.plc); if (!p || p.kind === 'building') return h;
  const i = h.indexOf('data-add="pl"'), j = i >= 0 ? h.indexOf('</button>', i) + 9 : h.indexOf('<div class="scroll">') + 20;
  return h.slice(0, j) + tempChart(p) + h.slice(j);
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tper],[data-tadd]'); if (!b) return;
  if (b.dataset.tper != null) { st.tper = +b.dataset.tper; return render(); }
  newAdd({step: 'form', kind: 'temp', target: 'place', plc: b.dataset.tadd, from: 'direct'}); render();
});
// crosshair + tooltip: the pointer finds the nearest reading by time
function tempHover(e) {
  const svg = e.target.closest && e.target.closest('svg[data-tplc]'); if (!svg) return;
  const p = plById(svg.dataset.tplc), pts = p ? tempPts(p) : []; if (!pts.length) return;
  const g = tempGeom(pts), box = svg.getBoundingClientRect(), x = (e.clientX - box.left) / box.width * TW;
  const r = pts.reduce((a, b) => Math.abs(g.X(b.at) - x) < Math.abs(g.X(a.at) - x) ? b : a);
  const cx = g.X(r.at), ln = svg.querySelector('.tx'), tip = svg.parentNode.querySelector('.ttip');
  ln.setAttribute('x1', cx); ln.setAttribute('x2', cx); ln.setAttribute('visibility', 'visible');
  svg.querySelectorAll('.tm').forEach(c => c.classList.toggle('on', Math.abs(+c.getAttribute('cx') - cx) < 0.2));
  tip.hidden = false; tip.textContent = '';
  const v = document.createElement('b'); v.textContent = tFmt(r.f.t); const d = document.createElement('span'); d.textContent = `${relDay(r.at)} ${fTime(r.at)}`;
  tip.append(v, d);
  const px = cx / TW * box.width; tip.style.left = Math.min(Math.max(px, 50), box.width - 50) + 'px';
}
document.addEventListener('pointermove', tempHover);
document.addEventListener('pointerdown', tempHover);
document.addEventListener('pointerleave', e => { const s = e.target.closest && e.target.closest('svg[data-tplc]'); if (!s) return; s.querySelector('.tx').setAttribute('visibility', 'hidden'); s.parentNode.querySelector('.ttip').hidden = true; }, true);

document.head.insertAdjacentHTML('beforeend', `<style>
.tbox{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:18px;background:var(--card);box-shadow:var(--shadow-card)}
.ttiles{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:6px}
.ttiles div{padding:8px 10px;border-radius:12px;background:var(--soft)}
.ttiles span{display:block;font:600 11px/1.2 var(--font-text);color:var(--muted)}
.ttiles b{display:block;margin-top:2px;font:800 18px/1.1 var(--font-display);color:var(--ink);font-variant-numeric:tabular-nums}
.ttiles small{display:block;margin-top:2px;font:500 11px/1.2 var(--font-text);color:var(--muted)}
.bl-seg.four{grid-template-columns:repeat(4,1fr)}
.tchart{position:relative}
.tchart svg{display:block;width:100%;height:auto;touch-action:pan-y;overflow:visible}
.tchart text{font:500 10px var(--font-text);fill:var(--muted)}
.tchart .tg{stroke:var(--line);stroke-width:1}
.tchart .tx{stroke:var(--muted);stroke-width:1;stroke-dasharray:3 3}
.tchart .tl{fill:none;stroke:var(--keep);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.tchart .tm{fill:var(--keep);stroke:var(--card);stroke-width:2}
.tchart .tm.on{r:6}
.tchart .thit{fill:transparent}
.ttip{position:absolute;top:2px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 10px;border-radius:10px;background:var(--fab);color:var(--on-fab);pointer-events:none;white-space:nowrap;box-shadow:var(--shadow-card)}
.ttip b{font:800 14px/1.1 var(--font-text)}.ttip span{font:500 11px/1.2 var(--font-text);opacity:.8}
.tlist{display:flex;flex-direction:column}
.trow2{display:flex;align-items:baseline;gap:10px;min-height:40px;padding:6px 4px;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);text-align:left;cursor:pointer}
.trow2 b{min-width:64px;font:700 14px/1.2 var(--font-text);font-variant-numeric:tabular-nums}.trow2 span{font:500 12.5px/1.3 var(--font-text);color:var(--muted)}
.tsign{flex:none;font:800 18px/1 var(--font-text)}
</style>`);
