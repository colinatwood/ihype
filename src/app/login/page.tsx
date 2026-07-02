import { Suspense } from 'react';
import { AuthUnified } from '@/components/AuthUnified';

export const metadata = {
  title: 'Sign in | iHYPE.org',
  robots: { index: false, follow: false }
};

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ identifier?: string; registered?: string; auth?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  if (resolvedSearchParams.auth === 'full') {
    const { LoginScreen } = await import('@/components/AuthScreens');
    return (
      <LoginScreen
        initialIdentifier={resolvedSearchParams.identifier}
        justRegistered={resolvedSearchParams.registered === '1'}
      />
    );
  }

  return (
    <Suspense fallback={null}>
      <AuthUnified
        initialEmail={resolvedSearchParams.identifier}
        initialMode="signin"
        justRegistered={resolvedSearchParams.registered === '1'}
      />
    </Suspense>
  );
}
