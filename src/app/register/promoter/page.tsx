import type { Metadata } from 'next';
import { RegisterForm } from '@/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Promoter Sign Up | iHYPE.org',
  description: 'Create a promoter account and review the iHYPE artist upload and limited use license policy.',
  robots: {
    index: false,
    follow: false
  }
};

export default function PromoterRegisterPage() {
  return <RegisterForm defaultRole="DJ" />;
}
