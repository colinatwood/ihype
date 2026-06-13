import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampler(ctx) {
      if (ctx.parentSampled !== undefined) return ctx.parentSampled;
      const url = ctx.name ?? '';
      if (url.includes('/api/auth') || url.includes('/api/register') || url.includes('/api/shows')) {
        return 0.5;
      }
      return 0.05;
    },
    ignoreErrors: [
      'Non-Error promise rejection captured',
      'AbortError',
    ],
  });
}
