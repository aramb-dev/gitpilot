import { Metadata } from 'next'
import { RepositoriesPage } from '@/components/dashboard/RepositoriesPage'
import { mockRepos } from '@/data/dashboard'

export const metadata: Metadata = {
    title: 'Repositories - GitPilot',
    description: 'Manage and perform bulk operations on your GitHub repositories'
}

export default function RepositoriesRoute() {
    return <RepositoriesPage repositories={mockRepos} />
}
