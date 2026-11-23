// dept.js — v2: free note (department record, type dept) — own fields for each kind, like weather.js does for «Pogoda».
// f.kind: 0 facilities {gwork[], gwhere, gby[]}, 1 pest control {rway[], rprep, rn, rsign[], rwhere},
// 2 delivery {swhat[], sfrom, sqty, sstate[], sby[]}, 3 breakdown {awhat[], awhere, aurg, astat, ato}, 4 other — description only.
// A new free note shows «Other» selected; the kind is written only on save, so an untouched form closes without the discard question.
Object.assign(OPT, {
  dgwork: () => LA(['Sprzątanie', 'Wymiana ściółki / podłoża', 'Mycie poideł i basenów', 'Drobna naprawa', 'Rośliny', 'Dezynfekcja'], ['Уборка', 'Замена подстилки / грунта', 'Мытьё поилок и бассейнов', 'Мелкий ремонт', 'Растения', 'Дезинфекция'], ['Cleaning', 'Bedding / substrate change', 'Drinkers and pools washed', 'Small repair', 'Plants', 'Disinfection']),
  drway: () => LA(['Stacje z trutką', 'Pułapki mechaniczne', 'Pułapki lepowe', 'Firma zewnętrzna'], ['Станции с приманкой', 'Механические ловушки', 'Клеевые ловушки', 'Внешняя фирма'], ['Bait stations', 'Snap traps', 'Glue traps', 'External company']),
  drsign: () => LA(['Brak śladów', 'Odchody', 'Ślady żerowania', 'Widziano gryzonia', 'Martwy gryzoń', 'Trutka zjedzona'], ['Следов нет', 'Помёт', 'Следы погрыза', 'Видели грызуна', 'Мёртвый грызун', 'Приманка съедена'], ['No signs', 'Droppings', 'Gnaw marks', 'Rodent seen', 'Dead rodent', 'Bait eaten']),
  dswhat: () => LA(['Karma', 'Owoce i warzywa', 'Żywe owady', 'Mięso / ryby', 'Ściółka', 'Leki / suplementy', 'Sprzęt'], ['Корм', 'Фрукты и овощи', 'Живые насекомые', 'Мясо / рыба', 'Подстилка', 'Лекарства / добавки', 'Инвентарь'], ['Feed', 'Fruit and vegetables', 'Live insects', 'Meat / fish', 'Bedding', 'Drugs / supplements', 'Equipment']),
  dsstate: () => LA(['Zgodna z zamówieniem', 'Braki', 'Uszkodzona / zepsuta', 'Krótki termin'], ['Соответствует заказу', 'Недостача', 'Повреждена / испорчена', 'Короткий срок'], ['As ordered', 'Missing items', 'Damaged / spoiled', 'Short shelf life']),
  dawhat: () => LA(['Ogrzewanie', 'Oświetlenie', 'Woda', 'Prąd', 'Wentylacja', 'Drzwi / zamki', 'Siatka / ogrodzenie'], ['Отопление', 'Освещение', 'Вода', 'Электричество', 'Вентиляция', 'Двери / замки', 'Сетка / ограждение'], ['Heating', 'Lighting', 'Water', 'Power', 'Ventilation', 'Doors / locks', 'Mesh / fence']),
  daurg: () => LA(['Może poczekać', 'Pilne', 'Zagrożenie dla zwierząt'], ['Может подождать', 'Срочно', 'Угроза для животных'], ['Can wait', 'Urgent', 'Danger to animals']),
  dastat: () => LA(['Zgłoszono', 'W naprawie', 'Naprawiono'], ['Заявлено', 'В ремонте', 'Исправлено'], ['Reported', 'Being fixed', 'Fixed'])
});
const DEPT_OTHER = 4;
// [type, key, label, list / placeholder, multi / unit]; the first field is the short summary in the journal title
const DEPT_F = () => ({
  0: [['chips', 'gwork', L('Co zrobiono', 'Что сделано', 'What was done'), 'dgwork', 1], ['text', 'gwhere', L('Gdzie', 'Где', 'Where'), L('np. Woliera 2, kuchnia', 'напр. Вольер 2, кухня', 'e.g. Aviary 2, kitchen')], ['staff', 'gby', L('Kto', 'Кто', 'Who')]],
  1: [['chips', 'rway', L('Sposób', 'Способ', 'Method'), 'drway', 1], ['text', 'rprep', L('Preparat', 'Препарат', 'Product'), L('nazwa środka', 'название средства', 'product name')], ['num', 'rn', L('Ile stacji / pułapek', 'Сколько станций / ловушек', 'Stations / traps'), '0', L('szt.', 'шт.', 'pcs')], ['chips', 'rsign', L('Ślady gryzoni', 'Следы грызунов', 'Rodent signs'), 'drsign', 1], ['text', 'rwhere', L('Gdzie', 'Где', 'Where'), L('np. magazyn paszy', 'напр. склад корма', 'e.g. feed store')]],
  2: [['chips', 'swhat', L('Co dostarczono', 'Что привезли', 'What was delivered'), 'dswhat', 1], ['text', 'sfrom', L('Dostawca', 'Поставщик', 'Supplier'), L('firma', 'фирма', 'company')], ['text', 'sqty', L('Ilość', 'Количество', 'Quantity'), L('np. 3 worki po 20 kg', 'напр. 3 мешка по 20 кг', 'e.g. 3 bags of 20 kg')], ['chips', 'sstate', L('Stan dostawy', 'Состояние поставки', 'Condition'), 'dsstate', 1], ['staff', 'sby', L('Kto przyjął', 'Кто принял', 'Received by')]],
  3: [['chips', 'awhat', L('Co się zepsuło', 'Что сломалось', 'What broke'), 'dawhat', 1], ['text', 'awhere', L('Gdzie', 'Где', 'Where'), L('np. Woliera 2', 'напр. Вольер 2', 'e.g. Aviary 2')], ['chips', 'aurg', L('Pilność', 'Срочность', 'Urgency'), 'daurg'], ['chips', 'astat', L('Status', 'Статус', 'Status'), 'dastat'], ['text', 'ato', L('Zgłoszono do', 'Кому сообщили', 'Reported to'), L('np. dział techniczny', 'напр. технический отдел', 'e.g. maintenance')]]
});
const DEPT_PH = () => ({0: L('np. co jeszcze trzeba zrobić', 'напр. что ещё нужно сделать', 'e.g. what is left to do'), 1: L('np. gdzie były ślady', 'напр. где были следы', 'e.g. where the signs were'), 2: L('np. czego brakowało', 'напр. чего не хватило', 'e.g. what was missing'), 3: L('np. co dokładnie się stało', 'напр. что именно случилось', 'e.g. what exactly happened')});
const deptKeys = () => Object.values(DEPT_F()).flat().map(x => x[1]);

const _freeFormD = freeForm;
freeForm = function () {
  const f0 = F(), dflt = f0 && f0.fv.kind == null; if (dflt) f0.fv.kind = DEPT_OTHER;
  let h; try { h = _freeFormD(); } finally { if (dflt) delete f0.fv.kind; }
  const kind = dflt ? DEPT_OTHER : f0.fv.kind, set = DEPT_F()[kind]; if (!set) return h;
  const i = h.indexOf('<label class="bl-field"><span>' + L('Opis', 'Описание', 'Description'));
  if (i >= 0) h = h.slice(0, i) + set.map(fieldHTML).join('') + h.slice(i);
  return h.replace(/<textarea([^>]*?) placeholder="[^"]*"/, '<textarea$1').replace('<textarea', `<textarea placeholder="${esc(DEPT_PH()[kind])}"`);
};
const _saveFormD = saveForm;
saveForm = function () {
  const f = F();
  if (f && f.kind === 'dept') {
    if (f.fv.kind == null) f.fv.kind = DEPT_OTHER;
    const own = (DEPT_F()[f.fv.kind] || []).map(x => x[1]);
    deptKeys().forEach(k => { if (!own.includes(k)) delete f.fv[k]; });
    if (f.fv.rn != null && String(f.fv.rn).trim() !== '') { const n = num(String(f.fv.rn)); if (n == null || n < 0) { f.err = L('Liczba stacji: liczba ≥ 0', 'Число станций: число ≥ 0', 'Stations: a number ≥ 0'); return render(); } f.fv.rn = n; } else delete f.fv.rn;
  }
  return _saveFormD();
};
const deptVal = (x, v) => x[0] === 'chips' ? pick(x[3], v) : x[0] === 'staff' ? (v || []).map(nameOf).join(', ') : x[0] === 'num' ? v + ' ' + (x[4] || '') : v;
const _recTitleD = recTitle;
recTitle = r => {
  const set = r.k === 'dept' && DEPT_F()[r.f.kind]; if (!set) return _recTitleD(r);
  const x = set[0], v = r.f[x[1]], s = v == null || v === '' ? '' : deptVal(x, v);
  return OPT.dept()[r.f.kind] + (s ? ': ' + s : '');
};
const _recDetailsD = recDetails;
recDetails = function (r) {
  const out = _recDetailsD(r), set = r.k === 'dept' && DEPT_F()[r.f.kind]; if (!set) return out;
  for (const x of set) { const v = r.f[x[1]]; if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue; const s = deptVal(x, v); if (s) out.push([x[2], s]); }
  return out;
};
