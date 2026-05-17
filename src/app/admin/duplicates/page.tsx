import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { isAdminSession } from '@/lib/permissions';
import { AdminNav } from '@/components/AdminNav';

export const metadata: Metadata = { title: 'Duplicate Detection · Admin · iHYPE' };
export const dynamic = 'force-dynamic';

export default async function DuplicatesPage() {
  const session = await auth();
  if (!isAdminSession(session)) redirect('/login');

  // Find users sharing the same email domain with count > 5 (potential bulk registrations)
  const domainGroups = await db.$queryRaw<Array<{ domain: string; user_count: bigint }>>`
    SELECT
      LOWER(SPLIT_PART(email, '@', 2)) AS domain,
      COUNT(*) AS user_count
    FROM "User"
    WHERE email IS NOT NULL
    GROUP BY domain
    HAVING COUNT(*) > 5
    ORDER BY user_count DESC
    LIMIT 50
  `;

  // Find profiles with very similar names (exact duplicates)
  const nameGroups = await db.$queryRaw<Array<{ name: string; profile_count: bigint }>>`
    SELECT
      LOWER(TRIM(name)) AS name,
      COUNT(*) AS profile_count
    FROM "Profile"
    GROUP BY LOWER(TRIM(name))
    HAVING COUNT(*) > 1
    ORDER BY profile_count DESC
    LIMIT 50
  `;

  // Fetch details for duplicate name profiles
  const duplicateNames = nameGroups.map((g) => g.name);
  const duplicateProfiles =
    duplicateNames.length > 0
      ? await db.profile.findMany({
          where: { name: { in: duplicateNames, mode: 'insensitive' } },
          select: {
            id: true,
            slug: true,
            name: true,
            type: true,
            createdAt: true,
            owner: { select: { id: true, email: true } }
          },
          orderBy: { name: 'asc' }
        })
      : [];

  // Group profiles by lowercased name
  const profilesByName = new Map<string, typeof duplicateProfiles>();
  for (const p of duplicateProfiles) {
    const key = p.name.toLowerCase().trim();
    if (!profilesByName.has(key)) profilesByName.set(key, []);
    profilesByName.get(key)!.push(p);
  }

  return (
    <main className="container section">
      <AdminNav active="users" />
      <h1 className="title">Duplicate detection</h1>
      <p className="meta" style={{ marginBottom: 24 }}>
        Suspicious patterns detected in user and profile data.
      </p>

      <section className="section">
        <h2>Email domain concentrations</h2>
        <p className="meta">Domains with more than 5 registered accounts:</p>
        {domainGroups.length === 0 ? (
          <p className="meta">None found.</p>
        ) : (
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Accounts</th>
              </tr>
            </thead>
            <tbody>
              {domainGroups.map((row) => (
                <tr key={row.domain}>
                  <td style={{ fontFamily: 'var(--font-jb, monospace)' }}>@{row.domain}</td>
                  <td>{Number(row.user_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="section">
        <h2>Duplicate profile names</h2>
        <p className="meta">Profiles sharing the same name:</p>
        {profilesByName.size === 0 ? (
          <p className="meta">None found.</p>
        ) : (
          <div style={{ display: 'grid', gap: 16, marginTop: 12 }}>
            {[...profilesByName.entries()].map(([name, profiles]) => (
              <div key={name} className="panel" style={{ padding: '1rem' }}>
                <h3 style={{ marginBottom: 8 }}>&ldquo;{profiles[0].name}&rdquo; — {profiles.length} profiles</h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 4 }}>
                  {profiles.map((p) => (
                    <li key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13 }}>
                      <Link href={`/artists/${p.slug}`} target="_blank">
                        {p.name}
                      </Link>
                      <span className="badge" style={{ fontSize: 10 }}>{p.type}</span>
                      <span className="meta">{p.owner?.email ?? 'no email'}</span>
                      <span className="meta">
                        <Link href={`/admin/users?q=${encodeURIComponent(p.owner?.id ?? '')}`}>
                          admin
                        </Link>
                      </span>
                      <span className="meta">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
