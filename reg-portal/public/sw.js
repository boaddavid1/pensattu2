// PENSA TTU Registration Portal — Service Worker
// Cache-busting & safe caching strategy:
// Never cache HTML or JS bundles so new deployments always load immediately.

const CACHE_NAME = 'pensa-reg-v3';

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
    event.respondWith(fetch(request));
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
