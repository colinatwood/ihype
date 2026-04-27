// iHYPE Service Worker
// Cache-first for assets, network-first for pages
// Version this string when deploying updates

const CACHE_VERSION = 'ihype-v1';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const PAGES_CACHE   = `${CACHE_VERSION}-pages`;

// Everything that goes in the static cache on install
const STATIC_ASSETS = [
  '/ihype-shared.css',
  '/ihype-shared.js',
  '/manifest.json',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Pages cached on install — the core shell
const CORE_PAGES = [
  '/ihype-homepage.html',
  '/ihype-auth.html',
  '/ihype-promise.html',
  '/ihype-hype-engine.html',
  '/ihype-rec-engine.html',
  '/ihype-ticketing.html',
  '/ihype-show-creator.html',
  '/ihype-page-customizer.html',
  '/index.html',
];

// ─── Install: pre-cache everything ───────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(PAGES_CACHE).then(cache => cache.addAll(CORE_PAGES)),
    ]).then(() => self.skipWaiting())
  );
});

// ─── Activate: delete old caches ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('ihype-') && k !== STATIC_CACHE && k !== PAGES_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: strategy depends on request type ─────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Static assets → cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages → stale-while-revalidate (fast load + background update)
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(staleWhileRevalidate(request, PAGES_CACHE));
    return;
  }

  // Everything else → network with cache fallback
  event.respondWith(networkWithCacheFallback(request, STATIC_CACHE));
});

// ─── Strategies ──────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  // Return cached immediately; update in background
  return cached || await networkFetch || offlineFallback();
}

async function networkWithCacheFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback();
  }
}

function isStaticAsset(pathname) {
  return (
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.json')
  );
}

function offlineFallback() {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>iHYPE · offline</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#faf8f3;color:#1a1814;font-family:'Inter',system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;text-align:center}
  h1{font-family:Georgia,serif;font-size:2rem;font-weight:600;margin-bottom:.75rem;letter-spacing:-.02em}
  h1 em{font-style:italic;color:#d83a16}
  p{color:#5c5448;line-height:1.65;max-width:400px;margin:0 auto 1.5rem}
  a{display:inline-block;padding:.7rem 1.5rem;background:#1a1814;color:#faf8f3;border-radius:99px;font-size:.9rem;font-weight:500;text-decoration:none}
</style>
</head>
<body>
<div>
  <h1>You're <em>offline.</em></h1>
  <p>iHYPE needs a connection to load this page. The core pages are cached — try going back to Discover.</p>
  <a href="/ihype-homepage.html">Back to Discover</a>
</div>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

// ─── Background sync placeholder ─────────────────────────────────────────────
// When real APIs exist, register HYPE taps and ticket purchases here
// so they retry when the connection comes back.
self.addEventListener('sync', event => {
  if (event.tag === 'hype-tap-queue') {
    // event.waitUntil(flushHypeTapQueue());
  }
  if (event.tag === 'ticket-purchase-queue') {
    // event.waitUntil(flushTicketQueue());
  }
});
