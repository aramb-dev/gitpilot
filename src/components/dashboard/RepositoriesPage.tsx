'use client'

import { useEffect, useMemo, useState } from 'react'
import { RepositoryTable } from './RepositoryTable'
import { RepositoryActions } from './RepositoryActions'
import { Pagination } from './Pagination'
import { Repository } from '@/types/dashboard'

interface RepositoriesPageProps {
    repositories?: Repository[]
}

export function RepositoriesPage({ repositories: initialRepositories }: RepositoriesPageProps) {
    const [repositories, setRepositories] = useState<Repository[]>(initialRepositories ?? [])
    const [isLoading, setIsLoading] = useState(initialRepositories ? false : true)
    const [error, setError] = useState<string | null>(null)
    const [selectedRepos, setSelectedRepos] = useState<number[]>([])
    const [selectAll, setSelectAll] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        if (initialRepositories) return

        let cancelled = false
        async function loadRepos() {
            try {
                setIsLoading(true)
                setError(null)

                const res = await fetch('/api/github/repos', {
                    method: 'GET',
                    cache: 'no-store',
                })

                if (!res.ok) {
                    if (res.status === 401) {
                        window.location.href = '/api/auth/signin?callbackUrl=/dashboard/repos'
                        return
                    }

                    const text = await res.text()
                    throw new Error(text || `Failed to load repositories (${res.status})`)
                }

                const data = (await res.json()) as Repository[]
                if (!cancelled) {
                    setRepositories(data)
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Failed to load repositories'
                if (!cancelled) {
                    setError(message)
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        void loadRepos()

        return () => {
            cancelled = true
        }
    }, [initialRepositories])

    useEffect(() => {
        setSelectedRepos([])
        setSelectAll(false)
    }, [repositories])

    const itemsPerPage = 10
    const normalizedQuery = searchQuery.toLowerCase()
    const filteredRepos = useMemo(() => {
        return repositories.filter((repo) => {
            if (!normalizedQuery) return true
            return (
                repo.name.toLowerCase().includes(normalizedQuery) ||
                repo.owner.toLowerCase().includes(normalizedQuery) ||
                repo.full_name.toLowerCase().includes(normalizedQuery)
            )
        })
    }, [normalizedQuery, repositories])
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

            {error ? (
                <div className="bg-[#161b22] border border-gray-800 rounded-lg p-4 text-sm text-red-300">
                    {error}
                </div>
            ) : null}

            <RepositoryTable
                repositories={isLoading ? [] : paginatedRepos}
                selectedRepos={selectedRepos}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onSelectRepo={handleSelectRepo}
            />

            {isLoading ? (
                <div className="text-sm text-gray-400">Loading repositories…</div>
            ) : null}

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
