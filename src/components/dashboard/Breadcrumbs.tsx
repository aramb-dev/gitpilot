'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs() {
    const pathname = usePathname()

    const getBreadcrumbs = (pathname: string) => {
        const segments = pathname.split('/').filter(Boolean)
        const breadcrumbs = [
            { label: 'Dashboard', href: '/dashboard', isActive: false }
        ]

        if (segments.length > 1) {
            const section = segments[1]
            const sectionLabels: Record<string, string> = {
                'repos': 'Repositories',
                'issues': 'Issues',
                'prs': 'Pull Requests',
                'members': 'Members',
                'settings': 'Settings'
            }

            breadcrumbs.push({
                label: sectionLabels[section] || section,
                href: pathname,
                isActive: true
            })
        }

        return breadcrumbs
    }

    const breadcrumbs = getBreadcrumbs(pathname)

    return (
        <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className="flex items-center">
                    {index > 0 && (
                        <ChevronRight className="w-4 h-4 text-gray-500 mx-2" />
                    )}
                    {breadcrumb.isActive ? (
                        <span className="text-white font-medium">
                            {breadcrumb.label}
                        </span>
                    ) : (
                        <Link
                            href={breadcrumb.href}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            {breadcrumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    )
}
