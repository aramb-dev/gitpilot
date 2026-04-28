import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { GET } from './route';

const mockSession = {
  accessToken: 'test-token',
  user: { id: '1', name: 'Test User' },
};

const mockIssue = {
  id: 123,
  nodeId: 'I_123',
  number: 1,
  title: 'Test Issue',
  body: 'Test body',
  state: 'open',
  locked: false,
  user: { id: 1, login: 'testuser', avatarUrl: '', htmlUrl: '' },
  assignees: [],
  labels: [],
  milestone: null,
  repository: { id: 1, name: 'repo', fullName: 'owner/repo', owner: 'owner', private: false },
  comments: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  closedAt: null,
  htmlUrl: 'https://github.com/owner/repo/issues/1',
  apiUrl: 'https://api.github.com/repos/owner/repo/issues/1',
};

mock.module('@/lib/auth', () => ({
  getAuthSession: mock(() => Promise.resolve(mockSession)),
}));

mock.module('@/lib/github/issues', () => ({
  fetchMultiRepoIssues: mock(() =>
    Promise.resolve({
      issues: [mockIssue],
      totalCount: 1,
      hasNextPage: false,
    }),
  ),
}));

describe('Issues API Route', () => {
  beforeEach(() => {});

  it('should return issues for specified repos', async () => {
    mock.module('@/lib/auth', () => ({
      getAuthSession: mock(() => Promise.resolve(mockSession)),
    }));

    mock.module('@/lib/github/issues', () => ({
      fetchMultiRepoIssues: mock(() =>
        Promise.resolve({
          issues: [mockIssue],
          totalCount: 1,
          hasNextPage: false,
        }),
      ),
    }));

    const request = new Request('http://localhost:3000/api/github/issues?repos=owner/repo');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.issues).toHaveLength(1);
    expect(data.data.issues[0].title).toBe('Test Issue');
  });

  it('should return 401 when no session exists', async () => {
    mock.module('@/lib/auth', () => ({
      getAuthSession: mock(() => Promise.resolve(null)),
    }));

    const request = new Request('http://localhost:3000/api/github/issues?repos=owner/repo');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return 400 when no repos specified', async () => {
    mock.module('@/lib/auth', () => ({
      getAuthSession: mock(() => Promise.resolve(mockSession)),
    }));

    const request = new Request('http://localhost:3000/api/github/issues');
    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('should parse filter parameters', async () => {
    let capturedFilters: Record<string, unknown> = {};

    mock.module('@/lib/auth', () => ({
      getAuthSession: mock(() => Promise.resolve(mockSession)),
    }));

    mock.module('@/lib/github/issues', () => ({
      fetchMultiRepoIssues: mock(
        (_token: string, _repos: string[], filters: Record<string, unknown>) => {
          capturedFilters = filters;
          return Promise.resolve({
            issues: [],
            totalCount: 0,
            hasNextPage: false,
          });
        },
      ),
    }));

    const request = new Request(
      'http://localhost:3000/api/github/issues?repos=owner/repo&state=closed&labels=bug,help&assignee=user1&sort=updated&direction=asc',
    );
    await GET(request);

    expect(capturedFilters.state).toBe('closed');
    expect(capturedFilters.labels).toEqual(['bug', 'help']);
    expect(capturedFilters.assignee).toBe('user1');
    expect(capturedFilters.sort).toBe('updated');
    expect(capturedFilters.direction).toBe('asc');
  });

  it('should return 502 on fetch error', async () => {
    mock.module('@/lib/auth', () => ({
      getAuthSession: mock(() => Promise.resolve(mockSession)),
    }));

    mock.module('@/lib/github/issues', () => ({
      fetchMultiRepoIssues: mock(() => Promise.reject(new Error('Network error'))),
    }));

    const request = new Request('http://localhost:3000/api/github/issues?repos=owner/repo');
    const response = await GET(request);

    expect(response.status).toBe(502);
  });
});
