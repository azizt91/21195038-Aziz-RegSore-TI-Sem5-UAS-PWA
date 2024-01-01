const cacheName = 'profile-aziz-v3';

const filesToCache = [
  '/',
  '/index.html',
  '/page1.html',
  '/page2.html',
  '/page3.html',
  '/service-worker.js',
  '/indexeddb.js',
  '/app.js',
  '/manifest.json',
  '/styles.css',
  '/img/icon-72x72.png',
  '/img/icon-96x96.png',
  '/img/icon-128x128.png',
  '/img/icon-144x144.png',
  '/img/icon-152x152.png',
  '/img/icon-192x192.png',
  '/img/icon-384x384.png',
  '/img/icon-512x512.png',
  '/img/happy.png',
  '/img/sad.png',
  '/img/profile.jpg',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.3/font/bootstrap-icons.css',
];

self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(cacheName)
        .then(cache => cache.addAll(filesToCache))
    );
  });
  
  self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(existingCacheName => {
            if (existingCacheName !== cacheName) {
              return caches.delete(existingCacheName);
            }
          })
        );
      })
    );
  });

  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  });

// Fetching sumber daya dari cache atau jaringan
// self.addEventListener('fetch', evt => {
//     evt.respondWith(
//         caches.match(evt.request).then(cacheRes => {
//             // Menggunakan sumber daya dari cache jika ada
//             return cacheRes || fetch(evt.request);
//         })
//     );
// });

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(response) {
//         // Data berhasil diambil dari jaringan, cache data tersebut
//         if (response.status === 200) {
//           const responseClone = response.clone();
//           caches.open('my-cache').then(function(cache) {
//             cache.put(event.request, responseClone);
//           });
//         }
//         return response;
//       })
//       .catch(function() {
//         // Jika gagal mengambil data dari jaringan, coba ambil dari cache
//         return caches.match(event.request);
//  })
// );
// });