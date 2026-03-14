import Link from 'next/link';
import { ProfileCard } from '@/components/ProfileCard';

type DirectoryProfile = {
  id: string;
  type: 'ARTIST' | 'DJ' | 'VENUE' | 'LISTENER';
  slug: string;
  hexId: string;
  name: string;
  city: string | null;
  stateRegion: string | null;
  country: string | null;
  hypeCount: number;
  bio: string | null;
  genres: string[];
  avatarImage: string | null;
};

function getTopMarkets(profiles: DirectoryProfile[]) {
  const counts = new Map<string, number>();

  for (const profile of profiles) {
    const label = [profile.city, profile.stateRegion ?? profile.country].filter(Boolean).join(', ');
    if (!label) {
      continue;
    }

    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([label, count]) => `${label} (${count})`);
}

export function ProfileDirectoryPage({
  badge,
  title,
  description,
  profiles
}: {
  badge: string;
  title: string;
  description: string;
  profiles: DirectoryProfile[];
}) {
  const topMarkets = getTopMarkets(profiles);
  const totalHype = profiles.reduce((sum, profile) => sum + profile.hypeCount, 0);

  return (
    <main className="container section">
      <section className="directory-hero panel">
        <div className="directory-hero-copy">
          <div className="badge">{badge}</div>
          <h1 className="directory-title">{title}</h1>
          <p className="subtitle">{description}</p>
          <div className="cta-row">
            <Link className="button" href="/shows">
              Browse live shows
            </Link>
            <Link className="button secondary" href="/integrity">
              View transparency
            </Link>
          </div>
        </div>

        <div className="directory-hero-stats">
          <div className="directory-stat">
            <span>Profiles</span>
            <strong>{profiles.length}</strong>
          </div>
          <div className="directory-stat">
            <span>Total hype</span>
            <strong>{totalHype}</strong>
          </div>
          <div className="directory-stat">
            <span>Top markets</span>
            <strong>{topMarkets[0] ?? 'Building'}</strong>
          </div>
        </div>
      </section>

      {topMarkets.length ? (
        <section className="section directory-market-strip" aria-label="Top markets">
          {topMarkets.map((market) => (
            <span className="directory-market-pill" key={market}>
              {market}
            </span>
          ))}
        </section>
      ) : null}

      <section className="section">
        <div className="grid grid-3">
          {profiles.length ? (
            profiles.map((profile) => <ProfileCard key={profile.id} profile={profile} />)
          ) : (
            <div className="empty">Nothing is published here yet.</div>
          )}
        </div>
      </section>
    </main>
  );
}
