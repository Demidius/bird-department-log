// qrcard.js — v2: QR code of the animal card (loads after ux3.js; uses qrcode.js).
// Button next to the pencil → a window with the code of the link to this card (…/v2/?a=<id>), name, species, mark / ring;
// Download (PNG label), Print (label only), Share (picture + link; or the link is copied).
// Opening such a link (phone camera) shows this card; without a session — after signing in. Access is still by account.

BirdLog.icons.qr = '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM19 14h1M14 19v1M18 18h2v2h-2z"/>';
const QR_SITE = 'https://demidius.github.io/bird-department-log/v2/';
const qrUrl = a => (/\.github\.io$/.test(location.hostname) ? location.origin + location.pathname.replace(/index\.html$/, '') : QR_SITE) + '?a=' + a.id;
let QR_OPEN = null;
try {
  const q = new URLSearchParams(location.search).get('a');
  if (q && /^[0-9a-f-]{36}$/i.test(q)) { QR_OPEN = q; sessionStorage.setItem('v2qr', q); history.replaceState(history.state, '', location.pathname + location.hash); }
  else QR_OPEN = sessionStorage.getItem('v2qr');
} catch (x) {}
let qrWait = 0;
const qrOpen = () => {
  qrWait = 0; const id = QR_OPEN; QR_OPEN = null; try { sessionStorage.removeItem('v2qr'); } catch (x) {}
  const a = id && anById(id);
  if (a) go({scr: 'card', ani: a.id}); else toast(L('Nie znaleziono karty z kodu QR', 'Карточка из QR-кода не найдена', 'Card from the QR code not found'));
};
addEventListener('DOMContentLoaded', () => {
  const _r = render; render = function () { _r(); if (QR_OPEN && st.gate === 'app' && !qrWait) { qrWait = 1; setTimeout(qrOpen, 0); } };
  const _g = go; go = function (o) { if (o && o.scr) st.qr = null; return _g(o); };
});
addEventListener('popstate', e => { if (!st.qr) return; e.stopImmediatePropagation(); st.qr = null; history.pushState({v2: 1, nav: navOf()}, ''); render(); });
const qrMake = a => { const q = qrcode(0, 'M'); q.addData(qrUrl(a)); q.make(); return q; };
function qrSvg(q) {
  const n = q.getModuleCount(); let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return `<svg class="qrsvg" viewBox="-4 -4 ${n + 8} ${n + 8}" shape-rendering="crispEdges" role="img" aria-label="QR"><rect x="-4" y="-4" width="${n + 8}" height="${n + 8}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}
const qrLines = a => { const s = spBy(a.species_id), sp = s ? spName(s) : '', lat = s && s.latin && s.latin !== sp ? s.latin : '';
  return [[a.name, 'b'], [sp && sp !== a.name ? sp : '', ''], [lat, 'i'], [a.ring ? L('Znak / obrączka', 'Знак / кольцо', 'Mark / ring') + ': ' + a.ring : '', '']].filter(x => x[0]); };
function qrCanvas(a) {
  const q = qrMake(a), n = q.getModuleCount(), W = 640, k = Math.floor(W / (n + 8)), qs = n * k, x0 = (W - qs) / 2, y0 = 4 * k;
  const lines = qrLines(a), spec = {b: [36, '800', ''], i: [24, '500', 'italic '], '': [26, '600', '']};
  const H = y0 + qs + 20 + lines.reduce((s, [, t]) => s + spec[t][0] * 1.35, 0) + 30;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = Math.round(H); const g = cv.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, cv.height); g.fillStyle = '#000';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect(x0 + c * k, y0 + r * k, k, k);
  let y = y0 + qs + 20; g.textAlign = 'center'; g.textBaseline = 'top';
  for (const [txt, t] of lines) { let [sz, wt, st0] = spec[t];
    do { g.font = `${st0}${wt} ${sz}px Manrope, Inter, Arial, sans-serif`; sz -= 1; } while (g.measureText(txt).width > W - 48 && sz > 12);
    g.fillStyle = t === 'b' ? '#000' : '#333'; g.fillText(txt, W / 2, y); y += spec[t][0] * 1.35; }
  return cv;
}
const qrFile = a => String(a.name || 'karta').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 60) || 'karta';
const qrBlob = a => new Promise(res => qrCanvas(a).toBlob(res, 'image/png'));
async function qrDownload(a) {
  const b = await qrBlob(a), u = URL.createObjectURL(b), l = document.createElement('a');
  l.href = u; l.download = `QR ${qrFile(a)}.png`; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
}
function qrPrint(a) {
  let el = document.getElementById('qrprint'); if (!el) { el = document.createElement('div'); el.id = 'qrprint'; document.body.appendChild(el); }
  el.innerHTML = `<img alt="QR" src="${qrCanvas(a).toDataURL('image/png')}">`;
  document.body.classList.add('qrp'); const done = () => { document.body.classList.remove('qrp'); removeEventListener('afterprint', done); };
  addEventListener('afterprint', done); setTimeout(() => window.print(), 50);
}
async function qrShare(a) {
  const url = qrUrl(a), title = a.name, copied = () => toast(L('Link skopiowany', 'Ссылка скопирована', 'Link copied'));
  try {
    const f = new File([await qrBlob(a)], `QR ${qrFile(a)}.png`, {type: 'image/png'});
    if (navigator.canShare && navigator.canShare({files: [f]})) return await navigator.share({files: [f], title, text: `${title}\n${url}`});
    if (navigator.share) return await navigator.share({title, url});
  } catch (x) { if (x && x.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(url); copied(); } catch (x) { toast(url); }
}
const _animalCardQr = animalCard;
animalCard = function () {
  let h = _animalCardQr(); const a = anById(st.ani); if (!a) return h;
  const i = h.indexOf('<div class="topbar">'), j = i < 0 ? -1 : h.indexOf('</span>', i);
  if (j >= 0) { const k = j + 7, ph = '<span style="width:40px"></span>', btn = `<button class="bl-x qrbtn" data-qr="1" aria-label="${L('Kod QR', 'QR-код', 'QR code')}">${ic('qr', 18)}</button>`;
    h = h.slice(0, k) + btn + (h.startsWith(ph, k) ? h.slice(k + ph.length) : h.slice(k)); }
  if (st.qr !== a.id) return h;
  const sheet = `<div class="scrim" data-qrclose="1"></div><div class="bl-sheet qrsh"><div class="grip"></div><div class="head"><h3>${ic('qr', 20)}${L('Kod QR karty', 'QR-код карточки', 'Card QR code')}</h3><button class="bl-x" data-qrclose="1">${ic('x', 18)}</button></div>
  <div class="qrlab">${qrSvg(qrMake(a))}${qrLines(a).map(([t, k]) => `<div class="qrl qrl-${k || 'n'}">${esc(t)}</div>`).join('')}</div>
  <p class="tip">${L('Zeskanuj aparatem telefonu — otworzy się ta karta (po zalogowaniu).', 'Наведи камеру телефона — откроется эта карточка (после входа).', 'Scan with a phone camera — this card opens (after signing in).')}</p>
  <div class="qrbtns"><button class="bl-btn" data-qrdo="dl">${ic('download', 18)}${L('Pobierz', 'Скачать', 'Download')}</button><button class="bl-btn" data-qrdo="pr">${ic('print', 18)}${L('Drukuj', 'Распечатать', 'Print')}</button><button class="bl-btn solid" data-qrdo="sh">${ic('share', 18)}${L('Wyślij', 'Отправить', 'Share')}</button></div></div>`;
  const e = h.lastIndexOf('</div>'); return e < 0 ? h + sheet : h.slice(0, e) + sheet + h.slice(e);
};
BirdLog.icons.download = BirdLog.icons.download || '<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>';
BirdLog.icons.print = BirdLog.icons.print || '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="2"/><path d="M7 14h10v6H7z"/>';
BirdLog.icons.share = BirdLog.icons.share || '<path d="M12 15V4"/><path d="m8 8 4-4 4 4"/><path d="M6 12v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7"/>';
document.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('[data-qr]')) { e.preventDefault(); e.stopImmediatePropagation(); st.qr = st.ani; return render(); }
  if (t.closest('[data-qrclose]')) { e.preventDefault(); e.stopImmediatePropagation(); st.qr = null; return render(); }
  const d = t.closest('[data-qrdo]'); if (!d) return; e.preventDefault(); e.stopImmediatePropagation();
  const a = anById(st.qr); if (!a) return;
  if (d.dataset.qrdo === 'dl') qrDownload(a); else if (d.dataset.qrdo === 'pr') qrPrint(a); else qrShare(a);
}, true);
document.head.insertAdjacentHTML('beforeend', '<style>.qrlab{display:flex;flex-direction:column;align-items:center;gap:2px;padding:16px 14px 14px;border-radius:18px;background:#fff;color:#000;border:1px solid var(--line)}.qrsvg{width:min(240px,62vw);height:auto;margin-bottom:8px}.qrl{text-align:center;word-break:break-word}.qrl-b{font:800 18px/1.25 var(--font-display,Manrope),sans-serif}.qrl-n{font:600 14px/1.3 var(--font-text);color:#333}.qrl-i{font:italic 500 13px/1.3 var(--font-text);color:#333}'
  + '.qrbtns{display:flex;gap:8px}.qrbtns .bl-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;min-width:0;padding:0 8px;font-size:14px;white-space:nowrap}.qrbtns .bl-btn.solid{background:var(--fab);color:var(--on-fab)}'
  + '#qrprint{display:none}@media print{body.qrp>*:not(#qrprint){display:none!important}body.qrp #qrprint{display:flex!important;justify-content:center;padding-top:1.5cm}#qrprint img{width:9cm;height:auto}}</style>');
