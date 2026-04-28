'use client';

import { useCallback, useRef, useState } from 'react';
import type {
  BulkIssueAction,
  BulkOperationResult,
  BulkOperationSummary,
  Issue,
} from '@/types/issue';

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
  executeAction: (action: BulkIssueAction, issuesOverride?: Issue[]) => Promise<void>;
  cancelOperation: () => void;
  error: string | null;
  resetState: () => void;
  retryFailed: () => void;
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

export function useBulkIssueActions(onSuccess?: () => void): UseBulkIssueActionsReturn {
  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);
  const [state, setState] = useState<BulkOperationState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastActionRef = useRef<BulkIssueAction | null>(null);

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
      setState((s) => ({ ...s, isExecuting: false, isCompleted: true }));
    }
  }, []);

  const executeAction = useCallback(
    async (action: BulkIssueAction, issuesOverride?: Issue[]): Promise<void> => {
      const issuesToProcess = issuesOverride || selectedIssues;

      if (issuesToProcess.length === 0) {
        throw new Error('No issues selected');
      }

      lastActionRef.current = action;

      const total = issuesToProcess.length;
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
        for (let i = 0; i < issuesToProcess.length; i += BATCH_SIZE) {
          if (abortControllerRef.current.signal.aborted) break;

          const batch = issuesToProcess.slice(i, i + BATCH_SIZE);
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
            const batchFailures: BulkOperationResult[] = batch.map((issue) => ({
              issue: {
                owner: issue.repository.owner,
                repo: issue.repository.name,
                number: issue.number,
              },
              success: false,
              error: errorMsg,
            }));

            allResults.push(...batchFailures);
            failedCount += batch.length;
          } else {
            const summary = data.data as BulkOperationSummary;
            allResults.push(...summary.results);
            succeededCount += summary.succeeded;
            failedCount += summary.failed;
          }

          setState((prev) => ({
            ...prev,
            processed: Math.min(i + BATCH_SIZE, total),
            succeeded: succeededCount,
            failed: failedCount,
            results: [...allResults],
          }));
        }

        setState((prev) => ({ ...prev, isExecuting: false, isCompleted: true }));

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
        setState((prev) => ({ ...prev, isExecuting: false, isCompleted: true }));
      } finally {
        abortControllerRef.current = null;
      }
    },
    [selectedIssues, onSuccess],
  );

  const retryFailed = useCallback(() => {
    if (!lastActionRef.current) return;

    // Identify failed issues from results
    const failedIdentifiers = new Set(
      state.results
        .filter((r) => !r.success)
        .map((r) => `${r.issue.owner}/${r.issue.repo}#${r.issue.number}`),
    );

    if (failedIdentifiers.size === 0) return;

    // We need to find the original Issue objects.
    // They should be in selectedIssues (if the user hasn't cleared them).
    // If we passed issuesOverride, we rely on selectedIssues containing them
    // OR we should have stored the last processed batch?
    // Assumption: selectedIssues hasn't changed significantly.
    const failedIssues = selectedIssues.filter((issue) =>
      failedIdentifiers.has(`${issue.repository.owner}/${issue.repository.name}#${issue.number}`),
    );

    if (failedIssues.length > 0) {
      // Update selection to only failed ones so the UI reflects what's being retried
      setSelectedIssues(failedIssues);
      // Execute with the failed subset
      executeAction(lastActionRef.current, failedIssues);
    }
  }, [state.results, selectedIssues, executeAction]);

  return {
    selectedIssues,
    setSelectedIssues,
    clearSelection,
    state,
    executeAction,
    cancelOperation,
    error,
    resetState,
    retryFailed,
  };
}
