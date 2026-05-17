import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { id } = await params;

  const template = await db.setlistTemplate.findUnique({
    where: { id },
    include: { profile: { select: { ownerId: true } } }
  });
  if (!template) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  if (template.profile.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

  let name: string | undefined, tracks: unknown;
  try {
    const body = await request.json();
    name = body.name;
    tracks = body.tracks;
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (tracks !== undefined) updateData.tracks = tracks;

  const updated = await db.setlistTemplate.update({
    where: { id },
    data: updateData
  });

  return NextResponse.json({ template: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { id } = await params;

  const template = await db.setlistTemplate.findUnique({
    where: { id },
    include: { profile: { select: { ownerId: true } } }
  });
  if (!template) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  if (template.profile.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

  await db.setlistTemplate.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
