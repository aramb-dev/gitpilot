
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { createGitHubClient } from '../services/github';
import { extractRateLimitInfo } from '../utils/helpers';

/**
 * Hook for making authenticated GitHub API requests with rate limit handling
 * @param {string} endpoint - GitHub API endpoint
 * @param {Object} options - Request options
 * @param {boolean} immediate - Whether to fetch immediately
 * @returns {Object} - Data, loading state, error, and refetch function
 */
export const useGitHubApi = (endpoint, options = {}, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimit, setRateLimit] = useState(null);
  const { githubToken } = useAuthStore();

  const fetchData = useCallback(async (customEndpoint, customOptions) => {
    // Use provided endpoint/options or fall back to the ones provided to the hook
    const targetEndpoint = customEndpoint || endpoint;
    const targetOptions = { ...options, ...customOptions };

    if (!githubToken) {
      setError('GitHub token not available. Please sign in again.');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const client = await createGitHubClient();
      const response = await client.get(targetEndpoint, targetOptions);

      // Extract and store rate limit information
      const rateLimitInfo = extractRateLimitInfo(response);
      setRateLimit(rateLimitInfo);

      setData(response.data);
      return response.data;
    } catch (err) {
      console.error(`Error fetching ${targetEndpoint}:`, err);
      setError(err.response?.data?.message || err.message);

      // Handle rate limit errors specifically
      if (err.response?.status === 403 && err.response?.headers['x-ratelimit-remaining'] === '0') {
        const resetTime = new Date(parseInt(err.response.headers['x-ratelimit-reset']) * 1000);
        setError(`GitHub API rate limit exceeded. Reset at ${resetTime.toLocaleTimeString()}`);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, options, githubToken]);

  // Fetch data on mount if immediate is true
  useEffect(() => {
    if (immediate && githubToken) {
      fetchData();
    }
  }, [immediate, githubToken, fetchData]);

  return {
    data,
    loading,
    error,
    rateLimit,
    fetchData,
  };
};
