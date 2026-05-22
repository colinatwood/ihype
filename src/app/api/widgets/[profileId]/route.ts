import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { canManageOwnedResource } from '@/lib/permissions';
import { parseWidgetConfig, WidgetConfig, WIDGET_DEFS, WidgetType } from '@/lib/widgets';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;

  const profile = await db.profile.findUnique({
    where: { id: profileId },
    select: { widgetConfig: true },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const config = parseWidgetConfig(profile.widgetConfig);
  return NextResponse.json({ config });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await db.profile.findUnique({
    where: { id: profileId },
    select: { ownerId: true },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (!canManageOwnedResource(session, profile.ownerId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || !('config' in body)) {
    return NextResponse.json({ error: 'Missing config field' }, { status: 400 });
  }

  const incoming = (body as { config: unknown }).config;

  if (typeof incoming !== 'object' || incoming === null) {
    return NextResponse.json({ error: 'config must be an object' }, { status: 400 });
  }

  const incomingConfig = incoming as Partial<WidgetConfig>;

  if (!Array.isArray(incomingConfig.enabled)) {
    return NextResponse.json({ error: 'config.enabled must be an array' }, { status: 400 });
  }

  const validEnabled = incomingConfig.enabled.filter(
    (w): w is WidgetType => typeof w === 'string' && w in WIDGET_DEFS
  );

  if (validEnabled.length > 8) {
    return NextResponse.json({ error: 'At most 8 widgets can be enabled' }, { status: 400 });
  }

  if (
    incomingConfig.data !== undefined &&
    (typeof incomingConfig.data !== 'object' || incomingConfig.data === null || Array.isArray(incomingConfig.data))
  ) {
    return NextResponse.json({ error: 'config.data must be an object' }, { status: 400 });
  }

  const sanitized: WidgetConfig = {
    enabled: validEnabled,
    data: incomingConfig.data ?? {},
  };

  await db.profile.update({
    where: { id: profileId },
    data: { widgetConfig: JSON.stringify(sanitized) },
  });

  return NextResponse.json({ config: sanitized });
}
