import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Taste Match · iHYPE Workbench' };
export const dynamic = 'force-dynamic';

function UsernameForm({ defaultValue }: { defaultValue?: string }) {
  return (
    <form method="GET" style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <label className="field" style={{ margin: 0, minWidth: 220 }}>
        <span style={{ fontSize: '0.7rem', opacity: 0.55 }}>Enter a username to compare taste</span>
        <input name="user" defaultValue={defaultValue} placeholder="username" style={{ fontSize: '0.9rem' }} autoComplete="off" />
      </label>
      <button className="button" type="submit">Compare</button>
    </form>
  );
}

export default async function TasteMatchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/landing');
  const userId = session.user.id;

  const sp = await searchParams;
  const targetUsername = sp.user?.trim().replace(/^@/, '') ?? '';

  if (!targetUsername) {
    return (
      <main className="wb-main">
        <div className="wb-content" style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ marginBottom: '0.25rem' }}>Taste Match</h1>
            <p className="meta">Compare your music taste with another iHYPE user.</p>
          </div>
          <div className="panel" style={{ padding: '1.5rem' }}>
            <UsernameForm />
          </div>
        </div>
      </main>
    );
  }

  const targetUser = await db.user.findFirst({
    where: { username: { equals: targetUsername, mode: 'insensitive' } },
    select: { id: true, username: true, name: true, image: true }
  });

  if (!targetUser) {
    return (
      <main className="wb-main">
        <div className="wb-content" style={{ maxWidth: 680, margin: '0 auto' }}>
          <h1 style={{ marginBottom: '1rem' }}>Taste Match</h1>
          <div className="panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <UsernameForm defaultValue={targetUsername} />
          </div>
          <div className="panel" style={{ padding: '1rem 1.25rem' }}>
            <p style={{ margin: 0, opacity: 0.6 }}>User <strong>@{targetUsername}</strong> not found.</p>
          </div>
        </div>
      </main>
    );
  }

  if (targetUser.id === userId) {
    return (
      <main className="wb-main">
        <div className="wb-content" style={{ maxWidth: 680, margin: '0 auto' }}>
          <h1 style={{ marginBottom: '1rem' }}>Taste Match</h1>
          <div className="panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <UsernameForm defaultValue={targetUsername} />
          </div>
          <p className="meta">That's you. Try comparing with someone else.</p>
        </div>
      </main>
    );
  }

  // Fetch both users' hype data
  const [myHypes, theirHypes, myListens, theirListens] = await Promise.all([
    db.profileHypeEvent.findMany({
      where: { userId },
      select: { profileId: true, profile: { select: { name: true, slug: true, avatarImage: true, genres: true, type: true } } }
    }),
    db.profileHypeEvent.findMany({
      where: { userId: targetUser.id },
      select: { profileId: true, profile: { select: { name: true, slug: true, avatarImage: true, genres: true, type: true } } }
    }),
    db.mediaListen.findMany({ where: { userId }, select: { mediaId: true } }),
    db.mediaListen.findMany({ where: { userId: targetUser.id }, select: { mediaId: true } })
  ]);

  const myProfileIds = new Set(myHypes.map(h => h.profileId));
  const theirProfileIds = new Set(theirHypes.map(h => h.profileId));

  const sharedIds = [...myProfileIds].filter(id => theirProfileIds.has(id));
  const onlyMine = myHypes.filter(h => !theirProfileIds.has(h.profileId));
  const onlyTheirs = theirHypes.filter(h => !myProfileIds.has(h.profileId));

  // Genre Jaccard similarity
  const myGenres = new Set(myHypes.flatMap(h => h.profile.genres.map(g => g.toLowerCase())));
  const theirGenres = new Set(theirHypes.flatMap(h => h.profile.genres.map(g => g.toLowerCase())));
  const genreIntersection = [...myGenres].filter(g => theirGenres.has(g));
  const genreUnion = new Set([...myGenres, ...theirGenres]);
  const genreJaccard = genreUnion.size > 0 ? genreIntersection.length / genreUnion.size : 0;

  // Artist overlap
  const artistJaccard = (myProfileIds.size + theirProfileIds.size - sharedIds.length) > 0
    ? sharedIds.length / (myProfileIds.size + theirProfileIds.size - sharedIds.length) : 0;

  // Track overlap
  const myMediaIds = new Set(myListens.map(l => l.mediaId));
  const sharedTracks = theirListens.filter(l => myMediaIds.has(l.mediaId)).length;
  const trackUnion = new Set([...myListens.map(l => l.mediaId), ...theirListens.map(l => l.mediaId)]);
  const trackJaccard = trackUnion.size > 0 ? sharedTracks / trackUnion.size : 0;

  // Overall match score (weighted average)
  const matchScore = Math.round((genreJaccard * 0.4 + artistJaccard * 0.45 + trackJaccard * 0.15) * 100);

  // Shared profile details
  const sharedProfiles = myHypes.filter(h => sharedIds.includes(h.profileId)).slice(0, 12);

  // Shared genres
  const sharedGenres = genreIntersection.slice(0, 10);

  // Score label
  const scoreLabel = matchScore >= 80 ? 'Twins' : matchScore >= 60 ? 'Soul mates' : matchScore >= 40 ? 'Close ears' : matchScore >= 20 ? 'Some overlap' : 'Different worlds';
  const scoreColor = matchScore >= 60 ? 'var(--accent, #ff5029)' : matchScore >= 30 ? '#c084fc' : 'rgba(255,255,255,0.4)';

  const currentUser = await db.user.findUnique({ where: { id: userId }, select: { username: true, name: true, image: true } });

  return (
    <main className="wb-main">
      <div className="wb-content" style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.25rem' }}>Taste Match</h1>
          <UsernameForm defaultValue={targetUsername} />
        </div>

        {/* Match score card */}
        <div className="panel" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', textAlign: 'center', borderTop: `4px solid ${scoreColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              {currentUser?.image && <img src={currentUser.image} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginBottom: 4 }} />}
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>@{currentUser?.username}</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{matchScore}%</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.7 }}>{scoreLabel}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              {targetUser.image && <img src={targetUser.image} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginBottom: 4 }} />}
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>@{targetUser.username}</div>
            </div>
          </div>

          {/* Score breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', maxWidth: 400, margin: '0 auto' }}>
            {[
              { label: 'Artists', value: Math.round(artistJaccard * 100) },
              { label: 'Genres', value: Math.round(genreJaccard * 100) },
              { label: 'Tracks', value: Math.round(trackJaccard * 100) },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{s.value}%</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>

          {/* Shared artists */}
          <div className="panel" style={{ padding: '1rem 1.25rem' }}>
            <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>
              Artists you both hype ({sharedIds.length})
            </h2>
            {sharedProfiles.length === 0 ? (
              <p style={{ fontSize: '0.75rem', opacity: 0.4, margin: 0 }}>No shared artists yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sharedProfiles.map(h => (
                  <Link key={h.profileId} href={`/artists/${h.profile.slug}`} title={h.profile.name} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center', width: 52 }}>
                    {h.profile.avatarImage ? (
                      <img src={h.profile.avatarImage} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                    )}
                    <span style={{ fontSize: '0.58rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{h.profile.name}</span>
                  </Link>
                ))}
                {sharedIds.length > 12 && <span style={{ fontSize: '0.65rem', opacity: 0.4, alignSelf: 'center' }}>+{sharedIds.length - 12} more</span>}
              </div>
            )}
          </div>

          {/* Shared genres */}
          <div className="panel" style={{ padding: '1rem 1.25rem' }}>
            <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>
              Shared genres ({genreIntersection.length})
            </h2>
            {sharedGenres.length === 0 ? (
              <p style={{ fontSize: '0.75rem', opacity: 0.4, margin: 0 }}>No genre overlap yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {sharedGenres.map(g => (
                  <span key={g} style={{ fontSize: '0.72rem', padding: '3px 8px', background: 'rgba(255,80,41,0.15)', border: '1px solid rgba(255,80,41,0.3)', borderRadius: 12, textTransform: 'capitalize' }}>{g}</span>
                ))}
                {genreIntersection.length > 10 && <span style={{ fontSize: '0.65rem', opacity: 0.4, alignSelf: 'center' }}>+{genreIntersection.length - 10}</span>}
              </div>
            )}
          </div>

          {/* Only you */}
          {onlyMine.length > 0 && (
            <div className="panel" style={{ padding: '1rem 1.25rem' }}>
              <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>
                Your exclusive picks ({onlyMine.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {onlyMine.slice(0, 8).map(h => (
                  <Link key={h.profileId} href={`/artists/${h.profile.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {h.profile.avatarImage
                      ? <img src={h.profile.avatarImage} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />}
                    <span style={{ fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.profile.name}</span>
                  </Link>
                ))}
                {onlyMine.length > 8 && <span style={{ fontSize: '0.65rem', opacity: 0.4 }}>+{onlyMine.length - 8} more</span>}
              </div>
            </div>
          )}

          {/* Only them */}
          {onlyTheirs.length > 0 && (
            <div className="panel" style={{ padding: '1rem 1.25rem' }}>
              <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>
                @{targetUser.username}'s exclusive picks ({onlyTheirs.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {onlyTheirs.slice(0, 8).map(h => (
                  <Link key={h.profileId} href={`/artists/${h.profile.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {h.profile.avatarImage
                      ? <img src={h.profile.avatarImage} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />}
                    <span style={{ fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.profile.name}</span>
                  </Link>
                ))}
                {onlyTheirs.length > 8 && <span style={{ fontSize: '0.65rem', opacity: 0.4 }}>+{onlyTheirs.length - 8} more</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
