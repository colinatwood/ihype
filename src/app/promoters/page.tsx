import { ProfileDirectoryPage } from '@/components/ProfileDirectoryPage';
import { getDirectoryProfiles } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function PromotersIndexPage() {
  const promoters = await getDirectoryProfiles('DJ');

  return (
    <ProfileDirectoryPage
      badge="PROMOTERS"
      description="Promoter pages combine show programming, recommendation history, and demand signals from the scenes they build."
      profiles={promoters}
      title="Promoter directory"
    />
  );
}
