import type { Metadata } from 'next';
import { VenueRegisterWizard } from '@/components/VenueRegisterWizard';

export const metadata: Metadata = {
  title: 'Venue Sign Up | iHYPE.org',
  description: 'Create a venue account with a guided setup for design, hours, local guidance, and future show sections.',
  robots: {
    index: false,
    follow: false
  }
};

export default function VenueRegisterPage() {
  return <VenueRegisterWizard />;
}
