import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const all = new URL(request.url).searchParams.get('all') === '1';
    const notifications = await db.notification.findMany({
      where: { userId: session.user.id, ...(all ? {} : { read: false }) },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, type: true, body: true, link: true, read: true, createdAt: true }
    });
    return NextResponse.json({ notifications });
  } catch (err) {
    console.error('[api/notifications] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    await db.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true }
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/notifications] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const { id } = await request.json() as { id?: string };
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await db.notification.updateMany({ where: { id, userId: session.user.id }, data: { read: true } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/notifications] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      await db.notification.deleteMany({ where: { id, userId: session.user.id } });
    } else {
      await db.notification.deleteMany({ where: { userId: session.user.id, read: true } });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/notifications] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
