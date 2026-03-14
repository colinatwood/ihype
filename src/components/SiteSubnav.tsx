'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Discover', match: '/' },
  { href: '/shows', label: 'Shows', match: '/shows' },
  { href: '/artists', label: 'Artists', match: '/artists' },
  { href: '/promoters', label: 'Promoters', match: '/promoters' },
  { href: '/venues', label: 'Venues', match: '/venues' },
  { href: '/listeners', label: 'Listeners', match: '/listeners' },
  { href: '/integrity', label: 'Integrity', match: '/integrity' }
] as const;

function isActivePath(pathname: string, match: string) {
  if (match === '/') {
    return pathname === '/';
  }

  return pathname === match || pathname.startsWith(`${match}/`);
}

export function SiteSubnav() {
  const pathname = usePathname();

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null;
  }

  return (
    <div className="site-subnav-shell">
      <nav aria-label="Site sections" className="container site-subnav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            className={isActivePath(pathname, item.match) ? 'site-subnav-link active' : 'site-subnav-link'}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
