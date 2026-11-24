'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"favicon.png": "0cf21e85aada2b1c79018daced39a592",
"canvaskit/canvaskit.js": "26eef3024dbc64886b7f48e1b6fb05cf",
"canvaskit/chromium/canvaskit.js": "b7ba6d908089f706772b2007c37e6da4",
"canvaskit/chromium/canvaskit.js.symbols": "e115ddcfad5f5b98a90e389433606502",
"canvaskit/chromium/canvaskit.wasm": "ea5ab288728f7200f398f60089048b48",
"canvaskit/skwasm.js": "ac0f73826b925320a1e9b0d3fd7da61c",
"canvaskit/canvaskit.js.symbols": "efc2cd87d1ff6c586b7d4c7083063a40",
"canvaskit/skwasm.wasm": "828c26a0b1cc8eb1adacbdd0c5e8bcfa",
"canvaskit/skwasm.js.symbols": "96263e00e3c9bd9cd878ead867c04f3c",
"canvaskit/skwasm.worker.js": "89990e8c92bcb123999aa81f7e203b1c",
"canvaskit/canvaskit.wasm": "e7602c687313cfac5f495c5eac2fb324",
"firebasejs/firebase-messaging.js": "bff43540a7306afd4d79caf547b5c800",
"firebasejs/firebase-auth.js": "c69756f278e82739faa104081eb2f847",
"firebasejs/firebase-firestore.js": "89d2dfb3193320de28daa271997e325d",
"firebasejs/firebase-app.js": "ce8df1e99bfde3ef3efed1d63d0a1c0f",
"flutter_bootstrap.js": "b8ca81c86514885047a041b27ae2f47f",
"assets/NOTICES": "bf5949217f610f139526bbd53c416986",
"assets/web_fonts/NotoNaskhArabic_400Regular.ttf": "b9adf6a0dd7ea110e62d9f1a057fc635",
"assets/web_fonts/HS-SemiBold.ttf": "ecde3365b566e69d1b446298aa8f561f",
"assets/web_fonts/HS-Regular.ttf": "c35557270087ba64812331665bec9cd4",
"assets/web_fonts/HS-Bold.ttf": "57f368d92bee851a4b7818bf9d5565aa",
"assets/web_fonts/NotoNaskhArabic_700Bold.ttf": "34b23203ccccf50b2cc2cf7ee63eda1f",
"assets/AssetManifest.bin": "2137408f198df23542d5dbacd5ca7423",
"assets/assets/hadith_books.json": "59a67f2556aaa15a19dc11b5d4648794",
"assets/assets/daily_hadith.json": "d9e04968f083d56730b1b25d8a25bd78",
"assets/assets/names99.json": "84803ec07b4844d48f40f1cd80ebe2a2",
"assets/assets/logo.png": "83a05e29af2357046d0062aba040ab08",
"assets/assets/baby_names.json": "607cfda6db361bad1a2eef60dd47a1a0",
"assets/FontManifest.json": "e4b8f650f0a8bf95482b2f5e2558917d",
"assets/sounds/azan.mp3": "11a7ac848cb195a410db933cbd261787",
"assets/AssetManifest.json": "2fa0b9d44944a8953e8a5f703a6326bc",
"assets/fonts/MaterialIcons-Regular.otf": "f2af305fa950ebbdd7221a271c0f8ef2",
"assets/AssetManifest.bin.json": "83526abf52e2c38a81dd3929c2d819d4",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"index.html": "7e710bdcb0283fe8202b4e37098e4def",
"/": "7e710bdcb0283fe8202b4e37098e4def",
"flutter.js": "4b2350e14c6650ba82871f60906437ea",
"main.dart.js": "77a3b383e05bcd5a022f5edcd3b57e20",
"manifest.json": "977c76781afe03d60a5aac3f69ba0f2b",
"icons/Icon-512.png": "a059153c0594b184fea76836b62c2d28",
"icons/Icon-maskable-512.png": "d42c0466542461649f3ef0f98213362c",
"icons/Icon-maskable-192.png": "cf36e0322d82cb8e1eb285eec26980ca",
"icons/Icon-192.png": "10147afbb273e57474a4857d8ecbc48f",
"icons/apple-touch-icon.png": "9f86eac3e10081f763eb198f8b1608cd",
"version.json": "e9fc36b3863afac74a866f3ed54b151b"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
