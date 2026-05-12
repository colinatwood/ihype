import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ihype.org';
const url = (path: string) => `${base}${path}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artists, venues, shows, promoters, fans] = await Promise.all([
    db.profile.findMany({ where: { type: 'ARTIST' }, select: { slug: true, updatedAt: true } }),
    db.profile.findMany({ where: { type: 'VENUE' },  select: { slug: true, updatedAt: true } }),
    db.show.findMany({
      where: { status: { not: 'DRAFT' } },
      select: { slug: true, updatedAt: true },
    }),
    db.profile.findMany({ where: { type: 'DJ' },     select: { slug: true, updatedAt: true } }),
    db.profile.findMany({ where: { type: 'LISTENER' }, select: { slug: true, updatedAt: true } }),
  ]);

  const statics: MetadataRoute.Sitemap = [
    { url: url('/'),          changeFrequency: 'weekly',  priority: 1 },
    { url: url('/shows'),     changeFrequency: 'hourly',  priority: 0.9 },
    { url: url('/artists'),   changeFrequency: 'daily',   priority: 0.9 },
    { url: url('/venues'),    changeFrequency: 'weekly',  priority: 0.8 },
    { url: url('/promoters'), changeFrequency: 'weekly',  priority: 0.7 },
    { url: url('/fans'),      changeFrequency: 'weekly',  priority: 0.6 },
    { url: url('/about'),     changeFrequency: 'monthly', priority: 0.5 },
    { url: url('/transparency'), changeFrequency: 'monthly', priority: 0.4 },
  ];

  return [
    ...statics,
    ...artists.map(  p => ({ url: url(`/artists/${p.slug}`),   lastModified: p.updatedAt, changeFrequency: 'weekly'  as const, priority: 0.8 })),
    ...venues.map(   p => ({ url: url(`/venues/${p.slug}`),    lastModified: p.updatedAt, changeFrequency: 'weekly'  as const, priority: 0.7 })),
    ...shows.map(    s => ({ url: url(`/shows/${s.slug}`),     lastModified: s.updatedAt, changeFrequency: 'daily'   as const, priority: 0.85 })),
    ...promoters.map(p => ({ url: url(`/promoters/${p.slug}`), lastModified: p.updatedAt, changeFrequency: 'weekly'  as const, priority: 0.65 })),
    ...fans.map(     p => ({ url: url(`/fans/${p.slug}`),      lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.5 })),
  ];
}
