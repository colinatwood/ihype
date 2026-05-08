import Link from 'next/link';

type TrustPolicyPageProps = {
  badge: string;
  title: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export function TrustPolicyPage({ badge, title, intro, sections }: TrustPolicyPageProps) {
  return (
    <main className="container section trust-policy-page">
      <section className="panel trust-policy-hero">
        <div className="badge">{badge}</div>
        <h1>{title}</h1>
        <p className="subtitle">{intro}</p>
        <div className="trust-policy-links">
          <Link className="text-link" href="/privacy">Privacy</Link>
          <Link className="text-link" href="/terms">Terms</Link>
          <Link className="text-link" href="/copyright">Copyright</Link>
          <Link className="text-link" href="/ticket-policy">Ticket policy</Link>
          <Link className="text-link" href="/community-rules">Community rules</Link>
          <Link className="text-link" href="/trust">Trust center</Link>
          <Link className="text-link" href="/support">Support</Link>
        </div>
      </section>

      <section className="grid trust-policy-grid">
        {sections.map((section) => (
          <article className="card trust-policy-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
