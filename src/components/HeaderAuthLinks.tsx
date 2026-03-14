'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export function HeaderAuthLinks() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="nav-links nav-links-auth nav-links-compact nav-auth-slot" aria-hidden="true">
        <span className="nav-loading-pill" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="nav-links nav-links-auth nav-links-compact nav-auth-slot">
        <Link href="/dashboard">Dashboard</Link>
        <span className="nav-divider">|</span>
        <button
          className="nav-text-button"
          onClick={() => {
            void signOut({ callbackUrl: '/' });
          }}
          type="button"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="nav-links nav-links-auth nav-links-compact nav-auth-slot">
      <Link href="/login">Sign In</Link>
      <span className="nav-divider">|</span>
      <Link href="/register">Sign Up</Link>
    </div>
  );
}
