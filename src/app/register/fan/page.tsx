import type { Metadata } from 'next';
import { RegisterForm } from '@/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Fan Sign Up | iHYPE.org',
  description: 'Create a fan account on iHYPE.org.',
  robots: {
    index: false,
    follow: false
  }
};

export default function FanRegisterPage() {
  return <RegisterForm defaultRole="FAN" />;
}
