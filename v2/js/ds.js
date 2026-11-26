/* @ds-bundle: {"format":4,"namespace":"BirdLog","components":[]} */
(function () {
  var P = {
    cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
    pill: '<rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-35 12 12.5)"/><path d="m9.5 8.5 5 7"/>',
    syringe: '<path d="m18 2 4 4M17 7l-9 9-3 1 1-3 9-9M14 4l6 6M7 13l4 4"/>',
    scale: '<path d="M4 20h16l-2-12H6z"/><circle cx="12" cy="5" r="2"/><path d="M12 11v4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
    egg: '<path d="M12 3c3.5 0 7 5.5 7 10a7 7 0 0 1-14 0c0-4.5 3.5-10 7-10z"/>',
    nest: '<path d="M3 13h18a9 6 0 0 1-18 0z"/><path d="M9 13a3 3 0 0 1 6 0"/>',
    swap: '<path d="M7 7h13l-4-4M17 17H4l4 4"/>',
    bowl: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    home: '<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    now: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    clipboard: '<path d="M9 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3"/><rect x="9" y="2" width="6" height="5" rx="1"/><path d="M8 12h8m-8 5h8"/>',
    bird: '<path d="M16 7h.01M3.5 18A8 8 0 0 0 20 12V7l2-2h-5a4 4 0 0 0-4 4v2L3.5 18z"/><path d="M7 18v3M11 17v4"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    book: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="m9 5 7 7-7 7"/>',
    cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'
  };
  function icon(name, size, stroke) {
    size = size || 20; stroke = stroke || 2;
    return '<svg class="bl-ico" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + stroke +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  }
  /* replace every [data-ic="name"] (data-s = size, data-w = stroke) with its svg */
  function paint(root) {
    var els = (root || document).querySelectorAll('[data-ic]');
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      e.innerHTML = icon(e.getAttribute('data-ic'), +e.getAttribute('data-s') || 20, +e.getAttribute('data-w') || 2);
    }
  }
  /* record groups and types, fixed order (README: Путь записи) */
  var GROUPS = [
    {id: 'health', icon: 'cross', types: ['injury', 'tstart', 'tdose', 'proc']},
    {id: 'obs', icon: 'eye', types: ['obs', 'watch', 'score']},
    {id: 'breed', icon: 'egg', types: ['mate', 'lay', 'incub', 'hatch', 'fledge', 'birth']},
    {id: 'keep', icon: 'swap', types: ['expo', 'diet', 'env', 'enr', 'leave', 'arrive']},
    {id: 'dept', icon: 'building', types: ['house', 'rat', 'other']}
  ];
  window.BirdLog = window.BirdLog || {};
  window.BirdLog.icons = P;
  window.BirdLog.icon = icon;
  window.BirdLog.paint = paint;
  window.BirdLog.groups = GROUPS;
})();
