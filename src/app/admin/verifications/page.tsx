import { redirect } from 'next/navigation';

// This directory only ever held AdminVerificationQueue.tsx (a component
// imported directly by /admin/review/page.tsx) with no page.tsx of its own —
// admins bookmarking or typing /admin/verifications got a 404. Real thin
// redirect alias now, matching the /studio/etc. precedent.
export default function AdminVerificationsRedirect() {
  redirect('/admin/review?tab=verifications');
}
