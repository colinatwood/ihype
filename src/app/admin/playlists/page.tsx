import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isAdminSession } from '@/lib/permissions';
import { AdminNav } from '@/components/AdminNav';

export const metadata: Metadata = { title: 'Curated Playlists · Admin · iHYPE' };
export const dynamic = 'force-dynamic';

export default async function AdminPlaylistsPage() {
  const session = await auth();
  if (!isAdminSession(session)) redirect('/login');

  const playlists = await db.curatedPlaylist.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="container section">
      <AdminNav active="playlists" />
      <h1 className="title">Curated Playlists</h1>
      <p className="meta" style={{ marginBottom: 16 }}>
        Manage staff-curated playlists. Use the API at <code>/api/admin/playlists</code> to create and update.
      </p>

      {playlists.length === 0 ? (
        <p className="meta">No playlists yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Tracks</th>
              <th>Published</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {playlists.map((pl) => {
              const tracks = Array.isArray(pl.tracks) ? pl.tracks : [];
              return (
                <tr key={pl.id}>
                  <td>{pl.title}</td>
                  <td>{tracks.length}</td>
                  <td>{pl.published ? '✓' : '—'}</td>
                  <td>{new Date(pl.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
