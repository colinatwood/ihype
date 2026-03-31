import Link from 'next/link';
import {
  type DiscoverModuleId,
  type DiscoverRoleKey,
  getDiscoverModulesForRole
} from '@/lib/discover-modules';

export function RoleModuleSubheader({
  role,
  currentHref,
  activeModule
}: {
  role: DiscoverRoleKey;
  currentHref: string;
  activeModule: DiscoverModuleId;
}) {
  const modules = getDiscoverModulesForRole(role);

  return (
    <div className="site-subnav-shell">
      <nav aria-label={`${role} discover modules`} className="container site-subnav">
        {modules.map((module) => (
          <Link
            className={module.id === activeModule ? 'site-subnav-link active' : 'site-subnav-link'}
            href={`${currentHref}?module=${module.id}`}
            key={module.id}
          >
            {module.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
