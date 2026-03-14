import { ProfileDirectoryPage } from '@/components/ProfileDirectoryPage';
import { getDirectoryProfiles } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function VenuesIndexPage() {
  const venues = await getDirectoryProfiles('VENUE');

  return (
    <ProfileDirectoryPage
      badge="VENUES"
      description="Venue pages surface room identity, booking context, requests, and the show history building around each location."
      profiles={venues}
      title="Venue directory"
    />
  );
}
