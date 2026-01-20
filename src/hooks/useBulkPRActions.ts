'use client';

import { useState, useCallback, useRef } from 'react';
import type { PullRequest, BulkPRAction } from '@/types/pull-request';

export interface BulkPROperationState {
  isExecuting: boolean;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  results: { pr: string; success: boolean; error?: string }[];
  isCompleted: boolean;
}

interface UseBulkPRActionsReturn {
  state: BulkPROperationState;
  executeAction: (prs: PullRequest[], action: BulkPRAction) => Promise<void>;
  cancelOperation: () => void;
  resetState: () => void;
  retryFailed: () => void;
}

const INITIAL_STATE: BulkPROperationState = {
  isExecuting: false,
  total: 0,
  processed: 0,
  succeeded: 0,
  failed: 0,
  results: [],
  isCompleted: false,
};

export function useBulkPRActions(onSuccess?: () => void): UseBulkPRActionsReturn {
  const [state, setState] = useState<BulkPROperationState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastParamsRef = useRef<{
    prs: PullRequest[];
    action: BulkPRAction;
  } | null>(null);

  const resetState = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const cancelOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(s => ({ ...s, isExecuting: false, isCompleted: true }));
    }
  }, []);

  const executeAction = useCallback(
    async (prs: PullRequest[], action: BulkPRAction): Promise<void> => {
      const total = prs.length;
      setState({ ...INITIAL_STATE, isExecuting: true, total });
      
      lastParamsRef.current = { prs, action };

      abortControllerRef.current = new AbortController();

      const BATCH_SIZE = 5;
      let succeededCount = 0;
      let failedCount = 0;
      const allResults: BulkPROperationState['results'] = [];

      try {
        for (let i = 0; i < prs.length; i += BATCH_SIZE) {
          if (abortControllerRef.current.signal.aborted) break;

          const batch = prs.slice(i, i + BATCH_SIZE);
          const prParams = batch.map(pr => ({
            owner: pr.repository.owner,
            repo: pr.repository.name,
            prNumber: pr.number,
          }));

          const response = await fetch('/api/github/prs/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prs: prParams,
              action,
            }),
            signal: abortControllerRef.current.signal,
          });

          const data = await response.json();

          if (!response.ok) {
            const errorMsg = data.error || 'Batch operation failed';
            batch.forEach(pr => {
              allResults.push({ pr: `${pr.repository.fullName}#${pr.number}`, success: false, error: errorMsg });
            });
            failedCount += batch.length;
          } else {
            if (data.success) {
              data.success.forEach((s: any) => {
                allResults.push({ pr: s.full_name || `${s.owner}/${s.repo}#${s.number}`, success: true });
                succeededCount++;
              });
            }
            if (data.errors) {
              data.errors.forEach((e: any) => {
                allResults.push({ pr: e.pr || `${e.owner}/${e.repo}#${e.prNumber}`, success: false, error: e.error });
                failedCount++;
              });
            }
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
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setState(prev => ({ ...prev, isExecuting: false, isCompleted: true }));
      } finally {
        abortControllerRef.current = null;
      }
    },
    [onSuccess]
  );

  const retryFailed = useCallback(() => {
    if (!lastParamsRef.current) return;
    
    const { prs, action } = lastParamsRef.current;
    
    // Identify failed PRs
    const failedIds = new Set(
      state.results
        .filter(r => !r.success)
        .map(r => r.pr)
    );

    if (failedIds.size === 0) return;

    // Filter original PRs
    const failedPRs = prs.filter(pr => 
      failedIds.has(`${pr.repository.fullName}#${pr.number}`) ||
      failedIds.has(`${pr.repository.owner}/${pr.repository.name}#${pr.number}`)
    );

    if (failedPRs.length > 0) {
      executeAction(failedPRs, action);
    }
  }, [state.results, executeAction]);

  return {
    state,
    executeAction,
    cancelOperation,
    resetState,
    retryFailed,
  };
}
