import { Suspense } from 'react';
import { LoginPageClient } from '@/components/LoginPageClient';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
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
      <LoginPageClient />
    </Suspense>
  );
}
