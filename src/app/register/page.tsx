import { RegisterAccountChoices } from '@/components/RegisterAccountChoices';

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
