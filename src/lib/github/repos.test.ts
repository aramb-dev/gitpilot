import { afterEach, describe, expect, it, mock } from 'bun:test';
import { fetchAllRepos, fetchOrgRepos, fetchUserRepos } from './repos';

describe('fetchUserRepos', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches user repos with correct URL and headers', async () => {
    const mockRepos = [
      { id: 1, name: 'repo1', full_name: 'user/repo1' },
      { id: 2, name: 'repo2', full_name: 'user/repo2' },
    ];

    let capturedUrl: string | undefined;
    let capturedHeaders: HeadersInit | undefined;

    global.fetch = mock((url: string, options: RequestInit) => {
      capturedUrl = url;
      capturedHeaders = options.headers;
      return Promise.resolve(new Response(JSON.stringify(mockRepos), { status: 200 }));
    }) as any;

    const result = await fetchUserRepos('test-token');

    expect(capturedUrl).toBe(
      'https://api.github.com/user/repos?affiliation=owner&per_page=100&sort=updated',
    );
    expect(capturedHeaders).toMatchObject({
      Authorization: 'Bearer test-token',
    });
    expect(result.data).toEqual(mockRepos as any);
    expect(result.pagesFetched).toBe(1);
  });

  it('handles pagination', async () => {
    const page1 = [{ id: 1, name: 'repo1' }];
    const page2 = [{ id: 2, name: 'repo2' }];
    let callCount = 0;

    global.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(
          new Response(JSON.stringify(page1), {
            status: 200,
            headers: {
              Link: '<https://api.github.com/user/repos?page=2>; rel="next"',
            },
          }),
        );
      }
      return Promise.resolve(new Response(JSON.stringify(page2), { status: 200 }));
    }) as any;

    const result = await fetchUserRepos('test-token');

    expect(result.data).toHaveLength(2);
    expect(result.pagesFetched).toBe(2);
  });

  it('calls onProgress callback', async () => {
    const mockRepos = [{ id: 1, name: 'repo1' }];
    const progressMessages: string[] = [];

    global.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockRepos), { status: 200 })),
    ) as any;

    await fetchUserRepos('test-token', {
      onProgress: (msg) => progressMessages.push(msg),
    });

    expect(progressMessages).toContain('Fetching personal repositories...');
  });
});

describe('fetchOrgRepos', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches org repos with correct URL', async () => {
    const mockRepos = [{ id: 1, name: 'org-repo' }];
    let capturedUrl: string | undefined;

    global.fetch = mock((url: string) => {
      capturedUrl = url;
      return Promise.resolve(new Response(JSON.stringify(mockRepos), { status: 200 }));
    }) as any;

    const result = await fetchOrgRepos('test-token', 'my-org');

    expect(capturedUrl).toBe('https://api.github.com/orgs/my-org/repos?per_page=100&sort=updated');
    expect('data' in result && result.data).toEqual(mockRepos as any);
  });

  it('encodes org name in URL', async () => {
    let capturedUrl: string | undefined;

    global.fetch = mock((url: string) => {
      capturedUrl = url;
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    }) as any;

    await fetchOrgRepos('test-token', 'org with spaces');

    expect(capturedUrl).toContain('org%20with%20spaces');
  });

  it('returns error for 404 response', async () => {
    global.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 })),
    ) as any;

    const result = await fetchOrgRepos('test-token', 'nonexistent-org');

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error.code).toBe('NOT_FOUND');
      expect(result.error.message).toContain('nonexistent-org');
    }
  });

  it('returns error for 403 response', async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: 'Forbidden' }), {
          status: 403,
          headers: { 'X-RateLimit-Remaining': '100' },
        }),
      ),
    ) as any;

    const result = await fetchOrgRepos('test-token', 'private-org');

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error.code).toBe('FORBIDDEN');
    }
  });
});

describe('fetchAllRepos', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches personal repos when no orgs specified', async () => {
    const mockRepos = [{ id: 1, name: 'personal-repo' }];

    global.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockRepos), { status: 200 })),
    ) as any;

    const result = await fetchAllRepos('test-token', []);

    expect(result.repos).toEqual(mockRepos as any);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('combines personal and org repos', async () => {
    const personalRepos = [{ id: 1, name: 'personal' }];
    const orgRepos = [{ id: 2, name: 'org-repo' }];
    let _callCount = 0;

    global.fetch = mock((url: string) => {
      _callCount++;
      if (url.includes('/user/repos')) {
        return Promise.resolve(new Response(JSON.stringify(personalRepos), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify(orgRepos), { status: 200 }));
    }) as any;

    const result = await fetchAllRepos('test-token', ['my-org']);

    expect(result.repos).toHaveLength(2);
    expect(result.repos).toContainEqual(personalRepos[0] as any);
    expect(result.repos).toContainEqual(orgRepos[0] as any);
  });

  it('continues on org fetch failure', async () => {
    const personalRepos = [{ id: 1, name: 'personal' }];
    const org2Repos = [{ id: 3, name: 'org2-repo' }];

    global.fetch = mock((url: string) => {
      if (url.includes('/user/repos')) {
        return Promise.resolve(new Response(JSON.stringify(personalRepos), { status: 200 }));
      }
      if (url.includes('/orgs/failing-org')) {
        return Promise.resolve(
          new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 }),
        );
      }
      return Promise.resolve(new Response(JSON.stringify(org2Repos), { status: 200 }));
    }) as any;

    const result = await fetchAllRepos('test-token', ['failing-org', 'working-org']);

    expect(result.repos).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].org).toBe('failing-org');
  });

  it('adds warning when pagination limit reached', async () => {
    const mockRepos = [{ id: 1, name: 'repo' }];

    global.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockRepos), {
          status: 200,
          headers: {
            Link: '<https://api.github.com/user/repos?page=999>; rel="next"',
          },
        }),
      ),
    ) as any;

    const result = await fetchAllRepos('test-token', [], { maxPages: 1 });

    expect(result.warnings.some((w) => w.includes('pagination'))).toBe(true);
  });

  it('handles multiple orgs in batches', async () => {
    const fetchCalls: string[] = [];

    global.fetch = mock((url: string) => {
      fetchCalls.push(url);
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    }) as any;

    await fetchAllRepos('test-token', ['org1', 'org2', 'org3', 'org4', 'org5', 'org6']);

    // Should have 1 personal + 6 org calls
    expect(fetchCalls).toHaveLength(7);
  });
});
