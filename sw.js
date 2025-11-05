const CACHE_NAME = 'giorgi-app-v6'; // Sürümü v4'ten v5'e yükselttim
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
                // Önbelleğe alırken ağdan taze kopyaları al
                const cachePromises = URLS_TO_CACHE.map(url => {
                    return fetch(new Request(url, {cache: 'reload'}))
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Dosya yüklenemedi: ${url}`);
                            }
                            return cache.put(url, response);
                        });
                });
                return Promise.all(cachePromises);
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
                return response || fetch(event.request).then(fetchResponse => {
                    // Bulduğun yeni şeyi de cache'e at
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                });
            })
            .catch(err => {
                console.error('Fetch hatası:', err);
            })
    );
});

// 3. Activate (Eski Cache'leri Temizleme)
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME]; // Sadece v5'i tut
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Eğer cache adı v5 değilse, SİL
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});
