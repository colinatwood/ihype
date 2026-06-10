import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const PREF_FIELDS = ['newShows', 'journalPosts', 'milestones', 'weeklyDigest'] as const;
type PrefField = (typeof PREF_FIELDS)[number];

const DEFAULTS: Record<PrefField, boolean> = {
  newShows: true,
  journalPosts: true,
  milestones: true,
  weeklyDigest: true
};

const PREF_SELECT = { newShows: true, journalPosts: true, milestones: true, weeklyDigest: true } as const;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const preferences = await db.notificationPreference.findUnique({
    where: { userId: session.user.id },
    select: PREF_SELECT
  });

  return NextResponse.json({ preferences: preferences ?? DEFAULTS });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const updates: Partial<Record<PrefField, boolean>> = {};
  for (const field of PREF_FIELDS) {
    if (typeof body[field] === 'boolean') updates[field] = body[field] as boolean;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid preference fields provided.' }, { status: 400 });
  }

  const preferences = await db.notificationPreference.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...DEFAULTS, ...updates },
    update: updates,
    select: PREF_SELECT
  });

  return NextResponse.json({ preferences });
}
