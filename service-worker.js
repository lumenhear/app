const CACHE_NAME = 'lumen-pwa-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.webmanifest',
    '/assets/logo.svg',
    '/assets/icon-speech.svg',
    '/assets/icon-hearing.svg',
    '/assets/icon-progress.svg',
    '/assets/icon-appointments.svg',
    '/assets/icon-videos.svg',
    '/assets/icon-192x192.png',
    '/assets/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
];

// Install event: opens the cache and adds the core files to it.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event: serves assets from the cache first.
// If the request is not in the cache, it gets it from the network,
// caches it, and then returns it.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request because it's a stream and can only be consumed once.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response because we need to put it in the cache and also return it.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Activate event: cleans up old caches.
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
