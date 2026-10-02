// PENSA TTU SEC — Service Worker
// Safe caching strategy:
// Never cache HTML or JS bundles so new deployments always load immediately.
// For SPA navigations, let Vercel handle routing or fallback to /index.html if offline.

const CACHE_NAME = 'pensa-sec-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never cache API calls, navigation/HTML, or JS/CSS bundles
  if (
    request.url.includes('/api/') ||
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.url.endsWith('.html') ||
    request.url.endsWith('.js') ||
    request.url.endsWith('.css')
  ) {
    event.respondWith(
      fetch(request).catch(() => {
        // Offline fallback for navigation requests in SPA
        if (request.mode === 'navigate' || request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
    );
    return;
  }

  // Only cache images / icons / manifest for fast offline icon loading
  if (
    request.destination === 'image' ||
    request.url.match(/\.(png|svg|ico|jpg|jpeg|webp)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(fetch(request));
});
