import type { DiscoverRoleKey } from '@/lib/discover-modules';

export type PublicRoleCard = {
  key: DiscoverRoleKey;
  label: string;
  registerRole: 'FAN' | 'ARTIST' | 'DJ' | 'VENUE';
  tone: 'fan' | 'artist' | 'venue' | 'promoter';
  icon: 'headphones' | 'microphone' | 'venue' | 'megaphone';
  title: string;
  copy: string;
  points: string[];
};

export const publicRoleCards: PublicRoleCard[] = [
  {
    key: 'fans',
    label: 'Fan',
    registerRole: 'FAN',
    tone: 'fan',
    icon: 'headphones',
    title: 'Listen. Hype. Attend.',
    copy: 'Your HYPE is an uncorrupted signal. It shapes charts, informs tour planning, and moves real dollars to the artists you love.',
    points: [
      'Discover local and touring acts',
      'HYPE artists, venues and shows',
      'Buy verified serialized tickets',
      'Build a shareable music identity',
    ],
  },
  {
    key: 'artists',
    label: 'Artist',
    registerRole: 'ARTIST',
    tone: 'artist',
    icon: 'microphone',
    title: 'Publish. Tour. Get paid.',
    copy: '45% of every ticket sold goes directly to you. See real HYPE concentration to plan tours where demand actually exists.',
    points: [
      'Customizable artist profile and page',
      '45% of every ticket, every time',
      'HYPE heatmap for tour planning',
      'Upload music and stream shows',
    ],
  },
  {
    key: 'venues',
    label: 'Venue',
    registerRole: 'VENUE',
    tone: 'venue',
    icon: 'venue',
    title: 'List shows. Fill rooms.',
    copy: '45% of every ticket, plus a booking radar that shows which artists have real local demand before you make the call.',
    points: [
      'Venue profile with capacity and specs',
      '45% of every ticket sold at your room',
      'Artist demand radar by ZIP code',
      'QR door-scan ticketing built in',
    ],
  },
  {
    key: 'promoters',
    label: 'Promoter',
    registerRole: 'DJ',
    tone: 'promoter',
    icon: 'megaphone',
    title: 'Curate. Promote. Earn.',
    copy: '10% of every ticket sold through your referral link. Program shows using real demand data, not guesswork.',
    points: [
      '10% split on every referred ticket',
      'Create and co-promote shows',
      'Demand analytics before booking',
      'Shareable referral links with tracking',
    ],
  },
];

export const signedRoleLandingCopy: Record<
  DiscoverRoleKey,
  {
    eyebrow: string;
    heading: string;
    emphasis: string;
    signalLabel: string;
  }
> = {
  fans: {
    eyebrow: 'Fan signal',
    heading: 'Find the music worth',
    emphasis: 'showing up for.',
    signalLabel: 'Taste profile',
  },
  artists: {
    eyebrow: 'Artist signal',
    heading: 'Turn real attention into',
    emphasis: 'the next market.',
    signalLabel: 'Demand map',
  },
  promoters: {
    eyebrow: 'Promoter signal',
    heading: 'Build shows from',
    emphasis: 'songs and rooms.',
    signalLabel: 'Show pipeline',
  },
  venues: {
    eyebrow: 'Venue signal',
    heading: 'Book the signal before',
    emphasis: 'everyone sees it.',
    signalLabel: 'Room demand',
  },
};
