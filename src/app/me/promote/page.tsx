import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getPromoterDashboard } from '@/lib/promoterDashboard';
import { formatCurrencyFromCents } from '@/lib/ticketing';
import { PromoteShareButton } from '@/components/PromoteShareButton';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Share & Earn · iHYPE',
  description: 'Promote shows you love and earn a share of the 10% promoter pool on every ticket you drive.',
  robots: { index: false, follow: false },
};

function fmtDate(iso: string | null): string {
  if (!iso) return 'TBD';
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default async function PromotePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/me/promote');
  }

  const d = await getPromoterDashboard(session.user.id);

  return (
    <main className="promote-page">
      <style>{PROMOTE_CSS}</style>

      <header className="promote-head">
        <span className="promote-eyebrow">SHARE &amp; EARN · 10% PROMOTER POOL</span>
        <h1 className="promote-title">Promote the scene.<br />Earn your cut.</h1>
        <p className="promote-sub">
          Share any show with your link. When someone buys a ticket through it, you earn a
          proportional slice of that show&apos;s 10% promoter pool — no cost to the fan, no cut from the artist or venue.
        </p>
      </header>

      <section className="promote-stats">
        <Stat value={String(d.clicks)} label="Link clicks" color="#b983ff" />
        <Stat value={String(d.ticketsSold)} label="Tickets driven" color="#22e5d4" />
        <Stat value={formatCurrencyFromCents(d.grossRevenueCents)} label="Gate driven" color="#ff5029" />
        <Stat value={formatCurrencyFromCents(d.earnedCents)} label="Earned (pending)" color="#ff3e9a" />
      </section>

      <section className="promote-shows">
        <h2 className="promote-h2">Shows you can promote</h2>
        {d.shows.length === 0 ? (
          <div className="promote-empty">
            <p>No upcoming ticketed shows to promote right now.</p>
            <Link href="/discover" className="promote-cta">Browse the scene</Link>
          </div>
        ) : (
          <ul className="promote-list">
            {d.shows.map((s) => (
              <li key={s.slug} className="promote-row">
                <div className="promote-row-main">
                  <Link href={`/shows/${s.slug}`} className="promote-row-title">{s.title}</Link>
                  <div className="promote-row-meta">
                    {fmtDate(s.startsAt)}{s.venueName ? ` · ${s.venueName}` : ''} · {s.promoterPayoutPercent}% pool
                  </div>
                </div>
                <PromoteShareButton link={s.promoLink} title={s.title} slug={s.slug} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="promote-foot">
        Earnings settle to your payout account once it&apos;s connected. Splits are locked at 45% artist / 45% venue / 10% promoters.
      </p>
    </main>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="promote-stat">
      <div className="promote-stat-value" style={{ color }}>{value}</div>
      <div className="promote-stat-label">{label}</div>
    </div>
  );
}

const PROMOTE_CSS = `
.promote-page { max-width: 720px; margin: 0 auto; padding: 32px 16px 64px; }
.promote-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.16em; color: #b983ff; }
.promote-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 34px; line-height: 1.0; letter-spacing: -0.03em; color: #f0ebe5; margin: 10px 0 12px; }
.promote-sub { font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.6; color: rgba(240,235,229,0.6); max-width: 56ch; margin: 0; }
.promote-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 28px 0; }
.promote-stat { background: #100d09; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 18px 16px; }
.promote-stat-value { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 30px; line-height: 1; letter-spacing: -0.03em; }
.promote-stat-label { font-family: 'DM Sans', sans-serif; font-size: 13px; color: rgba(240,235,229,0.55); margin-top: 6px; }
.promote-h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; letter-spacing: -0.02em; color: #f0ebe5; margin: 0 0 14px; }
.promote-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.promote-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 16px; background: #100d09; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; }
.promote-row-main { min-width: 0; }
.promote-row-title { font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 15px; color: #f0ebe5; text-decoration: none; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.promote-row-title:hover { color: #ff5029; }
.promote-row-meta { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(240,235,229,0.45); margin-top: 4px; }
.promote-share-btn, .promote-cta { flex-shrink: 0; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; padding: 10px 18px; border-radius: 9999px; border: none; cursor: pointer; background: linear-gradient(135deg, #ff5029, #ff3e6e); color: #fff; text-decoration: none; display: inline-block; }
.promote-empty { text-align: center; padding: 24px; background: #100d09; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; }
.promote-empty p { font-family: 'DM Sans', sans-serif; color: rgba(240,235,229,0.6); margin: 0 0 14px; }
.promote-foot { font-family: 'DM Sans', sans-serif; font-size: 12px; color: rgba(240,235,229,0.4); text-align: center; margin-top: 28px; line-height: 1.6; }
`;
