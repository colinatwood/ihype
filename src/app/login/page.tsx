import { redirect } from 'next/navigation';
import { LoginScreen } from '@/components/AuthScreens';
import { auth } from '@/lib/auth';

export const metadata = {
  title: 'Sign in | iHYPE.org',
  robots: { index: false, follow: false }
};

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ identifier?: string; registered?: string }>;
}) {
  const session = await auth();
  if (session?.user?.id) {
    redirect('/auth/landing');
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};

  return (
    <LoginScreen
      initialIdentifier={resolvedSearchParams.identifier ?? ''}
      justRegistered={resolvedSearchParams.registered === '1'}
    />
  );
}
