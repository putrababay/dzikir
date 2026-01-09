const CACHE_NAME = "tasbih-mu-v3"; // Naikkan versi ke v3
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11",
  "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Amiri:wght@700&display=swap",
  "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
];

// 1. Install: Simpan aset ke Cache Storage
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching aset utama...");
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
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Strategy: Cache First (PENTING UNTUK OFFLINE)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        // Balas dengan cache jika ada, jika tidak ambil dari network
        return (
          cachedResponse ||
          fetch(event.request).then((response) => {
            // Opsional: Simpan file baru yang ditemukan ke cache secara otomatis
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
        );
      })
      .catch(() => {
        // Jika benar-benar offline dan aset tidak ada di cache
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      })
  );
});

// 4. Logika Notifikasi (Tetap dipertahankan)
let reminderInterval = null;
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SET_REMINDER") {
    if (reminderInterval) clearInterval(reminderInterval);
    startReminderTimer(event.data.time);
  }
});

function startReminderTimer(targetTime) {
  reminderInterval = setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    if (currentTime === targetTime) {
      self.registration.showNotification("Waktunya Dzikir! 📿", {
        body: "Mari luangkan waktu sejenak untuk mengingat Allah.",
        icon: "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
        badge: "https://cdn-icons-png.flaticon.com/512/5113/5113795.png",
        tag: "dzikir-reminder-active",
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: { url: "./" },
      });
    }
  }, 30000);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === event.notification.data.url && "focus" in client)
          return client.focus();
      }
      if (clients.openWindow)
        return clients.openWindow(event.notification.data.url);
    })
  );
});
