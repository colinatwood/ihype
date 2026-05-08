import Link from 'next/link';
import { publicRoleCards } from '@/lib/role-landing-content';

export const metadata = {
  title: 'iHYPE.org | The Promise',
  description: 'Independent music, hyped by the people who love it.',
};

const liveSignals = [
  {
    kicker: 'The promise',
    title: 'Free forever',
    copy: 'A platform for independent music without paid tiers or gated discovery tools.',
    metric: 'not-for-profit - scene first',
  },
  {
    kicker: 'HYPE signal',
    title: 'Fans decide',
    copy: 'Completed listens and fan intent help artists, venues, and promoters see real demand.',
    metric: 'listen - hype - attend',
  },
  {
    kicker: 'Ticketing',
    title: 'Verified access',
    copy: 'Serialized ticket IDs and QR verification protect the room, the artist, and the fan.',
    metric: 'scan-ready - fair transfer',
  },
];

export default function PromiseHomePage() {
  return (
    <main className="ihype-home-page">
      <section className="ihype-home-hero" aria-labelledby="ihype-home-title">
        <div className="ihype-home-shell">
          <div className="ihype-hero-copy">
            <p className="ihype-eyebrow">Not-for-profit &middot; Free forever &middot; Built for the scene</p>
            <h1 id="ihype-home-title" className="ihype-home-title">
              Independent music,
              <span className="ihype-gradient-text"> hyped by the people who love it.</span>
            </h1>
            <p className="ihype-home-lede">
              iHYPE is a free music platform owned by no one with a profit motive.
              Fans discover and champion artists. Artists get paid when their music sells
              tickets. The people who make the scene - not a corporation - decide what rises.
            </p>
            <div className="ihype-hero-actions">
              <Link className="ihype-home-button ihype-home-button-primary" href="/register">
                Join free
              </Link>
              <Link className="ihype-home-button ihype-home-button-ghost" href="/login">
                Sign in
              </Link>
              <span className="ihype-hero-note">Email or phone. Two fields. Done.</span>
            </div>
          </div>

          <div className="ihype-hero-art-grid" aria-label="iHYPE platform signal preview">
            {liveSignals.map((item) => (
              <article className="ihype-signal-card" key={item.kicker}>
                <span>{item.kicker}</span>
                <strong>{item.title}</strong>
                <p>{item.copy}</p>
                <small>{item.metric}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ihype-roles-section" aria-labelledby="roles-heading">
        <div className="ihype-roles-shell">
          <div className="ihype-section-heading">
            <h2 id="roles-heading">One platform. Four roles.</h2>
            <p>
              Everyone in the ecosystem gets the same free, full-featured access.
              No tiers. No gated tools.
            </p>
          </div>

          <div className="ihype-role-grid">
            {publicRoleCards.map((role) => (
              <article className="ihype-role-card" key={role.label}>
                <div className={`ihype-role-icon ihype-role-icon-${role.icon}`} aria-hidden="true" />
                <span className={`ihype-role-badge ihype-role-badge-${role.tone}`}>
                  {role.label}
                </span>
                <h3>{role.title}</h3>
                <p>{role.copy}</p>
                <ul className="ihype-role-points">
                  {role.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <Link
                  aria-label={`Learn more about joining iHYPE as a ${role.label}`}
                  href={`/register?role=${role.registerRole}`}
                  className="ihype-learn-link"
                >
                  Learn More -&gt;
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
