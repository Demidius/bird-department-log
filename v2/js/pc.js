// pc.js — v2: computer layout (window ≥ 1000px). On a phone nothing changes.
// 1) Three columns: menu on the left (Now, Journal, Calendar, Animals, Species, Enclosures, Drugs, More; «+» on top),
//    the chosen list in the middle, the opened card on the right (record, animal, species, enclosure, drug); the open row
//    of the list is highlighted. One header line across all columns, in the colour of the window.
// 2) Forms and menus open as a window in the centre; the «+» menu opens next to the menu button; toasts bottom right.
// 3) Calendar: the month fills the middle (day cells with coloured record chips, up to 3, then «+N»; neighbouring days pale,
//    weekends darker); the right column lists the chosen day; a tap anywhere in a cell opens that day.
// 4) Species, animal and enclosure cards: photo on the right half, name, Latin and data tiles on the left.
// 5) Drugs list in the middle column has a normal list header (no «back to More»).
// 6) Species: the list fills the middle with tiles four in a row, search and a compact «New species» in one row;
//    the species card opens on the right (460px: photo on top, name and data below).

const PC_W = 1000, isPC = () => innerWidth >= PC_W;
const PC_DET = ['card', 'pcard', 'scard', 'rcard', 'dcard'];
const PC_NAV = [['now', 'now', () => L('Teraz', 'Сейчас', 'Now')], ['logs', 'list', () => L('Dziennik', 'Журнал', 'Journal')], ['cal', 'cal', () => L('Kalendarz', 'Календарь', 'Calendar')],
  ['animals', 'bird', () => L('Zwierzęta', 'Животные', 'Animals')], ['species', 'book', () => L('Gatunki', 'Виды', 'Species')], ['places', 'home', () => L('Woliery', 'Вольеры', 'Enclosures')],
  ['drugs', 'pill', () => L('Leki', 'Лекарства', 'Drugs')], ['more', 'grid', () => L('Więcej', 'Ещё', 'More')]];
function pcMark() {
  if (!isPC()) return;
  const sel = st.scr === 'card' ? `[data-ani="${st.ani}"]` : st.scr === 'rcard' ? `[data-rec="${st.rec}"]` : st.scr === 'scard' ? `[data-sp="${st.sp}"]` : st.scr === 'pcard' ? `[data-plc="${st.plc}"]` : '';
  if (sel) document.querySelectorAll('.pc-list ' + sel).forEach(el => el.classList.add('pcsel'));
}
const pcFixList = (l, h) => l !== 'drugs' ? h : h.replace(/^<div class="cardscr"><div class="topbar">[\s\S]*?<\/div><div class="scroll"><h1 class="sph1"[^>]*>[^<]*<\/h1>/, head(L('Leki', 'Лекарства', 'Drugs')) + '<div class="cardscr"><div class="scroll">');
const _speciesCardPC = speciesCard;
speciesCard = function () {
  const h = _speciesCardPC(); if (!isPC()) return h;
  const a = h.indexOf('<div class="sphero">'); if (a < 0) return h;
  const b = h.indexOf('</div>', a) + 6, c = h.indexOf('<div class="sec"', b); if (c < 0) return h;
  return h.slice(0, a) + `<div class="sptop"><div class="sptxt">${h.slice(b, c)}</div>${h.slice(a, b)}</div>` + h.slice(c);
};
function pcHero() {
  if (!isPC() || !['card', 'pcard'].includes(st.scr)) return;
  const sc = document.querySelector('.pc-det .cardscr .scroll'); if (!sc || sc.querySelector('.pchero')) return;
  const hero = sc.querySelector(':scope > .ahero'); if (!hero) return;
  const facts = hero.nextElementSibling, av = hero.querySelector('.bl-av.big'), txt = hero.querySelector(':scope > div');
  const top = document.createElement('div'); top.className = 'sptop pchero';
  const left = document.createElement('div'); left.className = 'sptxt';
  const ah = document.createElement('div'); ah.className = 'ahero pcah'; if (txt) ah.appendChild(txt); left.appendChild(ah);
  if (facts && facts.matches('dl.bl-facts')) left.appendChild(facts);
  const ph = document.createElement('div'); ph.className = 'sphero';
  if (av) for (const at of av.attributes) if (at.name !== 'class') ph.setAttribute(at.name, at.value);
  const img = av && av.querySelector('img');
  if (img) ph.appendChild(img); else ph.innerHTML = ic(st.scr === 'pcard' ? 'home' : 'bird', 40) + `<span class="phn">${L('brak zdjęcia', 'нет фото', 'no photo')}</span>`;
  top.append(left, ph); hero.replaceWith(top);
}
function pcCalItems(k, EV) { return (EV.get(k) || []).sort((a, b) => (a.exp ? 1 : 0) - (b.exp ? 1 : 0) || a.r.at - b.r.at); }
function pcCal(hd) {
  const now = new Date(), y = st.cy ?? now.getFullYear(), m = st.cm ?? now.getMonth(), EV = calEvents(), first = (new Date(y, m, 1).getDay() + 6) % 7;
  const rows = Math.ceil((first + new Date(y, m + 1, 0).getDate()) / 7), sel = st.dk || dayKey(Date.now()), tk = dayKey(Date.now());
  const dows = [0, 1, 2, 3, 4, 5, 6].map(i => `<span class="dw">${new Date(2024, 0, 1 + i).toLocaleDateString(LOC(), {weekday: 'short'}).replace('.', '')}</span>`).join('');
  let g = '';
  for (let i = 0; i < rows * 7; i++) {
    const dt = new Date(y, m, 1 - first + i), k = dayKey(dt.getTime()), out = dt.getMonth() !== m;
    g += `<button class="pcd ${out ? 'out' : ''} ${k === tk ? 'today' : ''} ${k === sel ? 'on' : ''} ${i % 7 > 4 ? 'we' : ''}" data-day="${k}"><span class="n">${dt.getDate()}</span>${calDayCounts(EV.get(k))}</button>`;
  }
  const mn = new Date(y, m, 1).toLocaleDateString(LOC(), {month: 'long', year: 'numeric'});
  return `${hd}<div class="pccal"><div class="pccal-top"><h2>${mn.charAt(0).toUpperCase() + mn.slice(1)}</h2><button class="bl-btn icon" data-mon="-1" aria-label="${L('Poprzedni miesiąc', 'Предыдущий месяц', 'Previous month')}">${ic('back', 20, 2.4)}</button><button class="bl-btn icon" data-mon="1" aria-label="${L('Następny miesiąc', 'Следующий месяц', 'Next month')}">${ic('chev', 20, 2.4)}</button></div><div class="pcgrid" style="grid-template-rows:auto repeat(${rows},minmax(0,1fr))">${dows}${g}</div></div>`;
}
function pcDay() {
  const sel = st.dk || dayKey(Date.now()), [sy, sm, sd] = sel.split('-').map(Number), ev = pcCalItems(sel, calEvents());
  const rows = ev.map(e => e.exp ? `<button class="bl-rec g-${e.g} guessrow recbtn" data-rec="${e.r.id}">${badge(e.g, e.icn, 'sm')}<div><b>${L('Spodziewane: ', 'Ожидается: ', 'Expected: ')}${esc(e.label)}</b><span>${esc(recWho(e.r))}</span></div><time></time></button>` : recHTML(e.r)).join('');
  const wd = new Date(sy, sm, sd).toLocaleDateString(LOC(), {weekday: 'long'});
  return `<div class="pc-ehead pcdayh"><b>${wd.charAt(0).toUpperCase() + wd.slice(1)}, ${fDay(new Date(sy, sm, sd).getTime())}</b><span>${ev.length || ''}</span></div><div class="scroll pcdayl"><div class="stack">${rows || `<p class="empty">${L('Brak zdarzeń', 'Событий нет', 'No events')}</p>`}</div></div>`;
}
document.addEventListener('click', e => {
  if (!isPC()) return;
  const d = e.target.closest('.pcd[data-day]'); if (!d) return;
  e.preventDefault(); e.stopImmediatePropagation();
  st.dk = d.dataset.day; if (st.scr !== 'cal') go({scr: 'cal'}); else render();
}, true);
addEventListener('DOMContentLoaded', () => {
  const _scrPC = screen;
  screen = function () {
    if (!isPC()) return _scrPC();
    const s0 = st.scr, det = PC_DET.includes(s0); let listH, detH;
    if (det) {
      const l = st.pcList || 'logs'; st.scr = l;
      try { listH = l === 'drugs' && typeof drugsScreen === 'function' ? pcFixList(l, drugsScreen()) : l === 'cal' ? pcCal(_scrPC().split('<div class="scroll">')[0]) : _scrPC(); } finally { st.scr = s0; }
      detH = _scrPC();
    } else {
      st.pcList = s0; listH = s0 === 'cal' ? pcCal(_scrPC().split('<div class="scroll">')[0]) : pcFixList(s0, _scrPC());
      detH = s0 === 'cal' ? pcDay() : `<div class="pc-ehead"></div><div class="pc-empty">${ic('list', 34)}<p>${L('Wybierz wpis, zwierzę lub kartę z listy', 'Выбери запись, животное или карточку в списке', 'Pick a record, animal or card from the list')}</p></div>`;
    }
    const cur = st.pcList || s0;
    const rail = `<nav class="bl-rail pc-rail"><span class="logo">${ic('bird', 22)}</span>${canWrite() ? `<button class="add" data-fab="1" aria-label="${L('Dodaj wpis', 'Добавить запись', 'Add record')}">${ic('plus', 24, 2.6)}</button>` : ''}${PC_NAV.map(([k, i, l]) => `<button class="ni" data-scr="${k}" ${cur === k ? 'aria-current="page"' : ''}>${ic(i, 22)}<span>${l()}</span></button>`).join('')}</nav>`;
    const wide = cur === 'cal';
    return `${rail}<section class="pc-list ${wide ? 'pc-wide' : ''}">${listH}</section><section class="pc-det ${wide ? 'pc-side' : ''}">${detH}</section>`;
  };
  const _renderPC = render; render = function () { _renderPC(); pcMark(); pcHero(); };
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(render, 150); });
});

function pcSpeciesWide() {
  if (!isPC() || st.pcList !== 'species') return;
  const l = document.querySelector('.pc-list'), d = document.querySelector('.pc-det'); if (l) l.classList.add('pc-wide', 'pc-spw'); if (d) d.classList.add('pc-side', 'pc-spd');
  // search on the left and a compact «New species» button on the right, in one row
  const sc = l && l.querySelector('.scroll'), nb = sc && sc.querySelector(':scope > .newani'), se = sc && sc.querySelector(':scope > .bl-search');
  if (nb && se && !sc.querySelector('.pctool')) {
    const inp = se.querySelector('input'), had = inp && document.activeElement === inp, sel = had ? [inp.selectionStart, inp.selectionEnd] : null;
    const t = document.createElement('div'); t.className = 'pctool'; se.before(t); t.append(se, nb);
    if (had) { inp.focus(); try { inp.setSelectionRange(sel[0], sel[1]); } catch (x) {} }
  }
}
addEventListener('DOMContentLoaded', () => { const _r = render; render = function () { _r(); pcSpeciesWide(); }; });
document.head.insertAdjacentHTML('beforeend', '<style>@media (min-width: 1000px){.pc-spw .stack:has(> [data-sp]){grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.pc-spw .scroll{padding-left:20px;padding-right:20px}.pc-det.pc-spd{width:460px}.pc-spd .sptop{grid-template-columns:1fr;gap:16px}.pc-spd .sptop .sphero{order:-1}.pctool{display:flex;align-items:stretch;gap:12px;margin:4px 0 16px}.pctool .bl-search{flex:1;margin:0!important;min-height:50px}.pctool .newani{flex:none;width:auto;min-height:50px;margin:0;padding:0 20px 0 8px;gap:10px;border-radius:14px;box-shadow:none;border:1.5px solid color-mix(in srgb, var(--accent) 25%, transparent)}.pctool .newani small,.pctool .newani .sx{display:none}.pctool .newani .bl-av{width:36px;height:36px}.pctool .newani b{font-size:14.5px;white-space:nowrap}.pc-spd .cardscr .scroll,.pc-spd .cardscr .topbar,.pc-spd .cardscr .cbar{padding-left:20px;padding-right:20px}}</style>');

document.head.insertAdjacentHTML('beforeend', '<style>' + '@media (min-width: 1000px) { #shell{max-width:none} .app{flex-direction:row} .app>.bl-nav{display:none} .pc-rail{flex:none;height:100%;overflow:auto;scrollbar-width:none;padding-top:12px} .app{--hdbg:var(--bg);--hdline:var(--line)} #app[data-wt] .app{--hdbg:color-mix(in srgb, var(--tint) 24%, var(--bg));--hdline:color-mix(in srgb, var(--tint) 35%, var(--line))} .pc-list>.hd,.pc-det .topbar,.pc-ehead{flex:none;height:64px;min-height:64px;padding-top:0!important;padding-bottom:0!important;box-sizing:border-box;align-items:center;border-bottom:1px solid var(--hdline)!important;background:var(--hdbg)!important} .pc-rail{background:linear-gradient(to bottom, var(--hdbg) 0 63px, var(--hdline) 63px 64px, var(--card) 64px)} .pc-rail .logo{margin:0 auto 22px} .pc-list>.hd h1{font-size:24px} .pc-list>.hd .sub{padding-top:0} .pc-ehead{display:block} .pc-det:has(.pc-ehead){display:flex;flex-direction:column}.pc-det .pc-empty{flex:1;height:auto} .pc-rail .ni{padding:9px 2px;font-size:11px} .pc-rail .ni span{text-align:center} .pc-list{flex:none;width:420px;position:relative;display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--line);background:var(--bg)} .pc-list>.bl-counters{padding:0 12px 10px} .pc-list .scroll{padding-bottom:40px} .pc-list .cardscr{position:relative;inset:auto;flex:1;min-height:0} .pc-det{flex:1;position:relative;min-width:0;background:color-mix(in srgb, var(--bg) 60%, var(--card))} .pc-det .cardscr .scroll,.pc-det .cardscr .topbar,.pc-det .cardscr .cbar{padding-left:max(20px, calc((100% - 760px) / 2));padding-right:max(20px, calc((100% - 760px) / 2))} .pc-det .cardscr .scroll{padding-top:24px;padding-bottom:140px} .pc-list .scroll{padding-top:12px} .pc-list>.hd + :not(.scroll){margin-top:12px} .pc-list .chiprow{overflow:visible;padding:0 12px 4px} .pc-list .chiprow .bl-chips{flex-wrap:wrap;row-gap:8px} .pc-list>.chiprow + .scroll,.pc-list>.bl-counters + .scroll{padding-top:8px} .pc-rail .logo{background:#1e6b4e;color:#fff} .sptop{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px;align-items:start;margin-bottom:6px} .sptop .sphero{margin:0;aspect-ratio:4/3} .sptxt .sph1{margin-top:2px} .sptxt .gaps{width:100%} .pchero .pcah{margin:2px 0 14px} .pchero .pcah h1{font-size:26px} .pchero .bl-facts{margin:0} .pc-empty{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--muted);text-align:center;padding:24px} .pc-empty p{margin:0;max-width:280px;font:600 15px/1.4 var(--font-text)} .pc-list .pcsel{outline:2px solid var(--accent);outline-offset:-2px;border-radius:14px;background:color-mix(in srgb, var(--accent) 8%, var(--card))} .app .scrim,.cardscr .scrim{position:fixed;inset:0} .app .bl-sheet,.app>.bl-sheet:not(.full),.cardscr .bl-sheet,.app .bl-sheet.full,.cardscr .bl-sheet.full{position:fixed;left:50%;right:auto;top:50%;bottom:auto;transform:translate(-50%,-50%);width:min(640px, 92vw);max-height:88vh;border-radius:var(--radius-sheet);padding:14px 20px 20px} .app .bl-sheet.full,.cardscr .bl-sheet.full{height:88vh} .bl-sheet .grip{display:none} .pc-list.pc-wide{flex:1;width:auto} .pc-det.pc-side{flex:none;width:440px;display:flex;flex-direction:column;border-left:0} .pccal{flex:1;display:flex;flex-direction:column;min-height:0;padding:14px 20px 18px} .pccal-top{display:flex;align-items:center;gap:8px;margin-bottom:12px} .pccal-top h2{flex:1;margin:0;font:800 22px/1.2 var(--font-display)} .pccal-top .bl-btn.icon{background:var(--card);box-shadow:var(--shadow-card)} .pcgrid{flex:1;min-height:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:var(--shadow-card)} .pcgrid .dw{background:var(--card);padding:9px 10px 7px;font:700 11px/1 var(--font-text);letter-spacing:.05em;text-transform:uppercase;color:var(--muted)} .pcd{min-height:0;overflow:hidden;display:flex;flex-direction:column;align-items:stretch;gap:3px;padding:6px;border:0;background:var(--card);color:var(--ink);font:inherit;text-align:left;cursor:pointer} .pcd.we{background:color-mix(in srgb, var(--bg) 45%, var(--card))} .pcd.out{background:color-mix(in srgb, var(--bg) 85%, var(--card))}.pcd.out .n,.pcd.out .cal-counts{opacity:.5} .pcd:hover{background:color-mix(in srgb, var(--accent) 6%, var(--card))} .pcd.on{box-shadow:inset 0 0 0 2px var(--accent)} .pcd .n{flex:none;align-self:flex-start;width:26px;height:26px;border-radius:13px;display:flex;align-items:center;justify-content:center;font:700 13px/1 var(--font-text)} .pcd.today .n{background:var(--fab);color:var(--on-fab)} .pcdayh{display:flex!important;align-items:center;gap:10px;padding:0 18px!important} .pcdayh b{flex:1;font:800 17px/1.2 var(--font-display)}.pcdayh span{font:700 12px/1 var(--font-text);color:var(--muted)} .pcdayl{flex:1;overflow:auto;padding:14px 16px 40px} .toast{left:auto;right:24px;bottom:24px;width:420px} .dial{position:fixed;left:100px;right:auto;top:64px;bottom:auto;width:380px} .app .dialx{position:fixed;left:16px;top:70px;bottom:auto;transform:none} }' + '</style>');
