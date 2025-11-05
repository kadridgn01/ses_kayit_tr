const CACHE_NAME = 'ses-kayitlari-v2';
const URLS_TO_CACHE = [
    'index.html',
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
// Çevrimdışı-öncelikli (Offline-first) strateji
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache'de varsa, cache'den döndür
                if (response) {
                    return response;
                }
                // Cache'de yoksa, ağdan talep et
                return fetch(event.request);
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
