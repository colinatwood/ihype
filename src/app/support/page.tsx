import type { Metadata } from 'next';
import Link from 'next/link';
import { SupportForm } from '@/components/SupportForm';

export const metadata: Metadata = {
  title: 'Support | iHYPE.org',
  description: 'Get help with login, MFA, verification, copyright, safety, and ticketing issues on iHYPE.'
};

export default function SupportPage() {
  return (
    <main className="container section support-page">
      <section className="panel trust-policy-hero">
        <div className="badge">Support</div>
        <h1>Get help from iHYPE.</h1>
        <p className="subtitle">
          Use this page for login trouble, MFA/email issues, takedowns, ticket problems, artist or venue verification,
          and safety concerns.
        </p>
        <div className="trust-policy-links">
          <Link className="text-link" href="/about">About iHYPE</Link>
          <Link className="text-link" href="/community-rules">Community Rules</Link>
          <Link className="text-link" href="/ticket-policy">Ticket Policy</Link>
          <Link className="text-link" href="/copyright">Copyright</Link>
        </div>
      </section>

      <section className="panel support-form-panel">
        <SupportForm />
      </section>
    </main>
  );
}
