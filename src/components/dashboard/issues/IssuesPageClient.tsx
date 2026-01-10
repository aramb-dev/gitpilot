'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IssueList } from './IssueList';
import { IssueFilters } from './IssueFilters';
import { IssuePreview } from './IssuePreview';
import { BulkActionBar } from './BulkActionBar';
import { IssueListPagination } from './IssueListPagination';
import { useIssues } from '@/hooks/useIssues';
import { useIssueFilters } from '@/hooks/useIssueFilters';
import { useBulkIssueActions } from '@/hooks/useBulkIssueActions';
import type { Issue, IssueLabel, IssueUser } from '@/types/issue';

interface IssuesPageClientProps {
  availableRepos: string[];
}

export function IssuesPageClient({ availableRepos }: IssuesPageClientProps) {
  const { filters, setFilters } = useIssueFilters();
  const [previewIssue, setPreviewIssue] = useState<Issue | null>(null);
  const [availableLabels, setAvailableLabels] = useState<IssueLabel[]>([]);
  const [availableAssignees, setAvailableAssignees] = useState<IssueUser[]>([]);

  // Initialize repos filter if empty
  useEffect(() => {
    if (!filters.repos || filters.repos.length === 0) {
      if (availableRepos.length > 0) {
        setFilters({ ...filters, repos: availableRepos.slice(0, 5) });
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
    isExecuting,
    executeAction,
  } = useBulkIssueActions(refetch);

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

  // Show repo selection prompt if no repos selected
  if (!filters.repos || filters.repos.length === 0) {
    return (
      <div className="space-y-6">
        <IssueFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableRepos={availableRepos}
          availableLabels={[]}
          availableAssignees={[]}
        />

        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Select repositories to view issues
          </h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Use the repository filter above to select which repositories you want to view issues from.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-400">{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
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
        isExecuting={isExecuting}
        availableLabels={availableLabels}
        availableAssignees={availableAssignees}
      />
    </div>
  );
}
