import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { SavedPlaylistPlayButton } from '@/components/SavedPlaylistPlayButton';

export const metadata = { title: 'Playlists · iHYPE' };
export const dynamic = 'force-dynamic';

export default async function PlaylistsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [seeds, curatedPlaylists] = await Promise.all([
    db.seed.findMany({
      where: { userId: session.user.id, action: 'save' },
      orderBy: { createdAt: 'desc' },
      take: 500
    }),
    db.curatedPlaylist.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const mediaIds = [...new Set(seeds.map((s) => s.mediaId))];
  const media = mediaIds.length
    ? await db.artistMediaAsset.findMany({
        where: { id: { in: mediaIds } },
        select: { id: true, title: true, profile: { select: { name: true, slug: true } } }
      })
    : [];
  const mediaMap = new Map(media.map((m) => [m.id, m]));

  // Group by year-month
  const groups = new Map<string, typeof seeds>();
  for (const seed of seeds) {
    const key = seed.createdAt.toISOString().slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(seed);
  }

  return (
    <main className="container section">
      <h1>Playlists</h1>

      <section className="section">
        <h2>Saved tracks</h2>
        {seeds.length === 0 ? (
          <p className="meta">You haven&apos;t saved anything yet. Swipe right on the discovery feed to save tracks.</p>
        ) : (
          <>
            <p className="meta">{seeds.length} saved · grouped by month</p>
            {[...groups.entries()].map(([month, items]) => (
              <section key={month} className="section">
                <h3 style={{ marginBottom: 8 }}>
                  {new Date(`${month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
                  {items.map((seed) => {
                    const m = mediaMap.get(seed.mediaId);
                    if (!m) return null;
                    return (
                      <li key={seed.id} className="panel" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{m.title}</strong>
                          <div className="meta">{m.profile?.name ?? 'Unknown'}</div>
                        </div>
                        <SavedPlaylistPlayButton id={m.id} title={m.title} artist={m.profile?.name ?? ''} />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </>
        )}
      </section>

      <section className="section">
        <div className="badge">Curated</div>
        <h2>Staff playlists</h2>
        <p className="meta">Handpicked collections from the iHYPE team.</p>
        {curatedPlaylists.length === 0 ? (
          <p className="meta">No curated playlists yet. Check back soon.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12, marginTop: 16 }}>
            {curatedPlaylists.map((playlist) => {
              const tracks = Array.isArray(playlist.tracks) ? playlist.tracks : [];
              return (
                <li key={playlist.id} className="panel" style={{ padding: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 6px' }}>{playlist.title}</h3>
                  {playlist.description && <p className="meta" style={{ margin: '0 0 8px' }}>{playlist.description}</p>}
                  <p className="meta">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</p>
                  <p className="meta" style={{ fontSize: 11 }}>
                    Added {new Date(playlist.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
