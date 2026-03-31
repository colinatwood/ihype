'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

type HeaderContext = {
  href: string;
  label: 'Fan' | 'Artist' | 'Promoter' | 'Venue';
};

function getContextFromRole(role: string | undefined): HeaderContext | null {
  if (role === 'FAN') {
    return { href: '/fans', label: 'Fan' };
  }

  if (role === 'ARTIST') {
    return { href: '/artists', label: 'Artist' };
  }

  if (role === 'DJ') {
    return { href: '/promoters', label: 'Promoter' };
  }

  if (role === 'VENUE') {
    return { href: '/venues', label: 'Venue' };
  }

  return null;
}

function getBrowseContext(pathname: string, role: string | undefined): HeaderContext | null {
  if (pathname.startsWith('/fans') || pathname.startsWith('/listeners')) {
    return { href: '/fans', label: 'Fan' };
  }

  if (pathname.startsWith('/artists')) {
    return { href: '/artists', label: 'Artist' };
  }

  if (pathname.startsWith('/promoters') || pathname.startsWith('/djs')) {
    return { href: '/promoters', label: 'Promoter' };
  }

  if (pathname.startsWith('/venues')) {
    return { href: '/venues', label: 'Venue' };
  }

  if (pathname.startsWith('/dashboard')) {
    return getContextFromRole(role);
  }

  return null;
}

export function HeaderLogo() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const browseContext = getBrowseContext(pathname, session?.user?.role);
  const showBrowseCue = status === 'authenticated' && Boolean(session?.user) && Boolean(browseContext);

  return (
    <Link
      href={showBrowseCue ? browseContext?.href ?? '/' : '/'}
      className="nav-logo nav-logo-left"
      aria-label={showBrowseCue ? `Open ${browseContext?.label ?? ''} discover page` : 'Go to iHYPE home'}
    >
      <span className="nav-logo-mark">
        <span className="nav-logo-word">iHYPE</span>
        <span className="nav-logo-dot">.org</span>
      </span>
      {showBrowseCue ? <span className="nav-logo-discover">{browseContext?.label}</span> : null}
    </Link>
  );
}
