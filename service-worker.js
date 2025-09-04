self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("lumen-cache").then(cache => {
      return cache.addAll([
        "index.html",
        "styles.css",
        "app.js",
        "manifest.webmanifest",
        "assets/logo.png"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
