import { TrustPolicyPage } from '@/components/TrustPolicyPage';

export const metadata = { title: 'Privacy | iHYPE.org' };

export default function PrivacyPage() {
  return (
    <TrustPolicyPage
      badge="Privacy"
      title="Privacy-first music discovery"
      intro="iHYPE should collect the least data needed to run accounts, discovery, safety, ticketing, and support."
      sections={[
        { title: 'Location', body: 'iHYPE should use coarse location signals for discovery and should not publicly expose precise fan location.' },
        { title: 'Account data', body: 'Emails, usernames, roles, login activity, and support data are used to operate the service and protect accounts.' },
        { title: 'Music activity', body: 'Completed listens, hypes, playlists, and ticket activity support fan stats and recommendation quality.' },
        { title: 'Data sharing', body: 'iHYPE should avoid selling personal user data and should share only what is required for service providers, legal compliance, and user-requested actions.' }
      ]}
    />
  );
}
