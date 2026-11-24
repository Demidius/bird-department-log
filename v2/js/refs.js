// refs.js — v2: sources of a species card. species.info.sources = [{t: title, url}] (the number is the position, from 1);
// texts of the card carry markers «(1)», «(2)» — they become small number buttons that scroll to that source and highlight it.
// The «Sources» section is at the very bottom of the card; each source opens its page (↗).
const SRC_ARROW = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>`;
const srcHost = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (x) { return ''; } };
const _speciesCardR = speciesCard;
speciesCard = function () {
  let h = _speciesCardR(); const s = spBy(st.sp); if (!s) return h;
  const src = (Array.isArray(spInfo(s).sources) ? spInfo(s).sources : []).filter(x => x && (x.t || x.url)); if (!src.length) return h;
  const refs = t => t.replace(/\((\d{1,2})\)/g, (m, n) => +n >= 1 && +n <= src.length ? `<button class="ref" data-ref="${n}" aria-label="${L('Źródło', 'Источник', 'Source')} ${n}">${n}</button>` : m);
  h = h.replace(/(<div class="accb">)([\s\S]*?)(<\/div>)/g, (m, a, b, c) => a + refs(b) + c)
       .replace(/(<dl class="ffacts">[\s\S]*?<\/dl>)/, m => m.replace(/(<dd>)([\s\S]*?)(<\/dd>)/g, (x, a, b, c) => a + refs(b) + c));
  const url = x => /^https?:\/\//.test(x.url || '') ? x.url : '';
  const list = `<div class="sec"><span>${L('Źródła', 'Источники', 'Sources')}</span><span>${src.length}</span></div><ol class="srcl">${src.map((x, i) => `<li id="src-${i + 1}"><span class="sn">${i + 1}</span><span class="st">${esc(x.t || srcHost(x.url))}${url(x) ? `<small>${esc(srcHost(x.url))}</small>` : ''}</span>${url(x) ? `<a href="${esc(url(x))}" target="_blank" rel="noopener" aria-label="${L('Otwórz', 'Открыть', 'Open')}">${SRC_ARROW}</a>` : ''}</li>`).join('')}</ol>`;
  const i = h.lastIndexOf('\n  </div>'); // end of the scrolling part
  return i < 0 ? h : h.slice(0, i) + list + h.slice(i);
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ref]'); if (!b) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const el = document.getElementById('src-' + b.dataset.ref); if (!el) return;
  el.scrollIntoView({behavior: 'smooth', block: 'center'}); el.classList.add('hi'); setTimeout(() => el.classList.remove('hi'), 1800);
}, true);
document.head.insertAdjacentHTML('beforeend', '<style>.ref{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;margin:0 1px;padding:0 5px;border:0;border-radius:999px;background:color-mix(in srgb, var(--accent) 16%, transparent);color:var(--accent);font:700 11.5px/1 var(--font-text);vertical-align:2px;cursor:pointer}'
  + '.srcl{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}.srcl li{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:14px;background:var(--card);border:1px solid var(--frame, var(--line));transition:box-shadow .3s, background .3s}'
  + '.srcl li.hi{box-shadow:0 0 0 3px color-mix(in srgb, var(--accent) 45%, transparent);background:color-mix(in srgb, var(--accent) 8%, var(--card))}'
  + '.srcl .sn{flex:none;min-width:24px;height:24px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb, var(--accent) 16%, transparent);color:var(--accent);font:800 12px/1 var(--font-text)}'
  + '.srcl .st{flex:1;min-width:0;font:600 13.5px/1.35 var(--font-text);color:var(--ink)}.srcl .st small{display:block;font-weight:500;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
  + '.srcl a{flex:none;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;background:color-mix(in srgb, var(--accent) 14%, transparent);color:var(--accent)}</style>');
