import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Metadata } from 'next';
import { VerifyForm } from '@/components/VerifyForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Verification · iHYPE',
  robots: { index: false, follow: false },
};

const TYPE_LABEL: Record<string, string> = { ARTIST: 'Artist', DJ: 'DJ', VENUE: 'Venue' };

export default async function VerifyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/verify');

  const profiles = await db.profile.findMany({
    where: { ownerId: session.user.id, type: { in: ['ARTIST', 'DJ', 'VENUE'] } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, type: true, name: true, city: true, genres: true, contactInfo: true, verificationStatus: true, verificationSubmittedAt: true },
  });

  if (profiles.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 24px 100px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(240,235,229,.4)', marginBottom: 12 }}>Verification</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, marginBottom: 12 }}>Nothing to verify yet.</h1>
        <p style={{ fontSize: 14, color: 'rgba(240,235,229,.6)', marginBottom: 24 }}>
          Fan accounts don&apos;t need verification. Create an Artist, DJ, or Venue page to get started.
        </p>
        <Link href="/pages?tab=creator" className="ihype-btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Create a page →
        </Link>
      </div>
    );
  }

  const profile = profiles.find((p) => p.verificationStatus !== 'VERIFIED') ?? profiles[0];

  if (profile.verificationStatus === 'VERIFIED') {
    return (
      <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 24px 100px', textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
          background: 'rgba(34,229,212,.12)', border: '2px solid #22e5d4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22e5d4" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, marginBottom: 8 }}>You&apos;re verified.</h1>
        <p style={{ fontSize: 14, color: 'rgba(240,235,229,.6)' }}>{profile.name} is a verified {TYPE_LABEL[profile.type]} on iHYPE.</p>
      </div>
    );
  }

  if (profile.verificationStatus === 'PENDING' && profile.verificationSubmittedAt) {
    return (
      <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 24px 100px', textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
          background: 'rgba(255,184,74,.12)', border: '2px solid #ffb84a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffb84a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, marginBottom: 8 }}>Under review.</h1>
        <p style={{ fontSize: 14, color: 'rgba(240,235,229,.6)', marginBottom: 24 }}>
          We&apos;ll review your {TYPE_LABEL[profile.type]} application within 48 hours and email you at the address on your account.
        </p>
        <Link href="/home" className="ihype-btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Explore as a Fan →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 24px 100px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(240,235,229,.4)', marginBottom: 12 }}>Verification</p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, marginBottom: 8 }}>Verify your {TYPE_LABEL[profile.type]} page.</h1>
      <p style={{ fontSize: 14, color: 'rgba(240,235,229,.6)', marginBottom: 24, lineHeight: 1.6 }}>
        Fan accounts are instant. Artist, DJ, and Venue accounts require verification — it protects everyone in the 45/45/10 ecosystem.
      </p>
      <VerifyForm
        profileId={profile.id}
        type={profile.type as 'ARTIST' | 'DJ' | 'VENUE'}
        initialName={profile.name}
        initialCity={profile.city ?? ''}
        initialGenres={profile.genres.join(', ')}
        initialLink={profile.contactInfo ?? ''}
      />
    </div>
  );
}
