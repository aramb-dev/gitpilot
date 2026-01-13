'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { IssueFilters } from '@/types/issue';

export function useIssueFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: IssueFilters = useMemo(() => {
    const state = searchParams.get('state');
    const labels = searchParams.get('labels');
    const assignee = searchParams.get('assignee');
    const repos = searchParams.get('repos');
    const since = searchParams.get('since');
    const sort = searchParams.get('sort');
    const direction = searchParams.get('direction');
    const search = searchParams.get('search');

    return {
      state: (state === 'closed' || state === 'all') ? state : 'open',
      labels: labels ? labels.split(',').filter(Boolean) : undefined,
      assignee: assignee || undefined,
      repos: repos ? repos.split(',').filter(Boolean) : undefined,
      since: since || undefined,
      sort: sort === 'updated' || sort === 'comments' ? sort : 'created',
      direction: direction === 'asc' ? 'asc' : 'desc',
      search: search || undefined,
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (newFilters: IssueFilters) => {
      const params = new URLSearchParams();

      if (newFilters.state && newFilters.state !== 'open') {
        params.set('state', newFilters.state);
      }

      if (newFilters.labels && newFilters.labels.length > 0) {
        params.set('labels', newFilters.labels.join(','));
      }

      if (newFilters.assignee) {
        params.set('assignee', newFilters.assignee);
      }

      if (newFilters.repos && newFilters.repos.length > 0) {
        params.set('repos', newFilters.repos.join(','));
      }

      if (newFilters.since) {
        params.set('since', newFilters.since);
      }

      if (newFilters.sort && newFilters.sort !== 'created') {
        params.set('sort', newFilters.sort);
      }

      if (newFilters.direction && newFilters.direction !== 'desc') {
        params.set('direction', newFilters.direction);
      }

      if (newFilters.search) {
        params.set('search', newFilters.search);
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [router, pathname]
  );

  const updateFilter = useCallback(
    <K extends keyof IssueFilters>(key: K, value: IssueFilters[K]) => {
      setFilters({ ...filters, [key]: value });
    },
    [filters, setFilters]
  );

  const clearFilters = useCallback(() => {
    setFilters({ state: 'open', repos: filters.repos });
  }, [setFilters, filters.repos]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
  };
}
