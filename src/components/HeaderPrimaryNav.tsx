'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function HeaderPrimaryNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Home', active: pathname === '/' },
    { href: '/hype', label: 'HYPE', active: pathname.startsWith('/hype') },
    {
      href: '/tickets',
      label: 'Tickets',
      active: pathname.startsWith('/shows') || pathname.startsWith('/tickets'),
    },
  ];

  return (
    <nav className="nav-primary-links" aria-label="Primary navigation">
      {items.map((item) => (
        <Link key={item.label} className={`nav-link${item.active ? ' active' : ''}`} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
