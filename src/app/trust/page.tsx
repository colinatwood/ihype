import type { Metadata } from 'next';
import { TrustPolicyPage } from '@/components/TrustPolicyPage';

export const metadata: Metadata = {
  title: 'Trust Center | iHYPE.org',
  description: 'The iHYPE trust center for safety, privacy, moderation, verification, ticketing, and copyright.'
};

export default function TrustCenterPage() {
  return (
    <TrustPolicyPage
      badge="Trust Center"
      intro="A single place for the policies and operating commitments that matter before iHYPE moves from beta into broader public use."
      sections={[
        {
          title: 'Privacy and safety',
          body: 'iHYPE limits location handling to broad discovery signals, keeps authentication cookies essential, and avoids publishing personal user location data.'
        },
        {
          title: 'Moderation',
          body: 'Every public profile and show can be reported. Admins can review, resolve, dismiss, or hide reported content and those actions are written to the audit log.'
        },
        {
          title: 'Verification',
          body: 'Artist and venue ownership verification is reviewed by administrators before verified status appears on public pages.'
        },
        {
          title: 'Ticketing',
          body: 'Ticket orders are reserved until an event opens. Payment capture is blocked until a real payment processor is configured.'
        },
        {
          title: 'Copyright',
          body: 'Artists and promoters are responsible for uploaded media rights. Reports and copyright concerns are routed into review before wider distribution.'
        },
        {
          title: 'Beta transparency',
          body: 'The admin console tracks health, email delivery, content reports, verification queues, and audit activity so launch issues are visible quickly.'
        }
      ]}
      title="Trust Center"
    />
  );
}
