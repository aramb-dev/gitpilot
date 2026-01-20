/**
 * Tests for GitHub Pull Request utilities.
 * Tests cover normalization, fetching across repos, and bulk actions.
 */

import { describe, expect, it, mock, beforeEach } from 'bun:test';
import {
  normalizePullRequest,
  fetchPRsAcrossRepos,
  executePRAction,
} from './prs';
import type { GitHubPullRequest, GitHubUser, GitHubLabel, GitHubMilestone, GitHubSimpleRepository } from '@/types/github';

describe('normalizePullRequest', () => {
  const createMockGitHubUser = (overrides: Partial<GitHubUser> = {}): GitHubUser => ({
    id: 1,
    login: 'testuser',
    avatar_url: 'https://github.com/avatar.png',
    html_url: 'https://github.com/testuser',
    bio: null,
    type: 'User',
    ...overrides,
  });

  const createMockGitHubLabel = (overrides: Partial<GitHubLabel> = {}): GitHubLabel => ({
    id: 1,
    node_id: 'label_node_id',
    url: 'https://api.github.com/labels/bug',
    name: 'bug',
    color: 'd73a4a',
    default: false,
    description: 'Something is broken',
    ...overrides,
  });

  const createMockGitHubMilestone = (overrides: Partial<GitHubMilestone> = {}): GitHubMilestone => ({
    url: 'https://api.github.com/milestones/1',
    html_url: 'https://github.com/milestone/1',
    labels_url: 'https://api.github.com/milestones/1/labels',
    id: 1,
    node_id: 'milestone_node_id',
    number: 1,
    title: 'v1.0',
    description: 'First milestone',
    creator: createMockGitHubUser(),
    open_issues: 5,
    closed_issues: 10,
    state: 'open',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    due_on: '2024-02-01T00:00:00Z',
    closed_at: null,
    ...overrides,
  });

  const createMockGitHubSimpleRepo = (overrides: Partial<GitHubSimpleRepository> = {}): GitHubSimpleRepository => ({
    id: 123,
    node_id: 'repo_node_id',
    name: 'test-repo',
    full_name: 'testowner/test-repo',
    private: false,
    owner: createMockGitHubUser(),
    html_url: 'https://github.com/testowner/test-repo',
    description: 'Test repository',
    fork: false,
    url: 'https://api.github.com/repos/testowner/test-repo',
    ...overrides,
  });

  const createMockPullRequest = (overrides: Partial<GitHubPullRequest> = {}): GitHubPullRequest => {
    const mockUser = createMockGitHubUser();
    const mockRepo = createMockGitHubSimpleRepo();
    return {
      id: 456,
      node_id: 'pr_node_id',
      url: 'https://api.github.com/repos/testowner/test-repo/pulls/1',
      html_url: 'https://github.com/testowner/test-repo/pull/1',
      diff_url: 'https://github.com/testowner/test-repo/pull/1.diff',
      patch_url: 'https://github.com/testowner/test-repo/pull/1.patch',
      issue_url: 'https://api.github.com/repos/testowner/test-repo/issues/1',
      number: 1,
      state: 'open',
      locked: false,
      title: 'Test PR',
      user: mockUser,
      body: 'Test PR body',
      labels: [],
      milestone: null,
      active_lock_reason: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      closed_at: null,
      merged_at: null,
      merge_commit_sha: null,
      assignee: null,
      assignees: [],
      requested_reviewers: [],
      requested_teams: [],
      head: {
        label: 'testowner:feature-branch',
        ref: 'feature-branch',
        sha: 'abc123',
        user: mockUser,
        repo: mockRepo,
      },
      base: {
        label: 'testowner:main',
        ref: 'main',
        sha: 'def456',
        user: mockUser,
        repo: mockRepo,
      },
      _links: {
        self: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1' },
        html: { href: 'https://github.com/testowner/test-repo/pull/1' },
        issue: { href: 'https://api.github.com/repos/testowner/test-repo/issues/1' },
        comments: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1/comments' },
        review_comments: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1/comments' },
        review_comment: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1/comments' },
        commits: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1/commits' },
        statuses: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1/statuses' },
      },
      author_association: 'OWNER',
      auto_merge: null,
      draft: false,
      merged: false,
      mergeable: true,
      rebaseable: true,
      mergeable_state: 'clean',
      merged_by: null,
      comments: 5,
      review_comments: 3,
      maintainer_can_modify: true,
      commits: 2,
      additions: 100,
      deletions: 50,
      changed_files: 3,
      ...overrides,
    };
  };

  it('normalizes a basic pull request correctly', () => {
    const raw = createMockPullRequest();
    const result = normalizePullRequest(raw);

    expect(result.id).toBe(456);
    expect(result.nodeId).toBe('pr_node_id');
    expect(result.number).toBe(1);
    expect(result.title).toBe('Test PR');
    expect(result.body).toBe('Test PR body');
    expect(result.state).toBe('open');
    expect(result.merged).toBe(false);
    expect(result.draft).toBe(false);
    expect(result.locked).toBe(false);
  });

  it('normalizes user information correctly', () => {
    const raw = createMockPullRequest();
    const result = normalizePullRequest(raw);

    expect(result.user).toEqual({
      id: 1,
      login: 'testuser',
      avatarUrl: 'https://github.com/avatar.png',
      htmlUrl: 'https://github.com/testuser',
    });
  });

  it('normalizes assignees correctly', () => {
    const user1 = createMockGitHubUser({ id: 1, login: 'user1' });
    const user2 = createMockGitHubUser({ id: 2, login: 'user2' });
    const raw = createMockPullRequest({ assignees: [user1, user2] });
    const result = normalizePullRequest(raw);

    expect(result.assignees).toHaveLength(2);
    expect(result.assignees[0]).toEqual({
      id: 1,
      login: 'user1',
      avatarUrl: user1.avatar_url,
      htmlUrl: user1.html_url,
    });
    expect(result.assignees[1]).toEqual({
      id: 2,
      login: 'user2',
      avatarUrl: user2.avatar_url,
      htmlUrl: user2.html_url,
    });
  });

  it('normalizes requested reviewers correctly', () => {
    const reviewer1 = createMockGitHubUser({ id: 3, login: 'reviewer1' });
    const reviewer2 = createMockGitHubUser({ id: 4, login: 'reviewer2' });
    const raw = createMockPullRequest({ requested_reviewers: [reviewer1, reviewer2] });
    const result = normalizePullRequest(raw);

    expect(result.reviewers).toHaveLength(2);
    expect(result.reviewers[0]).toEqual({
      id: 3,
      login: 'reviewer1',
      avatarUrl: reviewer1.avatar_url,
      htmlUrl: reviewer1.html_url,
      state: 'PENDING',
    });
  });

  it('normalizes labels correctly', () => {
    const label1 = createMockGitHubLabel({ id: 1, name: 'bug', color: 'd73a4a', description: 'Bug' });
    const label2 = createMockGitHubLabel({ id: 2, name: 'enhancement', color: 'a2eeef', description: 'Enhancement' });
    const raw = createMockPullRequest({ labels: [label1, label2] });
    const result = normalizePullRequest(raw);

    expect(result.labels).toHaveLength(2);
    expect(result.labels[0]).toEqual({
      id: 1,
      name: 'bug',
      color: 'd73a4a',
      description: 'Bug',
    });
    expect(result.labels[1]).toEqual({
      id: 2,
      name: 'enhancement',
      color: 'a2eeef',
      description: 'Enhancement',
    });
  });

  it('normalizes milestone when present', () => {
    const milestone = createMockGitHubMilestone({
      id: 10,
      number: 2,
      title: 'v2.0',
      state: 'open',
      due_on: '2024-03-01T00:00:00Z',
    });
    const raw = createMockPullRequest({ milestone });
    const result = normalizePullRequest(raw);

    expect(result.milestone).toEqual({
      id: 10,
      number: 2,
      title: 'v2.0',
      state: 'open',
      dueOn: '2024-03-01T00:00:00Z',
    });
  });

  it('sets milestone to null when not present', () => {
    const raw = createMockPullRequest({ milestone: null });
    const result = normalizePullRequest(raw);

    expect(result.milestone).toBeNull();
  });

  it('normalizes repository from base repo', () => {
    const raw = createMockPullRequest();
    const result = normalizePullRequest(raw);

    expect(result.repository).toEqual({
      id: 123,
      name: 'test-repo',
      fullName: 'testowner/test-repo',
      owner: 'testuser',
      private: false,
    });
  });

  it('falls back to head repo when base repo is missing', () => {
    const raw = createMockPullRequest();
    // @ts-expect-error - Testing fallback behavior
    raw.base.repo = null;
    const result = normalizePullRequest(raw);

    expect(result.repository).toEqual({
      id: 123,
      name: 'test-repo',
      fullName: 'testowner/test-repo',
      owner: 'testuser',
      private: false,
    });
  });

  it('handles missing repository gracefully', () => {
    const raw = createMockPullRequest();
    // @ts-expect-error - Testing edge case
    raw.base.repo = null;
    // @ts-expect-error - Testing edge case
    raw.head.repo = null;
    const result = normalizePullRequest(raw);

    expect(result.repository).toEqual({
      id: 0,
      name: '',
      fullName: '',
      owner: '',
      private: false,
    });
  });

  it('normalizes statistics correctly', () => {
    const raw = createMockPullRequest({
      comments: 10,
      review_comments: 5,
      commits: 7,
      additions: 200,
      deletions: 100,
    });
    const result = normalizePullRequest(raw);

    expect(result.comments).toBe(10);
    expect(result.reviewComments).toBe(5);
    expect(result.commits).toBe(7);
    expect(result.additions).toBe(200);
    expect(result.deletions).toBe(100);
  });

  it('defaults statistics to zero when missing', () => {
    const raw = createMockPullRequest();
    delete (raw as any).comments;
    delete (raw as any).review_comments;
    delete (raw as any).commits;
    delete (raw as any).additions;
    delete (raw as any).deletions;

    const result = normalizePullRequest(raw);

    expect(result.comments).toBe(0);
    expect(result.reviewComments).toBe(0);
    expect(result.commits).toBe(0);
    expect(result.additions).toBe(0);
    expect(result.deletions).toBe(0);
  });

  it('normalizes timestamps correctly', () => {
    const raw = createMockPullRequest({
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      closed_at: '2024-01-20T00:00:00Z',
      merged_at: '2024-01-21T00:00:00Z',
    });
    const result = normalizePullRequest(raw);

    expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(result.updatedAt).toBe('2024-01-15T00:00:00Z');
    expect(result.closedAt).toBe('2024-01-20T00:00:00Z');
    expect(result.mergedAt).toBe('2024-01-21T00:00:00Z');
  });

  it('normalizes branch references correctly', () => {
    const raw = createMockPullRequest({
      head: { ...createMockPullRequest().head, ref: 'feature' },
      base: { ...createMockPullRequest().base, ref: 'main' },
    });
    const result = normalizePullRequest(raw);

    expect(result.headRef).toBe('feature');
    expect(result.baseRef).toBe('main');
  });

  it('normalizes URLs correctly', () => {
    const raw = createMockPullRequest({
      html_url: 'https://github.com/owner/repo/pull/42',
      url: 'https://api.github.com/repos/owner/repo/pulls/42',
    });
    const result = normalizePullRequest(raw);

    expect(result.htmlUrl).toBe('https://github.com/owner/repo/pull/42');
    expect(result.apiUrl).toBe('https://api.github.com/repos/owner/repo/pulls/42');
  });

  it('generates API URL when missing', () => {
    const raw = createMockPullRequest();
    delete (raw as any).url;
    const result = normalizePullRequest(raw);

    expect(result.apiUrl).toBe('https://api.github.com/repos/testuser/test-repo/pulls/1');
  });

  it('correctly identifies merged PRs when merged_at is present', () => {
    const raw = createMockPullRequest({
      state: 'closed',
      merged_at: '2024-01-21T00:00:00Z',
    });
    const result = normalizePullRequest(raw);

    expect(result.merged).toBe(true);
  });

  it('correctly identifies merged PRs when merged field is true', () => {
    const raw = createMockPullRequest({
      merged: true,
      merged_at: null,
    });
    const result = normalizePullRequest(raw);

    expect(result.merged).toBe(true);
  });

  it('correctly identifies draft PRs', () => {
    const raw = createMockPullRequest({ draft: true });
    const result = normalizePullRequest(raw);

    expect(result.draft).toBe(true);
  });

  it('correctly identifies locked PRs', () => {
    const raw = createMockPullRequest({ locked: true });
    const result = normalizePullRequest(raw);

    expect(result.locked).toBe(true);
  });

  it('handles null html_url in user', () => {
    const raw = createMockPullRequest();
    // @ts-expect-error - Testing edge case
    raw.user.html_url = null;
    const result = normalizePullRequest(raw);

    expect(result.user.htmlUrl).toBe('https://github.com/testuser');
  });
});

describe('fetchPRsAcrossRepos', () => {
  const createMockPullRequest = (overrides: Partial<GitHubPullRequest> = {}): GitHubPullRequest => ({
    id: 456,
    node_id: 'pr_node_id',
    url: 'https://api.github.com/repos/testowner/test-repo/pulls/1',
    html_url: 'https://github.com/testowner/test-repo/pull/1',
    diff_url: 'https://github.com/testowner/test-repo/pull/1.diff',
    patch_url: 'https://github.com/testowner/test-repo/pull/1.patch',
    issue_url: 'https://api.github.com/repos/testowner/test-repo/issues/1',
    number: 1,
    state: 'open',
    locked: false,
    title: 'Test PR',
    user: {
      id: 1,
      login: 'testuser',
      avatar_url: 'https://github.com/avatar.png',
      html_url: 'https://github.com/testuser',
      bio: null,
      type: 'User',
    },
    body: 'Test PR body',
    labels: [],
    milestone: null,
    active_lock_reason: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    closed_at: null,
    merged_at: null,
    merge_commit_sha: null,
    assignee: null,
    assignees: [],
    requested_reviewers: [],
    requested_teams: [],
    head: {
      label: 'testowner:feature-branch',
      ref: 'feature-branch',
      sha: 'abc123',
      user: {
        id: 1,
        login: 'testuser',
        avatar_url: 'https://github.com/avatar.png',
        html_url: 'https://github.com/testuser',
        bio: null,
        type: 'User',
      },
      repo: {
        id: 123,
        node_id: 'repo_node_id',
        name: 'test-repo',
        full_name: 'testowner/test-repo',
        private: false,
        owner: {
          id: 1,
          login: 'testuser',
          avatar_url: 'https://github.com/avatar.png',
          type: 'User',
          html_url: 'https://github.com/testuser',
        },
        html_url: 'https://github.com/testowner/test-repo',
        description: 'Test repo',
        fork: false,
        url: 'https://api.github.com/repos/testowner/test-repo',
      },
    },
    base: {
      label: 'testowner:main',
      ref: 'main',
      sha: 'def456',
      user: {
        id: 1,
        login: 'testuser',
        avatar_url: 'https://github.com/avatar.png',
        html_url: 'https://github.com/testuser',
        bio: null,
        type: 'User',
      },
      repo: {
        id: 123,
        node_id: 'repo_node_id',
        name: 'test-repo',
        full_name: 'testowner/test-repo',
        private: false,
        owner: {
          id: 1,
          login: 'testuser',
          avatar_url: 'https://github.com/avatar.png',
          type: 'User',
          html_url: 'https://github.com/testuser',
        },
        html_url: 'https://github.com/testowner/test-repo',
        description: 'Test repo',
        fork: false,
        url: 'https://api.github.com/repos/testowner/test-repo',
      },
    },
    _links: {
      self: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1' },
      html: { href: 'https://github.com/testowner/test-repo/pull/1' },
      issue: { href: 'https://api.github.com/repos/testowner/test-repo/issues/1' },
      comments: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1/comments' },
      review_comments: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1/comments' },
      review_comment: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1/comments' },
      commits: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1/commits' },
      statuses: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1/statuses' },
    },
    author_association: 'OWNER',
    auto_merge: null,
    draft: false,
    ...overrides,
  });

  beforeEach(() => {
    mock.restore();
  });

  it('fetches PRs from multiple repositories', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify([createMockPullRequest()]),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await fetchPRsAcrossRepos('test-token', { repos: ['owner/repo1', 'owner/repo2'] });

    expect(result.data.pullRequests).toHaveLength(2);
    expect(result.warnings).toHaveLength(0);
  });

  it('filters by merged state correctly', async () => {
    const mergedPR = createMockPullRequest({ number: 1, merged_at: '2024-01-20T00:00:00Z', state: 'closed' });
    const closedPR = createMockPullRequest({ number: 2, merged_at: null, state: 'closed' });

    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify([mergedPR, closedPR]),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await fetchPRsAcrossRepos('test-token', { repos: ['owner/repo1'], state: 'merged' });

    expect(result.data.pullRequests).toHaveLength(1);
    expect(result.data.pullRequests[0].merged).toBe(true);
  });

  it('filters by closed state correctly (excluding merged)', async () => {
    const mergedPR = createMockPullRequest({ number: 1, merged_at: '2024-01-20T00:00:00Z', state: 'closed' });
    const closedPR = createMockPullRequest({ number: 2, merged_at: null, state: 'closed' });

    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify([mergedPR, closedPR]),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await fetchPRsAcrossRepos('test-token', { repos: ['owner/repo1'], state: 'closed' });

    expect(result.data.pullRequests).toHaveLength(1);
    expect(result.data.pullRequests[0].merged).toBe(false);
    expect(result.data.pullRequests[0].state).toBe('closed');
  });

  it('sorts results by updated date descending by default', async () => {
    const pr1 = createMockPullRequest({ number: 1, updated_at: '2024-01-10T00:00:00Z' });
    const pr2 = createMockPullRequest({ number: 2, updated_at: '2024-01-20T00:00:00Z' });

    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify([pr1, pr2]),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await fetchPRsAcrossRepos('test-token', { repos: ['owner/repo1'], sort: 'updated', direction: 'desc' });

    expect(result.data.pullRequests[0].number).toBe(2);
    expect(result.data.pullRequests[1].number).toBe(1);
  });

  it('sorts results by created date when specified', async () => {
    const pr1 = createMockPullRequest({ number: 1, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-20T00:00:00Z' });
    const pr2 = createMockPullRequest({ number: 2, created_at: '2024-01-10T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' });

    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify([pr1, pr2]),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await fetchPRsAcrossRepos('test-token', { repos: ['owner/repo1'], sort: 'created', direction: 'asc' });

    expect(result.data.pullRequests[0].number).toBe(1);
    expect(result.data.pullRequests[1].number).toBe(2);
  });

  it('handles client-side pagination correctly', async () => {
    const prs = Array.from({ length: 50 }, (_, i) => createMockPullRequest({ number: i + 1 }));

    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify(prs),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await fetchPRsAcrossRepos('test-token', { repos: ['owner/repo1'], page: 2, perPage: 10 });

    expect(result.data.pullRequests).toHaveLength(10);
    expect(result.data.pullRequests[0].number).toBe(11);
    expect(result.data.totalCount).toBe(50);
    expect(result.data.hasNextPage).toBe(true);
  });

  it('returns warnings for failed repository fetches', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' }))
    ) as any;
    global.fetch = mockFetch;

    const result = await fetchPRsAcrossRepos('test-token', { repos: ['owner/nonexistent'] });

    expect(result.data.pullRequests).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('Failed to fetch PRs for owner/nonexistent');
  });

  it('handles errors gracefully and adds to warnings', async () => {
    const mockFetch = mock(() =>
      Promise.reject(new Error('Network error'))
    ) as any;
    global.fetch = mockFetch;

    const result = await fetchPRsAcrossRepos('test-token', { repos: ['owner/repo1'] });

    expect(result.data.pullRequests).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('Network error');
  });

  it('calculates hasNextPage correctly for last page', async () => {
    const prs = Array.from({ length: 25 }, (_, i) => createMockPullRequest({ number: i + 1 }));

    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify(prs),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await fetchPRsAcrossRepos('test-token', { repos: ['owner/repo1'], page: 1, perPage: 30 });

    expect(result.data.hasNextPage).toBe(false);
  });
});

describe('executePRAction', () => {
  beforeEach(() => {
    mock.restore();
  });

  it('executes merge action successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ merged: true }),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'merge',
      mergeMethod: 'squash',
      commitMessage: 'Merge PR',
    });

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalled();
  });

  it('returns error when merge fails', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ message: 'Merge conflict' }),
        { status: 405, statusText: 'Method Not Allowed' }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'merge',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('executes close action successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ state: 'closed' }),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'close',
    });

    expect(result.success).toBe(true);
  });

  it('executes reopen action successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ state: 'open' }),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'reopen',
    });

    expect(result.success).toBe(true);
  });

  it('executes add_labels action successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify([]),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'add_labels',
      labels: ['bug', 'priority'],
    });

    expect(result.success).toBe(true);
  });

  it('executes set_labels action successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify([]),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'set_labels',
      labels: ['enhancement'],
    });

    expect(result.success).toBe(true);
  });

  it('executes remove_labels action successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({}),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'remove_labels',
      labels: ['bug'],
    });

    expect(result.success).toBe(true);
  });

  it('ignores 404 errors when removing labels (label not present)', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(null, { status: 404 }))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'remove_labels',
      labels: ['nonexistent'],
    });

    expect(result.success).toBe(true);
  });

  it('returns error when remove_labels fails with non-404 status', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 403, statusText: 'Forbidden' }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'remove_labels',
      labels: ['bug'],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('executes assign action successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify([]),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'assign',
      assignees: ['user1', 'user2'],
    });

    expect(result.success).toBe(true);
  });

  it('executes unassign action successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify([]),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'unassign',
      assignees: ['user1'],
    });

    expect(result.success).toBe(true);
  });

  it('executes request_reviewers action successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify([]),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'request_reviewers',
      reviewers: ['reviewer1', 'reviewer2'],
    });

    expect(result.success).toBe(true);
  });

  it('executes remove_reviewers action successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify([]),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'remove_reviewers',
      reviewers: ['reviewer1'],
    });

    expect(result.success).toBe(true);
  });

  it('returns error for unsupported action type', async () => {
    const mockFetch = mock() as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'unsupported' as any,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unsupported action type');
  });

  it('handles network errors gracefully', async () => {
    const mockFetch = mock(() =>
      Promise.reject(new Error('Network error'))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'close',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
  });

  it('handles JSON parse errors gracefully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        'Invalid JSON',
        { status: 400, statusText: 'Bad Request' }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'merge',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('uses default merge method when not specified', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ merged: true }),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    await executePRAction('token', { owner: 'owner', repo: 'repo', number: 1 }, {
      type: 'merge',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.merge_method).toBe('merge');
  });
});
