import Link from 'next/link';

export default function LandingPage() {
  return (
    <main style={{ background: 'var(--bg-base)', color: 'var(--ink-1)', minHeight: '100vh', fontFamily: 'var(--font-body)', overflow: 'hidden', position: 'relative' }}>
      {/* Background mesh */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', left: '-10%', top: '-5%', width: '55%', height: '55%', borderRadius: '50%', background: '#ff5029', filter: 'blur(100px)', opacity: .12, animation: 'meshMove 4s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', right: '-5%', top: '20%', width: '45%', height: '45%', borderRadius: '50%', background: '#b983ff', filter: 'blur(100px)', opacity: .1, animation: 'meshMove 5.5s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', left: '10%', bottom: '5%', width: '40%', height: '40%', borderRadius: '50%', background: '#22e5d4', filter: 'blur(100px)', opacity: .08, animation: 'meshMove 3.8s ease-in-out infinite alternate' }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--line)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-.04em', color: 'var(--accent)' }}>iHYPE</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.66rem', letterSpacing: '.18em', textTransform: 'uppercase', color: '#ffb84a', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(255,184,74,.3)', background: 'rgba(255,184,74,.08)' }}>Closed Beta</span>
          <Link href="/app" style={{ padding: '8px 18px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', boxShadow: '0 2px 12px rgba(255,80,41,.3)' }}>Try demo →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '5rem 1.5rem 4rem', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 18 }}>Music. Tickets. No middlemen.</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.8rem, 8vw, 5rem)', letterSpacing: '-.04em', lineHeight: 1, marginBottom: 20 }}>
          The fan platform<br />
          <span style={{ color: 'var(--accent)' }}>artists own.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Direct ticket sales. 45% to artists, 45% to venues, 10% to promoters. iHYPE takes nothing. Discover music through Seeds — swipe to hype, skip, or save.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/app" style={{ display: 'inline-block', padding: '14px 28px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 24px rgba(255,80,41,.3)' }}>Enter iHYPE demo →</Link>
          <a href="#how" style={{ display: 'inline-block', padding: '14px 28px', borderRadius: 999, border: '1px solid var(--line)', color: 'var(--ink-2)', fontFamily: 'var(--font-body)', fontSize: '1rem', textDecoration: 'none' }}>How it works</a>
        </div>
      </section>

      {/* Split breakdown */}
      <section style={{ position: 'relative', zIndex: 10, padding: '3rem 1.5rem', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ height: 12, borderRadius: 999, overflow: 'hidden', display: 'flex', gap: 3, marginBottom: 12 }}>
          <div style={{ flex: 45, background: '#ff5029', borderRadius: '999px 0 0 999px' }} />
          <div style={{ flex: 45, background: '#22e5d4' }} />
          <div style={{ flex: 10, background: '#b983ff', borderRadius: '0 999px 999px 0' }} />
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { label: 'Artist', pct: '45%', desc: 'Direct deposit. Always.', color: '#ff5029' },
            { label: 'Venue', pct: '45%', desc: 'No booking fees ever.', color: '#22e5d4' },
            { label: 'Promoters', pct: '10%', desc: 'Fans earn for referrals.', color: '#b983ff' },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: s.label === 'Promoters' ? 10 : 45, paddingRight: i < 2 ? 8 : 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>{s.pct}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', color: s.color, marginTop: 2 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '.78rem', color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="how" style={{ position: 'relative', zIndex: 10, padding: '3rem 1.5rem', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--ink-3)', textAlign: 'center', marginBottom: 32 }}>What makes iHYPE different</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { icon: '🌱', title: 'Seeds', desc: 'Swipe through artist previews. Hype what you love, skip what you don\'t. Your taste shapes the charts.' },
            { icon: '📻', title: 'Radio', desc: 'DJ-curated live sets. Host your own station. Earn promoter cuts from every ticket sold through your link.' },
            { icon: '🎟', title: 'Direct tickets', desc: 'No hidden fees. No bots. Tickets go direct from venue to fan. 45% to the artist, no exceptions.' },
            { icon: '📊', title: 'HYPE charts', desc: 'Real-time demand driven by fan hypes, not pay-to-play. Artists rise on merit, not marketing spend.' },
          ].map(f => (
            <div key={f.title} style={{ padding: '1.25rem', borderRadius: 18, border: '1px solid var(--line)', background: 'var(--bg-surface)' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '.82rem', color: 'var(--ink-3)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section style={{ position: 'relative', zIndex: 10, padding: '3rem 1.5rem 2rem', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--ink-3)', textAlign: 'center', marginBottom: 20 }}>Four roles. One platform.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { icon: '🎶', label: 'Fan', color: '#b983ff', desc: 'Discover, hype, earn referrals.' },
            { icon: '📻', label: 'DJ', color: '#ff3e9a', desc: 'Build crates, host radio, promote.' },
            { icon: '🎤', label: 'Artist', color: '#ff5029', desc: '45% of every ticket. Always.' },
            { icon: '🏛️', label: 'Venue', color: '#22e5d4', desc: 'Book from demand data. 45% guaranteed.' },
          ].map(r => (
            <div key={r.label} style={{ padding: '1rem', borderRadius: 16, border: `1px solid ${r.color}22`, background: `${r.color}08`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{r.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.95rem', color: r.color }}>{r.label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '.78rem', color: 'var(--ink-3)', marginTop: 2 }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', letterSpacing: '-.03em', marginBottom: 12 }}>Ready to hype?</div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '.9rem', color: 'var(--ink-3)', marginBottom: 28 }}>Enter invite code <strong style={{ color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>IHYPE</strong> to try the demo.</p>
        <Link href="/app" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 24px rgba(255,80,41,.3)' }}>Launch the app →</Link>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.66rem', color: 'var(--ink-3)', marginTop: 16, letterSpacing: '.06em' }}>No app store required · Runs in your browser · Beta — no real transactions</div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid var(--line)', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.66rem', color: 'var(--ink-3)', letterSpacing: '.08em' }}>iHYPE v0.1.0-beta.5 · Nonprofit pending · © 2026 iHYPE Inc.</div>
      </footer>
    </main>
  );
}
