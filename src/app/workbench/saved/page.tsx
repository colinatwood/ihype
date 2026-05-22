import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { SavedTracksPlaylist } from '@/components/SavedTracksPlaylist';

export const metadata: Metadata = { title: 'Saved Tracks · iHYPE Workbench' };
export const dynamic = 'force-dynamic';

export default async function SavedTracksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/landing');

  const seeds = await db.seed.findMany({
    where: { userId: session.user.id, action: 'save' },
    orderBy: { createdAt: 'desc' },
    select: { mediaId: true, createdAt: true }
  });

  const mediaIds = seeds.map((s) => s.mediaId);

  const assets = mediaIds.length > 0
    ? await db.artistMediaAsset.findMany({
        where: { hexId: { in: mediaIds } },
        select: {
          hexId: true,
          title: true,
          notes: true,
          storageUrl: true,
          storageKey: true,
          storageProvider: true,
          profile: { select: { name: true, slug: true, avatarImage: true } }
        }
      })
    : [];

  // Preserve the seeds order (most recently saved first)
  const assetMap = new Map(assets.map((a) => [a.hexId, a]));
  const ordered = seeds
    .map((s) => {
      const asset = assetMap.get(s.mediaId);
      if (!asset) return null;
      const url = asset.storageUrl ?? `/api/media/${asset.hexId}`;
      return {
        hexId: asset.hexId,
        title: asset.title,
        notes: asset.notes ?? null,
        url,
        artistName: asset.profile.name,
        artistSlug: asset.profile.slug,
        artworkUrl: asset.profile.avatarImage ?? null,
        savedAt: s.createdAt
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  return (
    <main className="wb-main">
      <div className="wb-content">
        <h1 style={{ marginBottom: '0.25rem' }}>Saved tracks</h1>
        <p className="meta" style={{ marginBottom: '1.5rem' }}>
          Tracks you saved while listening in the Discover feed.
        </p>
        {ordered.length === 0 ? (
          <div className="empty">
            <span className="empty-title">No saved tracks yet.</span>
            <p>While listening in Discover, tap Save to bookmark a track here.</p>
          </div>
        ) : (
          <SavedTracksPlaylist tracks={ordered} />
        )}
      </div>
    </main>
  );
}
