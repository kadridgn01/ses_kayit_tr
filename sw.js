const CACHE_NAME = 'giorgi-app-v1'; // Cache adını güncelledim
const URLS_TO_CACHE = [
    'index.html',
    'loading.html',
    'app.html',
    'manifest.webmanifest'
];

// 1. Install (Yükleme)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache açıldı');
                return cache.addAll(URLS_TO_CACHE);
            })
            .catch(err => {
                console.error('Cache ekleme hatası:', err);
            })
    );
    self.skipWaiting();
});

// 2. Fetch (Ağ İsteklerini Yönetme)
self.addEventListener('fetch', event => {
    // CDN ve Placeholder isteklerini her zaman ağdan al
    if (event.request.url.startsWith('https://cdn.tailwindcss.com') || event.request.url.startsWith('https://placehold.co')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Diğer her şey için 'cache-first'
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
            .catch(err => {
                console.error('Fetch hatası:', err);
            })
    );
});

// 3. Activate (Eski Cache'leri Temizleme)
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
    return self.clients.claim();
});
