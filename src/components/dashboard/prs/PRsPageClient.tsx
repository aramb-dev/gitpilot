'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRCardGrid } from './PRCardGrid';
import { usePullRequests } from '@/hooks/usePullRequests';
import { toast } from 'sonner';
import type { PRFilters } from '@/types/pull-request';

interface PRsPageClientProps {
  availableRepos: string[];
}

export function PRsPageClient({ availableRepos }: PRsPageClientProps) {
  const [filters, setFilters] = useState<PRFilters>({
    repos: availableRepos.slice(0, 10),
    state: 'open',
  });
  const [selectedPRs, setSelectedPRs] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Modal states
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  const {
    pullRequests,
    isLoading,
    error,
    totalCount,
    hasNextPage,
    refetch,
    loadPage,
  } = usePullRequests(filters);

  const itemsPerPage = 10;
  const paginatedPRs = pullRequests.slice(0, itemsPerPage);
  const selectedPRObjects = pullRequests.filter(pr => selectedPRs.includes(pr.id));

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedPRs(paginatedPRs.map(pr => pr.id));
    } else {
      setSelectedPRs([]);
    }
  };

  const handleSelectPR = (prId: number, checked: boolean) => {
    if (checked) {
      setSelectedPRs([...selectedPRs, prId]);
    } else {
      setSelectedPRs(selectedPRs.filter(id => id !== prId));
      setSelectAll(false);
    }
  };

  const handleStateChange = useCallback(
    (state: string) => {
      setFilters({ ...filters, state: state as 'open' | 'closed' | 'merged' });
      setCurrentPage(1);
      setSelectedPRs([]);
      setSelectAll(false);
    },
    [filters]
  );

  const toggleRepo = (repo: string) => {
    const current = filters.repos || [];
    if (current.includes(repo)) {
      setFilters({ ...filters, repos: current.filter(r => r !== repo) });
    } else {
      setFilters({ ...filters, repos: [...current, repo] });
    }
    setCurrentPage(1);
    setSelectedPRs([]);
    setSelectAll(false);
  };

  const clearRepos = () => {
    setFilters({ ...filters, repos: [] });
    setCurrentPage(1);
  };

  const handleMerge = async () => {
    if (selectedPRObjects.length === 0) {
      toast.error('No PRs selected');
      return;
    }
    setIsMergeModalOpen(true);
  };

  const handleClose = async () => {
    if (selectedPRObjects.length === 0) {
      toast.error('No PRs selected');
      return;
    }
    setIsCloseModalOpen(true);
  };

  const handleReopen = async () => {
    if (selectedPRObjects.length === 0) {
      toast.error('No PRs selected');
      return;
    }
    setIsReopenModalOpen(true);
  };

  const confirmMerge = async () => {
    try {
      setIsActionLoading(true);
      const prParams = selectedPRObjects.map(pr => ({
        owner: pr.repository.owner,
        repo: pr.repository.name,
        prNumber: pr.number,
      }));

      const res = await fetch('/api/github/prs/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prs: prParams,
          action: 'merge',
          mergeMethod: 'merge',
        }),
      });

      const data = await res.json();
      if (data.success?.length > 0) {
        toast.success(`Successfully merged ${data.success.length} PRs.`);
        setIsMergeModalOpen(false);
        setSelectedPRs([]);
        setSelectAll(false);
        refetch();
      }
      if (data.errors?.length > 0) {
        toast.error(`Failed to merge ${data.errors.length} PRs.`);
      }
    } catch (e) {
      toast.error('An error occurred while merging PRs.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmClose = async () => {
    try {
      setIsActionLoading(true);
      const prParams = selectedPRObjects.map(pr => ({
        owner: pr.repository.owner,
        repo: pr.repository.name,
        prNumber: pr.number,
      }));

      const res = await fetch('/api/github/prs/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prs: prParams,
          action: 'close',
        }),
      });

      const data = await res.json();
      if (data.success?.length > 0) {
        toast.success(`Successfully closed ${data.success.length} PRs.`);
        setIsCloseModalOpen(false);
        setSelectedPRs([]);
        setSelectAll(false);
        refetch();
      }
      if (data.errors?.length > 0) {
        toast.error(`Failed to close ${data.errors.length} PRs.`);
      }
    } catch (e) {
      toast.error('An error occurred while closing PRs.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmReopen = async () => {
    try {
      setIsActionLoading(true);
      const prParams = selectedPRObjects.map(pr => ({
        owner: pr.repository.owner,
        repo: pr.repository.name,
        prNumber: pr.number,
      }));

      const res = await fetch('/api/github/prs/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prs: prParams,
          action: 'reopen',
        }),
      });

      const data = await res.json();
      if (data.success?.length > 0) {
        toast.success(`Successfully reopened ${data.success.length} PRs.`);
        setIsReopenModalOpen(false);
        setSelectedPRs([]);
        setSelectAll(false);
        refetch();
      }
      if (data.errors?.length > 0) {
        toast.error(`Failed to reopen ${data.errors.length} PRs.`);
      }
    } catch (e) {
      toast.error('An error occurred while reopening PRs.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const hasSelectedPRs = selectedPRs.length > 0;

  // Show repo selection prompt if no repos selected
  if (!filters.repos || filters.repos.length === 0) {
    return (
      <div className="space-y-6 font-mono">
        <div className="space-y-4">
          <div>
            <p className="text-[#666] text-sm mb-2">$ ls prs</p>
            <h1 className="text-2xl font-bold text-white">// PULL_REQUESTS</h1>
          </div>

          {/* Repo Filter */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilters({ ...filters, repos: availableRepos.slice(0, 10) })}
              className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#333] text-xs text-[#888] hover:border-[#00ff00] hover:text-[#00ff00] transition-all"
            >
              select_repos: {availableRepos.length} available
            </button>
          </div>
        </div>

        <div className="text-center py-16 bg-[#0d0d0d] border border-[#333]">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-[#00ff00]/30 bg-[#00ff00]/5 mb-4">
            <AlertCircle className="w-8 h-8 text-[#00ff00]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            // SELECT_REPOSITORIES
          </h3>
          <p className="text-[#666] text-sm max-w-md mx-auto">
            &gt; Click above to select which repositories you want to view pull requests from.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div>
        <p className="text-[#666] text-sm mb-2">$ ls prs</p>
        <h1 className="text-2xl font-bold text-white">// PULL_REQUESTS</h1>
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* State Filter */}
          <button
            onClick={() => handleStateChange(filters.state === 'open' ? 'closed' : 'open')}
            className={`px-3 py-2 text-xs font-mono transition-all border ${
              filters.state === 'open'
                ? 'bg-[#00ff00] text-black border-[#00ff00]'
                : filters.state === 'closed'
                ? 'bg-purple-600/50 text-purple-200 border-purple-600'
                : 'bg-gray-600/50 text-gray-200 border-gray-600'
            }`}
          >
            {filters.state || 'all'}
          </button>

          {/* Repos Filter - with dropdown */}
          <div className="relative group">
            <button className="px-3 py-2 bg-[#1a1a1a] border border-[#333] text-xs text-[#888] hover:border-[#00ff00] hover:text-[#00ff00] transition-all">
              [{(filters.repos || []).length}_repos_selected] ▼
            </button>
            <div className="hidden group-hover:block absolute top-full left-0 z-50 mt-1 w-64 bg-[#0d0d0d] border border-[#333] shadow-2xl max-h-72 overflow-y-auto">
              {availableRepos.map((repo) => (
                <button
                  key={repo}
                  onClick={() => toggleRepo(repo)}
                  className={`w-full px-3 py-2 text-xs text-left hover:bg-[#1a1a1a] transition-colors ${
                    filters.repos?.includes(repo) ? 'bg-[#1a1a1a] text-[#00ff00]' : 'text-[#888]'
                  }`}
                >
                  {filters.repos?.includes(repo) ? '✓ ' : '  '}{repo}
                </button>
              ))}
              <button
                onClick={clearRepos}
                className="w-full px-3 py-2 text-xs text-[#ff6b6b] hover:bg-[#1a1a1a] transition-colors border-t border-[#333]"
              >
                clear_selection
              </button>
            </div>
          </div>

          {/* Refetch button */}
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00] h-9"
            disabled={isLoading}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-900/10 border border-red-900/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-400 text-sm"><span className="text-[#666]">error: </span>{error}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            retry
          </Button>
        </div>
      )}

      {/* Bulk Actions */}
      {hasSelectedPRs && (
        <div className="border border-[#333] rounded-lg p-4 bg-[#0d0d0d]/50 space-y-3">
          <div className="text-xs text-[#666] font-mono">
            {selectedPRs.length} pull request{selectedPRs.length !== 1 ? 's' : ''} selected
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={confirmMerge}
              disabled={isActionLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs h-8 disabled:opacity-50"
            >
              merge
            </Button>

            <Button
              onClick={handleReopen}
              disabled={isActionLoading}
              variant="outline"
              className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00] font-mono text-xs h-8"
            >
              reopen
            </Button>

            <Button
              onClick={handleClose}
              disabled={isActionLoading}
              variant="outline"
              className="border-[#333] hover:border-red-500 text-[#888] hover:text-red-400 font-mono text-xs h-8"
            >
              close
            </Button>
          </div>
        </div>
      )}

      {/* PR Grid */}
      {isLoading ? (
        <div className="text-sm text-[#666]">loading pull requests...</div>
      ) : (
        <PRCardGrid
          pullRequests={paginatedPRs}
          selectedPRs={selectedPRs}
          selectAll={selectAll}
          onSelectAll={handleSelectAll}
          onSelectPR={handleSelectPR}
        />
      )}

      {/* Results Summary */}
      <div className="text-xs text-[#666] py-2 border-t border-[#333]">
        showing {paginatedPRs.length} of {totalCount} pull requests
      </div>
    </div>
  );
}
