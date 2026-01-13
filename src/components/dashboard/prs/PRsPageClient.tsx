'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRCardGrid } from './PRCardGrid';
import { PRList } from './PRList';
import { usePullRequests } from '@/hooks/usePullRequests';
import { IssueFilters } from '../issues/IssueFilters';
import { toast } from 'sonner';
import type { PRFilters, PullRequest } from '@/types/pull-request';
import type { IssueLabel, IssueUser } from '@/types/issue';

interface PRsPageClientProps {
  availableRepos: string[];
}

export function PRsPageClient({ availableRepos }: PRsPageClientProps) {
  const [filters, setFilters] = useState<PRFilters>({
    repos: [],
    state: 'open',
  });
  const [selectedPRs, setSelectedPRs] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Modal states
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  // Initialize repos filter if empty
  useEffect(() => {
    if (!filters.repos || filters.repos.length === 0) {
      if (availableRepos.length > 0) {
        setFilters({ ...filters, repos: availableRepos });
      }
    }
  }, [availableRepos, filters, setFilters]);

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

  const handleSelectPR = (pr: PullRequest | number, checked: boolean) => {
    const prId = typeof pr === 'number' ? pr : pr.id;
    if (checked) {
      setSelectedPRs([...selectedPRs, prId]);
    } else {
      setSelectedPRs(selectedPRs.filter(id => id !== prId));
      setSelectAll(false);
    }
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
        <IssueFilters
          filters={filters as any}
          onFiltersChange={(newFilters) => setFilters(newFilters as PRFilters)}
          availableRepos={availableRepos}
          availableLabels={[]}
          availableAssignees={[]}
        />

        <div className="text-center py-16 bg-[#0d0d0d] border border-[#333]">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-[#00ff00]/30 bg-[#00ff00]/5 mb-4">
            <AlertCircle className="w-8 h-8 text-[#00ff00]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            // SELECT_REPOSITORIES
          </h3>
          <p className="text-[#666] text-sm max-w-md mx-auto">
            &gt; Use the repository filter above to select which repositories you want to view pull requests from.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Filters */}
      <IssueFilters
        filters={filters as any}
        onFiltersChange={(newFilters) => setFilters(newFilters as PRFilters)}
        availableRepos={availableRepos}
        availableLabels={[]}
        availableAssignees={[]}
      />

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

      {/* PR Grid or List */}
      {isLoading ? (
        <div className="text-sm text-[#666]">loading pull requests...</div>
      ) : viewMode === 'grid' ? (
        <PRCardGrid
          pullRequests={paginatedPRs}
          selectedPRs={selectedPRs}
          selectAll={selectAll}
          onSelectAll={handleSelectAll}
          onSelectPR={handleSelectPR}
        />
      ) : (
        <PRList
          prs={paginatedPRs}
          selectedPRs={new Set(selectedPRs.map(String))}
          onSelectPR={(pr, checked) => handleSelectPR(pr, checked)}
          onSelectAll={handleSelectAll}
          onViewPR={() => {}}
        />
      )}

      {/* Results Summary */}
      <div className="text-xs text-[#666] py-2 border-t border-[#333]">
        showing {paginatedPRs.length} of {totalCount} pull requests
      </div>
    </div>
  );
}
