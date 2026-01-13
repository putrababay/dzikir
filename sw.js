const CACHE_NAME = "tasbih-mu-v5"; // Naikkan versi
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./audio.mp3",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11",
  "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Amiri:wght@700&display=swap",
];

// 1. Install: Simpan aset ke Cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate: Hapus cache lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Ini lebih aman agar konten terbaru tetap muncul jika ada sinyal
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Jika request adalah navigasi halaman, kembalikan index.html
          if (event.request.mode === 'navigate') {
            return caches.match("./index.html");
          }
        });
      })
  );
});

// 4. Logika Notifikasi yang Lebih Tangguh
let reminderTimer = null;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SET_REMINDER") {
    const targetTime = event.data.time;
    if (reminderTimer) clearInterval(reminderTimer);

    // Interval di dalam SW agar tetap berjalan di latar belakang
    reminderTimer = setInterval(() => {
      const now = new Date();
      const current = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      self.registration.showNotification("Waktunya Dzikir! 📿", {
        body: "Mari sejenak mengingat Allah agar hati menjadi tenang.",
        icon: "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
        badge: "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
        tag: "dzikir-notif",
        renotify: true,
        vibrate: [
          500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110,
          170, 40,
        ], // Pola getar lebih kuat
        silent: false, // Pastikan tidak silent
        requireInteraction: true, // Notifikasi tetap ada sampai diklik atau di-swipe
        data: { url: "./" },
      });
    }, 60000); // Cek setiap menit
  }
});

// Buka aplikasi saat notifikasi diklik
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("index.html") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow("./index.html");
    })
  );
});