const CACHE_NAME = 'gymgenie-cache-v1'; 
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/js/app.js',
  '/js/ui.js',
  '/js/storage.js',
  '/js/food-db.js', // <-- Tambahan file baru
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/images/fitnes-btn.jpg', // <-- Tambahan file gambar
  
  // Aset dari luar (CDN)
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', // <-- Tambahan
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Event install: menyimpan file ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Memaksa aktivasi
  );
});

// Event fetch: menyajikan file dari cache jika tersedia
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// Event activate: menghapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('gymgenie-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim()) // Mengambil kontrol halaman
  );
});