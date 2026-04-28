import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { PATCH } from './route';

// Mock getServerSession
mock.module('next-auth', () => ({
  getServerSession: () => Promise.resolve({ accessToken: 'mock-token' }),
}));

describe('Repo Visibility API Route', () => {
  beforeEach(() => {
    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify({})))) as any;
  });

  it('should update visibility for multiple repos', async () => {
    global.fetch = mock((url: string, options: any) => {
      if (url.includes('/repos/user/repo1') && options.method === 'PATCH') {
        const body = JSON.parse(options.body);
        if (body.private === true) {
          return Promise.resolve(new Response(JSON.stringify({ name: 'repo1', private: true })));
        }
      }
      if (url.includes('/repos/org/repo2') && options.method === 'PATCH') {
        const body = JSON.parse(options.body);
        if (body.private === true) {
          return Promise.resolve(new Response(JSON.stringify({ name: 'repo2', private: true })));
        }
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 404 }));
    }) as any;

    const req = {
      json: async () => ({
        repos: [
          { owner: 'user', repo: 'repo1' },
          { owner: 'org', repo: 'repo2' },
        ],
        visibility: 'private',
      }),
    } as any;

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toHaveLength(2);
    expect(data.errors).toHaveLength(0);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should return 401 if unauthorized', async () => {
    mock.module('next-auth', () => ({
      getServerSession: () => Promise.resolve(null),
    }));

    const req = {
      json: async () => ({
        repos: [{ owner: 'user', repo: 'repo1' }],
        visibility: 'private',
      }),
    } as any;

    const response = await PATCH(req);
    expect(response.status).toBe(401);
  });

  it('should return 400 if visibility is invalid', async () => {
    // Reset mock to authorized
    mock.module('next-auth', () => ({
      getServerSession: () => Promise.resolve({ accessToken: 'mock-token' }),
    }));

    const req = {
      json: async () => ({
        repos: [{ owner: 'user', repo: 'repo1' }],
        visibility: 'invalid-value',
      }),
    } as any;

    const response = await PATCH(req);
    expect(response.status).toBe(400);
  });

  it('should handle partial failures', async () => {
    global.fetch = mock((url: string) => {
      if (url.includes('repo1')) {
        return Promise.resolve(new Response(JSON.stringify({ name: 'repo1', private: true })));
      }
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 }),
      );
    }) as any;

    const req = {
      json: async () => ({
        repos: [
          { owner: 'user', repo: 'repo1' },
          { owner: 'user', repo: 'fail-repo' },
        ],
        visibility: 'private',
      }),
    } as any;

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toHaveLength(1);
    expect(data.errors).toHaveLength(1);
    expect(data.errors[0].repo).toContain('fail-repo');
  });

  it('should handle network errors', async () => {
    global.fetch = mock(() => Promise.reject(new Error('Network Error'))) as any;
    const req = {
      json: async () => ({
        repos: [{ owner: 'user', repo: 'net-fail' }],
        visibility: 'public',
      }),
    } as any;

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200); // It still returns 200 with errors list
    expect(data.errors).toHaveLength(1);
    expect(data.errors[0].error).toBe('Network Error');
  });

  it('should return 400 if validation fails (empty repos)', async () => {
    const req = {
      json: async () => ({
        repos: [], // Empty
        visibility: 'private',
      }),
    } as any;

    const response = await PATCH(req);
    expect(response.status).toBe(400);
  });
});
