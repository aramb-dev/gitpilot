'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { RepositoryCardGrid } from './RepositoryCardGrid'
import { RepositoryActions } from './RepositoryActions'
import { Pagination } from './Pagination'
import { ConfirmationModal } from './ConfirmationModal'
import { Repository } from '@/types/dashboard'
import type { ApiResponse } from '@/types/api-errors'
import { toast } from 'sonner'
import { usePreferences } from '@/hooks/usePreferences'

interface RepositoriesPageProps {
    repositories?: Repository[]
}

export function RepositoriesPage({ repositories: initialRepositories }: RepositoriesPageProps) {
    const { preferences } = usePreferences()
    const [repositories, setRepositories] = useState<Repository[]>(initialRepositories ?? [])
    const [isLoading, setIsLoading] = useState(initialRepositories ? false : true)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedRepos, setSelectedRepos] = useState<number[]>([])
    const [selectAll, setSelectAll] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [visibilityFilter, setVisibilityFilter] = useState(preferences?.defaultVisibility ?? 'all')
    const [languageFilter, setLanguageFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)



    // Modal states
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const loadRepos = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoading(true)
            setError(null)

            const orgsQuery = preferences?.selectedOrgs?.length 
                ? `?orgs=${preferences.selectedOrgs.join(",")}` 
                : "";

            const res = await fetch(`/api/github/repos${orgsQuery}`, {
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

            const json = (await res.json()) as ApiResponse<Repository[]>

            if (json.error) {
                throw new Error(json.error.message)
            }

            if (json.warnings && json.warnings.length > 0) {
                json.warnings.forEach(warning => toast.warning(warning))
            }

            setRepositories(json.data ?? [])
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to load repositories'
            if (!silent) {
                setError(message)
            } else {
                toast.error(message)
            }
        } finally {
            if (!silent) setIsLoading(false)
        }
    }, [preferences?.selectedOrgs])

    useEffect(() => {
        if (initialRepositories) return
        void loadRepos()
    }, [initialRepositories, loadRepos])

    useEffect(() => {
        setSelectedRepos([])
        setSelectAll(false)
    }, [repositories])

    const languages = useMemo(() => {
        const set = new Set<string>()
        repositories.forEach(repo => {
            if (repo.language) set.add(repo.language)
        })
        return Array.from(set).sort()
    }, [repositories])

    const itemsPerPage = preferences?.itemsPerPage ?? 10
    const normalizedQuery = searchQuery.toLowerCase()
    const filteredRepos = useMemo(() => {
        return repositories.filter((repo) => {
            const matchesSearch = !normalizedQuery || (
                repo.name.toLowerCase().includes(normalizedQuery) ||
                repo.owner.toLowerCase().includes(normalizedQuery) ||
                repo.full_name.toLowerCase().includes(normalizedQuery)
            )
            const matchesVisibility = visibilityFilter === 'all' || repo.visibility === visibilityFilter
            const matchesLanguage = languageFilter === 'all' || repo.language === languageFilter

            return matchesSearch && matchesVisibility && matchesLanguage
        })
    }, [normalizedQuery, repositories, visibilityFilter, languageFilter])
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

    const selectedRepoObjects = repositories.filter(repo => selectedRepos.includes(repo.id))
    const hasPublicSelected = selectedRepoObjects.some(repo => repo.visibility === 'public')
    const visibilityLabel = hasPublicSelected ? 'make_private' : 'make_public'

    const handleToggleVisibility = async () => {
        const action = hasPublicSelected ? 'private' : 'public'
        const repoParams = selectedRepoObjects.map(r => ({ owner: r.owner, repo: r.name }))

        try {
            setIsActionLoading(true)
            const res = await fetch('/api/github/repos/visibility', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repos: repoParams, visibility: action })
            })

            const data = await res.json()
            if (data.success?.length > 0) {
                toast.success(`Successfully updated visibility for ${data.success.length} repositories.`)
                await loadRepos(true)
            }
            if (data.errors?.length > 0) {
                toast.error(`Failed to update ${data.errors.length} repositories.`)
            }
        } catch (e) {
            toast.error('An error occurred while updating visibility.')
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleArchive = async () => {
        const repoParams = selectedRepoObjects.map(r => ({ owner: r.owner, repo: r.name }))

        try {
            setIsActionLoading(true)
            const res = await fetch('/api/github/repos/archive', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repos: repoParams })
            })

            const data = await res.json()
            if (data.success?.length > 0) {
                toast.success(`Successfully archived ${data.success.length} repositories.`)
                setIsArchiveModalOpen(false)
                await loadRepos(true)
            }
            if (data.errors?.length > 0) {
                toast.error(`Failed to archive ${data.errors.length} repositories.`)
            }
        } catch (e) {
            toast.error('An error occurred while archiving repositories.')
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleDelete = async () => {
        const repoParams = selectedRepoObjects.map(r => ({ owner: r.owner, repo: r.name }))

        if (repoParams.length === 0) {
            toast.error('No repositories selected.')
            setIsDeleteModalOpen(false)
            return
        }

        try {
            setIsActionLoading(true)
            const res = await fetch('/api/github/repos', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repos: repoParams })
            })

            if (!res.ok) {
                throw new Error(`Delete failed: ${res.statusText}`)
            }

            const data = await res.json()

            if (data.success?.length > 0) {
                toast.success(`Successfully deleted ${data.success.length} repositories.`)
                await loadRepos(true)
            }

            if (data.errors?.length > 0) {
                toast.error(`Failed to delete ${data.errors.length} repositories.`)
            }

            setIsDeleteModalOpen(false)
        } catch (e) {
            toast.error('An error occurred while deleting repositories.')
        } finally {
            setIsActionLoading(false)
        }
    }

    const hasSelectedRepos = selectedRepos.length > 0

    return (
        <div className="space-y-6 font-mono">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-[#666] text-sm mb-2">$ ls repos</p>
                    <h1 className="text-2xl font-bold text-white">REPOSITORIES</h1>
                </div>
                <RepositoryActions
                    hasSelectedRepos={hasSelectedRepos}
                    visibilityLabel={visibilityLabel}
                    onToggleVisibility={handleToggleVisibility}
                    onArchive={() => setIsArchiveModalOpen(true)}
                    onDelete={() => setIsDeleteModalOpen(true)}
                    onSearch={handleSearch}
                    visibilityFilter={visibilityFilter}
                    onVisibilityChange={(value: string) => setVisibilityFilter(value as 'all' | 'public' | 'private' | 'forks')}
                    languageFilter={languageFilter}
                    onLanguageChange={setLanguageFilter}
                    languages={languages}
                />
            </div>

            {error ? (
                <div className="bg-[#0d0d0d] border border-red-900/50 p-4 text-sm text-red-400">
                    <span className="text-[#666]">error: </span>{error}
                </div>
            ) : null}

            {isLoading ? (
                <div className="text-sm text-[#666]">loading...</div>
            ) : (
                <RepositoryCardGrid
                    repositories={paginatedRepos}
                    selectedRepos={selectedRepos}
                    selectAll={selectAll}
                    onSelectAll={handleSelectAll}
                    onSelectRepo={handleSelectRepo}
                />
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredRepos.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />

            {/* Modals */}
            <ConfirmationModal
                isOpen={isArchiveModalOpen}
                onClose={() => setIsArchiveModalOpen(false)}
                onConfirm={handleArchive}
                title="archive_repos"
                description={`Archive ${selectedRepos.length} repositories? This will make them read-only.`}
                confirmButtonText="archive"
                isLoading={isActionLoading}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="delete_repos"
                description={`IRREVERSIBLE. Permanently delete ${selectedRepos.length} repositories?`}
                confirmText="DELETE"
                confirmButtonText="delete"
                isDestructive
                isLoading={isActionLoading}
            />
        </div>
    )
}
