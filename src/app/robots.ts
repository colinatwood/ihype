import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ihype.org';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/workbench',
          '/api/',
          '/auth/',
          '/login',
          '/register',
          '/forgot',
          '/logout',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
