import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { WORKBENCH_PATH } from '@/lib/auth-redirects';
import { buildAuthSessionCookie } from '@/lib/auth-session';

export const dynamic = 'force-dynamic';

export default async function MagicLinkPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token || typeof token !== 'string') {
    redirect('/login?error=invalid_magic_link');
  }

  const record = await db.magicLinkToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, name: true, email: true, image: true, role: true, emailVerified: true } } }
  });

  if (!record || record.used || record.expiresAt < new Date()) {
    redirect('/login?error=expired_magic_link');
  }

  await db.magicLinkToken.update({ where: { id: record.id }, data: { used: true } });

  const sessionCookie = await buildAuthSessionCookie(record.user);
  if (!sessionCookie) redirect('/login?error=server_error');

  const jar = await cookies();
  jar.set(sessionCookie);

  redirect(WORKBENCH_PATH);
}
