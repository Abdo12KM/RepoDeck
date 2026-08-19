/* RepoDeck service worker: Web Push + a single offline navigation fallback. */
const OFFLINE_CACHE = "repodeck-offline-v3";
const OFFLINE_URL = "/offline.html";
const OFFLINE_CACHE_PREFIX = "repodeck-offline-";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.add(OFFLINE_URL)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith(OFFLINE_CACHE_PREFIX) && key !== OFFLINE_CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(async () => {
      const cache = await caches.open(OFFLINE_CACHE);
      return (await cache.match(OFFLINE_URL)) || Response.error();
    }),
  );
});

function safeNotificationUrl(value) {
  try {
    const candidate = new URL(
      typeof value === "string" ? value : "/",
      self.location.origin,
    );
    return candidate.origin === self.location.origin
      ? candidate.href
      : `${self.location.origin}/`;
  } catch {
    return `${self.location.origin}/`;
  }
}

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "RepoDeck", body: event.data.text() };
  }

  const title =
    typeof data.title === "string" && data.title ? data.title : "RepoDeck";
  const body = typeof data.body === "string" ? data.body : "";
  const targetUrl = safeNotificationUrl(data.url);

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: typeof data.tag === "string" ? data.tag : "repodeck-notification",
      renotify: Boolean(data.renotify),
      data: { url: targetUrl },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const target = safeNotificationUrl(event.notification.data?.url);
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windows) {
        if ("navigate" in client) await client.navigate(target);
        if ("focus" in client) return client.focus();
      }

      return self.clients.openWindow(target);
    })(),
  );
});
