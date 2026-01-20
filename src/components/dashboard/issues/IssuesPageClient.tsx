'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IssueList } from './IssueList';
import { IssueFilters } from './IssueFilters';
import { IssuePreview } from './IssuePreview';
import { BulkActionBar } from './BulkActionBar';
import { BulkOperationModal, type BulkItemStatus } from '../BulkOperationModal';
import { IssueListPagination } from './IssueListPagination';
import { useIssues } from '@/hooks/useIssues';
import { useIssueFilters } from '@/hooks/useIssueFilters';
import { useBulkIssueActions } from '@/hooks/useBulkIssueActions';
import { usePreferences } from '@/hooks/usePreferences';
import type { Issue, IssueLabel, IssueUser } from '@/types/issue';

interface IssuesPageClientProps {
  availableRepos: string[];
}

export function IssuesPageClient({ availableRepos }: IssuesPageClientProps) {
  const { preferences } = usePreferences();
  const { filters, setFilters } = useIssueFilters();
  const [previewIssue, setPreviewIssue] = useState<Issue | null>(null);
  const [availableLabels, setAvailableLabels] = useState<IssueLabel[]>([]);
  const [availableAssignees, setAvailableAssignees] = useState<IssueUser[]>([]);

  // Initialize repos filter if empty
  useEffect(() => {
    if (!filters.repos || filters.repos.length === 0) {
      if (availableRepos.length > 0) {
        setFilters({ ...filters, repos: availableRepos });
      }
    }
  }, [availableRepos, filters, setFilters]);

  const {
    issues,
    isLoading,
    error,
    totalCount,
    hasNextPage,
    currentPage,
    refetch,
    loadPage,
  } = useIssues(filters);

  const {
    selectedIssues,
    setSelectedIssues,
    clearSelection,
    state: bulkState,
    executeAction,
    cancelOperation,
    resetState: resetBulkState,
    retryFailed,
  } = useBulkIssueActions(refetch);

  // Map bulk results to modal items
  const bulkItems: BulkItemStatus[] = useMemo(() => {
    return selectedIssues.map(issue => {
      const result = bulkState.results.find(r => 
        r.issue.owner === issue.repository.owner && 
        r.issue.repo === issue.repository.name && 
        r.issue.number === issue.number
      );

      let status: BulkItemStatus['status'] = 'pending';
      if (result) {
        status = result.success ? 'success' : 'error';
      } else if (bulkState.isExecuting) {
        // Find if this issue is in the current or next batch
        // For simplicity, if not resulted but executing, mark as processing if it's among the first 'processed + batch_size'
        const idx = selectedIssues.indexOf(issue);
        if (idx < bulkState.processed + 5 && idx >= bulkState.processed) {
          status = 'processing';
        }
      }

      return {
        id: `${issue.repository.fullName}#${issue.number}`,
        label: `${issue.repository.name}#${issue.number}: ${issue.title}`,
        status,
        error: result?.error,
      };
    });
  }, [selectedIssues, bulkState]);

  // Extract unique labels and assignees from fetched issues
  useEffect(() => {
    const labelsMap = new Map<number, IssueLabel>();
    const assigneesMap = new Map<number, IssueUser>();

    for (const issue of issues) {
      for (const label of issue.labels) {
        if (!labelsMap.has(label.id)) {
          labelsMap.set(label.id, label);
        }
      }
      for (const assignee of issue.assignees) {
        if (!assigneesMap.has(assignee.id)) {
          assigneesMap.set(assignee.id, assignee);
        }
      }
      if (!assigneesMap.has(issue.user.id)) {
        assigneesMap.set(issue.user.id, issue.user);
      }
    }

    setAvailableLabels(Array.from(labelsMap.values()));
    setAvailableAssignees(Array.from(assigneesMap.values()));
  }, [issues]);

  const handleIssueClick = useCallback((issue: Issue) => {
    setPreviewIssue(issue);
  }, []);

  const handleSortChange = useCallback(
    (sort: 'created' | 'updated' | 'comments') => {
      setFilters({ ...filters, sort });
    },
    [filters, setFilters]
  );

  const handleDirectionChange = useCallback(
    (direction: 'asc' | 'desc') => {
      setFilters({ ...filters, direction });
    },
    [filters, setFilters]
  );

  const handleCloseBulkModal = () => {
    if (bulkState.isCompleted) {
      clearSelection();
      resetBulkState();
    }
  };

  // Show repo selection prompt if no repos selected
  if (!filters.repos || filters.repos.length === 0) {
    return (
      <div className="space-y-6 font-mono">
        <IssueFilters
          filters={filters}
          onFiltersChange={setFilters}
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
            &gt; Use the repository filter above to select which repositories you want to view issues from.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Filters */}
      <IssueFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableRepos={availableRepos}
        availableLabels={availableLabels}
        availableAssignees={availableAssignees}
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

      {/* Issue list */}
      <div className={selectedIssues.length > 0 ? 'pb-20' : ''}>
        <IssueList
          issues={issues}
          isLoading={isLoading}
          selectedIssues={selectedIssues}
          onSelectionChange={setSelectedIssues}
          onIssueClick={handleIssueClick}
          sortBy={filters.sort || 'created'}
          sortDirection={filters.direction || 'desc'}
          onSortChange={handleSortChange}
          onDirectionChange={handleDirectionChange}
        />

        {/* Pagination */}
        {!isLoading && issues.length > 0 && (
          <IssueListPagination
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            hasPrevPage={currentPage > 1}
            isLoading={isLoading}
            onPageChange={loadPage}
            totalCount={totalCount}
            perPage={preferences?.itemsPerPage}
          />
        )}
      </div>

      {/* Issue preview panel */}
      <IssuePreview issue={previewIssue} onClose={() => setPreviewIssue(null)} />

      {/* Bulk action bar */}
      <BulkActionBar
        selectedIssues={selectedIssues}
        onClearSelection={clearSelection}
        onExecuteAction={executeAction}
        isExecuting={bulkState.isExecuting}
        availableLabels={availableLabels}
        availableAssignees={availableAssignees}
      />

      {/* Bulk operation progress modal */}
      <BulkOperationModal
        isOpen={bulkState.isExecuting || bulkState.isCompleted}
        onClose={handleCloseBulkModal}
        title="EXECUTING_BULK_ISSUE_ACTION"
        items={bulkItems}
        isCompleted={bulkState.isCompleted}
        onCancel={cancelOperation}
        onRetry={retryFailed}
      />
    </div>
  );
}
