const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.js",
    "/manifest.webmanifest",
    "/style.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
  
  ];
  
  const STATIC_CACHE = "static-cache-v22";
  const RUNTIME_CACHE = "data-cache-v33";
  
  //install
  self.addEventListener("install", function(evt){
      evt.waitUntil(
        catches.open(CACHE_NAME).then(cache => {
        console.log("Your files were pre-cached succeefully!");
        return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
  });
  
  // The activate handler takes care of cleaning up old caches.
  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches
        .keys().then(keyList => {
         return Promise.all(
            keyList.map( key => {
                if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                    console.log("Removing old cache data", key);
                    return caches.delete(key);
                }
            })    
        );
    })
       
    );
      self.ClientRectList.claim();
  });
  

  // fetch
  self.addEventListener("fetch", function (evt) {
    // non GET requests are not cached and requests to other origins are not cached
    if (
      event.request.method !== "GET" ||
      !event.request.url.startsWith(self.location.origin)
    ) {
      event.respondWith(fetch(event.request));
      return;
    }
  
    // handle runtime GET requests for data from /api routes
    if (event.request.url.includes("/api/")) {
      // make network request and fallback to cache if network request fails (offline)
      evt.respondWith(
        caches.open(RUNTIME_CACHE).then(cache => {
          return fetch(evt.request)
            .then(response => {
               if(response.status === 200) { 
              cache.put(evt.request.url, response.clone());
            }
              return response;
            })
            .catch(err  => { 
                return caches.match(evt.request) 
            });
        }).catch(err => console.log(err))
      );
      return;
    }
  
    // use cache first for all other requests for performance
    evt.respondWith(
      fetch(evt.request).catch(function() {
        return caches.match(evt.request).then(function(response) {

          if (response){
               return response;
          } else if (evt.request.headers.get("aceept").includes("text/html")) {
             // retun cached to home page for all request
            return caches.match("/")
          }

        });

      })
  
    );
});