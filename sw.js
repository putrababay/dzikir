const CACHE_NAME = 'tasbih-mu-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11'
];

// Install: Simpan aset ke memori HP
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate: Hapus cache lama jika ada update
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

// Fetch: Logika agar bisa dibuka Offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Balas dengan cache jika ada, jika tidak ambil dari network
            return cachedResponse || fetch(event.request).catch(() => {
                // Jika offline dan aset tidak ada di cache, berikan respon kosong agar tidak ERR_FAILED
                return new Response('Offline content not available');
            });
        })
    );
});