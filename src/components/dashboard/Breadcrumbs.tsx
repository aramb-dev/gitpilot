'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();

  const getBreadcrumbs = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: '~', href: '/dashboard', isActive: false }];

    if (segments.length > 1) {
      const section = segments[1];
      const sectionLabels: Record<string, string> = {
        repos: 'repos',
        issues: 'issues',
        prs: 'prs',
        members: 'members',
        settings: 'settings',
      };

      breadcrumbs.push({
        label: sectionLabels[section] || section,
        href: pathname,
        isActive: true,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <nav className="flex items-center text-sm font-mono text-[#666]">
      {breadcrumbs.map((breadcrumb, index) => (
        <span key={breadcrumb.href}>
          {index > 0 && <span className="mx-2">/</span>}
          {breadcrumb.isActive ? (
            <span className="text-[#00ff00]">{breadcrumb.label}</span>
          ) : (
            <Link href={breadcrumb.href} className="hover:text-white transition-colors">
              {breadcrumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
