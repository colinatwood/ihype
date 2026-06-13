import './admin.css';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/permissions';
import { WORKBENCH_PATH } from '@/lib/auth-redirects';
import { AdminShell } from '@/components/admin/AdminShell';
import { OpsLoginGate } from '@/components/admin/OpsLoginGate';
import { db } from '@/lib/db';
import { hashDeviceToken, getDeviceCookieName } from '@/lib/admin-device';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (!isAdminSession(session)) {
    redirect(WORKBENCH_PATH);
  }

  // Device cookie check — exempt the registration page to avoid redirect loops
  const pathname = (await headers()).get('x-pathname') ?? '';
  const isDeviceSetupPath = pathname === '/admin/device-register';

  if (!isDeviceSetupPath) {
    const cookieStore = await cookies();
    const deviceCookie = cookieStore.get(getDeviceCookieName())?.value;
    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { adminDeviceTokenHash: true },
    });
    const isDeviceValid =
      deviceCookie &&
      admin?.adminDeviceTokenHash &&
      hashDeviceToken(deviceCookie) === admin.adminDeviceTokenHash;
    if (!isDeviceValid) {
      redirect('/admin/device-register');
    }
  }

  const { name, email } = session.user;

  return (
    <OpsLoginGate name={name} email={email}>
      <AdminShell name={name} email={email}>{children}</AdminShell>
    </OpsLoginGate>
  );
}
