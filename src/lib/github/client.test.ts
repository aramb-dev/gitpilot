import { describe, expect, it } from 'bun:test';
import {
  createGitHubHeaders,
  parseRateLimitHeaders,
  isRateLimited,
  getSecondsUntilReset,
} from './client';

describe('createGitHubHeaders', () => {
  it('creates headers with Bearer token', () => {
    const headers = createGitHubHeaders('test-token');
    
    expect(headers).toEqual({
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer test-token',
      'X-GitHub-Api-Version': '2022-11-28',
    });
  });
});

describe('parseRateLimitHeaders', () => {
  it('parses rate limit headers correctly', () => {
    const response = new Response(null, {
      headers: {
        'X-RateLimit-Limit': '5000',
        'X-RateLimit-Remaining': '4999',
        'X-RateLimit-Reset': '1704067200',
      },
    });

    const result = parseRateLimitHeaders(response);

    expect(result).toEqual({
      limit: 5000,
      remaining: 4999,
      reset: 1704067200,
    });
  });

  it('returns null if headers are missing', () => {
    const response = new Response(null);

    const result = parseRateLimitHeaders(response);

    expect(result).toBeNull();
  });

  it('returns null if only some headers are present', () => {
    const response = new Response(null, {
      headers: {
        'X-RateLimit-Limit': '5000',
      },
    });

    const result = parseRateLimitHeaders(response);

    expect(result).toBeNull();
  });
});

describe('isRateLimited', () => {
  it('returns true for 403 with zero remaining', () => {
    const response = new Response(null, {
      status: 403,
      headers: {
        'X-RateLimit-Remaining': '0',
      },
    });

    expect(isRateLimited(response)).toBe(true);
  });

  it('returns false for 403 with remaining quota', () => {
    const response = new Response(null, {
      status: 403,
      headers: {
        'X-RateLimit-Remaining': '100',
      },
    });

    expect(isRateLimited(response)).toBe(false);
  });

  it('returns false for non-403 status', () => {
    const response = new Response(null, {
      status: 200,
      headers: {
        'X-RateLimit-Remaining': '0',
      },
    });

    expect(isRateLimited(response)).toBe(false);
  });

  it('returns false for 403 without rate limit header', () => {
    const response = new Response(null, {
      status: 403,
    });

    expect(isRateLimited(response)).toBe(false);
  });
});

describe('getSecondsUntilReset', () => {
  it('calculates seconds until reset', () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 3600;
    const seconds = getSecondsUntilReset(futureTimestamp);

    expect(seconds).toBeGreaterThan(3590);
    expect(seconds).toBeLessThanOrEqual(3600);
  });

  it('returns 0 for past timestamps', () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 100;
    const seconds = getSecondsUntilReset(pastTimestamp);

    expect(seconds).toBe(0);
  });
});
