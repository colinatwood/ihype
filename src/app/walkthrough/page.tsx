import type { Metadata } from 'next';
import { WalkthroughDeck } from '@/components/WalkthroughDeck';

export const metadata: Metadata = {
  title: 'iHYPE — One Loop. Four Roles. Zero Fees.',
  description:
    'How a single hype turns into a booked show, a sold ticket, a paid artist, and a fan who got in early — with iHYPE taking nothing.',
};

export default function WalkthroughPage() {
  return <WalkthroughDeck />;
}
