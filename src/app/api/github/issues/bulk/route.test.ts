import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { POST } from './route';

const mockSession = {
  accessToken: 'test-token',
  user: { id: '1', name: 'Test User' },
};

mock.module('@/lib/auth', () => ({
  getAuthSession: mock(() => Promise.resolve(mockSession)),
}));

mock.module('@/lib/github/issue-operations', () => ({
  executeBulkAction: mock(() =>
    Promise.resolve({
      total: 2,
      succeeded: 2,
      failed: 0,
      results: [
        { issue: { owner: 'owner', repo: 'repo', number: 1 }, success: true },
        { issue: { owner: 'owner', repo: 'repo', number: 2 }, success: true },
      ],
    }),
  ),
}));

describe('Bulk Issues API Route', () => {
  beforeEach(() => {});

  it('should execute bulk close action', async () => {
    mock.module('@/lib/auth', () => ({
      getAuthSession: mock(() => Promise.resolve(mockSession)),
    }));

    mock.module('@/lib/github/issue-operations', () => ({
      executeBulkAction: mock(() =>
        Promise.resolve({
          total: 2,
          succeeded: 2,
          failed: 0,
          results: [],
        }),
      ),
    }));

    const request = new Request('http://localhost:3000/api/github/issues/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issues: [
          { owner: 'owner', repo: 'repo', number: 1 },
          { owner: 'owner', repo: 'repo', number: 2 },
        ],
        action: { type: 'close' },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.total).toBe(2);
    expect(data.data.succeeded).toBe(2);
  });

  it('should return 401 when no session exists', async () => {
    mock.module('@/lib/auth', () => ({
      getAuthSession: mock(() => Promise.resolve(null)),
    }));

    const request = new Request('http://localhost:3000/api/github/issues/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issues: [{ owner: 'owner', repo: 'repo', number: 1 }],
        action: { type: 'close' },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 when no issues specified', async () => {
    mock.module('@/lib/auth', () => ({
      getAuthSession: mock(() => Promise.resolve(mockSession)),
    }));

    const request = new Request('http://localhost:3000/api/github/issues/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issues: [],
        action: { type: 'close' },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid action', async () => {
    mock.module('@/lib/auth', () => ({
      getAuthSession: mock(() => Promise.resolve(mockSession)),
    }));

    const request = new Request('http://localhost:3000/api/github/issues/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issues: [{ owner: 'owner', repo: 'repo', number: 1 }],
        action: { type: 'invalid_action' },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 when exceeding 100 issues', async () => {
    mock.module('@/lib/auth', () => ({
      getAuthSession: mock(() => Promise.resolve(mockSession)),
    }));

    const issues = Array.from({ length: 101 }, (_, i) => ({
      owner: 'owner',
      repo: 'repo',
      number: i + 1,
    }));

    const request = new Request('http://localhost:3000/api/github/issues/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issues,
        action: { type: 'close' },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should validate label action has labels array', async () => {
    mock.module('@/lib/auth', () => ({
      getAuthSession: mock(() => Promise.resolve(mockSession)),
    }));

    const request = new Request('http://localhost:3000/api/github/issues/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issues: [{ owner: 'owner', repo: 'repo', number: 1 }],
        action: { type: 'add_labels' }, // Missing labels array
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
