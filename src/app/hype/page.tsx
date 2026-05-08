import { PublicFeaturePage } from '@/components/PublicFeaturePage';

export const metadata = {
  title: 'HYPE | iHYPE.org',
  description: 'How iHYPE turns completed listening and fan intent into transparent music demand.'
};

export default function HypePage() {
  return (
    <PublicFeaturePage
      actions={[
        { href: '/register', label: 'Join free' },
        { href: '/auth/landing?module=recommendation-engine', label: 'Open recommendations', variant: 'ghost' }
      ]}
      cards={[
        {
          label: 'Listen',
          title: 'Completion matters.',
          copy:
            'The product is designed around meaningful listening signals, not idle plays, fake counters, or paid placement.'
        },
        {
          label: 'Hype',
          title: 'Fans move the charts.',
          copy:
            'Fans can hype artists, venues, and shows they actually care about, turning attention into a visible demand signal.'
        },
        {
          label: 'Audit',
          title: 'Trust stays visible.',
          copy:
            'The platform keeps ranking rules and operating commitments understandable so scenes can see why things rise.'
        }
      ]}
      eyebrow="Signal over noise"
      gradient="completed attention into accountable demand."
      lede="HYPE is the operating signal for iHYPE. It is meant to reward real listens, real fans, and real local demand instead of vanity metrics."
      note="No paid placement. No fake heat."
      sectionCopy="The HYPE engine is intentionally simple at the surface: listen fully, hype what matters, and let transparent aggregate signals guide discovery, booking, and tickets."
      sectionEyebrow="How it works"
      sectionTitle="A cleaner signal for independent music."
      signals={[
        {
          kicker: 'Full listens',
          title: 'Meaningful activity',
          copy: 'Finished songs and shows become stronger signals than casual page views.',
          metric: 'listen - verify - count'
        },
        {
          kicker: 'Fan hype',
          title: 'Demand from people',
          copy: 'Fans can support artists, venues, promoters, and shows without comments becoming the product.',
          metric: 'fan intent - scene lift'
        },
        {
          kicker: 'Transparency',
          title: 'Rules people can read',
          copy: 'Growth mechanics should be inspectable by the community they affect.',
          metric: 'public logic - safer charts'
        }
      ]}
      title="HYPE turns"
    />
  );
}
