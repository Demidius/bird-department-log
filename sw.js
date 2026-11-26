// Offline shell for the bird department log.
// Pages and scripts come from the network first, so updates show at once;
// the cached copy is used only when there is no connection.
// 'no-cache' asks the server every time (a cheap 304 when nothing changed),
// otherwise the browser keeps GitHub Pages files for up to 10 minutes after a release.
const CACHE = 'zoo-log-v35';
const SHELL = ['./', 'index.html', 'v2/', 'v2/index.html', 'v2/app.css', 'v2/js/ds.js', 'v2/js/base.js', 'v2/js/model.js', 'v2/js/views.js', 'v2/js/forms.js', 'v2/js/breed.js', 'v2/js/temp.js', 'v2/js/weather.js', 'v2/js/groups.js', 'v2/js/avatars.js', 'v2/js/dept.js', 'v2/js/picker.js', 'v2/js/polish.js', 'v2/js/schedule.js', 'v2/js/tints.js', 'v2/js/links.js', 'v2/js/refs.js', 'v2/js/drugs.js', 'v2/js/ux.js', 'v2/js/ux2.js', 'v2/js/pc.js', 'v2/js/ux3.js', 'v2/js/sync.js', 'v2/js/main.js', 'manifest.webmanifest', 'icon.svg'];

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
  }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || (req.mode === 'navigate' ? caches.match('v2/index.html') : Response.error()))));
});
