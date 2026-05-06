'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getSiteNavItemsForPerspective, useAdminPerspective } from '@/components/AdminPerspective';

function isActivePath(pathname: string, match: string) {
  if (match === '/') {
    return pathname === '/';
  }

  return pathname === match || pathname.startsWith(`${match}/`);
}

export function SiteSubnav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { isAdmin, perspective } = useAdminPerspective();

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null;
  }

  if (status === 'loading') {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const navItems = getSiteNavItemsForPerspective(isAdmin, perspective, session.user.role);

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
