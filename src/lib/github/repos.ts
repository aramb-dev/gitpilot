/**
 * GitHub repository fetching utilities.
 * Handles fetching repos from personal accounts and organizations.
 */

import type { ApiError } from '@/types/api-errors';
import type { GitHubRepository } from '@/types/github';
import { createGitHubHeaders, GITHUB_API_BASE } from './client';
import { fetchAllPages, type PaginatedFetchResult } from './pagination';

const MAX_CONCURRENT_ORG_FETCHES = 5;
const DEFAULT_MAX_PAGES = 10;

export interface FetchReposOptions {
  maxPages?: number;
  onProgress?: (message: string) => void;
  userId?: string;
}

export interface OrgFetchError {
  org: string;
  error: ApiError;
}

export interface FetchAllReposResult {
  repos: GitHubRepository[];
  errors: OrgFetchError[];
  warnings: string[];
}

/**
 * Fetches all repositories owned by the authenticated user.
 * @param accessToken - GitHub OAuth access token
 * @param options - Fetch options
 * @returns Paginated result with user's repositories
 */
export async function fetchUserRepos(
  accessToken: string,
  options: FetchReposOptions = {},
): Promise<PaginatedFetchResult<GitHubRepository>> {
  const { maxPages = DEFAULT_MAX_PAGES, onProgress } = options;
  const headers = createGitHubHeaders(accessToken);
  const url = `${GITHUB_API_BASE}/user/repos?affiliation=owner&per_page=100&sort=updated`;

  if (onProgress) {
    onProgress('Fetching personal repositories...');
  }

  return fetchAllPages<GitHubRepository>(url, headers, {
    maxPages,
    userId: options.userId,
    onPage: (page, count) => {
      if (onProgress) {
        onProgress(`Fetched page ${page} (${count} repos)`);
      }
    },
  });
}

/**
 * Fetches all repositories for a specific organization.
 * @param accessToken - GitHub OAuth access token
 * @param orgName - Organization login name
 * @param options - Fetch options
 * @returns Paginated result with org's repositories, or error
 */
export async function fetchOrgRepos(
  accessToken: string,
  orgName: string,
  options: FetchReposOptions = {},
): Promise<PaginatedFetchResult<GitHubRepository> | { error: ApiError }> {
  const { maxPages = DEFAULT_MAX_PAGES, onProgress } = options;
  const headers = createGitHubHeaders(accessToken);
  const url = `${GITHUB_API_BASE}/orgs/${encodeURIComponent(orgName)}/repos?per_page=100&sort=updated`;

  if (onProgress) {
    onProgress(`Fetching repositories for ${orgName}...`);
  }

  try {
    const result = await fetchAllPages<GitHubRepository>(url, headers, {
      maxPages,
      userId: options.userId,
      onPage: (page, count) => {
        if (onProgress) {
          onProgress(`${orgName}: Fetched page ${page} (${count} repos)`);
        }
      },
    });

    return result;
  } catch (err) {
    if (err instanceof Error && err.message.includes('GitHub API error: 404')) {
      return {
        error: {
          code: 'NOT_FOUND',
          message: `Organization '${orgName}' not found or access denied`,
        },
      };
    }

    if (err instanceof Error && err.message.includes('GitHub API error: 403')) {
      return {
        error: {
          code: 'FORBIDDEN',
          message: `Access denied to organization '${orgName}'`,
        },
      };
    }

    return {
      error: {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error fetching org repos',
      },
    };
  }
}

/**
 * Fetches all repositories from personal account and specified organizations.
 * Handles partial failures gracefully, returning available data with errors.
 * @param accessToken - GitHub OAuth access token
 * @param orgNames - Array of organization names to fetch
 * @param options - Fetch options
 * @returns Combined result with repos, errors, and warnings
 */
export async function fetchAllRepos(
  accessToken: string,
  orgNames: string[] = [],
  options: FetchReposOptions = {},
): Promise<FetchAllReposResult> {
  const { onProgress } = options;
  const allRepos: GitHubRepository[] = [];
  const errors: OrgFetchError[] = [];
  const warnings: string[] = [];

  // Fetch personal repos first
  try {
    const userResult = await fetchUserRepos(accessToken, options);
    allRepos.push(...userResult.data);

    if (userResult.hasMore) {
      warnings.push('Some personal repositories may not be shown due to pagination limits');
    }

    if (userResult.rateLimited) {
      warnings.push('Rate limited while fetching personal repositories');
    }
  } catch (err) {
    errors.push({
      org: 'personal',
      error: {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch personal repos',
      },
    });
  }

  // Fetch org repos in batches to avoid rate limit spikes
  if (orgNames.length > 0) {
    const batches: string[][] = [];
    for (let i = 0; i < orgNames.length; i += MAX_CONCURRENT_ORG_FETCHES) {
      batches.push(orgNames.slice(i, i + MAX_CONCURRENT_ORG_FETCHES));
    }

    for (const batch of batches) {
      if (onProgress) {
        onProgress(`Fetching repos for organizations: ${batch.join(', ')}`);
      }

      const results = await Promise.all(
        batch.map((org) => fetchOrgRepos(accessToken, org, options)),
      );

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const orgName = batch[i];

        if ('error' in result) {
          errors.push({ org: orgName, error: result.error });
        } else {
          allRepos.push(...result.data);

          if (result.hasMore) {
            warnings.push(
              `Some repositories from '${orgName}' may not be shown due to pagination limits`,
            );
          }

          if (result.rateLimited) {
            warnings.push(`Rate limited while fetching '${orgName}' repositories`);
          }
        }
      }
    }
  }

  return {
    repos: allRepos,
    errors,
    warnings,
  };
}

/**
 * Checks if a fetch result indicates a rate limit error.
 */
export function isOrgFetchError(
  result: PaginatedFetchResult<GitHubRepository> | { error: ApiError },
): result is { error: ApiError } {
  return 'error' in result;
}
