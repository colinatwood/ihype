import { redirect } from 'next/navigation';
import { recordAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// Short HYPE Link — https://ihype.org/h/{code} — where {code} is a fan's
// hexId (or a show-scoped promo code). Records the click the same way the
// existing /api/referral/click endpoint does, then hands off to the real
// referral-tracking flow at /register?ref=. Purely an alias: all actual
// attribution logic already lives in /api/register and the referral APIs.
export default async function HypeLinkPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const ref = code.trim().slice(0, 80);

  if (ref) {
    await recordAuditEvent({
      action: 'referral_click',
      entityType: 'referral',
      entityId: ref,
    }).catch(() => {});
  }

  redirect(`/register?ref=${encodeURIComponent(ref)}`);
}
