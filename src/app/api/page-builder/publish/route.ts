import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db, withDbRetry } from '@/lib/db';
import { canManageOwnedResource } from '@/lib/permissions';
import { consumeRateLimit } from '@/lib/rate-limit';
import { getProfilePathForType } from '@/lib/profile-paths';

export const dynamic = 'force-dynamic';

const publishSchema = z.object({
  profileId: z.string().cuid()
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required.' }, { status: 401 });
  }

  const rate = await consumeRateLimit(`page-builder-publish:${session.user.id}`, {
    limit: 10,
    windowMs: 5 * 60 * 1000
  });
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Publishing too often — try again in a few minutes.' }, { status: 429 });
  }

  let body: z.infer<typeof publishSchema>;
  try {
    body = publishSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid publish payload.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  let profile: { id: string; ownerId: string; type: string; slug: string; pageDraft: string | null } | null;
  try {
    profile = await withDbRetry(() => db.profile.findUnique({
      where: { id: body.profileId },
      select: { id: true, ownerId: true, type: true, slug: true, pageDraft: true }
    }));
  } catch {
    return NextResponse.json({ error: 'Database unavailable — please try again in a moment.' }, { status: 503 });
  }

  if (!profile || !canManageOwnedResource(session, profile.ownerId)) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  if (!profile.pageDraft) {
    return NextResponse.json({ error: 'Nothing to publish — save a draft first.' }, { status: 400 });
  }

  let updated: { pagePublishedAt: Date | null };
  try {
    updated = await withDbRetry(() => db.profile.update({
      where: { id: profile!.id },
      data: {
        pagePublished: profile!.pageDraft,
        pagePublishedAt: new Date()
      },
      select: { pagePublishedAt: true }
    }));
  } catch {
    return NextResponse.json({ error: 'Database unavailable — your page could not be published. Please try again.' }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    publishedAt: updated.pagePublishedAt,
    url: getProfilePathForType(profile.type, profile.slug)
  });
}
