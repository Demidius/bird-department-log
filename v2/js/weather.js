// weather.js — v2: "Pogoda / Погода" in free notes. Stored as a department record: type dept, f.kind = 5 (index in OPT.dept),
// f.t = °C (number), f.sky = index, f.prec = [indexes], f.wind = index, f.phen = [indexes].
const WX = 5;
OPT.dept = (base => () => base().concat(L('Pogoda', 'Погода', 'Weather')))(OPT.dept);
OPT.wsky = () => LA(['Słonecznie', 'Częściowe zachmurzenie', 'Pochmurno', 'Mgła'], ['Ясно', 'Переменная облачность', 'Пасмурно', 'Туман'], ['Sunny', 'Partly cloudy', 'Overcast', 'Fog']);
OPT.wprec = () => LA(['Mżawka', 'Deszcz', 'Ulewa', 'Śnieg z deszczem', 'Śnieg', 'Grad'], ['Морось', 'Дождь', 'Ливень', 'Мокрый снег', 'Снег', 'Град'], ['Drizzle', 'Rain', 'Downpour', 'Sleet', 'Snow', 'Hail']);
OPT.wwind = () => LA(['Bezwietrznie', 'Słaby wiatr', 'Silny wiatr', 'Wichura'], ['Штиль', 'Слабый ветер', 'Сильный ветер', 'Шквальный ветер'], ['Calm', 'Light wind', 'Strong wind', 'Gale']);
OPT.wphen = () => LA(['Burza', 'Przymrozek', 'Gołoledź', 'Upał'], ['Гроза', 'Заморозок', 'Гололёд', 'Жара'], ['Thunderstorm', 'Frost', 'Black ice', 'Heat']);
const WX_KEYS = ['t', 'sky', 'prec', 'wind', 'phen'];
const isWx = f => f && f.kind === WX;

/* ---------- free note form: "Weather" next to the other kinds (before "Other"); weather fields replace the weekly reminder ---------- */
freeForm = function () {
  const f = F(), v = f.fv.kind, names = OPT.dept(), order = [...names.keys()].filter(i => i !== 4 && i !== WX).concat([WX, 4]);
  const kinds = fld(L('Czego dotyczy', 'О чём', 'About'), `<div class="bl-chips">${order.map(i => `<button class="bl-chip phrase" data-fv="kind" data-i="${i}" data-m="" aria-pressed="${v === i}">${esc(names[i])}</button>`).join('')}</div>`);
  const wx = v === WX;
  const fields = wx ? `${fld(L('Temperatura', 'Температура', 'Temperature'), `<div class="numrow"><button class="bl-btn icon tsign" data-tsign="1" aria-label="±">±</button><input class="inp tval" data-in="fv.t" value="${esc(f.fv.t ?? '')}" placeholder="12" inputmode="decimal" autocomplete="off"><em>°C</em></div>`)}
    ${fieldHTML(['chips', 'sky', L('Niebo', 'Небо', 'Sky'), 'wsky'])}${fieldHTML(['chips', 'prec', L('Opady', 'Осадки', 'Precipitation'), 'wprec', 1])}
    ${fieldHTML(['chips', 'wind', L('Wiatr', 'Ветер', 'Wind'), 'wwind'])}${fieldHTML(['chips', 'phen', L('Zjawiska', 'Явления', 'Phenomena'), 'wphen', 1])}` : FS().dept.filter(x => x[1] !== 'kind').map(fieldHTML).join('');
  return `<div class="formbody">${kinds}${fields}<label class="bl-field"><span>${L('Opis', 'Описание', 'Description')}</span>${area('note', f.note, wx ? L('np. silne podmuchy, osłonięto woliery', 'напр. порывы ветра, укрыли вольеры', 'e.g. gusts, enclosures covered') : '', 3)}</label>${whenPhoto()}</div>${saveBtn()}`;
};

/* ---------- saving: number for the temperature, nothing left over from the other kind ---------- */
const _saveFormW = saveForm;
saveForm = async function () {
  const f = F();
  if (f && f.kind === 'dept') {
    const fv = f.fv;
    if (fv.kind === WX) {
      delete fv.rep;
      const s = String(fv.t ?? '').trim();
      if (s && s !== '-') { const n = num(s); if (n == null || n < -60 || n > 70) { f.err = L('Temperatura: −60…70 °C', 'Температура: −60…70 °C', 'Temperature: −60…70 °C'); return render(); } fv.t = n; } else delete fv.t;
      const any = fv.t != null || fv.sky != null || fv.wind != null || (fv.prec || []).length || (fv.phen || []).length || f.note.trim();
      for (const k of ['prec', 'phen']) if (Array.isArray(fv[k])) fv[k] = [...fv[k]].sort((a, b) => a - b);
      if (!any) { f.err = L('Podaj pogodę', 'Укажи погоду', 'Enter the weather'); return render(); }
    } else WX_KEYS.forEach(k => delete fv[k]);
  }
  return _saveFormW();
};

/* ---------- how a weather record reads ---------- */
const wxLine = f => [typeof f.t === 'number' ? tFmt(f.t) : '', pick('wprec', f.prec), pick('wsky', f.sky), pick('wwind', f.wind), pick('wphen', f.phen)].filter(Boolean);
const _recTitleW = recTitle;
recTitle = r => { if (r.k === 'dept' && isWx(r.f)) { const l = wxLine(r.f).slice(0, 3); return OPT.dept()[WX] + (l.length ? ': ' + l.join(' · ') : ''); } return _recTitleW(r); };
const _recDetailsW = recDetails;
recDetails = function (r) {
  const out = _recDetailsW(r); if (r.k !== 'dept' || !isWx(r.f)) return out;
  const f = r.f, P = (k, v) => v !== '' && v != null && out.push([k, v]);
  if (typeof f.t === 'number') P(L('Temperatura', 'Температура', 'Temperature'), tFmt(f.t));
  P(L('Niebo', 'Небо', 'Sky'), pick('wsky', f.sky)); P(L('Opady', 'Осадки', 'Precipitation'), pick('wprec', f.prec));
  P(L('Wiatr', 'Ветер', 'Wind'), pick('wwind', f.wind)); P(L('Zjawiska', 'Явления', 'Phenomena'), pick('wphen', f.phen));
  return out;
};
