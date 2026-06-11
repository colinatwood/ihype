import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db, withDbRetry } from '@/lib/db';
import { canManageOwnedResource } from '@/lib/permissions';
import { consumeRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const MAX_DRAFT_CHARS = 100_000;

const putSchema = z.object({
  profileId: z.string().cuid(),
  // Empty string clears the draft; anything else must be valid JSON (checked below).
  draft: z.string().max(MAX_DRAFT_CHARS, 'Draft is too large.')
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required.' }, { status: 401 });
  }

  const profileId = new URL(request.url).searchParams.get('profileId') ?? '';
  if (!profileId || profileId.length > 64) {
    return NextResponse.json({ error: 'profileId is required.' }, { status: 400 });
  }

  let profile: {
    id: string;
    ownerId: string;
    pageDraft: string | null;
    pageDraftUpdatedAt: Date | null;
    pagePublishedAt: Date | null;
  } | null;
  try {
    profile = await withDbRetry(() => db.profile.findUnique({
      where: { id: profileId },
      select: { id: true, ownerId: true, pageDraft: true, pageDraftUpdatedAt: true, pagePublishedAt: true }
    }));
  } catch {
    return NextResponse.json({ error: 'Database unavailable — please try again in a moment.' }, { status: 503 });
  }

  if (!profile || !canManageOwnedResource(session, profile.ownerId)) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  return NextResponse.json({
    draft: profile.pageDraft,
    draftUpdatedAt: profile.pageDraftUpdatedAt,
    publishedAt: profile.pagePublishedAt
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required.' }, { status: 401 });
  }

  const rate = await consumeRateLimit(`page-builder-save:${session.user.id}`, {
    limit: 60,
    windowMs: 5 * 60 * 1000
  });
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Saving too often — try again in a moment.' }, { status: 429 });
  }

  let body: z.infer<typeof putSchema>;
  try {
    body = putSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid draft payload.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  if (body.draft !== '') {
    try {
      JSON.parse(body.draft);
    } catch {
      return NextResponse.json({ error: 'Draft must be valid JSON.' }, { status: 400 });
    }
  }

  let profile: { id: string; ownerId: string } | null;
  try {
    profile = await withDbRetry(() => db.profile.findUnique({
      where: { id: body.profileId },
      select: { id: true, ownerId: true }
    }));
  } catch {
    return NextResponse.json({ error: 'Database unavailable — please try again in a moment.' }, { status: 503 });
  }

  if (!profile || !canManageOwnedResource(session, profile.ownerId)) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  let updated: { pageDraftUpdatedAt: Date | null };
  try {
    updated = await withDbRetry(() => db.profile.update({
      where: { id: profile!.id },
      data: {
        pageDraft: body.draft === '' ? null : body.draft,
        pageDraftUpdatedAt: new Date()
      },
      select: { pageDraftUpdatedAt: true }
    }));
  } catch {
    return NextResponse.json({ error: 'Database unavailable — your draft could not be saved. Please try again.' }, { status: 503 });
  }

  return NextResponse.json({ ok: true, draftUpdatedAt: updated.pageDraftUpdatedAt });
}
