import { Monitor, Settings } from "lucide-react"
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
        <aside className="w-64 flex-shrink-0 bg-[#0a0a0a] border-r border-[#333] flex flex-col">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-[#333]">
                <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <Monitor className="w-6 h-6 text-[#00ff00]" />
                    <span className="text-lg font-bold text-white">[GitPilot]</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 font-mono text-sm">
                {sidebarItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activePage === item.id
                    const href = getRouteForId(item.id)

                    return (
                        <Link
                            key={item.id}
                            href={href}
                            className={`w-full flex items-center px-4 py-2 transition-all duration-200 ${isActive
                                ? 'text-[#00ff00] bg-[#00ff00]/5 border-l-2 border-[#00ff00]'
                                : 'text-[#888] hover:text-white hover:bg-[#1a1a1a] border-l-2 border-transparent'
                                }`}
                        >
                            <Icon className="w-4 h-4 mr-3" />
                            <span>[{item.label.toLowerCase()}]</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[#333] font-mono text-sm">
                <Link
                    href="/dashboard/settings"
                    className={`w-full flex items-center px-4 py-2 transition-all duration-200 ${activePage === 'settings'
                        ? 'text-[#00ff00] bg-[#00ff00]/5 border-l-2 border-[#00ff00]'
                        : 'text-[#888] hover:text-white hover:bg-[#1a1a1a] border-l-2 border-transparent'
                        }`}
                >
                    <Settings className="w-4 h-4 mr-3" />
                    [settings]
                </Link>
                <div className="flex items-center mt-4 p-2">
                    <div className="w-10 h-10 rounded border border-[#333] flex items-center justify-center bg-[#1a1a1a]">
                        <span className="text-[#00ff00] font-semibold">{userInitial}</span>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-white">{userName}</p>
                        {userEmail ? (
                            <p className="text-xs text-[#666]">{userEmail}</p>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => void handleSignOut("/")}
                            className="text-xs text-[#666] hover:text-red-500 transition"
                        >
                            &gt; exit
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    )
}
