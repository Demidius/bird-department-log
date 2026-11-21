// Install the log as an app on the phone or computer
Object.assign(DICT.ru, {inst_t: 'Установить на телефон', inst_p: 'Журнал откроется как обычное приложение — с иконкой на экране и без строки браузера.', inst_b: 'Установить приложение',
  inst_ios: 'На iPhone: откройте сайт в Safari, нажмите «Поделиться» (квадрат со стрелкой) и выберите «На экран „Домой“».',
  inst_other: 'Откройте меню браузера (⋮) и выберите «Установить приложение» или «Добавить на главный экран».', inst_done: 'Приложение установлено'});
Object.assign(DICT.pl, {inst_t: 'Zainstaluj na telefonie', inst_p: 'Dziennik otworzy się jak zwykła aplikacja — z ikoną na ekranie i bez paska przeglądarki.', inst_b: 'Zainstaluj aplikację',
  inst_ios: 'Na iPhonie: otwórz stronę w Safari, naciśnij „Udostępnij” (kwadrat ze strzałką) i wybierz „Do ekranu początkowego”.',
  inst_other: 'Otwórz menu przeglądarki (⋮) i wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.', inst_done: 'Aplikacja zainstalowana'});
Object.assign(DICT.en, {inst_t: 'Install on your phone', inst_p: 'The log opens like a normal app — with an icon on the home screen and no browser bar.', inst_b: 'Install the app',
  inst_ios: 'On iPhone: open the site in Safari, tap “Share” (square with an arrow) and choose “Add to Home Screen”.',
  inst_other: 'Open the browser menu (⋮) and choose “Install app” or “Add to Home screen”.', inst_done: 'App installed'});
(function () {
  const $ = s => document.querySelector(s);
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferred = null;
  function show() {
    const card = $('#install-card');
    if (!card) return;
    card.hidden = standalone();
    $('#inst-btn').hidden = !deferred;
    $('#inst-ios').hidden = !!deferred || !ios;
    $('#inst-other').hidden = !!deferred || ios;
  }
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; show(); });
  addEventListener('appinstalled', () => { deferred = null; const c = $('#install-card'); if (c) c.hidden = true; });
  document.addEventListener('click', async e => {
    if (!e.target.closest('#inst-btn') || !deferred) return;
    const p = deferred; deferred = null;
    await p.prompt();
    try { await p.userChoice; } catch (x) {}
    show();
  });
  show();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
