import { VenueRegisterWizard } from '@/components/VenueRegisterWizard';

export const metadata = {
  title: 'Venue Sign Up | iHYPE.org',
  description: 'Create a venue account with a guided setup for design, hours, local guidance, and future show sections.'
};

export default function VenueRegisterPage() {
  return <VenueRegisterWizard />;
}
