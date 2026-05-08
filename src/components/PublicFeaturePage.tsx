import Link from 'next/link';
import type { ReactNode } from 'react';

type FeatureSignal = {
  kicker: string;
  title: string;
  copy: string;
  metric: string;
};

type FeatureCard = {
  label: string;
  title: string;
  copy: string;
  href?: string;
};

type FeatureAction = {
  href: string;
  label: string;
  variant?: 'primary' | 'ghost';
};

export function PublicFeaturePage({
  eyebrow,
  title,
  gradient,
  lede,
  actions,
  note,
  signals,
  sectionEyebrow,
  sectionTitle,
  sectionCopy,
  cards,
  children
}: {
  eyebrow: string;
  title: string;
  gradient: string;
  lede: string;
  actions: FeatureAction[];
  note?: string;
  signals: FeatureSignal[];
  sectionEyebrow: string;
  sectionTitle: string;
  sectionCopy: string;
  cards: FeatureCard[];
  children?: ReactNode;
}) {
  return (
    <main className="ihype-home-page ihype-feature-page">
      <section className="ihype-home-hero ihype-feature-hero" aria-labelledby="ihype-feature-title">
        <div className="ihype-home-shell">
          <div className="ihype-hero-copy">
            <p className="ihype-eyebrow">{eyebrow}</p>
            <h1 id="ihype-feature-title" className="ihype-home-title">
              {title}
              <span className="ihype-gradient-text">{gradient}</span>
            </h1>
            <p className="ihype-home-lede">{lede}</p>
            <div className="ihype-hero-actions">
              {actions.map((action) => (
                <Link
                  className={`ihype-home-button ${
                    action.variant === 'ghost' ? 'ihype-home-button-ghost' : 'ihype-home-button-primary'
                  }`}
                  href={action.href}
                  key={`${action.href}-${action.label}`}
                >
                  {action.label}
                </Link>
              ))}
              {note ? <span className="ihype-hero-note">{note}</span> : null}
            </div>
          </div>

          <div className="ihype-hero-art-grid" aria-label="iHYPE feature signals">
            {signals.map((signal) => (
              <article className="ihype-signal-card" key={signal.kicker}>
                <span>{signal.kicker}</span>
                <strong>{signal.title}</strong>
                <p>{signal.copy}</p>
                <small>{signal.metric}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ihype-roles-section ihype-feature-section" aria-labelledby="ihype-feature-section-title">
        <div className="ihype-roles-shell">
          <div className="ihype-section-heading">
            <p className="ihype-section-kicker">{sectionEyebrow}</p>
            <h2 id="ihype-feature-section-title">{sectionTitle}</h2>
            <p>{sectionCopy}</p>
          </div>

          <div className="ihype-feature-card-grid">
            {cards.map((card) => {
              const content = (
                <>
                  <span className="ihype-role-badge ihype-role-badge-promoter">{card.label}</span>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                  {card.href ? <span className="ihype-learn-link">Open -&gt;</span> : null}
                </>
              );

              return card.href ? (
                <Link className="ihype-role-card ihype-feature-card" href={card.href} key={card.label}>
                  {content}
                </Link>
              ) : (
                <article className="ihype-role-card ihype-feature-card" key={card.label}>
                  {content}
                </article>
              );
            })}
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
