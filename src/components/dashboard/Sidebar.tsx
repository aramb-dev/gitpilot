import { Send, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { SidebarItem } from '@/types/dashboard'
import { handleSignOut } from '@/lib/auth/signout'

interface SidebarProps {
    sidebarItems: SidebarItem[]
}

export function Sidebar({ sidebarItems }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()

    const userName = session?.user?.name ?? "GitHub User"
    const userEmail = session?.user?.email ?? ""
    const userInitial = (userName?.trim()?.[0] ?? userEmail?.trim()?.[0] ?? "U").toUpperCase()

    // Map route paths to sidebar item IDs for active state detection
    const getActiveId = (pathname: string): string => {
        if (pathname.includes('/repos')) return 'repositories'
        if (pathname.includes('/issues')) return 'issues'
        if (pathname.includes('/prs')) return 'prs'
        if (pathname.includes('/members')) return 'members'
        if (pathname.includes('/settings')) return 'settings'
        return 'repositories' // default
    }

    const activePage = getActiveId(pathname)

    // Map sidebar item IDs to route paths
    const getRouteForId = (id: string): string => {
        switch (id) {
            case 'repositories': return '/dashboard/repos'
            case 'issues': return '/dashboard/issues'
            case 'prs': return '/dashboard/prs'
            case 'members': return '/dashboard/members'
            case 'settings': return '/dashboard/settings'
            default: return '/dashboard/repos'
        }
    }

    return (
        <aside className="w-64 flex-shrink-0 bg-[#161b22] border-r border-gray-800 flex flex-col">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-gray-800">
                <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <Send className="w-8 h-8 text-white" />
                    <span className="text-xl font-bold text-white">GitPilot</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {sidebarItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activePage === item.id
                    const href = getRouteForId(item.id)

                    return (
                        <Link
                            key={item.id}
                            href={href}
                            className={`w-full flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-[#21262d] text-[#58a6ff] font-semibold'
                                : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]'
                                }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
                <Link
                    href="/dashboard/settings"
                    className={`w-full flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${activePage === 'settings'
                        ? 'bg-[#21262d] text-[#58a6ff] font-semibold'
                        : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]'
                        }`}
                >
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                </Link>
                <div className="flex items-center mt-4 p-2 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#58a6ff] flex items-center justify-center">
                        <span className="text-white font-semibold">{userInitial}</span>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-semibold text-white">{userName}</p>
                        {userEmail ? (
                            <p className="text-xs text-gray-500">{userEmail}</p>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => void handleSignOut("/")}
                            className="text-xs text-gray-400 hover:text-red-500 transition"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    )
}
