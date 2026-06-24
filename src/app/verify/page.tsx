import { redirect } from 'next/navigation';

// /verify is an alias for /verify-email
export default function VerifyPage() {
  redirect('/verify-email');
}
