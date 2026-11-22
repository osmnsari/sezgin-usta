/* Sezgin Usta – çevrimdışı çalışma için önbellek.
   Her güncellemede SURUM numarasını bir artır. */
const SURUM = 'sezgin-usta-v1';
const DOSYALAR = ['./', './index.html', './style.css', './app.js', './nlu.js', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SURUM).then((c) => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SURUM).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Önce internetten taze sürümü dene (en fazla 3 sn), olmazsa kayıtlı kopyayı aç.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(SURUM);
    const ag = fetch(req, { cache: 'no-cache' }).then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    });
    const zaman = new Promise((resolve) => setTimeout(resolve, 3000, null));
    try {
      const res = await Promise.race([ag, zaman]);
      if (res) return res;
    } catch (err) { /* internet yok */ }
    const kayitli = await cache.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await cache.match('./index.html') : null);
    if (kayitli) return kayitli;
    return ag;
  })());
});
