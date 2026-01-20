'use client';

import { useState, useCallback, useRef } from 'react';
import type { Repository } from '@/types/repository';

export interface BulkRepoOperationState {
  isExecuting: boolean;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  results: { repo: string; success: boolean; error?: string }[];
  isCompleted: boolean;
}

interface UseBulkRepoActionsReturn {
  state: BulkRepoOperationState;
  executeAction: (repos: Repository[], type: 'archive' | 'unarchive' | 'delete' | 'visibility', options?: any) => Promise<void>;
  cancelOperation: () => void;
  resetState: () => void;
  retryFailed: () => void;
}

const INITIAL_STATE: BulkRepoOperationState = {
  isExecuting: false,
  total: 0,
  processed: 0,
  succeeded: 0,
  failed: 0,
  results: [],
  isCompleted: false,
};

export function useBulkRepoActions(onSuccess?: () => void): UseBulkRepoActionsReturn {
  const [state, setState] = useState<BulkRepoOperationState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastParamsRef = useRef<{
    repos: Repository[];
    type: 'archive' | 'unarchive' | 'delete' | 'visibility';
    options?: any;
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
    async (repos: Repository[], type: 'archive' | 'unarchive' | 'delete' | 'visibility', options?: any): Promise<void> => {
      const total = repos.length;
      setState({ ...INITIAL_STATE, isExecuting: true, total });
      
      lastParamsRef.current = { repos, type, options };
      
      abortControllerRef.current = new AbortController();

      const BATCH_SIZE = 2; // Repos operations are heavier, use smaller batch
      let succeededCount = 0;
      let failedCount = 0;
      const allResults: BulkRepoOperationState['results'] = [];

      try {
        for (let i = 0; i < repos.length; i += BATCH_SIZE) {
          if (abortControllerRef.current.signal.aborted) break;

          const batch = repos.slice(i, i + BATCH_SIZE);
          const repoParams = batch.map(r => ({ owner: r.owner, repo: r.name }));

          let url = '';
          let method = 'PATCH';
          let body: any = { repos: repoParams };

          switch (type) {
            case 'archive':
              url = '/api/github/repos/archive';
              body.archived = true;
              break;
            case 'unarchive':
              url = '/api/github/repos/archive';
              body.archived = false;
              break;
            case 'delete':
              url = '/api/github/repos';
              method = 'DELETE';
              break;
            case 'visibility':
              url = '/api/github/repos/visibility';
              body.visibility = options?.visibility;
              break;
          }

          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: abortControllerRef.current.signal,
          });

          const data = await response.json();

          if (!response.ok) {
            const errorMsg = data.error || 'Batch operation failed';
            batch.forEach(r => {
              allResults.push({ repo: r.full_name, success: false, error: errorMsg });
            });
            failedCount += batch.length;
          } else {
            // APIs return { success: [], errors: [] }
            if (data.success) {
              data.success.forEach((s: any) => {
                allResults.push({ repo: s.full_name, success: true });
                succeededCount++;
              });
            }
            if (data.errors) {
              data.errors.forEach((e: any) => {
                allResults.push({ repo: e.repo, success: false, error: e.error });
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
    
    const { repos, type, options } = lastParamsRef.current;
    
    // Identify failed repos
    const failedFullNames = new Set(
      state.results
        .filter(r => !r.success)
        .map(r => r.repo)
    );

    if (failedFullNames.size === 0) return;

    const failedRepos = repos.filter(r => failedFullNames.has(r.full_name));

    if (failedRepos.length > 0) {
      executeAction(failedRepos, type, options);
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
