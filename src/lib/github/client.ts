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
  if (response.status === 429) {
    return true;
  }
  
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

/**
 * Fetches a URL with intelligent backoff for rate limiting.
 * Respects X-RateLimit-Reset and Retry-After headers.
 * Uses exponential backoff for other retryable errors if configured.
 * 
 * @param input - URL or Request object
 * @param init - Fetch options
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns Response object
 */
export async function fetchWithBackoff(
  input: RequestInfo | URL,
  init?: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    const response = await fetch(input, init);
    
    if (isRateLimited(response)) {
      if (attempt >= maxRetries) {
        return response;
      }

      let waitTimeMs = 1000 * Math.pow(2, attempt); // Default exponential backoff

      // Check X-RateLimit-Reset
      const rateLimitInfo = parseRateLimitHeaders(response);
      if (rateLimitInfo && rateLimitInfo.remaining === 0) {
        const secondsUntilReset = getSecondsUntilReset(rateLimitInfo.reset);
        waitTimeMs = (secondsUntilReset + 1) * 1000;
      }

      // Check Retry-After (seconds)
      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
          waitTimeMs = (seconds + 1) * 1000;
        }
      }

      // Cap wait time to avoid hanging too long (e.g., 60 seconds) unless it's a primary rate limit reset?
      // For now, log the wait
      console.warn(`Rate limited. Waiting ${Math.round(waitTimeMs / 1000)}s before retry ${attempt + 1}/${maxRetries}`);
      
      await new Promise(resolve => setTimeout(resolve, waitTimeMs));
      attempt++;
      continue;
    }

    return response;
  }

  throw new Error('Unreachable code in fetchWithBackoff');
}

export { GITHUB_API_BASE, GITHUB_API_VERSION };
