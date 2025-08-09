// Ganti nama cache ke v2 untuk memicu instalasi ulang
const CACHE_NAME = 'fitdiary-cache-v2'; 

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json', // <-- TAMBAHKAN INI
  '/js/app.js',     // <-- PASTIKAN PATH INI BENAR
  '/js/ui.js',
  '/js/storage.js',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  
  // Aset dari luar (CDN) juga harus di-cache
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap', // <-- TAMBAHKAN INI
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Event install: menyimpan file ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache dibuka, file-file akan ditambahkan');
        return cache.addAll(URLS_TO_CACHE);
      })
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
          return cacheName.startsWith('fitdiary-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});