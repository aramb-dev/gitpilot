import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { GitHubIssueResponse, IssueRepository } from '@/types/issue';
import {
  buildIssueQueryParams,
  fetchMultiRepoIssues,
  fetchRepoIssues,
  normalizeIssue,
  parseLinkHeader,
} from './issues';

const mockRepoInfo: IssueRepository = {
  id: 1,
  name: 'test-repo',
  fullName: 'owner/test-repo',
  owner: 'owner',
  private: false,
};

const mockGitHubIssue: GitHubIssueResponse = {
  id: 123,
  node_id: 'I_123',
  number: 1,
  title: 'Test Issue',
  body: 'This is a test issue',
  state: 'open',
  locked: false,
  user: {
    id: 1,
    login: 'testuser',
    avatar_url: 'https://avatars.githubusercontent.com/u/1',
    html_url: 'https://github.com/testuser',
  },
  assignees: [
    {
      id: 2,
      login: 'assignee1',
      avatar_url: 'https://avatars.githubusercontent.com/u/2',
      html_url: 'https://github.com/assignee1',
    },
  ],
  labels: [
    {
      id: 10,
      name: 'bug',
      color: 'fc2929',
      description: 'Something is broken',
    },
  ],
  milestone: {
    id: 100,
    number: 1,
    title: 'v1.0',
    state: 'open',
    due_on: '2026-02-01T00:00:00Z',
  },
  comments: 5,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-05T00:00:00Z',
  closed_at: null,
  html_url: 'https://github.com/owner/test-repo/issues/1',
  url: 'https://api.github.com/repos/owner/test-repo/issues/1',
  repository_url: 'https://api.github.com/repos/owner/test-repo',
};

describe('normalizeIssue', () => {
  it('maps all fields correctly', () => {
    const result = normalizeIssue(mockGitHubIssue, mockRepoInfo);

    expect(result.id).toBe(123);
    expect(result.nodeId).toBe('I_123');
    expect(result.number).toBe(1);
    expect(result.title).toBe('Test Issue');
    expect(result.body).toBe('This is a test issue');
    expect(result.state).toBe('open');
    expect(result.locked).toBe(false);
  });

  it('maps user correctly', () => {
    const result = normalizeIssue(mockGitHubIssue, mockRepoInfo);

    expect(result.user.id).toBe(1);
    expect(result.user.login).toBe('testuser');
    expect(result.user.avatarUrl).toBe('https://avatars.githubusercontent.com/u/1');
    expect(result.user.htmlUrl).toBe('https://github.com/testuser');
  });

  it('maps assignees correctly', () => {
    const result = normalizeIssue(mockGitHubIssue, mockRepoInfo);

    expect(result.assignees).toHaveLength(1);
    expect(result.assignees[0].login).toBe('assignee1');
  });

  it('maps labels correctly', () => {
    const result = normalizeIssue(mockGitHubIssue, mockRepoInfo);

    expect(result.labels).toHaveLength(1);
    expect(result.labels[0].name).toBe('bug');
    expect(result.labels[0].color).toBe('fc2929');
  });

  it('maps milestone correctly', () => {
    const result = normalizeIssue(mockGitHubIssue, mockRepoInfo);

    expect(result.milestone).not.toBeNull();
    expect(result.milestone?.title).toBe('v1.0');
    expect(result.milestone?.dueOn).toBe('2026-02-01T00:00:00Z');
  });

  it('handles null milestone', () => {
    const issueWithoutMilestone = { ...mockGitHubIssue, milestone: null };
    const result = normalizeIssue(issueWithoutMilestone, mockRepoInfo);

    expect(result.milestone).toBeNull();
  });

  it('maps repository info', () => {
    const result = normalizeIssue(mockGitHubIssue, mockRepoInfo);

    expect(result.repository.fullName).toBe('owner/test-repo');
    expect(result.repository.owner).toBe('owner');
  });
});

describe('parseLinkHeader', () => {
  it('returns empty object for null header', () => {
    const result = parseLinkHeader(null);
    expect(result).toEqual({});
  });

  it('parses next page', () => {
    const header = '<https://api.github.com/repos/owner/repo/issues?page=2>; rel="next"';
    const result = parseLinkHeader(header);
    expect(result.next).toBe(2);
  });

  it('parses next and last pages', () => {
    const header =
      '<https://api.github.com/repos/owner/repo/issues?page=2>; rel="next", <https://api.github.com/repos/owner/repo/issues?page=5>; rel="last"';
    const result = parseLinkHeader(header);
    expect(result.next).toBe(2);
    expect(result.last).toBe(5);
  });

  it('handles complex URLs with multiple params', () => {
    const header =
      '<https://api.github.com/repos/owner/repo/issues?state=open&page=3&per_page=30>; rel="next"';
    const result = parseLinkHeader(header);
    expect(result.next).toBe(3);
  });
});

describe('buildIssueQueryParams', () => {
  it('includes page and per_page by default', () => {
    const result = buildIssueQueryParams({});
    expect(result).toContain('page=1');
    expect(result).toContain('per_page=30');
  });

  it('includes state filter', () => {
    const result = buildIssueQueryParams({ state: 'closed' });
    expect(result).toContain('state=closed');
  });

  it('includes state=all when specified', () => {
    const result = buildIssueQueryParams({ state: 'all' });
    expect(result).toContain('state=all');
  });

  it('includes labels as comma-separated', () => {
    const result = buildIssueQueryParams({ labels: ['bug', 'help wanted'] });
    expect(result).toContain('labels=bug%2Chelp+wanted');
  });

  it('includes assignee', () => {
    const result = buildIssueQueryParams({ assignee: 'testuser' });
    expect(result).toContain('assignee=testuser');
  });

  it('includes sort and direction', () => {
    const result = buildIssueQueryParams({ sort: 'updated', direction: 'asc' });
    expect(result).toContain('sort=updated');
    expect(result).toContain('direction=asc');
  });

  it('caps per_page at 100', () => {
    const result = buildIssueQueryParams({}, 1, 200);
    expect(result).toContain('per_page=100');
  });
});

describe('fetchRepoIssues', () => {
  beforeEach(() => {});

  it('fetches and normalizes issues', async () => {
    const mockFetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockGitHubIssue]),
        headers: new Headers(),
      }),
    ) as any;
    global.fetch = mockFetch as any;

    const result = await fetchRepoIssues('token', 'owner', 'repo');

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].title).toBe('Test Issue');
    expect(mockFetch).toHaveBeenCalled();
  });

  it('filters out pull requests', async () => {
    const prIssue = { ...mockGitHubIssue, pull_request: { url: 'https://...' } };
    const mockFetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockGitHubIssue, prIssue]),
        headers: new Headers(),
      }),
    ) as any;
    global.fetch = mockFetch as any;

    const result = await fetchRepoIssues('token', 'owner', 'repo');

    expect(result.issues).toHaveLength(1);
  });

  it('parses pagination from Link header', async () => {
    const headers = new Headers();
    headers.set('Link', '<https://api.github.com/repos/owner/repo/issues?page=2>; rel="next"');

    const mockFetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockGitHubIssue]),
        headers,
      }),
    ) as any;
    global.fetch = mockFetch as any;

    const result = await fetchRepoIssues('token', 'owner', 'repo');

    expect(result.hasNextPage).toBe(true);
    expect(result.nextPage).toBe(2);
  });

  it('throws on API error', async () => {
    const mockFetch = mock(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not Found' }),
      }),
    ) as any;
    global.fetch = mockFetch as any;

    await expect(fetchRepoIssues('token', 'owner', 'repo')).rejects.toThrow('Not Found');
  });
});

describe('fetchMultiRepoIssues', () => {
  beforeEach(() => {});

  it('returns empty array for no repos', async () => {
    const result = await fetchMultiRepoIssues('token', []);
    expect(result.issues).toHaveLength(0);
  });

  it('fetches from multiple repos', async () => {
    const issue1 = { ...mockGitHubIssue, id: 1, title: 'Issue 1' };
    const issue2 = { ...mockGitHubIssue, id: 2, title: 'Issue 2' };

    let callCount = 0;
    const mockFetch = mock(() => {
      callCount++;
      const issue = callCount === 1 ? issue1 : issue2;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([issue]),
        headers: new Headers(),
      });
    }) as any;
    global.fetch = mockFetch as any;

    const result = await fetchMultiRepoIssues('token', ['owner/repo1', 'owner/repo2']);

    expect(result.issues).toHaveLength(2);
  });

  it('handles repo fetch failures gracefully', async () => {
    let callCount = 0;
    const mockFetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockGitHubIssue]),
          headers: new Headers(),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not Found' }),
      });
    }) as any;
    global.fetch = mockFetch as any;

    const result = await fetchMultiRepoIssues('token', ['owner/repo1', 'owner/repo2']);

    expect(result.issues).toHaveLength(1);
  });

  it('applies search filter', async () => {
    const issue1 = { ...mockGitHubIssue, id: 1, title: 'Bug in login' };
    const issue2 = { ...mockGitHubIssue, id: 2, title: 'Feature request' };

    const mockFetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([issue1, issue2]),
        headers: new Headers(),
      }),
    ) as any;
    global.fetch = mockFetch as any;

    const result = await fetchMultiRepoIssues('token', ['owner/repo'], { search: 'bug' });

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].title).toBe('Bug in login');
  });
});
