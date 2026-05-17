import type { Metadata } from 'next';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Curated Playlists · iHYPE' };
export const dynamic = 'force-dynamic';

export default async function CuratedPlaylistsPage() {
  const playlists = await db.curatedPlaylist.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="container section" style={{ maxWidth: 700 }}>
      <div className="badge">Curated</div>
      <h1 className="title">Staff playlists</h1>
      <p className="subtitle">Handpicked collections from the iHYPE team.</p>

      {playlists.length === 0 ? (
        <p className="meta">No curated playlists yet. Check back soon.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12, marginTop: 24 }}>
          {playlists.map((playlist) => {
            const tracks = Array.isArray(playlist.tracks) ? playlist.tracks : [];
            return (
              <li key={playlist.id} className="panel" style={{ padding: '1.25rem' }}>
                <h2 style={{ margin: '0 0 6px' }}>{playlist.title}</h2>
                {playlist.description && (
                  <p className="meta" style={{ margin: '0 0 8px' }}>{playlist.description}</p>
                )}
                <p className="meta">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</p>
                <p className="meta" style={{ fontSize: 11 }}>
                  Added {new Date(playlist.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
