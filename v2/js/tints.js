// tints.js — v2: a soft colour per kind of window, to find your way at a glance:
// animals (list + card) — light orange, species — sage, enclosures — grey, a record card — blue. Now / Journal / Calendar / More stay neutral.
// Cards: section titles bigger and darker with a line in the window colour; frames a bit brighter (mixed with the theme line, so dark theme stays dark).
const WIN_TINT = {card: 'an', animals: 'an', scard: 'sp', species: 'sp', pcard: 'pl', places: 'pl', rcard: 'rec'};
const markTint = () => { const el = document.getElementById('app'); if (!el) return; const w = WIN_TINT[st.scr]; if (w) el.dataset.wt = w; else delete el.dataset.wt; };
addEventListener('DOMContentLoaded', () => { const _renderT = render; render = function () { _renderT(); markTint(); }; });
document.head.insertAdjacentHTML('beforeend', '<style>'
  + '#app[data-wt=an]{--tint:#f2b77a}#app[data-wt=sp]{--tint:#6fae8a}#app[data-wt=pl]{--tint:#97a19d}#app[data-wt=rec]{--tint:#79a6d2}'
  + '#app[data-wt] .app{background:color-mix(in srgb, var(--tint) 13%, var(--bg));--accent:color-mix(in srgb, var(--tint) 78%, var(--ink))}'
  + '#app[data-wt] .topbar,#app[data-wt] .hd{background:color-mix(in srgb, var(--tint) 24%, var(--bg));border-bottom:1px solid color-mix(in srgb, var(--tint) 35%, var(--line))}'
  + '#app[data-wt] .topbar>span:not([style]){color:color-mix(in srgb, var(--tint) 70%, var(--ink));font-weight:800}'
  + '#app[data-wt] .bl-nav{background:color-mix(in srgb, var(--tint) 13%, var(--bg))}'
  + '.cardscr{--frame:color-mix(in srgb, var(--tint, #6fae8a) 45%, var(--line))}'
  + '.cardscr .sec{align-items:flex-end;margin:24px 2px 10px;padding:0 0 7px;border-bottom:2px solid var(--frame);font:800 15px/1.2 var(--font-display);letter-spacing:.03em;color:var(--ink)}'
  + '.cardscr .sec>span:last-child:not(:has(button)):not(:empty){font:700 12px/1 var(--font-text);letter-spacing:0;color:var(--accent);background:color-mix(in srgb, var(--accent) 13%, transparent);padding:4px 9px;border-radius:999px}'
  + '.cardscr :is(.bl-facts div,.note,.deptbox,.bl-rec,.bl-task,.bl-who.flat2){border:1px solid var(--frame)}'
  + '.cardscr .notebox{border-color:color-mix(in srgb, var(--tint, #6fae8a) 55%, var(--ctl-line))}'
  + '</style>');
