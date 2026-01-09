const CACHE_NAME = 'tasbih-mu-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

// Install: Simpan aset dasar saja agar tidak berat
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Aktivasi: Hapus cache lama jika versi berubah
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

// Fetch: Strategi Network First (Coba internet dulu, kalau gagal baru cache)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});