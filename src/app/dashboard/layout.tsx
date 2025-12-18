'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Breadcrumbs } from '@/components/dashboard/Breadcrumbs'
import { sidebarItems } from '@/data/dashboard'
import { SessionProvider } from 'next-auth/react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SessionProvider>
            <div className="flex h-screen bg-gray-900">
                <Sidebar sidebarItems={sidebarItems} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top bar with breadcrumbs */}
                    <header className="flex-shrink-0 border-b border-gray-800 px-8 py-4">
                        <Breadcrumbs />
                    </header>

                    {/* Main content area */}
                    <main className="flex-1 overflow-y-auto p-8">
                        {children}
                    </main>
                </div>
            </div>
        </SessionProvider>
    )
}
