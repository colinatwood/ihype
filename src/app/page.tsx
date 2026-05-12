import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';

const ROLES = [
  { k: 'fan', label: 'Fan', sub: 'Hype tracks · Build top-5 lists · Follow artists', c: '#b983ff', icon: '♡' },
  { k: 'artist', label: 'Artist', sub: 'Upload music · List shows · Track hype', c: '#ff5029', icon: '◐' },
  { k: 'venue', label: 'Venue', sub: 'Host shows · Verify capacity · Issue tickets', c: '#22e5d4', icon: '◇' },
  { k: 'promoter', label: 'Promoter / DJ', sub: 'Book talent · Affiliate · Run radio shows', c: '#ff3e9a', icon: '◉' },
];

const STATS = [
  { label: 'Tracks hyped', val: '1,247', c: '#ff5029' },
  { label: 'Shows listed', val: '184', c: '#22e5d4' },
  { label: 'Radio shows live', val: '23', c: '#ff3e9a' },
  { label: 'Cities', val: '41', c: '#b983ff' },
];

const REASONS = [
  {
    icon: '◐',
    head: 'Not-for-profit, free forever',
    body: 'No streaming cuts. No paywalls. No algorithmic gatekeeping. iHYPE is built for the scene, by the scene.',
  },
  {
    icon: '♡',
    head: 'Hype is the currency',
    body: 'Fans vote with hypes instead of plays. Artists see real signal — not inflated stream counts from bots.',
  },
  {
    icon: '◇',
    head: 'Shows first',
    body: 'Every artist page links to upcoming shows. Venues list for free. Fans buy tickets without a middleman.',
  },
  {
    icon: '◉',
    head: 'Radio lives here',
    body: 'DJs and promoters run live and recorded sets directly on the platform. No third-party embeds needed.',
  },
];

export default async function MarketingPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/home');
  }

  return (
    <main className="lp-wrap">
      {/* 0% fee banner */}
      <section className="lp-fee-banner">
        <span className="lp-fee-banner-text">
          iHYPE takes 0% of ticket revenue — forever. Artists and venues keep everything.
        </span>
        <Link href="/about" className="lp-fee-banner-link">→ See how it works</Link>
      </section>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-eyebrow">
          <span className="lp-live-dot" />
          {STATS[0].val} tracks hyped this week
        </div>
        <h1 className="lp-hero-h">
          Independent music,<br />
          <span className="lp-hero-gradient">found by humans.</span>
        </h1>
        <p className="lp-hero-sub">
          iHYPE is a streaming-first discovery platform for artists, promoters, venues, and fans.
          It is not-for-profit, free forever, and built entirely for the independent music scene.
        </p>
        <div className="lp-hero-actions">
          <Link href="/register" className="lp-btn-primary">Join free — pick your role</Link>
          <Link href="/login" className="lp-btn-ghost">Sign in</Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="lp-stats">
        {STATS.map((s) => (
          <div key={s.label} className="lp-stat">
            <span className="lp-stat-val" style={{ color: s.c }}>{s.val}</span>
            <span className="lp-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Hype explainer */}
      <section className="lp-hype-explainer">
        <p className="lp-hype-eyebrow">DEMAND SIGNAL · NOT A LIKE</p>
        <h2 className="lp-section-head">What is a Hype?</h2>
        <p className="lp-hype-body">
          A Hype is registered when a fan listens all the way through a track, or manually hypes an artist they believe in.
          Unlike a stream count or a like, a Hype is a deliberate signal of real demand — it tells artists and promoters
          which music is actually resonating. The more Hypes a track earns, the higher it surfaces in discovery feeds,
          with no pay-to-play and no algorithmic shortcuts.
        </p>
      </section>

      {/* Reasons why */}
      <section className="lp-reasons">
        <h2 className="lp-section-head">Why we built this</h2>
        <div className="lp-reason-grid">
          {REASONS.map((r) => (
            <div key={r.icon} className="lp-reason-card">
              <div className="lp-reason-icon">{r.icon}</div>
              <h3 className="lp-reason-head">{r.head}</h3>
              <p className="lp-reason-body">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role picker */}
      <section className="lp-roles">
        <h2 className="lp-section-head">Pick your role</h2>
        <p className="lp-section-sub">You can hold multiple roles — start with the one that fits best.</p>
        <div className="lp-role-grid">
          {ROLES.map((r) => (
            <Link
              key={r.k}
              href={`/register?role=${r.k}`}
              className="lp-role-card"
              style={{ '--role-c': r.c } as React.CSSProperties}
            >
              <span className="lp-role-icon" style={{ color: r.c }}>{r.icon}</span>
              <strong className="lp-role-label">{r.label}</strong>
              <span className="lp-role-sub">{r.sub}</span>
              <span className="lp-role-cta" style={{ color: r.c }}>Join as {r.label} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="lp-footer-cta">
        <h2 className="lp-hero-h" style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', marginBottom: '1rem' }}>
          Ready to find your sound?
        </h2>
        <div className="lp-hero-actions">
          <Link href="/register" className="lp-btn-primary">Get started free</Link>
          <Link href="/artists" className="lp-btn-ghost">Browse artists →</Link>
        </div>
      </section>
    </main>
  );
}
