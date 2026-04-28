import { AlertCircle, GitPullRequest, LayoutDashboard, Users } from 'lucide-react';
import type { Repository, SidebarItem } from '@/types/dashboard';

export const mockRepos: Repository[] = [];

export const sidebarItems: SidebarItem[] = [
  { id: 'repositories', label: 'Repositories', icon: LayoutDashboard },
  { id: 'issues', label: 'Issues', icon: AlertCircle },
  { id: 'prs', label: 'Pull Requests', icon: GitPullRequest },
  { id: 'members', label: 'Members', icon: Users },
];
