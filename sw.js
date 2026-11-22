// Géoloc DFCI – cache hors ligne
const C = 'geoloc-dfci-v2';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-180.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];
const TILES = 'geoloc-dfci-tuiles';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== C && n !== TILES).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = e.request.url;
  if (e.request.method !== 'GET') return;
  // Tuiles de carte : réseau d'abord, garde les dernières consultées pour le hors ligne
  if (u.includes('data.geopf.fr') || u.includes('tile.openstreetmap.org')) {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(TILES).then(c => c.put(e.request, cp).then(() => trim(c))); return r; })
      .catch(() => caches.match(e.request)));
    return;
  }
  // Appli : réseau d'abord (mises à jour), cache si hors ligne
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
async function trim(c) { const k = await c.keys(); for (let i = 0; i < k.length - 3000; i++) await c.delete(k[i]); }

