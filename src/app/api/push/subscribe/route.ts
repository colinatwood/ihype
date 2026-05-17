import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  let sub: { endpoint: string; keys: { auth: string; p256dh: string } };
  try {
    sub = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }

  if (!sub?.endpoint || !sub?.keys?.auth || !sub?.keys?.p256dh) {
    return NextResponse.json({ error: 'Missing subscription fields.' }, { status: 400 });
  }

  await db.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: {
      userId: session.user.id,
      endpoint: sub.endpoint,
      auth: sub.keys.auth,
      p256dh: sub.keys.p256dh
    },
    update: {
      userId: session.user.id,
      auth: sub.keys.auth,
      p256dh: sub.keys.p256dh
    }
  });

  return NextResponse.json({ ok: true });
}
