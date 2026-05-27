import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  // Pick 2 random tracks from the media library for a battle
  const count = await db.media.count().catch(() => 0);
  if (count < 2) return NextResponse.json({ battle: null });

  const skip1 = Math.floor(Math.random() * count);
  const skip2 = Math.floor(Math.random() * Math.max(1, count - 1));
  const [a, b] = await Promise.all([
    db.media.findFirst({ skip: skip1, select: { id: true, title: true, artistName: true, hypeCount: true, color: true } }),
    db.media.findFirst({ skip: skip2, select: { id: true, title: true, artistName: true, hypeCount: true, color: true } }),
  ]);
  if (!a || !b || a.id === b.id) return NextResponse.json({ battle: null });
  return NextResponse.json({ battle: { a, b, endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() } });
}
