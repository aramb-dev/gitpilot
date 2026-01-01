'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Breadcrumbs } from '@/components/dashboard/Breadcrumbs'
import { sidebarItems } from '@/data/dashboard'
import { SessionProvider } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

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
                    {/* Top bar with breadcrumbs and global search */}
                    <header className="flex-shrink-0 border-b border-gray-800 px-8 py-4 flex items-center justify-between">
                        <Breadcrumbs />
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input 
                                placeholder="Search repositories, issues, PRs..."
                                className="pl-10 bg-[#161b22] border-gray-800 text-sm h-9 focus:ring-[#58a6ff]"
                            />
                        </div>
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
