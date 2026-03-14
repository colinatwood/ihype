import { ProfileDirectoryPage } from '@/components/ProfileDirectoryPage';
import { getDirectoryProfiles } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function ListenersIndexPage() {
  const listeners = await getDirectoryProfiles('LISTENER');

  return (
    <ProfileDirectoryPage
      badge="FANS"
      currentHref="/fans"
      description="Fan pages collect avatars, top fives, saved shows, and the local rooms each fan keeps in rotation."
      profiles={listeners}
      title="Fan directory"
    />
  );
}
