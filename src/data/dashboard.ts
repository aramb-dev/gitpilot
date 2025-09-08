import { Repository, SidebarItem } from '@/types/dashboard'
import {
    LayoutDashboard,
    AlertCircle,
    GitPullRequest,
    Users
} from "lucide-react"

export const mockRepos: Repository[] = [
    { id: 1, name: 'gitpilot-landing', visibility: 'Public', stars: 128, updated: '2 hours ago' },
    { id: 2, name: 'project-nebula', visibility: 'Private', stars: 0, updated: '5 hours ago' },
    { id: 3, name: 'dotfiles', visibility: 'Private', stars: 12, updated: '1 day ago' },
    { id: 4, name: 'design-system-v2', visibility: 'Public', stars: 432, updated: '2 days ago' },
    { id: 5, name: 'api-gateway', visibility: 'Private', stars: 3, updated: '3 days ago' },
    { id: 6, name: 'mobile-app-ios', visibility: 'Private', stars: 1, updated: '5 days ago' },
    { id: 7, name: 'data-pipeline', visibility: 'Public', stars: 89, updated: '1 week ago' },
    { id: 8, name: 'legacy-website', visibility: 'Public', stars: 22, updated: '2 weeks ago' },
    { id: 9, name: 'infra-terraform', visibility: 'Private', stars: 5, updated: '1 month ago' },
    { id: 10, name: 'hackathon-project', visibility: 'Public', stars: 76, updated: '1 month ago' },
]

export const sidebarItems: SidebarItem[] = [
    { id: 'repositories', label: 'Repositories', icon: LayoutDashboard },
    { id: 'issues', label: 'Issues', icon: AlertCircle },
    { id: 'prs', label: 'Pull Requests', icon: GitPullRequest },
    { id: 'members', label: 'Members', icon: Users },
]
