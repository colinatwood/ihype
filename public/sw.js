const CACHE_VERSION = 'ihype-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

const STATIC_ASSETS = [
  '/ihype-shared.css',
  '/ihype-shared.js',
  '/ihype-auth.js',
  '/ihype-user-menu.js',
  '/manifest.json',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

const CORE_PAGES = [
  '/ihype-homepage.html',
  '/ihype-promise.html',
  '/ihype-hype-engine.html',
  '/ihype-rec-engine.html',
  '/ihype-ticketing.html',
  '/ihype-show-creator.html',
  '/ihype-page-customizer.html',
  '/index.html'
];

const NETWORK_ONLY_PATHS = [
  '/login',
  '/register',
  '/ihype-auth.html',
  '/api/auth',
  '/api/register'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(PAGE_CACHE).then((cache) => cache.addAll(CORE_PAGES))
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('ihype-') && key !== STATIC_CACHE && key !== PAGE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) return;
  if (isNetworkOnly(url.pathname)) return;

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(staleWhileRevalidate(request, PAGE_CACHE));
    return;
  }

  event.respondWith(networkWithCacheFallback(request, STATIC_CACHE));
});

function isNetworkOnly(pathname) {
  return NETWORK_ONLY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }

  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || (await networkFetch) || offlineFallback();
}

async function networkWithCacheFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback();
  }
}

function isStaticAsset(pathname) {
  return /\.(css|js|png|jpe?g|svg|webp|woff2?|json)$/i.test(pathname);
}

function offlineFallback() {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>iHYPE offline</title>
<style>
body{background:#faf8f3;color:#1a1814;font-family:system-ui,sans-serif;min-height:100vh;display:grid;place-items:center;padding:2rem;text-align:center}
h1{font-family:Georgia,serif;font-size:2rem;margin:0 0 .75rem}
p{color:#5c5448;line-height:1.65;max-width:400px;margin:0 auto 1.5rem}
a{display:inline-block;padding:.7rem 1.5rem;background:#1a1814;color:#faf8f3;border-radius:99px;text-decoration:none}
</style>
</head>
<body>
<div>
  <h1>You're offline.</h1>
  <p>iHYPE needs a connection to load this page. Try going back to Discover.</p>
  <a href="/ihype-homepage.html">Back to Discover</a>
</div>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }
  );
}
