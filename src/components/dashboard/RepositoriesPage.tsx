'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { RepoFilters } from '@/db/filter-presets';
import { useBulkRepoActions } from '@/hooks/useBulkRepoActions';
import { usePreferences } from '@/hooks/usePreferences';
import { useGlobalSearch } from '@/lib/global-search';
import type { ApiResponse } from '@/types/api-errors';
import type { Repository } from '@/types/dashboard';
import { type BulkItemStatus, BulkOperationModal } from './BulkOperationModal';
import { ConfirmationModal } from './ConfirmationModal';
import { FilterPresetsManager } from './FilterPresetsManager';
import { Pagination } from './Pagination';
import { RepositoryActions } from './RepositoryActions';
import { RepositoryCardGrid } from './RepositoryCardGrid';

interface RepositoriesPageProps {
  repositories?: Repository[];
}

export function RepositoriesPage({ repositories: initialRepositories }: RepositoriesPageProps) {
  const { preferences } = usePreferences();
  const { query: globalQuery } = useGlobalSearch();
  const [repositories, setRepositories] = useState<Repository[]>(initialRepositories ?? []);
  const [isLoading, setIsLoading] = useState(!initialRepositories);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState(preferences?.defaultVisibility ?? 'all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortValue, setSortValue] = useState('updated');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync global search into local search state
  useEffect(() => {
    setSearchQuery(globalQuery);
    setCurrentPage(1);
  }, [globalQuery]);

  // Modal states
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isUnarchiveModalOpen, setIsUnarchiveModalOpen] = useState(false);
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadRepos = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setIsLoading(true);
        setError(null);

        const orgsQuery = preferences?.selectedOrgs?.length
          ? `?orgs=${preferences.selectedOrgs.join(',')}`
          : '';

        const res = await fetch(`/api/github/repos${orgsQuery}`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/api/auth/signin?callbackUrl=/dashboard/repos';
            return;
          }

          const text = await res.text();
          throw new Error(text || `Failed to load repositories (${res.status})`);
        }

        const json = (await res.json()) as ApiResponse<Repository[]>;

        if (json.error) {
          throw new Error(json.error.message);
        }

        if (json.warnings && json.warnings.length > 0) {
          json.warnings.forEach((warning) => toast.warning(warning));
        }

        setRepositories(json.data ?? []);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load repositories';
        if (!silent) {
          setError(message);
        } else {
          toast.error(message);
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [preferences?.selectedOrgs],
  );

  const {
    state: bulkState,
    executeAction: executeBulkAction,
    cancelOperation: cancelBulkOperation,
    resetState: resetBulkState,
    retryFailed,
  } = useBulkRepoActions(async () => {
    await loadRepos(true);
  });

  useEffect(() => {
    if (initialRepositories) return;
    void loadRepos();
  }, [initialRepositories, loadRepos]);

  useEffect(() => {
    setSelectedRepos([]);
    setSelectAll(false);
  }, [repositories]);

  const languages = useMemo(() => {
    const set = new Set<string>();
    repositories.forEach((repo) => {
      if (repo.language) set.add(repo.language);
    });
    return Array.from(set).sort();
  }, [repositories]);

  const itemsPerPage = preferences?.itemsPerPage ?? 10;
  const normalizedQuery = searchQuery.toLowerCase();
  const filteredRepos = useMemo(() => {
    const filtered = repositories.filter((repo) => {
      const matchesSearch =
        !normalizedQuery ||
        repo.name.toLowerCase().includes(normalizedQuery) ||
        repo.owner.toLowerCase().includes(normalizedQuery) ||
        repo.full_name.toLowerCase().includes(normalizedQuery);
      const matchesVisibility = visibilityFilter === 'all' || repo.visibility === visibilityFilter;
      const matchesLanguage = languageFilter === 'all' || repo.language === languageFilter;

      // Preferences
      const matchesArchived = preferences?.showArchived || !repo.archived;
      const matchesForks = preferences?.showForks || !repo.fork;

      return (
        matchesSearch && matchesVisibility && matchesLanguage && matchesArchived && matchesForks
      );
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortValue) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stars':
          return b.stars - a.stars;
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  }, [
    normalizedQuery,
    repositories,
    visibilityFilter,
    languageFilter,
    sortValue,
    preferences?.showArchived,
    preferences?.showForks,
  ]);

  const totalPages = Math.ceil(filteredRepos.length / itemsPerPage);
  const paginatedRepos = filteredRepos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedRepos(paginatedRepos.map((repo) => repo.id));
    } else {
      setSelectedRepos([]);
    }
  };

  const handleSelectRepo = (repoId: number, checked: boolean) => {
    if (checked) {
      setSelectedRepos([...selectedRepos, repoId]);
    } else {
      setSelectedRepos(selectedRepos.filter((id) => id !== repoId));
      setSelectAll(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
    setSelectedRepos([]); // Clear selections when searching
    setSelectAll(false);
  };

  const selectedRepoObjects = repositories.filter((repo) => selectedRepos.includes(repo.id));
  const hasPublicSelected = selectedRepoObjects.some((repo) => repo.visibility === 'public');
  const visibilityLabel = hasPublicSelected ? 'make_private' : 'make_public';

  const handleToggleVisibility = async () => {
    const action = hasPublicSelected ? 'private' : 'public';
    setIsVisibilityModalOpen(false);
    await executeBulkAction(selectedRepoObjects, 'visibility', { visibility: action });
  };

  const handleArchive = async (archived: boolean = true) => {
    setIsArchiveModalOpen(false);
    setIsUnarchiveModalOpen(false);
    await executeBulkAction(selectedRepoObjects, archived ? 'archive' : 'unarchive');
  };

  const handleDelete = async () => {
    if (selectedRepoObjects.length === 0) {
      toast.error('No repositories selected.');
      setIsDeleteModalOpen(false);
      return;
    }

    setIsDeleteModalOpen(false);
    await executeBulkAction(selectedRepoObjects, 'delete');
  };

  const handleCloseBulkModal = () => {
    if (bulkState.isCompleted) {
      setSelectedRepos([]);
      resetBulkState();
    }
  };

  const currentFilters: RepoFilters = useMemo(
    () => ({
      visibility: visibilityFilter as 'all' | 'public' | 'private' | 'forks',
      language: languageFilter === 'all' ? undefined : languageFilter,
      sortBy: sortValue as 'name' | 'stars' | 'created' | 'updated',
      search: searchQuery || undefined,
    }),
    [visibilityFilter, languageFilter, sortValue, searchQuery],
  );

  const handleApplyPreset = (filters: any) => {
    const repoFilters = filters as RepoFilters;
    if (repoFilters.visibility) setVisibilityFilter(repoFilters.visibility);
    if (repoFilters.language) setLanguageFilter(repoFilters.language);
    if (repoFilters.sortBy) setSortValue(repoFilters.sortBy);
    if (repoFilters.search) setSearchQuery(repoFilters.search);
  };

  const bulkItems: BulkItemStatus[] = useMemo(() => {
    return selectedRepoObjects.map((repo) => {
      const result = bulkState.results.find((r) => r.repo === repo.full_name);
      let status: BulkItemStatus['status'] = 'pending';

      if (result) {
        status = result.success ? 'success' : 'error';
      } else if (bulkState.isExecuting) {
        const idx = selectedRepoObjects.indexOf(repo);
        if (idx < bulkState.processed + 2 && idx >= bulkState.processed) {
          status = 'processing';
        }
      }

      return {
        id: repo.id,
        label: repo.full_name,
        status,
        error: result?.error,
      };
    });
  }, [selectedRepoObjects, bulkState]);

  const hasSelectedRepos = selectedRepos.length > 0;

  const archiveCandidates = useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return repositories
      .filter((repo) => !repo.archived && new Date(repo.updated_at) < sixMonthsAgo)
      .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
      .slice(0, 5);
  }, [repositories]);

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
          onToggleVisibility={() => setIsVisibilityModalOpen(true)}
          onArchive={() => setIsArchiveModalOpen(true)}
          onUnarchive={() => setIsUnarchiveModalOpen(true)}
          onDelete={() => setIsDeleteModalOpen(true)}
          onSearch={handleSearch}
          visibilityFilter={visibilityFilter}
          onVisibilityChange={(value: string) =>
            setVisibilityFilter(value as 'all' | 'public' | 'private' | 'forks')
          }
          languageFilter={languageFilter}
          onLanguageChange={setLanguageFilter}
          languages={languages}
          sortValue={sortValue}
          onSortChange={setSortValue}
          presets={
            <FilterPresetsManager
              context="repositories"
              currentFilters={currentFilters}
              onApplyPreset={handleApplyPreset}
            />
          }
        />
      </div>

      {/* Archive Suggestions */}
      {archiveCandidates.length > 0 && (
        <div className="bg-[#00ff00]/5 border border-[#00ff00]/20 p-4">
          <h2 className="text-[#00ff00] text-sm font-bold mb-3">
            // ARCHIVE_CANDIDATES (inactive &gt; 6 months)
          </h2>
          <div className="flex flex-wrap gap-2">
            {archiveCandidates.map((repo) => (
              <button
                key={repo.id}
                onClick={() => {
                  setSelectedRepos([repo.id]);
                  setIsArchiveModalOpen(true);
                }}
                className="px-2 py-1 text-[10px] bg-[#1a1a1a] border border-[#333] hover:border-[#00ff00] text-[#666] hover:text-[#00ff00] transition-all"
              >
                {repo.full_name} ({new Date(repo.updated_at).toLocaleDateString()})
              </button>
            ))}
          </div>
        </div>
      )}

      {error ? (
        <div className="bg-[#0d0d0d] border border-red-900/50 p-4 text-sm text-red-400">
          <span className="text-[#666]">error: </span>
          {error}
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
        isOpen={isVisibilityModalOpen}
        onClose={() => setIsVisibilityModalOpen(false)}
        onConfirm={handleToggleVisibility}
        title="change_visibility"
        description={`Change visibility to ${hasPublicSelected ? 'PRIVATE' : 'PUBLIC'} for ${selectedRepos.length} repositories?`}
        confirmButtonText="confirm_change"
      />

      <ConfirmationModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={() => handleArchive(true)}
        title="archive_repos"
        description={`Archive ${selectedRepos.length} repositories? This will make them read-only.`}
        confirmButtonText="archive"
      />

      <ConfirmationModal
        isOpen={isUnarchiveModalOpen}
        onClose={() => setIsUnarchiveModalOpen(false)}
        onConfirm={() => handleArchive(false)}
        title="unarchive_repos"
        description={`Unarchive ${selectedRepos.length} repositories? They will become writable again.`}
        confirmButtonText="unarchive"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="delete_repos"
        description={`IRREVERSIBLE. Permanently delete ${selectedRepos.length} repositories? To confirm, type the names of the repositories separated by commas or simply 'DELETE' if you are sure.`}
        confirmText={selectedRepoObjects.length === 1 ? selectedRepoObjects[0].name : 'DELETE'}
        confirmButtonText="delete"
        isDestructive
      />

      <BulkOperationModal
        isOpen={bulkState.isExecuting || bulkState.isCompleted}
        onClose={handleCloseBulkModal}
        title="EXECUTING_BULK_REPO_ACTION"
        items={bulkItems}
        isCompleted={bulkState.isCompleted}
        onCancel={cancelBulkOperation}
        onRetry={retryFailed}
      />
    </div>
  );
}
