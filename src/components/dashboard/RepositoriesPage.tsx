'use client'

import { useState } from 'react'
import { RepositoryTable } from './RepositoryTable'
import { RepositoryActions } from './RepositoryActions'
import { Pagination } from './Pagination'
import { Repository } from '@/types/dashboard'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface RepositoriesPageProps {
    repositories: Repository[]
}

export function RepositoriesPage({ repositories }: RepositoriesPageProps) {
    const [selectedRepos, setSelectedRepos] = useState<number[]>([])
    const [selectAll, setSelectAll] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showArchiveDialog, setShowArchiveDialog] = useState(false)

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
        setShowArchiveDialog(true)
    }

    const confirmArchive = () => {
        console.log('Archiving:', selectedRepos)
        // TODO: Implement API call
        setShowArchiveDialog(false)
        setSelectedRepos([])
        setSelectAll(false)
    }

    const handleDelete = () => {
        setShowDeleteDialog(true)
    }

    const confirmDelete = () => {
        console.log('Deleting:', selectedRepos)
        // TODO: Implement API call
        setShowDeleteDialog(false)
        setSelectedRepos([])
        setSelectAll(false)
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

            {/* Archive Confirmation Dialog */}
            <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive repositories?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will archive {selectedRepos.length} {selectedRepos.length === 1 ? 'repository' : 'repositories'}.
                            Archived repositories are read-only and can be unarchived later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmArchive} className="bg-yellow-800/50 text-yellow-300 hover:bg-yellow-800/80">
                            Archive
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {selectedRepos.length} {selectedRepos.length === 1 ? 'repository' : 'repositories'}.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
