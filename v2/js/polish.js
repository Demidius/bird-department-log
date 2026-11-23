// polish.js — v2: small interface touches.
// Journal: the species name in the second line is coloured; the kind icon is 1.5× bigger.
// Add flow: a bottom bar with a full-width «Back» button (same step as the arrow on top; no step back — closes); the sheet reaches the bottom.
// «Discard changes?» after the add form: buttons «Back» and «Close».
const _recHTMLP = recHTML;
recHTML = function (r) {
  const h = _recHTMLP(r), a = r.k === 'dept' || r.f.place ? null : anByName(r.bird); if (!a) return h;
  const t = esc(anTitle(a)); return t ? h.replace('<span>' + t, '<span><em class="spn">' + t + '</em>') : h;
};
const _addSheetP = addSheet;
addSheet = function () {
  const h = _addSheetP(); if (!h || h.indexOf('bl-sheet') < 0) return h;
  const m = h.match(/<button class="bl-x" data-step="([^"]*)"/), attr = m ? `data-step="${m[1]}"` : 'data-close="add"';
  const bar = `<div class="shfoot"><button class="shback" ${attr}>${ic('back', 18)}<span>${L('Wstecz', 'Назад', 'Back')}</span></button></div>`;
  const i = h.lastIndexOf('</div>'); return h.slice(0, i) + bar + h.slice(i);
};
addEventListener('DOMContentLoaded', () => { // confirmBox comes from main.js, which loads last
  const _confirmBoxP = confirmBox;
  confirmBox = function () {
    const h = _confirmBoxP(); if (st.cf !== 'add') return h;
    return h.replace(`data-cf="no">${L('Wróć do formularza', 'Продолжить заполнение', 'Back to the form')}<`, `data-cf="no">${L('Wróć', 'Вернуться', 'Back')}<`)
      .replace(`data-cf="yes">${L('Odrzuć', 'Отменить', 'Discard')}<`, `data-cf="yes">${L('Zamknij', 'Закрыть', 'Close')}<`);
  };
});
document.head.insertAdjacentHTML('beforeend', '<style>.bl-rec .spn{font-style:normal;font-weight:600;color:var(--accent)}.bl-rec .bl-badge.phb>.kb{width:33px;height:33px;right:-9px;bottom:-9px}.bl-rec .bl-badge.phb>.kb svg{width:20px;height:20px}.bl-rec>.bl-badge:not(.phb) svg{width:24px;height:24px}.bl-sheet.full{max-height:none}.bl-sheet:has(.shfoot){padding-bottom:0}.bl-sheet .shfoot{flex:none;display:flex;margin:0 -14px;padding:8px 14px calc(14px + env(safe-area-inset-bottom));border-top:1px solid var(--line);background:var(--bg)}.bl-sheet .shfoot .shback{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;min-height:50px;border:0;border-radius:14px;background:var(--soft);color:var(--ink);font:700 15px/1 var(--font-text);cursor:pointer}.bl-sheet .shfoot .shback svg{width:20px;height:20px}</style>');
