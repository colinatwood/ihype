import { TrustPolicyPage } from '@/components/TrustPolicyPage';

export const metadata = { title: 'Community Rules | iHYPE.org' };

export default function CommunityRulesPage() {
  return (
    <TrustPolicyPage
      badge="Community"
      title="Keep the scene safe enough to grow"
      intro="iHYPE should be useful, human, and fair. That means no harassment, fraud, manipulation, or unsafe content."
      sections={[
        { title: 'Respect people', body: 'No harassment, threats, hate, doxxing, impersonation, or targeted abuse of fans, artists, venues, promoters, staff, or volunteers.' },
        { title: 'Respect the signal', body: 'Do not use bots, fake accounts, paid manipulation, or hidden incentives to distort hype, rankings, playlists, or recommendations.' },
        { title: 'Respect venues and fans', body: 'Event, ticket, safety, accessibility, and venue information should be accurate and corrected quickly when it changes.' },
        { title: 'Report problems', body: 'Users should report unsafe content, rights concerns, fraud, impersonation, or ticket issues so admins can review them in the beta console.' }
      ]}
    />
  );
}
