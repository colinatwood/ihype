import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginPageClient } from '@/components/LoginPageClient';
import { isPasswordResetEmailConfigured } from '@/lib/mailer';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Sign In | iHYPE.org',
  description: 'Sign in to iHYPE.org.',
  robots: {
    index: false,
    follow: false
  }
};

export default function LoginPage() {
  const passwordResetEnabled =
    process.env.NODE_ENV !== 'production' || isPasswordResetEmailConfigured();

  return (
    <Suspense
      fallback={
        <main className="container section">
          <div className="auth-shell">
            <div className="panel auth-panel">
              <h1>Sign in</h1>
              <p className="kicker">Loading sign-in controls...</p>
            </div>
          </div>
        </main>
      }
    >
      <LoginPageClient passwordResetEnabled={passwordResetEnabled} />
    </Suspense>
  );
}
