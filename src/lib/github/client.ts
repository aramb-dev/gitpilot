/**
 * GitHub API client utilities.
 * Provides low-level functions for interacting with GitHub's REST API.
 */

import type { RateLimitInfo } from '@/types/api-errors';

const GITHUB_API_VERSION = '2022-11-28';
const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Creates standard headers for GitHub API requests.
 * @param accessToken - OAuth access token
 * @returns Headers object for fetch requests
 */
export function createGitHubHeaders(accessToken: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${accessToken}`,
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
  };
}

/**
 * Parses rate limit information from GitHub API response headers.
 * @param response - Fetch Response object
 * @returns Rate limit info or null if headers are missing
 */
export function parseRateLimitHeaders(response: Response): RateLimitInfo | null {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  if (!limit || !remaining || !reset) {
    return null;
  }

  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset: parseInt(reset, 10),
  };
}

/**
 * Checks if a response indicates rate limiting.
 * @param response - Fetch Response object
 * @returns true if rate limited
 */
export function isRateLimited(response: Response): boolean {
  if (response.status !== 403) {
    return false;
  }

  const remaining = response.headers.get('X-RateLimit-Remaining');
  return remaining === '0';
}

/**
 * Calculates seconds until rate limit reset.
 * @param resetTimestamp - Unix timestamp of reset time
 * @returns Seconds until reset, minimum 0
 */
export function getSecondsUntilReset(resetTimestamp: number): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, resetTimestamp - now);
}

export { GITHUB_API_BASE, GITHUB_API_VERSION };
