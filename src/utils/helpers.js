import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind CSS support
 * @param {...string} inputs - Class names to combine
 * @returns {string} - Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a GitHub repository object for consistent use in the UI
 * @param {Object} repo - Raw GitHub repository object
 * @returns {Object} - Formatted repository object
 */
export const formatRepository = (repo) => {
  if (!repo) return null;

  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || '',
    isPrivate: repo.private,
    isArchived: repo.archived,
    url: repo.html_url,
    apiUrl: repo.url,
    owner: {
      id: repo.owner.id,
      login: repo.owner.login,
      avatarUrl: repo.owner.avatar_url,
      url: repo.owner.html_url,
      type: repo.owner.type, // 'User' or 'Organization'
    },
    createdAt: new Date(repo.created_at),
    updatedAt: new Date(repo.updated_at),
    pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
    stargazersCount: repo.stargazers_count,
    watchersCount: repo.watchers_count,
    forksCount: repo.forks_count,
    defaultBranch: repo.default_branch,
    isTemplate: repo.is_template || false,
  };
};

/**
 * Groups repositories by owner for easier management
 * @param {Array} repositories - List of repository objects
 * @returns {Object} - Repositories grouped by owner login
 */
export const groupRepositoriesByOwner = (repositories) => {
  return repositories.reduce((groups, repo) => {
    const ownerLogin = repo.owner.login;
    if (!groups[ownerLogin]) {
      groups[ownerLogin] = [];
    }
    groups[ownerLogin].push(repo);
    return groups;
  }, {});
};

/**
 * Handles GitHub API rate limiting by extracting and formatting rate limit info
 * @param {Object} response - GitHub API response with headers
 * @returns {Object} - Formatted rate limit information
 */
export const extractRateLimitInfo = (response) => {
  const headers = response?.headers;
  if (!headers) return null;

  return {
    limit: parseInt(headers['x-ratelimit-limit'] || '0'),
    remaining: parseInt(headers['x-ratelimit-remaining'] || '0'),
    reset: new Date(parseInt(headers['x-ratelimit-reset'] || '0') * 1000),
    used: parseInt(headers['x-ratelimit-used'] || '0'),
    resource: headers['x-ratelimit-resource'] || 'core',
  };
};

/**
 * Format GitHub error messages for user-friendly display
 * @param {Error & {response?: any}} error - Error object from GitHub API call
 * @returns {string} - Formatted error message
 */
export const formatGitHubError = (error) => {
  const response = error?.response;

  if (!response) {
    return error?.message || 'An unknown error occurred';
  }

  const status = response.status;
  const data = response.data;

  switch (status) {
    case 401:
      return 'Authentication error: Your GitHub token may have expired. Please sign in again.';
    case 403:
      if (response.headers['x-ratelimit-remaining'] === '0') {
        const resetTime = new Date(parseInt(response.headers['x-ratelimit-reset']) * 1000);
        return `Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}.`;
      }
      return data.message || 'You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found. It may have been deleted or you may not have access.';
    case 422:
      return data.message || 'The request was invalid. Please check your inputs.';
    default:
      return data?.message || `Error ${status}: ${error.message}`;
  }
};

/**
 * Batches API requests to avoid hitting rate limits
 * @param {Array} items - Items to process
 * @param {Function} processingFunction - Async function to process each item
 * @param {number} batchSize - Number of items to process in parallel
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} - Processing results
 */
export const batchProcess = async (items, processingFunction, batchSize = 10, onProgress = () => {}) => {
  const results = [];
  const errors = [];
  let processed = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(async (item) => {
      try {
        const result = await processingFunction(item);
        results.push({ item, result, success: true });
        return { item, result, success: true };
      } catch (error) {
        errors.push({ item, error, success: false });
        return { item, error, success: false };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    processed += batchResults.length;
    onProgress(processed, items.length);
  }

  return { results, errors, totalProcessed: processed };
};
