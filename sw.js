// Simpan dengan nama sw.js di folder yang sama dengan index.html
const CACHE_NAME = 'tasbih-mu-v1';
const assets = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11',
    'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});