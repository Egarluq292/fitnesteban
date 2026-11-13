/* FITNESTEBAN service worker: funciona sin conexión.
   Al cambiar cualquier archivo de la app, sube el número de CACHE para que el móvil descargue la versión nueva. */
const CACHE = 'fitnesteban-5.1.1';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.webmanifest',
  './icons/logo-128.png',
  './icons/logo-512.png',
  './icons/marca.svg',
  './icons/marca-f.svg',
  './icons/favicon-48.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './home-entreno.webp',
  './blk-full.webp',
  './blk-ppt.webp',
  './blk-brazos.webp',
  './blk-pierna.webp',
  './blk-kb.webp',
  './blk-casa.webp',
  './blk-gen.webp',
  './blk-bloques.webp',
  './blk-hibrido.webp',
  './blk-retos.webp',
  './blk-primeros.webp',
  './blk-inferior.webp',
  './blk-gluteo.webp',
  './home-dieta.webp',
  './home-progreso.webp',
  './home-coach.webp'
];

self.addEventListener('install', event => {
  // cache: 'reload' obliga a descargar los archivos nuevos del servidor, sin usar copias viejas del navegador
  // Actualización automática: en cuanto la versión nueva está descargada entera, toma el control (la app se recarga en un momento seguro)
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('fitnesteban-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // la IA y enlaces externos van directos a la red
  if (url.pathname.endsWith('/privacidad.html') || url.pathname.endsWith('/sw.js') || url.pathname.endsWith('/acceso.txt') || url.pathname.endsWith('/bloques.json') || url.pathname.endsWith('/ejercicios.json') || url.pathname.endsWith('.mp4')) return;        // comprobar la versión publicada: siempre a la red

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(hit => hit || fetch(req))
    );
    return;
  }
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
