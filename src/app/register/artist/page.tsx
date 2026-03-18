import { RegisterForm } from '@/components/RegisterForm';

export const metadata = {
  title: 'Artist Sign Up | iHYPE.org',
  description: 'Create an artist account and review the iHYPE artist upload and limited use license policy.'
};

export default function ArtistRegisterPage() {
  return <RegisterForm defaultRole="ARTIST" />;
}
