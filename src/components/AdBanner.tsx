import { db } from '@/lib/db';

export async function AdBanner() {
  const count = await db.adSubmission.count({ where: { status: 'approved' } });
  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);
  const ad = await db.adSubmission.findFirst({
    where: { status: 'approved' },
    skip,
    select: { id: true, advertiserName: true, adTextCopy: true, campaignWebsite: true },
  });
  if (!ad) return null;

  return (
    <aside className="panel" style={{ borderLeft: '3px solid var(--accent)', padding: '10px 14px' }}>
      <p className="meta" style={{ marginBottom: 4 }}>Supporter</p>
      <p style={{ margin: 0 }}>
        <a href={ad.campaignWebsite} rel="noopener noreferrer" target="_blank">
          <strong>{ad.advertiserName}</strong>
        </a>
        {' — '}
        {ad.adTextCopy}
      </p>
    </aside>
  );
}
