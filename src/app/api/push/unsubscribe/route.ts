import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  let endpoint: string;
  try {
    const body = await request.json();
    endpoint = body.endpoint;
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }

  if (!endpoint) return NextResponse.json({ error: 'endpoint required.' }, { status: 400 });

  await db.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id }
  });

  return NextResponse.json({ ok: true });
}
