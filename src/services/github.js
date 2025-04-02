/**
 * GitHub API Service for GitPilot
 * Handles all GitHub API interactions for repository management
 */

import axios from 'axios';
import { getGitHubToken } from './auth';
import { extractRateLimitInfo, formatGitHubError, batchProcess } from '../utils/helpers';
import { GITHUB_API, OPERATIONS } from '../utils/constants';

// Create GitHub API client with axios
const createGitHubClient = async () => {
  const token = await getGitHubToken();
  if (!token) {
    throw new Error('GitHub token not found. Please sign in again.');
  }

  return axios.create({
    baseURL: GITHUB_API.BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
};

/**
 * Fetch authenticated user's information from GitHub
 * @returns {Promise<Object>} GitHub user data
 */
export const fetchGitHubUser = async () => {
  try {
    const client = await createGitHubClient();
    const response = await client.get(GITHUB_API.ENDPOINTS.USER);
    return response.data;
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    throw formatGitHubError(error);
  }
};

/**
 * Fetch repositories for the authenticated user
 * @param {Object} options - Query options (type, sort, direction, per_page, page)
 * @returns {Promise<Object>} GitHub repositories data with pagination info
 */
export const fetchUserRepositories = async (options = {}) => {
  try {
    const client = await createGitHubClient();
    const params = {
      type: options.type || 'all',
      sort: options.sort || 'updated',
      direction: options.direction || 'desc',
      per_page: options.per_page || GITHUB_API.DEFAULT_PAGE_SIZE,
      page: options.page || 1,
    };

    const response = await client.get(GITHUB_API.ENDPOINTS.USER_REPOS, { params });

    // Extract pagination links and rate limit info
    const linkHeader = response.headers.link;
    const rateLimit = extractRateLimitInfo(response);

    // Parse pagination information
    const pagination = parseLinkHeader(linkHeader);

    return {
      repositories: response.data,
      pagination,
      rateLimit,
    };
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    throw formatGitHubError(error);
  }
};

/**
 * Fetch repositories for an organization
 * @param {string} org - Organization name
 * @param {Object} options - Query options
 * @returns {Promise<Object>} GitHub repositories data with pagination info
 */
export const fetchOrganizationRepositories = async (org, options = {}) => {
  try {
    const client = await createGitHubClient();
    const params = {
      type: options.type || 'all',
      sort: options.sort || 'updated',
      direction: options.direction || 'desc',
      per_page: options.per_page || GITHUB_API.DEFAULT_PAGE_SIZE,
      page: options.page || 1,
    };

    const response = await client.get(GITHUB_API.ENDPOINTS.ORG_REPOS(org), { params });

    const linkHeader = response.headers.link;
    const rateLimit = extractRateLimitInfo(response);
    const pagination = parseLinkHeader(linkHeader);

    return {
      repositories: response.data,
      pagination,
      rateLimit,
    };
  } catch (error) {
    console.error(`Error fetching ${org} repositories:`, error);
    throw formatGitHubError(error);
  }
};

/**
 * Fetch organizations for the authenticated user
 * @returns {Promise<Array>} GitHub organizations data
 */
export const fetchUserOrganizations = async () => {
  try {
    const client = await createGitHubClient();
    const response = await client.get(GITHUB_API.ENDPOINTS.USER_ORGS);
    return response.data;
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    throw formatGitHubError(error);
  }
};

/**
 * Change repository visibility (public/private)
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {boolean} isPrivate - Whether the repository should be private
 * @returns {Promise<Object>} Updated repository data
 */
export const changeRepositoryVisibility = async (owner, repo, isPrivate) => {
  try {
    const client = await createGitHubClient();
    const response = await client.patch(GITHUB_API.ENDPOINTS.REPO(owner, repo), {
      private: isPrivate,
    });
    return response.data;
  } catch (error) {
    console.error(`Error changing visibility for ${owner}/${repo}:`, error);
    throw formatGitHubError(error);
  }
};

/**
 * Delete a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteRepository = async (owner, repo) => {
  try {
    const client = await createGitHubClient();
    await client.delete(GITHUB_API.ENDPOINTS.REPO(owner, repo));
    return true;
  } catch (error) {
    console.error(`Error deleting ${owner}/${repo}:`, error);
    throw formatGitHubError(error);
  }
};

/**
 * Batch change visibility for multiple repositories
 * @param {Array} repositories - Array of repository objects
 * @param {boolean} makePrivate - Whether to make repositories private
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} Processing results
 */
export const batchChangeVisibility = async (repositories, makePrivate, onProgress = () => {}) => {
  return batchProcess(
    repositories,
    async (repo) => {
      return changeRepositoryVisibility(
        repo.owner.login,
        repo.name,
        makePrivate
      );
    },
    GITHUB_API.BATCH_SIZE.DEFAULT,
    onProgress
  );
};

/**
 * Batch delete multiple repositories
 * @param {Array} repositories - Array of repository objects
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} Processing results
 */
export const batchDeleteRepositories = async (repositories, onProgress = () => {}) => {
  return batchProcess(
    repositories,
    async (repo) => {
      return deleteRepository(repo.owner.login, repo.name);
    },
    GITHUB_API.BATCH_SIZE.DEFAULT,
    onProgress
  );
};

/**
 * Parse link header for pagination information
 * @param {string} linkHeader - Link header from GitHub API
 * @returns {Object} Pagination information
 */
const parseLinkHeader = (linkHeader) => {
  if (!linkHeader) {
    return { hasNextPage: false, hasPrevPage: false };
  }

  const links = {};
  const parts = linkHeader.split(',');

  for (const part of parts) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      const url = match[1];
      const rel = match[2];
      links[rel] = url;

      // Extract page number
      const pageMatch = url.match(/[&?]page=(\d+)/);
      if (pageMatch) {
        links[`${rel}Page`] = parseInt(pageMatch[1], 10);
      }
    }
  }

  return {
    nextPage: links.nextPage || null,
    prevPage: links.prevPage || null,
    firstPage: links.firstPage || 1,
    lastPage: links.lastPage || null,
    hasNextPage: !!links.next,
    hasPrevPage: !!links.prev,
  };
};

export default {
  fetchGitHubUser,
  fetchUserRepositories,
  fetchOrganizationRepositories,
  fetchUserOrganizations,
  changeRepositoryVisibility,
  deleteRepository,
  batchChangeVisibility,
  batchDeleteRepositories,
};
