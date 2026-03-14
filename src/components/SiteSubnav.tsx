'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSiteNavItemsForPerspective, useAdminPerspective } from '@/components/AdminPerspective';

function isActivePath(pathname: string, match: string) {
  if (match === '/') {
    return pathname === '/';
  }

  return pathname === match || pathname.startsWith(`${match}/`);
}

export function SiteSubnav() {
  const pathname = usePathname();
  const { isAdmin, perspective } = useAdminPerspective();

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null;
  }

  const navItems = getSiteNavItemsForPerspective(isAdmin, perspective);

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
