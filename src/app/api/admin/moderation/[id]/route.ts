import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { isAdminSession } from '@/lib/permissions';

/**
 * Takes real enforcement action against the flagged content, keyed by
 * ContentReport.targetType. Best-effort: a missing/already-gone target
 * (deleted since the report was filed) is not an error — the report still
 * gets marked ACTIONED. Types with no safe automated action ('profile',
 * 'profile-image' — we know a profile was flagged but not which field, so
 * an admin still has to look) fall through with no side effect beyond the
 * status flip.
 */
async function enforceRemoval(targetType: string, targetId: string): Promise<void> {
  switch (targetType) {
    case 'track':
      await db.artistMediaAsset.updateMany({ where: { hexId: targetId }, data: { isPublished: false, freeUseEnabled: false } });
      break;
    case 'comment':
      await db.showComment.updateMany({ where: { id: targetId }, data: { deletedAt: new Date() } });
      break;
    case 'show':
      await db.show.updateMany({ where: { id: targetId }, data: { status: 'CANCELED' } });
      break;
    case 'ad-creative':
      await db.adSubmission.updateMany({ where: { id: targetId }, data: { status: 'rejected' } });
      break;
    default:
      break;
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const { action } = await request.json() as { action: 'approve' | 'dismiss' };

    const report = await db.contentReport.findUnique({ where: { id }, select: { targetType: true, targetId: true } });
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (action === 'approve') {
      await enforceRemoval(report.targetType, report.targetId);
    }

    await db.contentReport.update({ where: { id }, data: { status: action === 'approve' ? 'ACTIONED' : 'DISMISSED' } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/moderation] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
