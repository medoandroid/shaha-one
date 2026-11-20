// DevMeDoAnDrOiD
// SHAHA ONE | شها ون — Progressive Web App Service Worker
const CACHE_NAME = 'shaha-one-v7';
const IMAGE_CACHE = 'shaha-one-images-v1';
const PUBLIC_API_CACHE = 'shaha-one-public-api-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './brand-icon.svg'
];

const PUBLIC_CACHEABLE_API_PATHS = [
  '/api/site-texts',
  '/api/community-pages',
  '/api/firebase-config'
];

// Install: Cache essential app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  const validCaches = new Set([CACHE_NAME, IMAGE_CACHE, PUBLIC_API_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!validCaches.has(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

function fetchWithFastFallback(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('Navigation timeout'));
      }
    }, timeoutMs);

    fetch(request)
      .then((res) => {
        clearTimeout(timer);
        if (!settled) {
          settled = true;
          resolve(res);
        }
      })
      .catch((err) => {
        clearTimeout(timer);
        if (!settled) {
          settled = true;
          reject(err);
        }
      });
  });
}

// Fetch: Fast network-first with 2.5s timeout for navigation, SWR for public read APIs and assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Stale-While-Revalidate for public read-only Worker config/content endpoints
  if (PUBLIC_CACHEABLE_API_PATHS.includes(url.pathname)) {
    event.respondWith(
      caches.open(PUBLIC_API_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkPromise = fetch(request)
            .then((res) => {
              if (res && res.status === 200) {
                cache.put(request, res.clone());
              }
              return res;
            })
            .catch(() => cached);
          return cached || networkPromise;
        })
      )
    );
    return;
  }

  // Authenticated APIs, Firestore, Google APIs and websockets always bypass the cache.
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('identitytoolkit') ||
    url.hostname.includes('googleapis.com')
  ) {
    return;
  }

  // HTML Navigation: Network first with 2.5s fast fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetchWithFastFallback(request, 2500)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Images: Cache-first for instant repeat loads
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            if (res && (res.status === 200 || res.type === 'opaque')) {
              cache.put(request, res.clone());
            }
            return res;
          });
        })
      )
    );
    return;
  }

  // Static Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
