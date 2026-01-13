'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PullRequest, PRFilters, PRsListResponse } from '@/types/pull-request';
import { usePreferences } from './usePreferences';

interface UsePullRequestsReturn {
  pullRequests: PullRequest[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  hasNextPage: boolean;
  currentPage: number;
  refetch: () => void;
  loadPage: (page: number) => void;
}

export function usePullRequests(filters: PRFilters): UsePullRequestsReturn {
  const { preferences } = usePreferences();
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPullRequests = useCallback(
    async (page: number = 1, refresh: boolean = false) => {
      if (!filters.repos || filters.repos.length === 0) {
        setPullRequests([]);
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
        
        if (refresh) {
          params.set('refresh', 'true');
        }
        
        if (preferences?.itemsPerPage) {
          params.set('per_page', String(preferences.itemsPerPage));
        }

        if (filters.state) params.set('state', filters.state);
        if (filters.draft !== undefined) params.set('draft', String(filters.draft));
        if (filters.labels?.length) params.set('labels', filters.labels.join(','));
        if (filters.assignee) params.set('assignee', filters.assignee);
        if (filters.author) params.set('author', filters.author);
        if (filters.sort) params.set('sort', filters.sort);
        if (filters.direction) params.set('direction', filters.direction);
        if (filters.search) params.set('search', filters.search);

        const response = await fetch(`/api/github/prs?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to fetch pull requests');
        }

        const result = data.data as PRsListResponse;
        setPullRequests(result.pullRequests);
        setTotalCount(result.totalCount);
        setHasNextPage(result.hasNextPage);
        setCurrentPage(page);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setPullRequests([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, preferences]
  );

  useEffect(() => {
    fetchPullRequests(1);
  }, [fetchPullRequests]);

  const refetch = useCallback(() => {
    fetchPullRequests(currentPage, true);
  }, [fetchPullRequests, currentPage]);

  const loadPage = useCallback(
    (page: number) => {
      fetchPullRequests(page);
    },
    [fetchPullRequests]
  );

  return {
    pullRequests,
    isLoading,
    error,
    totalCount,
    hasNextPage,
    currentPage,
    refetch,
    loadPage,
  };
}
