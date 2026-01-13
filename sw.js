const CACHE_NAME = "tasbih-mu-v6"; // Naikkan versi ke v6
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./audio.mp3", // Pastikan file ini ada di root folder
  "https://cdn.jsdelivr.net/npm/sweetalert2@11",
  "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Amiri:wght@700&display=swap",
];

// 1. Install: Simpan aset ke Cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Menggunakan addAll untuk memastikan semua file penting tersimpan
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate: Bersihkan cache lama
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

// 3. Fetch Strategy: Cache First untuk Audio, sisanya Network First
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // KHUSUS AUDIO: Gunakan Cache First
  // Media di PWA sering bermasalah jika menggunakan Network First saat offline
  if (url.pathname.endsWith('audio.mp3')) {
    event.respondWith(
      caches.match("./audio.mp3").then((response) => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // DEFAULT: Network First, fallback ke Cache
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) return response;

          // Fallback navigasi ke index.html jika offline
          if (event.request.mode === 'navigate') {
            return caches.match("./index.html");
          }
        });
      })
  );
});

// 4. Logika Pengingat (Reminder)
let reminderTimer = null;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SET_REMINDER") {
    const targetTime = event.data.time; // Format "HH:mm"

    if (reminderTimer) clearInterval(reminderTimer);

    reminderTimer = setInterval(() => {
      const now = new Date();
      const current = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      // Hanya tampilkan notifikasi jika waktu saat ini sama dengan target
      if (current === targetTime) {
        self.registration.showNotification("Waktunya Dzikir! 📿", {
          body: "Mari sejenak mengingat Allah agar hati menjadi tenang.",
          icon: "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
          badge: "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
          tag: "dzikir-notif",
          renotify: true,
          vibrate: [500, 110, 500, 110, 450],
          requireInteraction: true,
          data: { url: "./index.html" },
        });
      }
    }, 60000); // Cek setiap menit
  }
});

// 5. Handling Klik Notifikasi
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Jika aplikasi sudah terbuka, fokuskan
      for (const client of clientList) {
        if (client.url.includes("index.html") && "focus" in client) {
          return client.focus();
        }
      }
      // Jika belum terbuka, buka jendela baru
      if (clients.openWindow) return clients.openWindow("./index.html");
    })
  );
});