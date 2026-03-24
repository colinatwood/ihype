import type { Metadata } from 'next';
import { RegisterForm } from '@/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Artist Sign Up | iHYPE.org',
  description: 'Create an artist account and review the iHYPE artist upload and limited use license policy.',
  robots: {
    index: false,
    follow: false
  }
};

export default function ArtistRegisterPage() {
  return <RegisterForm defaultRole="ARTIST" />;
}
