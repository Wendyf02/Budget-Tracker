const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.html",
    "/index.js",
    "/manifest.webmanifest",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
   
  
  ];
  
  const CACHE_NAME = "static-cache-v2";
  const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log("Offline information pre-cached successfully");
        return cache.addAll(FILES_TO_CACHE);
      })
  )
   .then(() => self.skipWaiting())
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", event => {
event.waitUntil(
catches.key()
.then(keyList => {
    // return array of cache names that are old to delete
      return Promise
       .all(keyList.map(key => {
       if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
       console.log("Deleting previous cached information", key);
       return caches.delete(key);
       }
      })
    )
  })     
  )  
  .then(() => self.clients.claim()) 
  });

  // fetch
  self.addEventListener("fetch", event => {
  // non GET requests are not cached and requests to other origins are not cached
  if (event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // handle runtime GET requests for data from /api routes
  if (event.request.url.includes("/api/images")) {
    // make network request and fallback to cache if network request fails (offline)
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => caches.match(event.request));
      })
    );
    return;
  }


  
  // use cache first for all other requests for performance
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // request is not in cache. make network request and cache the response
      return caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(event.request).then(response => {
          return cache.put(event.request, response.clone()).then(() => {
            return response;
          });
        });
      });
    })
  );
});
