export interface Repository {
    id: number
    name: string
    owner: string
    full_name: string
    visibility: 'Public' | 'Private'
    stars: number
    updated: string
    language?: string | null
}

export interface SidebarItem {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
}

export type PageType = 'repositories' | 'issues' | 'prs' | 'members' | 'settings'
