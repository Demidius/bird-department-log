// ux2.js — v2: further small touches (continues ux.js; loads right after it).
// 1) Comment field: no scrollbar strip on the right; the field grows with the text up to 5 lines, then scrolls.
// 2) Photos: signed links live 1 hour, the app kept them forever, so after an hour thumbnails broke (the full photo got a
//    fresh link and opened). Now links older than 50 min are re-signed, old ones are refreshed every 5 min, and an image
//    that fails to load takes a new link.
// 3) Card top bar: instead of the pale «Journal» — a clear window type label in the window colour (journal entry, animal,
//    species, enclosure, drug card); the label and round buttons are white with a coloured outline.
// 4) «Now», treatment with several doses a day: after the first dose, «Undo» next to «Give» removes the last dose
//    given today (if the user may edit it: author or admin).

/* 1) comment field */
const cinFit = t => { t.style.height = '48px'; const h = Math.min(t.scrollHeight, 132); t.style.height = Math.max(48, h) + 'px'; t.classList.toggle('tall', t.scrollHeight > 132); };
document.addEventListener('input', e => { if (e.target.id === 'cin') cinFit(e.target); });
addEventListener('DOMContentLoaded', () => { const _renderU2 = render; render = function () { _renderU2(); const t = document.getElementById('cin'); if (t && t.value) cinFit(t); cardCat(); }; });

/* 2) photo links: refresh before they expire */
const URL_TTL = 50 * 60000, urlAt = new Map();
const _urlsSetU2 = urls.set.bind(urls); urls.set = (k, v) => { urlAt.set(k, Date.now()); return _urlsSetU2(k, v); };
const dropOldUrls = () => { const t = Date.now() - URL_TTL; for (const k of [...urls.keys()]) if (!(urlAt.get(k) > t)) urls.delete(k); };
const _ensureUrlsU2 = ensureUrls;
ensureUrls = function (paths) { dropOldUrls(); return _ensureUrlsU2(paths); };
setInterval(() => { const old = [...urls.keys()].filter(k => !(urlAt.get(k) > Date.now() - URL_TTL)); if (old.length) ensureUrls(old); }, 5 * 60000);
const phRetry = new Set();
document.addEventListener('error', e => {
  const img = e.target; if (!img || img.tagName !== 'IMG') return;
  const hit = [...urls.entries()].find(([, u]) => u === img.src), path = hit && hit[0]; if (!path || phRetry.has(path)) return;
  phRetry.add(path); urls.delete(path);
  ensureUrls([path]).then(() => { const u = urls.get(path); if (u) img.src = u; setTimeout(() => phRetry.delete(path), 60000); });
}, true);

/* 3) card top bar: window type label */
const CARD_CAT = {rcard: () => L('Wpis w dzienniku', 'Запись журнала', 'Journal entry'), card: () => L('Karta zwierzęcia', 'Карточка животного', 'Animal card'),
  scard: () => L('Karta gatunku', 'Карточка вида', 'Species card'), pcard: () => L('Karta woliery', 'Карточка вольера', 'Enclosure card'), dcard: () => L('Karta leku', 'Карточка лекарства', 'Drug card')};
function cardCat() {
  const f = CARD_CAT[st.scr]; if (!f) return;
  const s = document.querySelector('.topbar > span:not([style])'); if (s && !s.querySelector('.tbcat')) s.innerHTML = `<b class="tbcat">${esc(f())}</b>`;
}

/* 4) «Now»: undo the last dose of today */
const _taskHTMLU2 = taskHTML;
taskHTML = function (x) {
  let h = _taskHTMLU2(x); const r = x.rx; if (!r || x.act !== 'dose' || !canWrite()) return h;
  const today = D.rec.filter(d => d.k === 'tdose' && key(d.bird) === key(r.bird) && d.at > r.at && d.at >= today0() && (!r.f.drug || !d.f.drug || key(d.f.drug) === key(r.f.drug))).sort((a, b) => b.at - a.at);
  const last = today[0]; if (!last || !canEditRec(last)) return h;
  const btn = `<button class="bl-btn undodose" data-undorec="${last.id}" aria-label="${L('Cofnij ostatnie podanie', 'Отменить последнюю подачу', 'Undo last dose')}">${ic('back', 16)}<span>${L('Cofnij', 'Отменить', 'Undo')}</span></button>`;
  const i = h.indexOf(`<button class="bl-btn icon" data-tmenu="${r.id}"`); return i < 0 ? h : h.slice(0, i) + btn + h.slice(i);
};

document.head.insertAdjacentHTML('beforeend', '<style>'
  + '.cbar textarea{overflow-y:hidden;scrollbar-width:none;max-height:132px}.cbar textarea::-webkit-scrollbar{display:none}.cbar textarea.tall{overflow-y:auto}'
  + '.topbar .tbcat{display:inline-flex;align-items:center;min-height:40px;box-sizing:border-box;padding:0 16px;border-radius:999px;background:var(--card);border:1.5px solid color-mix(in srgb, var(--tint, var(--accent)) 60%, var(--line));color:var(--ink);font:800 16.5px/1 var(--font-display);letter-spacing:.01em;box-shadow:0 1px 3px color-mix(in srgb, var(--ink) 8%, transparent)}'
  + '.cardscr .topbar .bl-x{background:var(--card);border:1.5px solid color-mix(in srgb, var(--tint, var(--accent)) 60%, var(--line));box-shadow:0 1px 3px color-mix(in srgb, var(--ink) 8%, transparent)}'
  + '.acts .undodose{flex:none;display:inline-flex;align-items:center;gap:5px;min-height:42px;padding:0 12px;border-radius:12px;background:var(--soft);color:var(--ink-2);font:700 13px/1 var(--font-text);white-space:nowrap}'
  + '</style>');
