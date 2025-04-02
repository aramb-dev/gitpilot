import { useState, useCallback, useEffect } from 'react';
import {
  fetchUserRepositories,
  fetchOrganizationRepositories
} from '../services/github';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';

/**
 * Hook for managing GitHub repositories with filtering and pagination
 */
export const useRepositories = () => {
  const { githubToken } = useAuthStore();
  const {
    repositories,
    filteredRepositories,
    selectedRepositories,
    filters,
    pagination,
    fetchRepositories: storeRepoFetch,
    applyFilters,
    toggleRepositorySelection,
    selectAllRepositories,
    clearSelection,
    setFilter,
  } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);

  // Fetch repositories with pagination
  const fetchRepositories = useCallback(async (options = {}) => {
    if (!githubToken) {
      setError('GitHub token not available. Please sign in again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If fetching for a specific org, use that API
      if (options.org) {
        const result = await fetchOrganizationRepositories(options.org, {
          per_page: options.perPage || pagination.perPage,
          page: options.page || pagination.page,
          ...options,
        });

        storeRepoFetch(result.repositories);
        setHasNextPage(result.pagination.hasNextPage);
        setRateLimit(result.rateLimit);
      } else {
        // Otherwise fetch user's repos
        const result = await fetchUserRepositories({
          per_page: options.perPage || pagination.perPage,
          page: options.page || pagination.page,
          ...options,
        });

        storeRepoFetch(result.repositories);
        setHasNextPage(result.pagination.hasNextPage);
        setRateLimit(result.rateLimit);
      }
    } catch (err) {
      console.error('Error fetching repositories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [githubToken, pagination.perPage, pagination.page, storeRepoFetch]);

  // Load repositories when the hook is first used
  useEffect(() => {
    if (githubToken && repositories.length === 0) {
      fetchRepositories();
    }
  }, [githubToken, repositories.length, fetchRepositories]);

  // Helper for handling filter changes
  const handleFilterChange = useCallback((filterKey, value) => {
    setFilter(filterKey, value);
  }, [setFilter]);

  return {
    repositories,
    filteredRepositories,
    selectedRepositories,
    loading,
    error,
    hasNextPage,
    rateLimit,
    filters,
    pagination,
    fetchRepositories,
    handleFilterChange,
    toggleRepositorySelection,
    selectAll: selectAllRepositories,
    clearSelection,
    isAllSelected: repositories.length > 0 &&
                   selectedRepositories.length === filteredRepositories.length,
    isSomeSelected: selectedRepositories.length > 0
  };
};
