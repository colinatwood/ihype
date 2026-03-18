import { RegisterForm } from '@/components/RegisterForm';

export const metadata = {
  title: 'Fan Sign Up | iHYPE.org',
  description: 'Create a fan account on iHYPE.org.'
};

export default function FanRegisterPage() {
  return <RegisterForm defaultRole="FAN" />;
}
