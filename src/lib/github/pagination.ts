/**
 * GitHub API pagination utilities.
 * Handles Link header parsing and paginated fetching.
 */

import { isRateLimited, parseRateLimitHeaders, fetchWithBackoff } from './client';

export interface LinkHeaderUrls {
  next?: string;
  prev?: string;
  first?: string;
  last?: string;
}

export interface PaginatedFetchOptions {
  maxPages?: number;
  onPage?: (pageNumber: number, itemCount: number) => void;
}

export interface PaginatedFetchResult<T> {
  data: T[];
  pagesFetched: number;
  hasMore: boolean;
  rateLimited?: boolean;
}

/**
 * Parses GitHub's Link header into individual URLs.
 * @param linkHeader - The Link header value from a GitHub API response
 * @returns Object with URLs for next, prev, first, last (if present)
 * 
 * @example
 * // Input: '<https://api.github.com/user/repos?page=2>; rel="next", <https://api.github.com/user/repos?page=5>; rel="last"'
 * // Output: { next: 'https://api.github.com/user/repos?page=2', last: 'https://api.github.com/user/repos?page=5' }
 */
export function parseLinkHeader(linkHeader: string | null): LinkHeaderUrls {
  if (!linkHeader) {
    return {};
  }

  const result: LinkHeaderUrls = {};

  try {
    const links = linkHeader.split(',');

    for (const link of links) {
      const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
      if (match) {
        const [, url, rel] = match;
        if (rel === 'next' || rel === 'prev' || rel === 'first' || rel === 'last') {
          result[rel] = url;
        }
      }
    }
  } catch {
    console.warn('Failed to parse Link header:', linkHeader);
  }

  return result;
}

/**
 * Fetches all pages from a paginated GitHub API endpoint.
 * @param initialUrl - The starting URL (should include per_page parameter)
 * @param headers - Headers to include in requests
 * @param options - Pagination options
 * @returns Aggregated data from all pages
 */
export async function fetchAllPages<T>(
  initialUrl: string,
  headers: HeadersInit,
  options: PaginatedFetchOptions = {}
): Promise<PaginatedFetchResult<T>> {
  const { maxPages = 10, onPage } = options;
  
  const allData: T[] = [];
  let currentUrl: string | undefined = initialUrl;
  let pagesFetched = 0;
  let hasMore = false;
  let rateLimited = false;

  while (currentUrl && pagesFetched < maxPages) {
    const response = await fetchWithBackoff(currentUrl, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (isRateLimited(response)) {
        rateLimited = true;
        const rateLimitInfo = parseRateLimitHeaders(response);
        console.warn(
          `Rate limited during pagination. Reset at: ${rateLimitInfo?.reset}`
        );
        break;
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      allData.push(...data);
      pagesFetched++;

      if (onPage) {
        onPage(pagesFetched, data.length);
      }
    } else {
      break;
    }

    const linkHeader = response.headers.get('Link');
    const links = parseLinkHeader(linkHeader);
    
    if (links.next) {
      currentUrl = links.next;
      hasMore = true;
    } else {
      currentUrl = undefined;
      hasMore = false;
    }
  }

  if (currentUrl && pagesFetched >= maxPages) {
    hasMore = true;
  }

  return {
    data: allData,
    pagesFetched,
    hasMore,
    ...(rateLimited && { rateLimited }),
  };
}
