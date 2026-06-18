import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { consumeRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().email().max(254),
  profileId: z.string().cuid(),
});

export async function POST(request: Request) {
  const ip = (request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim();
  const rate = await consumeRateLimit(`newsletter-sub:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rate.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  let body: z.infer<typeof schema>;
  try { body = schema.parse(await request.json()); }
  catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const profile = await db.profile.findUnique({ where: { id: body.profileId }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  await db.newsletterSubscription.upsert({
    where: { email_profileId: { email: body.email, profileId: body.profileId } },
    create: { email: body.email, profileId: body.profileId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
