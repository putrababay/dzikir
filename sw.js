const CACHE_NAME = 'tasbih-mu-v2'; // Naikkan versi cache
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn-icons-png.flaticon.com/512/5113/5113795.png'
];

// 1. Install & Cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. Aktivasi & Pembersihan Cache Lama
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// 3. Logika Notifikasi Latar Belakang
let reminderInterval = null;

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SET_REMINDER') {
        const reminderTime = event.data.time;

        // Bersihkan interval sebelumnya jika user mengganti jam
        if (reminderInterval) clearInterval(reminderInterval);

        console.log("Jadwal Baru: " + reminderTime);
        startReminderTimer(reminderTime);
    }
});

function startReminderTimer(targetTime) {
    reminderInterval = setInterval(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (currentTime === targetTime) {
            // Cek apakah notifikasi sudah muncul di menit yang sama agar tidak spam
            self.registration.showNotification("Waktunya Dzikir! 📿", {
                body: "Mari luangkan waktu sejenak untuk mengingat Allah.",
                icon: "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
                badge: "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
                tag: 'dzikir-reminder-active', // Tag tetap agar tidak tumpuk
                renotify: false, // Jangan bunyi ulang di menit yang sama
                requireInteraction: true,
                vibrate: [200, 100, 200],
                data: { url: './' } // Data untuk dibuka saat diklik
            });
        }
    }, 30000); // Cek setiap 30 detik agar lebih akurat
}

// 4. Logika Saat Notifikasi Diklik
self.addEventListener('notificationclick', event => {
    event.notification.close(); // Tutup notifikasi
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Jika aplikasi sudah terbuka, fokuskan. Jika belum, buka baru.
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});

// 5. Fetch Strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});