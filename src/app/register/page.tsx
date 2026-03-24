import type { Metadata } from 'next';
import { RegisterAccountChoices } from '@/components/RegisterAccountChoices';

export const metadata: Metadata = {
  title: 'Sign Up | iHYPE.org',
  description: 'Choose an account type to create your iHYPE.org account.',
  robots: {
    index: false,
    follow: false
  }
};

export default function RegisterPage() {
  return (
    <main className="container section register-shell">
      <div className="register-grid">
        <div className="panel register-panel register-choice-panel">
          <RegisterAccountChoices />
        </div>
      </div>
    </main>
  );
}
