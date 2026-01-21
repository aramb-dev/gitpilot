/**
 * GitHub Issues fetching utilities.
 */

import { fetchWithBackoff, createGitHubHeaders } from './client';
import type {
  Issue,
  IssueFilters,
  GitHubIssueResponse,
  IssuesListResponse,
  IssueRepository,
} from '@/types/issue';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Normalizes a raw GitHub issue response to our Issue type.
 */
export function normalizeIssue(
  raw: GitHubIssueResponse,
  repoInfo: IssueRepository
): Issue {
  return {
    id: raw.id,
    nodeId: raw.node_id,
    number: raw.number,
    title: raw.title,
    body: raw.body,
    state: raw.state,
    locked: raw.locked,
    user: {
      id: raw.user.id,
      login: raw.user.login,
      avatarUrl: raw.user.avatar_url,
      htmlUrl: raw.user.html_url,
    },
    assignees: raw.assignees.map((a) => ({
      id: a.id,
      login: a.login,
      avatarUrl: a.avatar_url,
      htmlUrl: a.html_url,
    })),
    labels: raw.labels.map((l) => ({
      id: l.id,
      name: l.name,
      color: l.color,
      description: l.description,
    })),
    milestone: raw.milestone
      ? {
          id: raw.milestone.id,
          number: raw.milestone.number,
          title: raw.milestone.title,
          state: raw.milestone.state,
          dueOn: raw.milestone.due_on,
        }
      : null,
    repository: repoInfo,
    comments: raw.comments,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    closedAt: raw.closed_at,
    htmlUrl: raw.html_url,
    apiUrl: raw.url,
  };
}

/**
 * Parses the Link header to extract pagination info.
 */
export function parseLinkHeader(linkHeader: string | null): {
  next?: number;
  last?: number;
} {
  if (!linkHeader) return {};

  const result: { next?: number; last?: number } = {};
  const links = linkHeader.split(',');

  for (const link of links) {
    const match = link.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="(\w+)"/);
    if (match) {
      const page = parseInt(match[1], 10);
      const rel = match[2];
      if (rel === 'next') result.next = page;
      if (rel === 'last') result.last = page;
    }
  }

  return result;
}

/**
 * Builds query string for GitHub issues API.
 */
export function buildIssueQueryParams(
  filters: IssueFilters,
  page: number = 1,
  perPage: number = 30
): string {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('per_page', String(Math.min(perPage, 100)));

  if (filters.state) {
    params.set('state', filters.state);
  } else {
    params.set('state', 'open');
  }

  if (filters.labels && filters.labels.length > 0) {
    params.set('labels', filters.labels.join(','));
  }

  if (filters.assignee) {
    params.set('assignee', filters.assignee);
  }

  if (filters.creator) {
    params.set('creator', filters.creator);
  }

  if (filters.mentioned) {
    params.set('mentioned', filters.mentioned);
  }

  if (filters.since) {
    params.set('since', filters.since);
  }

  if (filters.sort) {
    params.set('sort', filters.sort);
  }

  if (filters.direction) {
    params.set('direction', filters.direction);
  }

  return params.toString();
}

/**
 * Fetches issues from a single repository.
 */
export async function fetchRepoIssues(
  accessToken: string,
  owner: string,
  repo: string,
  filters: IssueFilters = {},
  page: number = 1,
  perPage: number = 30,
  userId?: string
): Promise<IssuesListResponse> {
  const queryString = buildIssueQueryParams(filters, page, perPage);
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?${queryString}`;
  const headers = createGitHubHeaders(accessToken);

  const response = await fetchWithBackoff(url, {
    headers,
    cache: 'no-store',
  }, 3, userId);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Failed to fetch issues: ${response.status}`
    );
  }

  const rawIssues: GitHubIssueResponse[] = await response.json();
  const linkHeader = response.headers.get('Link');
  const pagination = parseLinkHeader(linkHeader);

  // Get repo info for normalization
  const repoInfo: IssueRepository = {
    id: 0, // Will be populated from first issue if available
    name: repo,
    fullName: `${owner}/${repo}`,
    owner: owner,
    private: false, // Unknown at this point
  };

  // Filter out pull requests (GitHub returns PRs in issues endpoint)
  const issuesOnly = rawIssues.filter(
    (issue) => !('pull_request' in issue)
  );

  const issues = issuesOnly.map((raw) => normalizeIssue(raw, repoInfo));

  return {
    issues,
    totalCount: issues.length,
    hasNextPage: !!pagination.next,
    nextPage: pagination.next,
  };
}

/**
 * Fetches issues from multiple repositories in parallel.
 */
export async function fetchMultiRepoIssues(
  accessToken: string,
  repos: string[],
  filters: IssueFilters = {},
  page: number = 1,
  perPage: number = 30,
  userId?: string
): Promise<IssuesListResponse> {
  if (repos.length === 0) {
    return { issues: [], totalCount: 0, hasNextPage: false };
  }

  const CONCURRENCY_LIMIT = 5;
  const allIssues: Issue[] = [];
  let hasMorePages = false;

  // If state is 'all', fetch both open and closed issues
  const statesToFetch = filters.state === 'all' ? ['open', 'closed'] : [filters.state || 'open'];

  for (const state of statesToFetch) {
    const filtersForState = { ...filters, state: state as 'open' | 'closed' };

    // Process repos in batches
    for (let i = 0; i < repos.length; i += CONCURRENCY_LIMIT) {
      const batch = repos.slice(i, i + CONCURRENCY_LIMIT);
      const promises = batch.map(async (repoFullName) => {
        const [owner, repo] = repoFullName.split('/');
        if (!owner || !repo) return null;

        try {
          return await fetchRepoIssues(
            accessToken,
            owner,
            repo,
            filtersForState,
            page,
            perPage,
            userId
          );
        } catch (error) {
          console.error(`Failed to fetch issues from ${repoFullName}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);

      for (const result of results) {
        if (result) {
          allIssues.push(...result.issues);
          if (result.hasNextPage) hasMorePages = true;
        }
      }
    }
  }

  // Sort combined results
  const sortField = filters.sort || 'created';
  const sortDirection = filters.direction || 'desc';

  allIssues.sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortField) {
      case 'updated':
        aVal = a.updatedAt;
        bVal = b.updatedAt;
        break;
      case 'comments':
        aVal = a.comments;
        bVal = b.comments;
        break;
      default:
        aVal = a.createdAt;
        bVal = b.createdAt;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'desc'
        ? bVal.localeCompare(aVal)
        : aVal.localeCompare(bVal);
    }

    return sortDirection === 'desc'
      ? (bVal as number) - (aVal as number)
      : (aVal as number) - (bVal as number);
  });

  // Apply search filter client-side if provided
  let filteredIssues = allIssues;
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredIssues = allIssues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchLower) ||
        (issue.body && issue.body.toLowerCase().includes(searchLower))
    );
  }

  // Paginate the filtered results
  const startIdx = (page - 1) * perPage;
  const endIdx = startIdx + perPage;
  const paginatedIssues = filteredIssues.slice(startIdx, endIdx);

  return {
    issues: paginatedIssues,
    totalCount: filteredIssues.length,
    hasNextPage: endIdx < filteredIssues.length,
    nextPage: endIdx < filteredIssues.length ? page + 1 : undefined,
  };
}

/**
 * Fetches a single issue by number.
 */
export async function fetchIssue(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number,
  userId?: string
): Promise<Issue> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`;
  const headers = createGitHubHeaders(accessToken);

  const response = await fetchWithBackoff(url, {
    headers,
    cache: 'no-store',
  }, 3, userId);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Failed to fetch issue: ${response.status}`
    );
  }

  const raw: GitHubIssueResponse = await response.json();

  const repoInfo: IssueRepository = {
    id: 0,
    name: repo,
    fullName: `${owner}/${repo}`,
    owner: owner,
    private: false,
  };

  return normalizeIssue(raw, repoInfo);
}
