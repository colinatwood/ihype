import openNextWorker from './.open-next/worker.js';

export { BucketCachePurge, DOQueueHandler, DOShardedTagCache } from './.open-next/worker.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === 'www.ihype.org') {
      url.hostname = 'ihype.org';
      return Response.redirect(url.toString(), 308);
    }
    const response = await openNextWorker.fetch(request, env, ctx);
    // Service worker scripts must never be served from a CDN edge cache.
    // Cloudflare Static Assets can cache /sw.js with a long max-age, which
    // prevents browsers from picking up the updated worker after a deploy.
    // Force revalidation on every request so the cache-busted CACHE_VERSION
    // inside sw.js is always visible to the browser's SW update check.
    if (url.pathname === '/sw.js') {
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'no-cache');
      return new Response(response.body, { status: response.status, headers });
    }
    return response;
  },
  scheduled(event, env, ctx) {
    return openNextWorker.scheduled?.(event, env, ctx);
  }
};
