/* Sezgin Usta – internetsiz çalışma ve güvenli güncelleme.
   Bir dosyayı değiştirip GitHub'a yüklediğinde SURUM'u bir artır (v3 → v4).
   Yeni sürüm ancak TÜM dosyalar sorunsuz indirilirse devreye girer;
   bir dosya eksik ya da bozuksa eski sürüm çalışmaya devam eder. */
const SURUM = 'sezgin-usta-v3';
const DOSYALAR = ['./', './index.html', './style.css', './app.js', './nlu.js', './manifest.webmanifest',
  './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SURUM)
      .then((c) => c.addAll(DOSYALAR.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SURUM).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Hep aynı sürümün dosyalarını ver (karışık sürüm olmasın); önbellekte yoksa internetten al.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(SURUM);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const page = await cache.match('./index.html') || await cache.match('./');
      if (page) return page;
    }
    return fetch(req);
  })());
});
