import { TrustPolicyPage } from '@/components/TrustPolicyPage';

export const metadata = { title: 'Terms | iHYPE.org' };

export default function TermsPage() {
  return (
    <TrustPolicyPage
      badge="Terms"
      title="Simple platform terms"
      intro="These beta terms summarize the core rules while final counsel-reviewed terms are prepared."
      lastUpdated="June 1, 2026"
      sections={[
        { title: 'The Charter', body: 'One member, one vote. Regardless of how much you’ve spent, your hype vote counts equally. iHYPE takes no cut of artist or venue revenue — the 45/45/10 split is locked in our charter.' },
        { title: 'Your responsibilities', body: 'You must be 13+ to use iHYPE. You own your account — don’t share your password. No spam, harassment, or illegal content. No bots or artificial vote manipulation. Users may not misrepresent identity, scrape accounts, or interfere with platform security.' },
        { title: 'Content & copyright', body: 'You own any content you upload (bio, profile art, show material). By posting, you grant iHYPE a license to display it on the platform. Artists and promoters must have the rights needed for any media they upload or use — all music rights belong to their owners.' },
        { title: 'Payments', body: 'Ticket prices are final. Refunds are available if a show is cancelled; there are no refunds for personal reasons. Refund requests must be made within 14 days of purchase.' },
        { title: 'No guaranteed outcomes', body: 'iHYPE supports discovery and community signal, but does not guarantee bookings, ticket sales, payouts, rankings, or promotion. The platform is provided "as is" — we’re not liable for lost data, service interruptions, or show cancellations by venues or artists.' },
        { title: 'Changes to these terms', body: 'We may update these terms as beta safety, compliance, and community needs become clearer. Major changes will be announced in advance. Continued use means you accept the changes.' },
        { title: 'Termination', body: 'We may suspend or delete your account if you violate these terms. You can request account deletion at any time from Settings.' }
      ]}
    />
  );
}
