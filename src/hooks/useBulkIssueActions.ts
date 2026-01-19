'use client';

import { useState, useCallback, useRef } from 'react';
import type { Issue, BulkIssueAction, BulkOperationSummary, BulkOperationResult } from '@/types/issue';

export interface BulkOperationState {
  isExecuting: boolean;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  results: BulkOperationResult[];
  isCompleted: boolean;
}

interface UseBulkIssueActionsReturn {
  selectedIssues: Issue[];
  setSelectedIssues: (issues: Issue[]) => void;
  clearSelection: () => void;
  state: BulkOperationState;
  executeAction: (action: BulkIssueAction) => Promise<void>;
  cancelOperation: () => void;
  error: string | null;
  resetState: () => void;
}

const INITIAL_STATE: BulkOperationState = {
  isExecuting: false,
  total: 0,
  processed: 0,
  succeeded: 0,
  failed: 0,
  results: [],
  isCompleted: false,
};

export function useBulkIssueActions(
  onSuccess?: () => void
): UseBulkIssueActionsReturn {
  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);
  const [state, setState] = useState<BulkOperationState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedIssues([]);
  }, []);

  const resetState = useCallback(() => {
    setState(INITIAL_STATE);
    setError(null);
  }, []);

  const cancelOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(s => ({ ...s, isExecuting: false, isCompleted: true }));
    }
  }, []);

  const executeAction = useCallback(
    async (action: BulkIssueAction): Promise<void> => {
      if (selectedIssues.length === 0) {
        throw new Error('No issues selected');
      }

      const total = selectedIssues.length;
      setState({
        ...INITIAL_STATE,
        isExecuting: true,
        total,
      });
      setError(null);
      abortControllerRef.current = new AbortController();

      const BATCH_SIZE = 5;
      const allResults: BulkOperationResult[] = [];
      let succeededCount = 0;
      let failedCount = 0;

      try {
        for (let i = 0; i < selectedIssues.length; i += BATCH_SIZE) {
          if (abortControllerRef.current.signal.aborted) break;

          const batch = selectedIssues.slice(i, i + BATCH_SIZE);
          const issueIdentifiers = batch.map((issue) => ({
            owner: issue.repository.owner,
            repo: issue.repository.name,
            number: issue.number,
          }));

          const response = await fetch('/api/github/issues/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ issues: issueIdentifiers, action }),
            signal: abortControllerRef.current.signal,
          });

          const data = await response.json();

          if (!response.ok) {
            // Handle partial failure or API error
            const errorMsg = data.error?.message || 'Batch operation failed';
            
            // Mark all items in this batch as failed if the whole request failed
            const batchFailures: BulkOperationResult[] = batch.map(issue => ({
              issue: {
                owner: issue.repository.owner,
                repo: issue.repository.name,
                number: issue.number,
              },
              success: false,
              error: errorMsg
            }));
            
            allResults.push(...batchFailures);
            failedCount += batch.length;
          } else {
            const summary = data.data as BulkOperationSummary;
            allResults.push(...summary.results);
            succeededCount += summary.succeeded;
            failedCount += summary.failed;
          }

          setState(prev => ({
            ...prev,
            processed: Math.min(i + BATCH_SIZE, total),
            succeeded: succeededCount,
            failed: failedCount,
            results: [...allResults],
          }));
        }

        setState(prev => ({ ...prev, isExecuting: false, isCompleted: true }));
        
        if (succeededCount > 0) {
          onSuccess?.();
          // We don't clear selection immediately so user can see results
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Handled by cancelOperation
          return;
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setState(prev => ({ ...prev, isExecuting: false, isCompleted: true }));
      } finally {
        abortControllerRef.current = null;
      }
    },
    [selectedIssues, onSuccess]
  );

  return {
    selectedIssues,
    setSelectedIssues,
    clearSelection,
    state,
    executeAction,
    cancelOperation,
    error,
    resetState,
  };
}
