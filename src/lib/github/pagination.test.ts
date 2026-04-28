import { afterEach, describe, expect, it, mock } from 'bun:test';
import { fetchAllPages, parseLinkHeader } from './pagination';

describe('parseLinkHeader', () => {
  it('returns empty object for null header', () => {
    expect(parseLinkHeader(null)).toEqual({});
  });

  it('returns empty object for empty string', () => {
    expect(parseLinkHeader('')).toEqual({});
  });

  it('parses single next link', () => {
    const header = '<https://api.github.com/user/repos?page=2>; rel="next"';
    expect(parseLinkHeader(header)).toEqual({
      next: 'https://api.github.com/user/repos?page=2',
    });
  });

  it('parses multiple links', () => {
    const header =
      '<https://api.github.com/user/repos?page=2>; rel="next", ' +
      '<https://api.github.com/user/repos?page=5>; rel="last", ' +
      '<https://api.github.com/user/repos?page=1>; rel="first"';

    expect(parseLinkHeader(header)).toEqual({
      next: 'https://api.github.com/user/repos?page=2',
      last: 'https://api.github.com/user/repos?page=5',
      first: 'https://api.github.com/user/repos?page=1',
    });
  });

  it('parses real GitHub Link header', () => {
    const header =
      '<https://api.github.com/user/repos?per_page=100&page=2>; rel="next", ' +
      '<https://api.github.com/user/repos?per_page=100&page=3>; rel="last"';

    const result = parseLinkHeader(header);

    expect(result.next).toBe('https://api.github.com/user/repos?per_page=100&page=2');
    expect(result.last).toBe('https://api.github.com/user/repos?per_page=100&page=3');
  });

  it('handles prev link', () => {
    const header =
      '<https://api.github.com/user/repos?page=1>; rel="prev", ' +
      '<https://api.github.com/user/repos?page=3>; rel="next"';

    expect(parseLinkHeader(header)).toEqual({
      prev: 'https://api.github.com/user/repos?page=1',
      next: 'https://api.github.com/user/repos?page=3',
    });
  });

  it('ignores unknown rel types', () => {
    const header = '<https://example.com>; rel="unknown"';
    expect(parseLinkHeader(header)).toEqual({});
  });

  it('handles malformed header gracefully', () => {
    const header = 'not a valid link header';
    expect(parseLinkHeader(header)).toEqual({});
  });
});

describe('fetchAllPages', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches single page when no Link header', async () => {
    const mockData = [{ id: 1 }, { id: 2 }];

    global.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    ) as any;

    const result = await fetchAllPages<{ id: number }>('https://api.github.com/test', {
      Authorization: 'Bearer token',
    });

    expect(result.data).toEqual(mockData);
    expect(result.pagesFetched).toBe(1);
    expect(result.hasMore).toBe(false);
  });

  it('fetches multiple pages following Link headers', async () => {
    const page1 = [{ id: 1 }, { id: 2 }];
    const page2 = [{ id: 3 }, { id: 4 }];
    let callCount = 0;

    global.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(
          new Response(JSON.stringify(page1), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              Link: '<https://api.github.com/test?page=2>; rel="next"',
            },
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify(page2), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }) as any;

    const result = await fetchAllPages<{ id: number }>('https://api.github.com/test', {
      Authorization: 'Bearer token',
    });

    expect(result.data).toEqual([...page1, ...page2]);
    expect(result.pagesFetched).toBe(2);
    expect(result.hasMore).toBe(false);
  });

  it('respects maxPages limit', async () => {
    const mockData = [{ id: 1 }];

    global.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            Link: '<https://api.github.com/test?page=999>; rel="next"',
          },
        }),
      ),
    ) as any;

    const result = await fetchAllPages<{ id: number }>(
      'https://api.github.com/test',
      { Authorization: 'Bearer token' },
      { maxPages: 2 },
    );

    expect(result.pagesFetched).toBe(2);
    expect(result.hasMore).toBe(true);
  });

  it('calls onPage callback for each page', async () => {
    const page1 = [{ id: 1 }, { id: 2 }];
    const page2 = [{ id: 3 }];
    let callCount = 0;
    const pageCallbacks: Array<{ page: number; count: number }> = [];

    global.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(
          new Response(JSON.stringify(page1), {
            status: 200,
            headers: {
              Link: '<https://api.github.com/test?page=2>; rel="next"',
            },
          }),
        );
      }
      return Promise.resolve(new Response(JSON.stringify(page2), { status: 200 }));
    }) as any;

    await fetchAllPages<{ id: number }>(
      'https://api.github.com/test',
      { Authorization: 'Bearer token' },
      {
        onPage: (page, count) => {
          pageCallbacks.push({ page, count });
        },
      },
    );

    expect(pageCallbacks).toEqual([
      { page: 1, count: 2 },
      { page: 2, count: 1 },
    ]);
  });

  it('stops on rate limit and returns partial data', async () => {
    const page1 = [{ id: 1 }];
    let callCount = 0;

    global.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(
          new Response(JSON.stringify(page1), {
            status: 200,
            headers: {
              Link: '<https://api.github.com/test?page=2>; rel="next"',
            },
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Rate limit exceeded' }), {
          status: 403,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Limit': '5000',
            'X-RateLimit-Reset': '1704067200',
          },
        }),
      );
    }) as any;

    const result = await fetchAllPages<{ id: number }>('https://api.github.com/test', {
      Authorization: 'Bearer token',
    });

    expect(result.data).toEqual(page1);
    expect(result.pagesFetched).toBe(1);
    expect(result.rateLimited).toBe(true);
  });

  it('throws on non-rate-limit errors', async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: 'Not Found' }), {
          status: 404,
        }),
      ),
    ) as any;

    await expect(
      fetchAllPages('https://api.github.com/test', { Authorization: 'Bearer token' }),
    ).rejects.toThrow('GitHub API error: 404');
  });
});
