import type { Metadata } from 'next';
import { AdSubmissionForm } from '@/components/AdSubmissionForm';

export const metadata: Metadata = {
  title: 'Advertise · iHYPE',
  description: 'Support iHYPE and reach music fans. Open to music-industry entities only.',
};

export default function AdvertisePage() {
  return (
    <main className="container section">
      <h1 className="title">Become a Supporter</h1>
      <p className="subtitle" style={{ maxWidth: 600 }}>
        iHYPE is a not-for-profit music discovery platform. We accept supporter placements
        exclusively from music-industry entities — artists, venues, promoters, labels, and
        music equipment brands. Submissions are automatically vetted by AI and reviewed by
        our team.
      </p>
      <AdSubmissionForm />
    </main>
  );
}
