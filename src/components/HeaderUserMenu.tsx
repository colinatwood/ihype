'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function HeaderUserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading' || !session?.user) return null;

  const name = session.user.name ?? session.user.email ?? 'Account';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Link
        href="/me/notifications"
        aria-label="Notifications"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 8,
          color: 'rgba(240,235,229,.5)',
          textDecoration: 'none', fontSize: 16,
          transition: 'color 150ms',
        }}
      >
        🔔
      </Link>
      <Link
        href="/home"
        aria-label="Your account"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30, borderRadius: 15,
          background: 'linear-gradient(135deg, var(--accent, #ff5029), #b983ff)',
          color: '#fff', fontWeight: 700, fontSize: 13,
          textDecoration: 'none', flexShrink: 0,
          fontFamily: 'var(--font-body)',
        }}
        title={name}
      >
        {initial}
      </Link>
    </div>
  );
}
