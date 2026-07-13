// sw.js — Service worker for offline play. Cache-first for the app shell (all game code,
// styles, and markup are static and versioned by CACHE_NAME), network-first fallback for
// anything not precached (e.g. the Google Fonts CSS/woff2, which come from a different origin).

const CACHE_NAME = 'cradles-conquest-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './js/ai.js',
  './js/audio.js',
  './js/biomes.js',
  './js/buildings.js',
  './js/camera.js',
  './js/cities.js',
  './js/cityArt.js',
  './js/combat.js',
  './js/difficulty.js',
  './js/diplomacy.js',
  './js/fog.js',
  './js/hex.js',
  './js/kingdomEffects.js',
  './js/kingdoms.js',
  './js/main.js',
  './js/movement.js',
  './js/noise.js',
  './js/renderer.js',
  './js/resources.js',
  './js/save.js',
  './js/state.js',
  './js/tech.js',
  './js/units.js',
  './js/victory.js',
  './js/wonders.js',
  './js/worldgen.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin) {
    // Cache-first for our own app shell: instant offline load, refresh cache in the background.
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
  } else {
    // Cross-origin (e.g. Google Fonts): network-first, cache fallback for offline.
    event.respondWith(
      fetch(request).then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => caches.match(request))
    );
  }
});
