import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordAuditEvent } from '@/lib/audit';
import { readClientAddress } from '@/lib/request-meta';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const { action } = await request.json() as { action: 'approve' | 'dismiss' };
  await db.contentReport.update({ where: { id }, data: { status: action === 'approve' ? 'ACTIONED' : 'DISMISSED' } });

  await recordAuditEvent({
    actorUserId: session.user?.id,
    action: 'admin_content_report_actioned',
    entityType: 'ContentReport',
    entityId: id,
    ipAddress: readClientAddress(request),
    metadata: { action },
  });

  return NextResponse.json({ ok: true });
}
