// Offline shell for the bird department log.
// Pages and scripts come from the network first, so updates show at once;
// the cached copy is used only when there is no connection.
// 'no-cache' asks the server every time (a cheap 304 when nothing changed),
// otherwise the browser keeps GitHub Pages files for up to 10 minutes after a release.
const CACHE = 'zoo-log-v4';
const SHELL = ['./', 'index.html', 'desktop.css', 'i18n.js', 'i18n-species.js', 'pwa.js', 'js/texts.js', 'js/screens.js', 'js/core.js', 'js/data.js', 'js/photos.js', 'js/render.js', 'js/changelog.js', 'js/calendar.js', 'js/ui.js', 'js/server.js', 'js/forms.js', 'js/places.js', 'js/locks.js', 'js/gaps.js', 'js/species-form.js', 'js/users.js', 'js/clicks.js', 'js/pick.js', 'js/gate.js', 'js/start.js', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req, {cache: 'no-cache'}).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
