'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { logoutAction } from '@/app/logout/actions';
import { getPerspectiveHomeHref, useAdminPerspective } from '@/components/AdminPerspective';

export function HeaderAuthLinks() {
  const { data: session, status } = useSession();
  const { isAdmin, perspective } = useAdminPerspective();

  if (status === 'loading') {
    return (
      <div className="nav-links nav-links-auth nav-links-compact nav-auth-slot" aria-hidden="true">
        <span className="nav-loading-pill" />
      </div>
    );
  }

  if (session?.user) {
    const primaryHref = isAdmin ? getPerspectiveHomeHref(perspective) : '/dashboard';
    const primaryLabel = isAdmin ? 'Open View' : 'Dashboard';

    return (
      <div className="nav-links nav-links-auth nav-links-compact nav-auth-slot">
        <Link href={primaryHref}>{primaryLabel}</Link>
        <span className="nav-divider">|</span>
        {isAdmin ? (
          <>
            <Link href="/dashboard">Admin</Link>
            <span className="nav-divider">|</span>
          </>
        ) : null}
        <form action={logoutAction} className="nav-inline-form">
          <button className="nav-text-button" type="submit">
            Sign Out
          </button>
        </form>
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
