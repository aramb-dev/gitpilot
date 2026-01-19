'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRCardGrid } from './PRCardGrid';
import { PRList } from './PRList';
import { PRFilters } from './PRFilters';
import { PRMergeModal } from './PRMergeModal';
import { PRPreview } from './PRPreview';
import { usePullRequests } from '@/hooks/usePullRequests';
import { usePreferences } from '@/hooks/usePreferences';
import { toast } from 'sonner';
import type { PRFilters as PRFiltersType, PullRequest } from '@/types/pull-request';
import type { IssueLabel, IssueUser } from '@/types/issue';

interface PRsPageClientProps {
  availableRepos: string[];
}

export function PRsPageClient({ availableRepos }: PRsPageClientProps) {
  const { preferences } = usePreferences();
  const [filters, setFilters] = useState<PRFiltersType>({
    repos: [],
    state: 'open',
    sort: 'updated',
    direction: 'desc',
  });
  const [selectedPRs, setSelectedPRs] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [previewPR, setPreviewPR] = useState<PullRequest | null>(null);
  
  // Modal states
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  // Initialize repos filter if empty
  useEffect(() => {
    if ((!filters.repos || filters.repos.length === 0) && availableRepos.length > 0) {
      setFilters(prev => ({ ...prev, repos: availableRepos }));
    }
  }, [availableRepos]);

  const {
    pullRequests,
    isLoading,
    error,
    totalCount,
    hasNextPage,
    refetch,
    loadPage,
  } = usePullRequests(filters);

  const itemsPerPage = preferences?.itemsPerPage || 10;
  const selectedPRObjects = pullRequests.filter(pr => selectedPRs.includes(pr.id));

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedPRs(pullRequests.map(pr => pr.id));
    } else {
      setSelectedPRs([]);
    }
  };

  const handleSelectPR = (pr: PullRequest | number, checked: boolean) => {
    const prId = typeof pr === 'number' ? pr : pr.id;
    if (checked) {
      setSelectedPRs(prev => [...prev, prId]);
    } else {
      setSelectedPRs(prev => prev.filter(id => id !== prId));
      setSelectAll(false);
    }
  };

  const handleAction = async (action: 'merge' | 'close' | 'reopen', params: any = {}) => {
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
          action,
          ...params,
        }),
      });

      if (!res.ok) throw new Error('Action failed');
      
      const data = await res.json();
      if (data.success?.length > 0) {
        toast.success(`Successfully ${action}ed ${data.success.length} PRs.`);
        setSelectedPRs([]);
        setSelectAll(false);
        refetch();
      }
      if (data.errors?.length > 0) {
        toast.error(`Failed to ${action} ${data.errors.length} PRs.`);
      }
    } catch (e) {
      toast.error(`An error occurred while ${action}ing PRs.`);
    } finally {
      setIsActionLoading(false);
      setIsMergeModalOpen(false);
      setIsCloseModalOpen(false);
      setIsReopenModalOpen(false);
    }
  };

  const handleMergeConfirm = (method: 'merge' | 'squash' | 'rebase', message: string) => {
    handleAction('merge', { mergeMethod: method, commitMessage: message });
  };

  const hasSelectedPRs = selectedPRs.length > 0;

  // Extract labels and assignees for filters
  const availableLabels: IssueLabel[] = Array.from(
    new Map(pullRequests.flatMap(pr => pr.labels).map(l => [l.id, l])).values()
  );
  const availableAssignees: IssueUser[] = Array.from(
    new Map(pullRequests.flatMap(pr => pr.assignees).map(a => [a.id, a])).values()
  );

  if (!filters.repos || filters.repos.length === 0) {
    return (
      <div className="space-y-6 font-mono">
        <PRFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableRepos={availableRepos}
          availableLabels={[]}
          availableAssignees={[]}
        />
        <div className="text-center py-16 bg-[#0d0d0d] border border-[#333]">
          <AlertCircle className="w-8 h-8 text-[#00ff00] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">// SELECT_REPOSITORIES</h3>
          <p className="text-[#666] text-sm max-w-md mx-auto">
            &gt; Select repositories to view pull requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">PULL_REQUESTS</h1>
          <p className="text-[#666] text-xs mt-1">&gt; listing {totalCount} requests across {filters.repos.length} repos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`h-9 w-9 p-0 border-[#333] ${viewMode === 'grid' ? 'text-[#00ff00] border-[#00ff00]/50 bg-[#00ff00]/5' : 'text-[#666]'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('list')}
            className={`h-9 w-9 p-0 border-[#333] ${viewMode === 'list' ? 'text-[#00ff00] border-[#00ff00]/50 bg-[#00ff00]/5' : 'text-[#666]'}`}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="h-9 px-3 border-[#333] text-[#666] hover:text-[#00ff00] hover:border-[#00ff00]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            REFRESH
          </Button>
        </div>
      </div>

      <PRFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableRepos={availableRepos}
        availableLabels={availableLabels}
        availableAssignees={availableAssignees}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
          <span className="text-[#666]">error: </span>{error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-3 text-[#666] py-12">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>loading_pull_requests...</span>
        </div>
      ) : viewMode === 'grid' ? (
        <PRCardGrid
          pullRequests={pullRequests}
          selectedPRs={selectedPRs}
          selectAll={selectAll}
          onSelectAll={handleSelectAll}
          onSelectPR={handleSelectPR}
        />
      ) : (
        <PRList
          prs={pullRequests}
          selectedPRs={new Set(selectedPRs.map(String))}
          onSelectPR={handleSelectPR}
          onSelectAll={handleSelectAll}
          onViewPR={setPreviewPR}
        />
      )}

      {/* Bulk Action Bar */}
      {hasSelectedPRs && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40">
          <div className="bg-[#0d0d0d] border border-[#00ff00]/30 shadow-[0_0_20px_rgba(0,255,0,0.1)] p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#00ff00] text-black px-2 py-0.5 text-xs font-bold">
                {selectedPRs.length}
              </div>
              <span className="text-xs text-[#00ff00] font-bold uppercase tracking-widest">selected</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsMergeModalOpen(true)}
                disabled={isActionLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-8"
              >
                BULK_MERGE
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction('close')}
                disabled={isActionLoading}
                className="border-[#333] text-[#888] hover:text-red-500 hover:border-red-500 font-bold text-xs h-8"
              >
                CLOSE
              </Button>
              <div className="w-px h-4 bg-[#333] mx-1" />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedPRs([])}
                className="text-[#666] hover:text-white text-xs h-8"
              >
                CANCEL
              </Button>
            </div>
          </div>
        </div>
      )}

      <PRMergeModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        onConfirm={handleMergeConfirm}
        count={selectedPRs.length}
        isLoading={isActionLoading}
      />

      <PRPreview
        pr={previewPR}
        onClose={() => setPreviewPR(null)}
      />
    </div>
  );
}
