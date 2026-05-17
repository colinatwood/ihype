import Link from 'next/link';
import { db } from '@/lib/db';

export async function FansNearYou({ city }: { city: string }) {
  const fans = await db.profile.findMany({
    where: { city: { equals: city, mode: 'insensitive' }, type: 'LISTENER' },
    select: { id: true, name: true, slug: true, avatarImage: true },
    take: 8,
    orderBy: { hypeCount: 'desc' }
  });

  if (fans.length === 0) return null;

  return (
    <section>
      <h3 className="section-label">Fans near you in {city}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {fans.map((fan) => (
          <Link key={fan.id} href={`/artists/${fan.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            {fan.avatarImage && <img src={fan.avatarImage} alt={fan.name} width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} />}
            <span style={{ fontSize: 14 }}>{fan.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
