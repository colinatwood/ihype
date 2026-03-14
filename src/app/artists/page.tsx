import { ProfileDirectoryPage } from '@/components/ProfileDirectoryPage';
import { getDirectoryProfiles } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function ArtistsIndexPage() {
  const artists = await getDirectoryProfiles('ARTIST');

  return (
    <ProfileDirectoryPage
      badge="ARTISTS"
      description="Artist pages hold uploads, journal updates, tour context, and the hype signal building around each act."
      profiles={artists}
      title="Artist directory"
    />
  );
}
