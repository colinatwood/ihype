import Link from 'next/link';

const productGates = [
  'App Store and Play Store approvals completed, or the pre-approval checklist cleared with resubmission buffer built in.',
  'Playback, upload, and account flows pass a documented beta soak test before public promotion.',
  'Crash-free sessions at or above 99.0% on both iOS and Android.',
  'Anti-fraud controls live: rate limiting, playback verification, device fingerprinting, and basic bot scoring.',
  'DMCA takedown workflow and content-policy enforcement fully operational before public launch.'
];

const legalGates = [
  'Delaware PBC decision made, IP assigned to the company, and contributor agreements executed.',
  'Terms of Service, Privacy Policy, DMCA Policy, Acceptable Use Policy, and Community Guidelines published.',
  'Artist Upload License Agreement deployed as a click-through flow in product.',
  'Payments structured through Stripe Connect or similar to avoid money-transmission exposure.',
  'KYC, AML, and US tax reporting plans defined before any payout program goes live.'
];

const gtmGates = [
  'Beta roster uses real opted-in artists, promoters, venues, and fans only.',
  'Launch communications avoid fictional users, fictional events, and simulated growth numbers.',
  'Support and moderation coverage is mapped before inviting broader public traffic.'
];

const corePillars = [
  {
    title: 'Hype Engine System of Record',
    body:
      'Store raw playback milestones and hype events in append-only tables, then compute derived hype values with a versioned algorithm so the platform can recompute history without losing trust.'
  },
  {
    title: 'Launch-Safe Fraud Defense',
    body:
      'Gate hype behind verified completion, device and IP consistency checks, rate limits, and manual anomaly review queues before considering heavier ML enforcement.'
  },
  {
    title: 'Rights and Safety First',
    body:
      'Keep launch focused on artist-uploaded content with explicit licensing, prohibit covers and remixes without proof of rights, and run a clear DMCA plus repeat-infringer workflow.'
  },
  {
    title: 'Payments Without Regulatory Drift',
    body:
      'When ticketing or payouts expand, use connected accounts, minimum payout thresholds, reserves, and immutable payout ledgers instead of holding funds in ad hoc flows.'
  }
];

const roadmap = [
  {
    phase: '90 Days Out',
    items: [
      'Define the first beta market and acceptance criteria.',
      'Invite only real account owners with clear consent.',
      'Document support, moderation, and incident ownership.'
    ]
  },
  {
    phase: '60 Days Out',
    items: [
      'Test onboarding, profile setup, media upload, and email MFA.',
      'Review every public page for beta-safe language.',
      'Pressure-test analytics, moderation, and account recovery.'
    ]
  },
  {
    phase: '30 Days Out',
    items: [
      'Prepare beta invite copy and public status notes.',
      'Lock the real beta roster and venue operations plan if ticketing is included.',
      'Finalize support macros, incident runbooks, and escalation coverage.'
    ]
  },
  {
    phase: 'Launch Targets',
    items: [
      'Measure verified account activation, not vanity traffic.',
      'Measure completed listens, profile updates, and successful MFA delivery.',
      'Publish only real aggregate counters from production data.'
    ]
  }
];

const operatingSystem = [
  {
    title: 'Legal and Policy Stack',
    items: [
      'Terms of Service, Privacy Policy, DMCA Policy, Acceptable Use Policy, Community Guidelines',
      'Artist Upload License Agreement, promoter payout terms, venue terms where applicable',
      'Founder IP assignment, contractor invention assignment, advisor and vendor agreements'
    ]
  },
  {
    title: 'Technical Hardening',
    items: [
      'Playback milestone validation and short-lived hype eligibility tokens',
      'Rate limits, signed media URLs, WAF coverage, audit logs, and restore-tested backups',
      'Sentry and analytics dashboards for stream latency, crash rates, 5xx spikes, and fraud anomalies'
    ]
  },
  {
    title: 'Community and Support',
    items: [
      'Hype-only culture with comments off by default and artist-controlled approval queues',
      'Support channels for upload issues, takedowns, account recovery, and payout questions',
      'Moderation SLAs: harassment in 24 hours, copyright in 48 hours, fraud in 24 to 72 hours'
    ]
  }
];

const transparencyLessons = [
  {
    title: 'Public Heuristics Ledger',
    body:
      'Ranking logic, visibility gates, and trust-facing rules should be documented in a versioned ledger rather than left as tribal knowledge.'
  },
  {
    title: 'Why Am I Seeing This?',
    body:
      'Important surfaces should expose plain-language explanations so growth mechanics are inspectable by users, artists, and partners.'
  },
  {
    title: 'Daily or Delayed Transparency Reports',
    body:
      'Aggregate platform snapshots should be published on a predictable cadence so trust metrics are not trapped inside operator dashboards.'
  },
  {
    title: 'Governance Over Silent Drift',
    body:
      'High-impact rule changes should be versioned, disclosed, and reviewable instead of quietly reshaping user outcomes in the background.'
  }
];

const risks = [
  {
    name: 'Pirated uploads',
    mitigation: 'DMCA intake, repeat-infringer policy, fast takedown logging, and later fingerprinting.'
  },
  {
    name: 'Bot-driven hype',
    mitigation: 'Completion verification, token gating, device and IP limits, and manual anomaly review.'
  },
  {
    name: 'App store rejection',
    mitigation: 'Pre-review checklist, policy clarity, and avoiding cash-for-engagement claims in the MVP.'
  },
  {
    name: 'Low retention after launch',
    mitigation: 'Market relevance, weekly product reviews, shareable profiles, and fast onboarding fixes.'
  },
  {
    name: 'Scaling outages',
    mitigation: 'Load tests, alerts, clear SEV1 runbooks, and a 15-minute triage rule during launch week.'
  },
  {
    name: 'Brand trust erosion',
    mitigation: 'Transparent policies, quick moderation, and a product stance that values integrity over vanity metrics.'
  }
];

export const metadata = {
  title: 'Launch Readiness | iHYPE.org',
  description: 'Beta launch-readiness plan for iHYPE.org.'
};

export default function LaunchReadinessPage() {
  return (
    <main className="container section">
      <section className="panel launch-hero">
        <div className="launch-hero-copy">
          <div className="badge">Beta Readiness Package</div>
          <h1 className="title" style={{ fontSize: '3rem' }}>iHYPE beta plan, distilled for execution.</h1>
          <p className="subtitle">
            This page keeps the launch-readiness work honest: no fictional roster, no fictional launch date, and no
            public growth numbers that are not backed by production data.
          </p>
          <div className="cta-row">
            <Link className="button" href="/artists">Open artist pages</Link>
            <Link className="button secondary" href="/dashboard">Open dashboard</Link>
          </div>
        </div>
        <div className="launch-hero-meta">
          <div className="stat"><strong>Beta</strong>Status</div>
          <div className="stat"><strong>TBD</strong>First market</div>
          <div className="stat"><strong>TBD</strong>Public launch date</div>
          <div className="stat"><strong>Real data only</strong>Public rule</div>
        </div>
      </section>

      <section className="section">
        <div className="launch-section-heading">
          <div className="badge">Executive Gate</div>
          <h2>Launch-ready means product, legal, and GTM all clear together.</h2>
          <p className="kicker">
            A public launch is only real when the app, the policies, and the market-specific go-to-market motion are all
            operational at the same time.
          </p>
        </div>

        <div className="launch-grid launch-grid-3">
          <article className="panel launch-card">
            <h3>Product Gates</h3>
            <ul className="launch-list">
              {productGates.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article className="panel launch-card">
            <h3>Legal and Compliance</h3>
            <ul className="launch-list">
              {legalGates.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article className="panel launch-card">
            <h3>Go-to-Market</h3>
            <ul className="launch-list">
              {gtmGates.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="launch-section-heading">
          <div className="badge">Core Pillars</div>
          <h2>The strongest operational ideas to keep from the full manual.</h2>
        </div>

        <div className="launch-grid launch-grid-2">
          {corePillars.map((pillar) => (
            <article className="panel launch-card" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p className="artist-copy">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="launch-section-heading">
          <div className="badge">90 / 60 / 30</div>
          <h2>Beta rollout and launch calendar.</h2>
        </div>

        <div className="launch-grid launch-grid-4">
          {roadmap.map((step) => (
            <article className="panel launch-card" key={step.phase}>
              <h3>{step.phase}</h3>
              <ul className="launch-list">
                {step.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="launch-section-heading">
          <div className="badge">Operating System</div>
          <h2>What needs to exist behind the product before a real launch.</h2>
        </div>

        <div className="launch-grid launch-grid-3">
          {operatingSystem.map((group) => (
            <article className="panel launch-card" key={group.title}>
              <h3>{group.title}</h3>
              <ul className="launch-list">
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="launch-section-heading">
          <div className="badge">Rift-Inspired Lessons</div>
          <h2>Best practices worth carrying into HYPE from transparency-first platform design.</h2>
        </div>

        <div className="launch-grid launch-grid-2">
          {transparencyLessons.map((lesson) => (
            <article className="panel launch-card" key={lesson.title}>
              <h3>{lesson.title}</h3>
              <p className="artist-copy">{lesson.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="launch-section-heading">
          <div className="badge">Risk Register</div>
          <h2>The risks worth tracking first, with concrete mitigations.</h2>
        </div>

        <div className="panel launch-card">
          <div className="launch-risk-table">
            <div className="launch-risk-head">Risk</div>
            <div className="launch-risk-head">Mitigation</div>
            {risks.map((risk) => (
              <div className="launch-risk-row" key={risk.name}>
                <strong>{risk.name}</strong>
                <span className="meta">{risk.mitigation}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="panel launch-card">
          <div className="badge">Guiding Principle</div>
          <h2>Integrity of hype matters more than artificial growth.</h2>
          <p className="subtitle">
            The strongest through-line in the package is that artist safety, rights, moderation quality, and credible
            demand signals are core product features. That principle is worth carrying into every launch decision.
          </p>
          <p className="meta">
            Operational and informational only, not legal or tax advice. Use counsel for final licensing, payment, and
            regulatory decisions.
          </p>
        </div>
      </section>
    </main>
  );
}
