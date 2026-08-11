const CACHE_NAME = 'ewa-logistics-v1';

// Core assets to cache immediately upon installation
const urlsToCache = [
  '/',
  '/login',
  '/signup',
  '/materials',
  '/logo.png',
  '/manifest.json'
];

// ✅ Install event: Cache the core resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.warn('⚠️ Cache installation failed:', err);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// ✅ Fetch event: Serve from cache, fallback to network, and cache new successful responses
self.addEventListener('fetch', (event) => {
  // 🛡️ CRITICAL: Only intercept and cache GET requests. Ignore POST/PUT/DELETE (e.g., logins, checkouts).
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the cached response
        if (response) {
          return response;
        }

        // Cache miss - fetch from network
        return fetch(event.request).then((networkResponse) => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Clone the response because it's a stream and can only be consumed once
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            // Dynamically cache the new successful response for future visits
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      })
      .catch((err) => {
        console.error('❌ Fetch failed (possibly offline):', err);
        // Optional: You could return a custom offline HTML page here in the future
        // return caches.match('/offline.html');
      })
  );
});

// ✅ Activate event: Clean up old caches to save user storage space
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim clients to ensure the updated service worker takes control immediately
      return self.clients.claim();
    })
  );
});