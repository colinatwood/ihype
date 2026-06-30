import { TrustPolicyPage } from '@/components/TrustPolicyPage';

export const metadata = { title: 'Privacy Policy | iHYPE.org' };

export default function PrivacyPage() {
  return (
    <TrustPolicyPage
      badge="Privacy"
      title="Your privacy at iHYPE"
      intro="We collect only what we need to run the platform. We don't sell your data and we never will."
      lastUpdated="June 1, 2026"
      sections={[
        {
          title: 'Overview',
          body: 'iHYPE believes in radical transparency about how we handle your data. We collect only what’s necessary to provide the service, never sell personal information, and give you control over it.'
        },
        {
          title: 'Data we collect',
          body: 'On sign-up: email address (required for login), username, display name, location (city/country — optional, shown on profile), and music taste (genres). While using iHYPE: bio and profile content you create, usage signals such as hypes, show listens, ticket purchases, and referral link clicks.'
        },
        {
          title: 'How we use it',
          body: 'Authentication and account security; music discovery (matching fans to artists, venues, and shows nearby); fraud and abuse detection (payment disputes, verification); enforcing the charter (one member, one vote); transactional emails such as OTP codes and ticket confirmations; and weekly digest emails you can unsubscribe from at any time.'
        },
        {
          title: 'Data you can delete',
          body: 'Email admin@ihype.org to request account deletion. Deletion removes your profile, posts, and personal information within 30 days.'
        },
        {
          title: 'Sharing',
          body: 'We never sell your data. We may share aggregate, non-identifiable stats on the Transparency page. Vendors that process minimal data needed for their service: Resend (email delivery), Stripe (payment processing — only if you purchase tickets), Prisma Accelerate (database connection pooling).'
        },
        {
          title: 'Security',
          body: 'Passwords are hashed with bcrypt. All traffic is encrypted (HTTPS). Payment information is handled by Stripe and never stored on iHYPE servers. We use one essential session cookie for authentication — no advertising, analytics, or tracking cookies are set.'
        },
        {
          title: 'Contact',
          body: 'Questions about privacy? Email admin@ihype.org or use the support form. For DMCA takedown requests visit /dmca.'
        }
      ]}
    />
  );
}
