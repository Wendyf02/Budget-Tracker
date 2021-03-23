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
caches.key()
  .then(keyList => {
    // return array of cache names that are old to delete
    return Promise
    .all(keyList.map(key => {
       if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
         console.log("Deleting previous cached information", key);
         return caches.delete(key);
       }
      })
    );
  })     
  )  
  .then(() => self.clients.claim()) 
});

  // fetch
  self.addEventListener("fetch", event => {
  // handle runtime GET requests for data from /api routes
  if (event.request.url.includes("/api/")) {
   
    // make network request and fallback to cache if network request fails (offline)
    event.respondWith(
      caches.open(DATA__CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            
            if (response.status === 200) {
                cache.put(event.request.url, repsonse.clone());
            }
            return response;

          }
          )
          .catch(err => {
          // use cache first for all other requests for performance
            return cache.match(event.request);
          });
      })
      .catch(err => console.log(err))
    );
    return;
  }



  // request is not in cache. make network request and cache the response
  event.respondWith(
    caches
    .open(CACHE_NAME)
    .then(cache=> {
         return cache.match(event.request)
         .then(response => {
            return response || fetch(event.request);
         });  
    })
  );
});
