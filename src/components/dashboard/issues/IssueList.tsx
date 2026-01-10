'use client';

import { useCallback, useState } from 'react';
import { IssueRow } from './IssueRow';
import { IssueListHeader } from './IssueListHeader';
import type { Issue } from '@/types/issue';

interface IssueListProps {
  issues: Issue[];
  isLoading: boolean;
  selectedIssues: Issue[];
  onSelectionChange: (issues: Issue[]) => void;
  onIssueClick: (issue: Issue) => void;
  sortBy: 'created' | 'updated' | 'comments';
  sortDirection: 'asc' | 'desc';
  onSortChange: (sort: 'created' | 'updated' | 'comments') => void;
  onDirectionChange: (direction: 'asc' | 'desc') => void;
}

export function IssueList({
  issues,
  isLoading,
  selectedIssues,
  onSelectionChange,
  onIssueClick,
  sortBy,
  sortDirection,
  onSortChange,
  onDirectionChange,
}: IssueListProps) {
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const selectedIds = new Set(selectedIssues.map((i) => i.id));

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        onSelectionChange([...issues]);
      } else {
        onSelectionChange([]);
      }
    },
    [issues, onSelectionChange]
  );

  const handleSelect = useCallback(
    (issue: Issue, selected: boolean, event?: React.MouseEvent) => {
      const issueIndex = issues.findIndex((i) => i.id === issue.id);

      // Handle shift-click for range selection
      if (event?.shiftKey && lastSelectedIndex !== null && issueIndex !== -1) {
        const start = Math.min(lastSelectedIndex, issueIndex);
        const end = Math.max(lastSelectedIndex, issueIndex);
        const rangeIssues = issues.slice(start, end + 1);

        if (selected) {
          const newSelection = [...selectedIssues];
          for (const rangeIssue of rangeIssues) {
            if (!selectedIds.has(rangeIssue.id)) {
              newSelection.push(rangeIssue);
            }
          }
          onSelectionChange(newSelection);
        } else {
          const rangeIds = new Set(rangeIssues.map((i) => i.id));
          onSelectionChange(selectedIssues.filter((i) => !rangeIds.has(i.id)));
        }
      } else {
        // Normal single selection
        if (selected) {
          onSelectionChange([...selectedIssues, issue]);
        } else {
          onSelectionChange(selectedIssues.filter((i) => i.id !== issue.id));
        }
      }

      setLastSelectedIndex(issueIndex);
    },
    [issues, selectedIssues, selectedIds, lastSelectedIndex, onSelectionChange]
  );

  const allSelected = issues.length > 0 && selectedIssues.length === issues.length;

  if (isLoading) {
    return (
      <div className="bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden">
        <IssueListHeader
          totalCount={0}
          selectedCount={0}
          allSelected={false}
          onSelectAll={() => {}}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          onDirectionChange={onDirectionChange}
        />
        <div className="divide-y divide-gray-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 animate-pulse">
              <div className="w-4 h-4 bg-gray-700 rounded mt-1" />
              <div className="w-5 h-5 bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No issues found</div>
          <p className="text-sm text-gray-600">
            Try adjusting your filters or selecting different repositories
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden">
      <IssueListHeader
        totalCount={issues.length}
        selectedCount={selectedIssues.length}
        allSelected={allSelected}
        onSelectAll={handleSelectAll}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        onDirectionChange={onDirectionChange}
      />
      <div className="divide-y divide-gray-800">
        {issues.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            isSelected={selectedIds.has(issue.id)}
            onSelect={(iss, sel) => handleSelect(iss, sel)}
            onClick={onIssueClick}
          />
        ))}
      </div>
    </div>
  );
}
