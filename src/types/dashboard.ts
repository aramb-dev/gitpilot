export interface Repository {
    id: number
    name: string
    owner: string
    full_name: string
    visibility: 'Public' | 'Private'
    stars: number
    updated: string
}

export interface SidebarItem {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
}

export type PageType = 'repositories' | 'issues' | 'prs' | 'members' | 'settings'
