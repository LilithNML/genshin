const cacheName = "genshin-pity-cache-v1";
const filesToCache = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
  "https://fonts.googleapis.com/icon?family=Material+Icons"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
