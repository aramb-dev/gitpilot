'use client';

import { useState, useMemo } from 'react';
import { usePullRequests } from '@/hooks/usePullRequests';
import { PRCardGrid } from './PRCardGrid';
import { PRActions } from './PRActions';
import { Pagination } from '../Pagination';
import { ConfirmationModal } from '../ConfirmationModal';
import type { PRFilters } from '@/types/pull-request';
import { toast } from 'sonner';
import { usePreferences } from '@/hooks/usePreferences';

interface PRsPageClientProps {
  availableRepos: string[];
}

export function PRsPageClient({ availableRepos }: PRsPageClientProps) {
  const { preferences } = usePreferences();
  const [selectedRepos, setSelectedRepos] = useState<string[]>(availableRepos.slice(0, 5));
  const [selectedPRs, setSelectedPRs] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('open');
  const [draftFilter, setDraftFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Modal states
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  const filters: PRFilters = {
    repos: selectedRepos,
    state: stateFilter === 'all' ? undefined : (stateFilter as 'open' | 'closed' | 'merged'),
    draft: draftFilter === 'all' ? undefined : draftFilter === 'draft',
    search: searchQuery,
  };

  const { pullRequests, isLoading, error, totalCount, hasNextPage } = usePullRequests(filters);

  const itemsPerPage = preferences?.itemsPerPage ?? 10;
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setSelectedPRs([]);
    setSelectAll(false);
  };

  const handleMerge = async () => {
    if (selectedPRObjects.length === 0) return;
    setIsMergeModalOpen(true);
  };

  const handleClose = async () => {
    if (selectedPRObjects.length === 0) return;
    setIsCloseModalOpen(true);
  };

  const handleReopen = async () => {
    if (selectedPRObjects.length === 0) return;
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
  const totalPages = Math.ceil(pullRequests.length / itemsPerPage);

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[#666] text-sm mb-2">$ ls prs</p>
          <h1 className="text-2xl font-bold text-white">// PULL_REQUESTS</h1>
        </div>
      </div>

      {error ? (
        <div className="bg-[#0d0d0d] border border-red-900/50 p-4 text-sm text-red-400">
          <span className="text-[#666]">error: </span>{error}
        </div>
      ) : null}

      <PRActions
        hasSelectedPRs={hasSelectedPRs}
        selectedPRs={selectedPRObjects}
        stateFilter={stateFilter}
        onStateChange={setStateFilter}
        draftFilter={draftFilter}
        onDraftChange={setDraftFilter}
        onSearch={handleSearch}
        onMerge={handleMerge}
        onClose={handleClose}
        onReopen={handleReopen}
        isLoading={isActionLoading}
      />

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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={pullRequests.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Modals */}
      <ConfirmationModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        onConfirm={confirmMerge}
        title="merge_prs"
        description={`Merge ${selectedPRs.length} pull request${selectedPRs.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmButtonText="merge"
        isLoading={isActionLoading}
      />

      <ConfirmationModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={confirmClose}
        title="close_prs"
        description={`Close ${selectedPRs.length} pull request${selectedPRs.length !== 1 ? 's' : ''}?`}
        confirmButtonText="close"
        isLoading={isActionLoading}
      />

      <ConfirmationModal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        onConfirm={confirmReopen}
        title="reopen_prs"
        description={`Reopen ${selectedPRs.length} pull request${selectedPRs.length !== 1 ? 's' : ''}?`}
        confirmButtonText="reopen"
        isLoading={isActionLoading}
      />
    </div>
  );
}
