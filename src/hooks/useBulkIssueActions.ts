'use client';

import { useState, useCallback } from 'react';
import type { Issue, BulkIssueAction, BulkOperationSummary } from '@/types/issue';

interface UseBulkIssueActionsReturn {
  selectedIssues: Issue[];
  setSelectedIssues: (issues: Issue[]) => void;
  clearSelection: () => void;
  isExecuting: boolean;
  lastResult: BulkOperationSummary | null;
  executeAction: (action: BulkIssueAction) => Promise<BulkOperationSummary>;
  error: string | null;
}

export function useBulkIssueActions(
  onSuccess?: () => void
): UseBulkIssueActionsReturn {
  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<BulkOperationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedIssues([]);
  }, []);

  const executeAction = useCallback(
    async (action: BulkIssueAction): Promise<BulkOperationSummary> => {
      if (selectedIssues.length === 0) {
        throw new Error('No issues selected');
      }

      setIsExecuting(true);
      setError(null);

      try {
        const issues = selectedIssues.map((issue) => ({
          owner: issue.repository.owner,
          repo: issue.repository.name,
          number: issue.number,
        }));

        const response = await fetch('/api/github/issues/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ issues, action }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to execute action');
        }

        const result = data.data as BulkOperationSummary;
        setLastResult(result);

        // Clear selection after successful operation
        if (result.succeeded > 0) {
          clearSelection();
          onSuccess?.();
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsExecuting(false);
      }
    },
    [selectedIssues, clearSelection, onSuccess]
  );

  return {
    selectedIssues,
    setSelectedIssues,
    clearSelection,
    isExecuting,
    lastResult,
    executeAction,
    error,
  };
}
