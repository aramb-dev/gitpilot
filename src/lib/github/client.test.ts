import { describe, expect, it, mock, afterEach, beforeEach } from 'bun:test';
import {
  createGitHubHeaders,
  parseRateLimitHeaders,
  isRateLimited,
  getSecondsUntilReset,
  fetchWithBackoff,
  isRetryableStatus,
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

describe('isRetryableStatus', () => {
  it('returns true for retryable server errors', () => {
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(502)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(504)).toBe(true);
  });

  it('returns false for non-retryable statuses', () => {
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(404)).toBe(false);
    expect(isRetryableStatus(429)).toBe(false);
    expect(isRetryableStatus(501)).toBe(false);
  });
});

describe('fetchWithBackoff', () => {
  const originalFetch = global.fetch;
  const originalSetTimeout = global.setTimeout;
  const originalRandom = Math.random;
  const originalWarn = console.warn;
  const originalDateNow = Date.now;

  beforeEach(() => {
    console.warn = originalWarn;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.setTimeout = originalSetTimeout;
    Math.random = originalRandom;
    console.warn = originalWarn;
    Date.now = originalDateNow;
  });

  it('retries on retryable 5xx responses with jittered backoff', async () => {
    const fetchMock = mock()
      .mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 502 })))
      .mockImplementationOnce(() => Promise.resolve(new Response('ok', { status: 200 })));
    global.fetch = fetchMock as any;

    Math.random = () => 0.5;
    Math.random = () => 0.5;
    const timeoutMock = mock((callback: TimerHandler, ms?: number) => {
      if (typeof callback === 'function') {
        callback();
      }
      return 0 as any;
    });
    global.setTimeout = timeoutMock as any;

    const response = await fetchWithBackoff('https://example.com');

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(timeoutMock).toHaveBeenCalledTimes(1);
    expect(timeoutMock.mock.calls[0][1]).toBe(1500);
  });

  it('caps rate limit waits and logs the cap', async () => {
    const fixedNow = 1700000000000;
    Date.now = () => fixedNow;
    Math.random = () => 0;

    const resetTimestamp = Math.floor(fixedNow / 1000) + 120;
    const fetchMock = mock()
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(null, {
            status: 403,
            headers: {
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetTimestamp.toString(),
              'X-RateLimit-Limit': '5000',
            },
          })
        )
      )
      .mockImplementationOnce(() => Promise.resolve(new Response('ok', { status: 200 })));
    global.fetch = fetchMock as any;

    const warnMock = mock(() => {});
    console.warn = warnMock as any;

    Math.random = () => 0.5;
    const timeoutMock = mock((callback: TimerHandler, ms?: number) => {
      if (typeof callback === 'function') {
        callback();
      }
      return 0 as any;
    });
    global.setTimeout = timeoutMock as any;

    const response = await fetchWithBackoff('https://example.com');

    expect(response.status).toBe(200);
    expect(timeoutMock).toHaveBeenCalledTimes(1);
    expect(timeoutMock.mock.calls[0][1]).toBe(60000);
    expect(warnMock).toHaveBeenCalled();
  });
});
