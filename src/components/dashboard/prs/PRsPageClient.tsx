'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRCardGrid } from './PRCardGrid';
import { PRList } from './PRList';
import { PRFilters } from './PRFilters';
import { PRMergeModal } from './PRMergeModal';
import { PRPreview } from './PRPreview';
import { PRBulkActionBar } from './PRBulkActionBar';
import { BulkOperationModal, type BulkItemStatus } from '../BulkOperationModal';
import { usePullRequests } from '@/hooks/usePullRequests';
import { usePreferences } from '@/hooks/usePreferences';
import { useBulkPRActions } from '@/hooks/useBulkPRActions';
import type { PRFilters as PRFiltersType, PullRequest, BulkPRAction } from '@/types/pull-request';
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
  const [previewPR, setPreviewPR] = useState<PullRequest | null>(null);
  
  // Modal states
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

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
    refetch,
  } = usePullRequests(filters);

  const {
    state: bulkState,
    executeAction: executeBulkAction,
    cancelOperation: cancelBulkOperation,
    resetState: resetBulkState,
    retryFailed,
  } = useBulkPRActions(refetch);

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

  const handleAction = async (action: BulkPRAction) => {
    setIsMergeModalOpen(false);
    await executeBulkAction(selectedPRObjects, action);
  };

  const handleMergeConfirm = (method: 'merge' | 'squash' | 'rebase', message: string) => {
    handleAction({ type: 'merge', mergeMethod: method, commitMessage: message });
  };

  const handleCloseBulkModal = () => {
    if (bulkState.isCompleted) {
      setSelectedPRs([]);
      setSelectAll(false);
      resetBulkState();
    }
  };

  const bulkItems: BulkItemStatus[] = useMemo(() => {
    return selectedPRObjects.map(pr => {
      const prKey = `${pr.repository.fullName}#${pr.number}`;
      const result = bulkState.results.find(r => r.pr === prKey);
      let status: BulkItemStatus['status'] = 'pending';
      
      if (result) {
        status = result.success ? 'success' : 'error';
      } else if (bulkState.isExecuting) {
        const idx = selectedPRObjects.indexOf(pr);
        if (idx < bulkState.processed + 5 && idx >= bulkState.processed) {
          status = 'processing';
        }
      }

      return {
        id: pr.id,
        label: prKey,
        status,
        error: result?.error,
      };
    });
  }, [selectedPRObjects, bulkState]);

  const hasSelectedPRs = selectedPRs.length > 0;

  // Extract labels and assignees for filters and bulk actions
  const availableLabels = Array.from(
    new Map(pullRequests.flatMap(pr => pr.labels).map(l => [l.id, l])).values()
  );
  // We use Assignees as "available users" for both assignment and review
  const availableAssignees = Array.from(
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

      <PRBulkActionBar 
        selectedPRs={selectedPRObjects}
        onClearSelection={() => {
          setSelectedPRs([]);
          setSelectAll(false);
        }}
        onExecuteAction={handleAction}
        onOpenMergeModal={() => setIsMergeModalOpen(true)}
        isExecuting={bulkState.isExecuting}
        availableLabels={availableLabels}
        availableAssignees={availableAssignees}
      />

      <PRMergeModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        onConfirm={handleMergeConfirm}
        count={selectedPRs.length}
        isLoading={bulkState.isExecuting}
      />

      <PRPreview
        pr={previewPR}
        onClose={() => setPreviewPR(null)}
      />

      <BulkOperationModal
        isOpen={bulkState.isExecuting || bulkState.isCompleted}
        onClose={handleCloseBulkModal}
        title="EXECUTING_BULK_PR_ACTION"
        items={bulkItems}
        isCompleted={bulkState.isCompleted}
        onCancel={cancelBulkOperation}
        onRetry={retryFailed}
      />
    </div>
  );
}