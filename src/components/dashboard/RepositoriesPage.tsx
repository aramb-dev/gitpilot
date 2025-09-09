'use client'

import { useState } from 'react'
import { RepositoryTable } from './RepositoryTable'
import { RepositoryActions } from './RepositoryActions'
import { Pagination } from './Pagination'
import { Repository } from '@/types/dashboard'

interface RepositoriesPageProps {
    repositories: Repository[]
}

export function RepositoriesPage({ repositories }: RepositoriesPageProps) {
    const [selectedRepos, setSelectedRepos] = useState<number[]>([])
    const [selectAll, setSelectAll] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 10
    const filteredRepos = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const totalPages = Math.ceil(filteredRepos.length / itemsPerPage)
    const paginatedRepos = filteredRepos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked)
        if (checked) {
            setSelectedRepos(paginatedRepos.map(repo => repo.id))
        } else {
            setSelectedRepos([])
        }
    }

    const handleSelectRepo = (repoId: number, checked: boolean) => {
        if (checked) {
            setSelectedRepos([...selectedRepos, repoId])
        } else {
            setSelectedRepos(selectedRepos.filter(id => id !== repoId))
            setSelectAll(false)
        }
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        setCurrentPage(1) // Reset to first page when searching
        setSelectedRepos([]) // Clear selections when searching
        setSelectAll(false)
    }

    const handleMakePrivate = () => {
        console.log('Making private:', selectedRepos)
        // TODO: Implement API call
    }

    const handleArchive = () => {
        console.log('Archiving:', selectedRepos)
        // TODO: Implement API call
    }

    const handleDelete = () => {
        console.log('Deleting:', selectedRepos)
        // TODO: Implement API call
    }

    const hasSelectedRepos = selectedRepos.length > 0

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Repositories</h1>
                <RepositoryActions
                    hasSelectedRepos={hasSelectedRepos}
                    onMakePrivate={handleMakePrivate}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onSearch={handleSearch}
                />
            </div>

            {/* Repositories Table */}
            <RepositoryTable
                repositories={paginatedRepos}
                selectedRepos={selectedRepos}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onSelectRepo={handleSelectRepo}
            />

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredRepos.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}
