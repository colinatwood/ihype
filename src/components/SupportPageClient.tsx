'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { SupportForm } from '@/components/SupportForm';
import { SupportPrivacyPanel } from '@/components/SupportPrivacyPanel';

const quickCardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '18px 20px',
  background: 'var(--bg-2, #100d09)', textDecoration: 'none', color: 'inherit', cursor: 'pointer',
};

export function SupportPageClient() {
  const [formKey, setFormKey] = useState(0);
  const [initialType, setInitialType] = useState('privacy');
  const [initialSubject, setInitialSubject] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  function reportProblem() {
    setInitialType('privacy');
    setInitialSubject('Privacy concern');
    setFormKey((k) => k + 1);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <>
      <p className="eyebrow" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.14em', color: 'rgba(240,235,229,.5)', margin: '0 0 14px' }}>
        Common Topics
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 14, marginBottom: 40 }}>
        <Link href="/tickets" style={quickCardStyle}>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 4 }}>My Tickets</div>
          <div style={{ fontSize: 12, color: 'rgba(240,235,229,.55)' }}>Transfer, cancel, or get a QR code</div>
        </Link>
        <SupportPrivacyPanel onReportProblem={reportProblem} />
        <Link href="/verify" style={quickCardStyle}>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 4 }}>Verification</div>
          <div style={{ fontSize: 12, color: 'rgba(240,235,229,.55)' }}>Artist/venue/DJ verification status</div>
        </Link>
        <Link href="/me/promote" style={quickCardStyle}>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 4 }}>Payouts</div>
          <div style={{ fontSize: 12, color: 'rgba(240,235,229,.55)' }}>Settlement, earnings, referrals</div>
        </Link>
      </div>

      <div ref={formRef}>
        <SupportForm key={formKey} initialType={initialType} initialSubject={initialSubject} />
      </div>
    </>
  );
}
