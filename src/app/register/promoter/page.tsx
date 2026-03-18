import { RegisterForm } from '@/components/RegisterForm';

export const metadata = {
  title: 'Promoter Sign Up | iHYPE.org',
  description: 'Create a promoter account and review the iHYPE artist upload and limited use license policy.'
};

export default function PromoterRegisterPage() {
  return <RegisterForm defaultRole="DJ" />;
}
