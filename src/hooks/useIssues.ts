'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Issue, IssueFilters, IssuesListResponse } from '@/types/issue';
import { usePreferences } from './usePreferences';

interface UseIssuesReturn {
  issues: Issue[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  hasNextPage: boolean;
  currentPage: number;
  refetch: () => void;
  loadPage: (page: number) => void;
}

export function useIssues(filters: IssueFilters): UseIssuesReturn {
  const { preferences } = usePreferences();
  const [issues, setIssues] = useState<Issue[]>([]);
  // ... rest of state ...

  const fetchIssues = useCallback(
    async (page: number = 1) => {
      if (!filters.repos || filters.repos.length === 0) {
        setIssues([]);
        setTotalCount(0);
        setHasNextPage(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('repos', filters.repos.join(','));
        params.set('page', String(page));
        
        if (preferences?.itemsPerPage) {
          params.set('per_page', String(preferences.itemsPerPage));
        }

        if (filters.state) params.set('state', filters.state);
        if (filters.labels?.length) params.set('labels', filters.labels.join(','));
        if (filters.assignee) params.set('assignee', filters.assignee);
        if (filters.since) params.set('since', filters.since);
        if (filters.sort) params.set('sort', filters.sort);
        if (filters.direction) params.set('direction', filters.direction);
        if (filters.search) params.set('search', filters.search);

        const response = await fetch(`/api/github/issues?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to fetch issues');
        }

        const result = data.data as IssuesListResponse;
        setIssues(result.issues);
        setTotalCount(result.totalCount);
        setHasNextPage(result.hasNextPage);
        setCurrentPage(page);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIssues([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, preferences]
  );

  useEffect(() => {
    fetchIssues(1);
  }, [fetchIssues]);

  const refetch = useCallback(() => {
    fetchIssues(currentPage);
  }, [fetchIssues, currentPage]);

  const loadPage = useCallback(
    (page: number) => {
      fetchIssues(page);
    },
    [fetchIssues]
  );

  return {
    issues,
    isLoading,
    error,
    totalCount,
    hasNextPage,
    currentPage,
    refetch,
    loadPage,
  };
}
