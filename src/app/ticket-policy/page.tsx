import { TrustPolicyPage } from '@/components/TrustPolicyPage';

export const metadata = { title: 'Ticket Policy | iHYPE.org' };

export default function TicketPolicyPage() {
  return (
    <TrustPolicyPage
      badge="Ticket policy"
      title="Verified tickets, clear event rules"
      intro="The ticket hub should prioritize transparent pricing, serialized tickets, venue verification, and fraud prevention."
      sections={[
        { title: 'Serialized tickets', body: 'Each ticket should carry a unique ID and QR verification path so venues can validate entry once.' },
        { title: 'Pricing and payouts', body: 'Ticket creation should show ticket cost, capacity, tax estimates, and artist/venue/promoter payout assumptions before opening sales.' },
        { title: 'Refunds and changes', body: 'Venues and event organizers are responsible for clear event-change, cancellation, refund, and reissue instructions.' },
        { title: 'Resale', body: 'Ticket resale should be limited to face value and require venue-assisted reassignment so the valid token owner is clear.' }
      ]}
    />
  );
}
