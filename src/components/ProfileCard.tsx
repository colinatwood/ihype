import Link from 'next/link';
import { getSafeImageUrl } from '@/lib/asset-safety';
import { shortenHexId } from '@/lib/hex-id';

type ProfileCardProfile = {
  type: 'ARTIST' | 'DJ' | 'VENUE' | 'LISTENER';
  slug: string;
  hexId: string;
  name: string;
  city: string | null;
  country: string | null;
  hypeCount: number;
  bio: string | null;
  genres: string[];
  avatarImage: string | null;
};

function getProfileBasePath(type: ProfileCardProfile['type']) {
  if (type === 'VENUE') return 'venues';
  if (type === 'DJ') return 'promoters';
  if (type === 'LISTENER') return 'fans';
  return 'artists';
}

function getProfileLabel(type: ProfileCardProfile['type']) {
  if (type === 'DJ') return 'PROMOTER';
  if (type === 'LISTENER') return 'FAN';
  return type;
}

export function ProfileCard({ profile }: { profile: ProfileCardProfile }) {
  const basePath = getProfileBasePath(profile.type);
  const avatarImage = getSafeImageUrl(profile.avatarImage);

  return (
    <article className="card">
      {avatarImage ? (
        <div className="card-avatar">
          <img alt={`${profile.name} avatar`} className="profile-avatar" src={avatarImage} />
        </div>
      ) : null}
      <div className="badge">{getProfileLabel(profile.type)}</div>
      <h3>{profile.name}</h3>
      <p className="meta">{[profile.city, profile.country].filter(Boolean).join(', ')}</p>
      <p className="meta">
        Share ID:{' '}
        <Link href={`/profiles/${profile.hexId}`}>
          {shortenHexId(profile.hexId)}
        </Link>
      </p>
      <p className="meta">Hype: {profile.hypeCount}</p>
      <p>{profile.bio}</p>
      <div className="tag-row">
        {profile.genres.map((genre) => <span key={genre} className="tag">{genre}</span>)}
      </div>
      <div className="cta-row">
        <Link className="button small secondary" href={`/${basePath}/${profile.slug}`}>View page</Link>
      </div>
    </article>
  );
}
