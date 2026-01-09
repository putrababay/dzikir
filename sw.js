const CACHE_NAME = 'tasbih-mu-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

// 1. Install & Cache (Sama dengan kode Anda)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. Aktivasi (Sama dengan kode Anda)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim(); // Tambahan agar SW langsung mengontrol halaman
});

// 3. Logika Notifikasi Latar Belakang (TAMBAHKAN INI)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SET_REMINDER') {
        const reminderTime = event.data.time;
        console.log("Pengingat dijadwalkan di Latar Belakang: " + reminderTime);
        startReminderTimer(reminderTime);
    }
});

// Di dalam sw.js
function startReminderTimer(targetTime) {
    setInterval(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (currentTime === targetTime) {
            // PENTING: Gunakan self.registration agar muncul meski aplikasi tertutup
            self.registration.showNotification("Waktunya Dzikir! 📿", {
                body: "Mari luangkan waktu sejenak untuk mengingat Allah.",
                icon: "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
                badge: "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
                tag: 'dzikir-reminder',
                renotify: true,
                requireInteraction: true, // Notifikasi tetap ada sampai diklik
                vibrate: [200, 100, 200]
            });
        }
    }, 60000);
}

// 4. Fetch Strategy (Sama dengan kode Anda)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});