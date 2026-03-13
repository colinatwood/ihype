import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDefaultLandingPathForUser } from '@/lib/account-routing';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const path = await getDefaultLandingPathForUser({
    userId: session.user.id,
    role: session.user.role
  });

  return NextResponse.json({ path });
}
