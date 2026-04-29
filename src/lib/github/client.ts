/**
 * GitHub API client utilities.
 * Provides low-level functions for interacting with GitHub's REST API.
 */

import type { RateLimitInfo } from '@/types/api-errors';
import { getCached, setCache } from '@/db/cache';
import { logApiMetric } from '../metrics';

const GITHUB_API_VERSION = '2022-11-28';
const GITHUB_API_BASE = 'https://api.github.com';
const BACKOFF_BASE_MS = 1000;
const BACKOFF_JITTER_MS = 1000;
const MAX_BACKOFF_MS = 60000;

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
 * Checks if a response status is a retryable server error.
 * @param status - HTTP status code
 * @returns true if retryable
 */
export function isRetryableStatus(status: number): boolean {
  return status === 500 || status === 502 || status === 503 || status === 504;
}

function applyJitter(waitTimeMs: number): number {
  return waitTimeMs + Math.floor(Math.random() * BACKOFF_JITTER_MS);
}

function capWaitTime(waitTimeMs: number): { waitTimeMs: number; capped: boolean } {
  if (waitTimeMs > MAX_BACKOFF_MS) {
    return { waitTimeMs: MAX_BACKOFF_MS, capped: true };
  }

  return { waitTimeMs, capped: false };
}

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  if (input instanceof Request) {
    return input.url;
  }

  return 'unknown';
}

/**
 * Fetches a URL with intelligent backoff for rate limiting.
 * Respects X-RateLimit-Reset and Retry-After headers.
 * Uses exponential backoff for other retryable errors if configured.
 *
 * @param input - URL or Request object
 * @param init - Fetch options
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param userId - Optional user ID for metrics logging
 * @returns Response object
 */
export async function fetchWithBackoff(
  input: RequestInfo | URL,
  init?: RequestInit,
  maxRetries: number = 3,
  userId?: string,
): Promise<Response> {
  let attempt = 0;
  const requestUrl = getRequestUrl(input);

  while (attempt <= maxRetries) {
    const response = await fetch(input, init);

    if (isRateLimited(response)) {
      let waitTimeMs = BACKOFF_BASE_MS * 2 ** attempt;
      let backoffSource: 'exponential' | 'rate_limit_reset' | 'retry_after' = 'exponential';

      // Check X-RateLimit-Reset
      const rateLimitInfo = parseRateLimitHeaders(response);
      if (rateLimitInfo && rateLimitInfo.remaining === 0) {
        const secondsUntilReset = getSecondsUntilReset(rateLimitInfo.reset);
        waitTimeMs = (secondsUntilReset + 1) * 1000;
        backoffSource = 'rate_limit_reset';
      }

      // Check Retry-After (seconds)
      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (!Number.isNaN(seconds)) {
          waitTimeMs = (seconds + 1) * 1000;
          backoffSource = 'retry_after';
        }
      }

      if (backoffSource === 'exponential') {
        waitTimeMs = applyJitter(waitTimeMs);
      }

      const cappedWait = capWaitTime(waitTimeMs);

      // Log metric if userId is provided
      if (userId) {
        await logApiMetric(
          userId,
          requestUrl,
          response.status,
          attempt,
          cappedWait.waitTimeMs,
          'rate_limit',
        );
      }

      if (attempt >= maxRetries) {
        return response;
      }

      if (cappedWait.capped) {
      }

      await new Promise((resolve) => setTimeout(resolve, cappedWait.waitTimeMs));
      attempt++;
      continue;
    }

    if (isRetryableStatus(response.status)) {
      const waitTimeMs = applyJitter(BACKOFF_BASE_MS * 2 ** attempt);
      const cappedWait = capWaitTime(waitTimeMs);

      // Log metric if userId is provided
      if (userId) {
        await logApiMetric(
          userId,
          requestUrl,
          response.status,
          attempt,
          cappedWait.waitTimeMs,
          'server_error',
        );
      }

      if (attempt >= maxRetries) {
        return response;
      }

      if (cappedWait.capped) {
      }

      await new Promise((resolve) => setTimeout(resolve, cappedWait.waitTimeMs));
      attempt++;
      continue;
    }

    // Success - log if userId provided and it wasn't the first attempt (meaning we recovered)
    if (userId && attempt > 0) {
      await logApiMetric(userId, requestUrl, response.status, attempt, 0, 'success');
    }

    return response;
  }

  throw new Error('Unreachable code in fetchWithBackoff');
}

/**
 * Advanced fetch for GitHub that integrates with Database Caching and ETags.
 *
 * @param userId - For caching attribution
 * @param cacheKey - Unique key for this request
 * @param dataType - Type of data for cache metadata
 * @param url - GitHub API URL
 * @param accessToken - GitHub OAuth token
 * @param ttlMinutes - Cache duration
 * @returns Data and a flag indicating if it was from cache
 */
export async function fetchGitHub<T>(
  userId: string,
  cacheKey: string,
  dataType: any, // Using any here to avoid importing CacheDataType which might cause circular deps or is complex
  url: string,
  accessToken: string,
  ttlMinutes = 5,
): Promise<{ data: T; fromCache: boolean }> {
  const cached = await getCached<T>(userId, cacheKey);

  const headers = createGitHubHeaders(accessToken) as Record<string, string>;

  if (cached?.etag) {
    headers['If-None-Match'] = cached.etag;
  }

  const response = await fetchWithBackoff(url, { headers }, 3, userId);

  if (response.status === 304 && cached) {
    // Not modified, return cached data
    return { data: cached.data, fromCache: true };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  const etag = response.headers.get('ETag') || undefined;

  // Update cache
  await setCache(userId, cacheKey, dataType, data, {
    ttlMinutes,
    etag,
  });

  return { data, fromCache: false };
}

export { GITHUB_API_BASE, GITHUB_API_VERSION };
