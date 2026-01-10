export type { Repository, RepositoryPermissions, OwnerType, RepositoryVisibility } from './repository';

/**
 * @deprecated Use Repository from './repository' instead.
 * This interface is kept for backward compatibility with existing UI components.
 * The new Repository type has additional fields: owner_type, archived, disabled,
 * description, default_branch, forks, open_issues, created_at, pushed_at, clone_url, permissions.
 * 
 * Field mapping from old to new:
 * - visibility: 'Public' | 'Private' → 'public' | 'private' (lowercase)
 * - updated: string (formatted) → updated_at: string (ISO 8601)
 * - url: string → html_url: string
 */
export interface LegacyRepository {
    id: number
    name: string
    owner: string
    full_name: string
    visibility: 'Public' | 'Private'
    stars: number
    updated: string
    language?: string | null
    url: string
}

export interface SidebarItem {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
}

export type PageType = 'repositories' | 'issues' | 'prs' | 'members' | 'settings'
