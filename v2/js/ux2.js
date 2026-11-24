// ux2.js — v2: further small touches (continues ux.js; loads right after it).
// 1) Comment field: no scrollbar strip on the right; the field grows with the text up to 5 lines, then scrolls.

/* 1) comment field */
const cinFit = t => { t.style.height = '48px'; const h = Math.min(t.scrollHeight, 132); t.style.height = Math.max(48, h) + 'px'; t.classList.toggle('tall', t.scrollHeight > 132); };
document.addEventListener('input', e => { if (e.target.id === 'cin') cinFit(e.target); });
addEventListener('DOMContentLoaded', () => { const _renderU2 = render; render = function () { _renderU2(); const t = document.getElementById('cin'); if (t && t.value) cinFit(t); }; });

document.head.insertAdjacentHTML('beforeend', '<style>'
  + '.cbar textarea{overflow-y:hidden;scrollbar-width:none;max-height:132px}.cbar textarea::-webkit-scrollbar{display:none}.cbar textarea.tall{overflow-y:auto}'
  + '</style>');
