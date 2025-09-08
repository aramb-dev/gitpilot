import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { RepositoriesPage } from './RepositoriesPage'
import { IssuesPage, PullRequestsPage, MembersPage, SettingsPage } from './PlaceholderPages'
import { PageType } from '@/types/dashboard'
import { sidebarItems, mockRepos } from '@/data/dashboard'

export function DashboardLayout() {
    const [activePage, setActivePage] = useState<PageType>('repositories')

    const renderContent = () => {
        switch (activePage) {
            case 'repositories':
                return <RepositoriesPage repositories={mockRepos} />
            case 'issues':
                return <IssuesPage />
            case 'prs':
                return <PullRequestsPage />
            case 'members':
                return <MembersPage />
            case 'settings':
                return <SettingsPage />
            default:
                return <RepositoriesPage repositories={mockRepos} />
        }
    }

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar
                sidebarItems={sidebarItems}
                activePage={activePage}
                onPageChange={setActivePage}
            />
            <main className="flex-1 overflow-y-auto p-8">
                {renderContent()}
            </main>
        </div>
    )
}
