import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { DELETE, GET } from './route';

// Helper to create a complete mock GitHub repo
const createMockGitHubRepo = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: 'test-repo',
  full_name: 'user/test-repo',
  owner: { login: 'user', id: 1, type: 'User', avatar_url: '' },
  private: false,
  html_url: 'https://github.com/user/test-repo',
  description: null,
  fork: false,
  url: 'https://api.github.com/repos/user/test-repo',
  archive_url: '',
  archived: false,
  disabled: false,
  visibility: 'public',
  pushed_at: '2023-01-01T00:00:00Z',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  clone_url: 'https://github.com/user/test-repo.git',
  ssh_url: '',
  language: null,
  forks_count: 0,
  stargazers_count: 0,
  watchers_count: 0,
  open_issues_count: 0,
  default_branch: 'main',
  has_issues: true,
  has_projects: true,
  has_wiki: true,
  has_pages: false,
  has_downloads: true,
  is_template: false,
  license: null,
  size: 0,
  permissions: { admin: true, push: true, pull: true },
  ...overrides,
});

// Mock getServerSession
mock.module('next-auth', () => ({
  getServerSession: () => Promise.resolve({ accessToken: 'mock-token' }),
}));

describe('Repositories API Route', () => {
  beforeEach(() => {
    mock.module('next-auth', () => ({
      getServerSession: () => Promise.resolve({ accessToken: 'mock-token' }),
    }));
    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify([])))) as any;
  });

  describe('GET', () => {
    it('should fetch repos for user and multiple orgs', async () => {
      global.fetch = mock((url: string) => {
        if (url.includes('/user/repos')) {
          return Promise.resolve(
            new Response(
              JSON.stringify([
                createMockGitHubRepo({
                  id: 1,
                  name: 'user-repo',
                  full_name: 'user/user-repo',
                  updated_at: '2023-01-01T00:00:00Z',
                }),
              ]),
            ),
          );
        }
        if (url.includes('/orgs/org1/repos')) {
          return Promise.resolve(
            new Response(
              JSON.stringify([
                createMockGitHubRepo({
                  id: 2,
                  name: 'org1-repo',
                  full_name: 'org1/org1-repo',
                  owner: { login: 'org1', id: 2, type: 'Organization', avatar_url: '' },
                  private: true,
                  updated_at: '2023-01-02T00:00:00Z',
                }),
              ]),
            ),
          );
        }
        return Promise.resolve(new Response(JSON.stringify([])));
      }) as any;

      const req = { url: 'http://localhost/api/github/repos?orgs=org1' } as any;
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toHaveLength(2);
      // Sorted by updated_at desc, so org1-repo (Jan 2) should be first
      expect(json.data[0].name).toBe('org1-repo');
      expect(json.data[1].name).toBe('user-repo');
    });

    it('should handle empty orgs list', async () => {
      global.fetch = mock((url: string) => {
        if (url.includes('/user/repos')) {
          return Promise.resolve(
            new Response(
              JSON.stringify([
                createMockGitHubRepo({ id: 1, name: 'user-repo', full_name: 'user/user-repo' }),
              ]),
            ),
          );
        }
        return Promise.resolve(new Response(JSON.stringify([])));
      }) as any;

      const req = { url: 'http://localhost/api/github/repos' } as any;
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].name).toBe('user-repo');
    });

    it('should return 401 if unauthorized', async () => {
      mock.module('next-auth', () => ({
        getServerSession: () => Promise.resolve(null),
      }));

      const req = { url: 'http://localhost/api/github/repos' } as any;
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('should include error in warnings when personal repos fetch fails', async () => {
      global.fetch = mock(() => Promise.reject(new Error('Network error'))) as any;
      const req = { url: 'http://localhost/api/github/repos' } as any;
      const response = await GET(req);
      const json = await response.json();

      // Partial failure returns 200 with warnings
      expect(response.status).toBe(200);
      expect(json.data).toEqual([]);
      expect(json.warnings).toBeDefined();
      expect(json.warnings.some((w: string) => w.includes('personal'))).toBe(true);
    });

    it('should handle pagination with Link headers', async () => {
      const page1 = [createMockGitHubRepo({ id: 1, name: 'repo1' })];
      const page2 = [createMockGitHubRepo({ id: 2, name: 'repo2' })];
      let callCount = 0;

      global.fetch = mock((url: string) => {
        if (url.includes('/user/repos')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve(
              new Response(JSON.stringify(page1), {
                status: 200,
                headers: { Link: '<https://api.github.com/user/repos?page=2>; rel="next"' },
              }),
            );
          }
          return Promise.resolve(new Response(JSON.stringify(page2), { status: 200 }));
        }
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      }) as any;

      const req = { url: 'http://localhost/api/github/repos' } as any;
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toHaveLength(2);
    });

    it('should include warnings for partial org failures', async () => {
      global.fetch = mock((url: string) => {
        if (url.includes('/user/repos')) {
          return Promise.resolve(
            new Response(JSON.stringify([createMockGitHubRepo({ id: 1, name: 'user-repo' })])),
          );
        }
        if (url.includes('/orgs/failing-org')) {
          return Promise.resolve(
            new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 }),
          );
        }
        return Promise.resolve(new Response(JSON.stringify([])));
      }) as any;

      const req = { url: 'http://localhost/api/github/repos?orgs=failing-org' } as any;
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toHaveLength(1);
      expect(json.warnings).toBeDefined();
      expect(json.warnings.some((w: string) => w.includes('failing-org'))).toBe(true);
    });

    it('should handle rate limiting gracefully', async () => {
      let callCount = 0;
      global.fetch = mock((url: string) => {
        if (url.includes('/user/repos')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve(
              new Response(JSON.stringify([createMockGitHubRepo({ id: 1, name: 'repo1' })]), {
                status: 200,
                headers: { Link: '<https://api.github.com/user/repos?page=2>; rel="next"' },
              }),
            );
          }
          // Second page hits rate limit
          return Promise.resolve(
            new Response(JSON.stringify({ message: 'Rate limit exceeded' }), {
              status: 403,
              headers: {
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Limit': '5000',
                'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) - 1),
              },
            }),
          );
        }
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      }) as any;

      const req = { url: 'http://localhost/api/github/repos' } as any;
      const response = await GET(req);
      const json = await response.json();

      // Should return partial data with warning
      expect(response.status).toBe(200);
      expect(json.data).toHaveLength(1);
      expect(json.warnings).toBeDefined();
    });
  });

  describe('DELETE', () => {
    it('should delete multiple repos', async () => {
      global.fetch = mock((_url: string, options: any) => {
        if (options.method === 'DELETE') {
          return Promise.resolve(new Response(null, { status: 204 }));
        }
        return Promise.resolve(new Response(null, { status: 404 }));
      }) as any;

      const req = {
        json: async () => ({
          repos: [
            { owner: 'user', repo: 'repo1' },
            { owner: 'user', repo: 'repo2' },
          ],
        }),
      } as any;

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toHaveLength(2);
      expect(data.errors).toHaveLength(0);
    });

    it('should handle partial failures in deletion', async () => {
      global.fetch = mock((url: string) => {
        if (url.includes('repo1')) {
          return Promise.resolve(new Response(null, { status: 204 }));
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
        }),
      } as any;

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toHaveLength(1);
      expect(data.errors).toHaveLength(1);
    });

    it('should return 401 if unauthorized', async () => {
      mock.module('next-auth', () => ({
        getServerSession: () => Promise.resolve(null),
      }));

      const req = {
        json: async () => ({
          repos: [{ owner: 'user', repo: 'repo1' }],
        }),
      } as any;

      const response = await DELETE(req);
      expect(response.status).toBe(401);
    });

    it('should return 400 if validation fails (empty repos)', async () => {
      // Reset mock
      mock.module('next-auth', () => ({
        getServerSession: () => Promise.resolve({ accessToken: 'mock-token' }),
      }));

      const req = {
        json: async () => ({
          repos: [],
        }),
      } as any;

      const response = await DELETE(req);
      expect(response.status).toBe(400);
    });

    it('should handle network errors', async () => {
      global.fetch = mock(() => Promise.reject(new Error('Network Error'))) as any;

      const req = {
        json: async () => ({
          repos: [{ owner: 'user', repo: 'net-fail' }],
        }),
      } as any;

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.errors).toHaveLength(1);
      expect(data.errors[0].error).toBe('Network Error');
    });
  });
});
