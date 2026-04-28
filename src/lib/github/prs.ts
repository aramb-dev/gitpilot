/**
 * GitHub Pull Request utilities.
 * Handles fetching, normalization, and bulk operations.
 */

import type { GitHubPullRequest, GitHubUser } from '@/types/github';
import type {
  BulkPRAction,
  PRFilters,
  PRLabel,
  PRRepository,
  PRsListResponse,
  PRUser,
  PullRequest,
} from '@/types/pull-request';
import { createGitHubHeaders, fetchWithBackoff, GITHUB_API_BASE } from './client';

/**
 * Normalizes a raw GitHub PR response to the canonical domain model.
 */
export function normalizePullRequest(raw: GitHubPullRequest): PullRequest {
  const repo = raw.base.repo || raw.head.repo;

  const prRepository: PRRepository = {
    id: repo?.id || 0,
    name: repo?.name || '',
    fullName: repo?.full_name || '',
    owner: repo?.owner.login || '',
    private: repo?.private || false,
  };

  const normalizeUser = (u: GitHubUser): PRUser => ({
    id: u.id,
    login: u.login,
    avatarUrl: u.avatar_url,
    htmlUrl: u.html_url || `https://github.com/${u.login}`,
  });

  return {
    id: raw.id,
    nodeId: raw.node_id,
    number: raw.number,
    title: raw.title,
    body: raw.body,
    state: raw.state as 'open' | 'closed',
    merged: raw.merged || !!raw.merged_at,
    draft: raw.draft || false,
    locked: raw.locked || false,

    user: normalizeUser(raw.user),
    assignees: raw.assignees.map(normalizeUser),
    reviewers: raw.requested_reviewers.map((r) => ({
      ...normalizeUser(r),
      state: 'PENDING' as const,
    })),
    labels: raw.labels.map(
      (l): PRLabel => ({
        id: l.id,
        name: l.name,
        color: l.color,
        description: l.description,
      }),
    ),
    milestone: raw.milestone
      ? {
          id: raw.milestone.id,
          number: raw.milestone.number,
          title: raw.milestone.title,
          state: raw.milestone.state,
          dueOn: raw.milestone.due_on,
        }
      : null,

    repository: prRepository,

    comments: raw.comments || 0,
    reviewComments: raw.review_comments || 0,
    commits: raw.commits || 0,
    additions: raw.additions || 0,
    deletions: raw.deletions || 0,

    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    closedAt: raw.closed_at,
    mergedAt: raw.merged_at,

    baseRef: raw.base.ref,
    headRef: raw.head.ref,

    htmlUrl: raw.html_url,
    apiUrl:
      raw.url ||
      `https://api.github.com/repos/${prRepository.owner}/${prRepository.name}/pulls/${raw.number}`,
  };
}

/**
 * Fetches pull requests for multiple repositories with filters.
 */
export async function fetchPRsAcrossRepos(
  accessToken: string,
  filters: PRFilters,
  options: { fetchDetails?: boolean; userId?: string } = {},
): Promise<{ data: PRsListResponse; warnings: string[] }> {
  const {
    repos = [],
    state = 'open',
    sort = 'updated',
    direction = 'desc',
    page = 1,
    perPage = 30,
  } = filters as any;
  const { userId } = options;
  const allPRs: PullRequest[] = [];
  const warnings: string[] = [];

  const headers = createGitHubHeaders(accessToken);

  // Fetch from each repo
  await Promise.all(
    repos.map(async (repoFull: string) => {
      try {
        const [owner, name] = repoFull.split('/');
        const query = new URLSearchParams({
          state: state === 'merged' ? 'closed' : state,
          sort,
          direction,
          per_page: '100', // Fetch max allowed
        });

        const res = await fetchWithBackoff(
          `${GITHUB_API_BASE}/repos/${owner}/${name}/pulls?${query}`,
          {
            headers,
            next: { revalidate: 60 },
          },
          3,
          userId,
        );

        if (!res.ok) {
          warnings.push(`Failed to fetch PRs for ${repoFull}: ${res.statusText}`);
          return;
        }

        const rawPRs: GitHubPullRequest[] = await res.json();

        let filtered = rawPRs;
        if (state === 'merged') {
          filtered = rawPRs.filter((pr) => pr.merged_at);
        } else if (state === 'closed') {
          filtered = rawPRs.filter((pr) => !pr.merged_at);
        }

        allPRs.push(...filtered.map(normalizePullRequest));
      } catch (error) {
        warnings.push(
          `Error fetching PRs for ${repoFull}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }),
  );

  // Unified sorting
  allPRs.sort((a, b) => {
    const dateA = new Date(sort === 'created' ? a.createdAt : a.updatedAt).getTime();
    const dateB = new Date(sort === 'created' ? b.createdAt : b.updatedAt).getTime();
    return direction === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Client-side pagination for the unified list
  const start = (page - 1) * perPage;
  const paginated = allPRs.slice(start, start + perPage);

  return {
    data: {
      pullRequests: paginated,
      totalCount: allPRs.length,
      hasNextPage: start + perPage < allPRs.length,
    },
    warnings,
  };
}

/**
 * Performs bulk actions on pull requests.
 */
export async function executePRAction(
  accessToken: string,
  pr: { owner: string; repo: string; number: number },
  action: BulkPRAction,
  userId?: string,
): Promise<{ success: boolean; error?: string }> {
  const headers = createGitHubHeaders(accessToken);
  const repoUrl = `${GITHUB_API_BASE}/repos/${pr.owner}/${pr.repo}`;
  const prUrl = `${repoUrl}/pulls/${pr.number}`;
  const issueUrl = `${repoUrl}/issues/${pr.number}`; // PRs are also issues

  try {
    switch (action.type) {
      case 'merge': {
        const res = await fetchWithBackoff(
          `${prUrl}/merge`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              commit_message: action.commitMessage,
              merge_method: action.mergeMethod || 'merge',
            }),
          },
          3,
          userId,
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { success: false, error: data.message || `Failed to merge: ${res.statusText}` };
        }
        return { success: true };
      }

      case 'close':
      case 'reopen': {
        const res = await fetchWithBackoff(
          prUrl,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ state: action.type === 'close' ? 'closed' : 'open' }),
          },
          3,
          userId,
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return {
            success: false,
            error: data.message || `Failed to ${action.type}: ${res.statusText}`,
          };
        }
        return { success: true };
      }

      case 'add_labels': {
        const res = await fetchWithBackoff(
          `${issueUrl}/labels`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ labels: action.labels }),
          },
          3,
          userId,
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return {
            success: false,
            error: data.message || `Failed to add labels: ${res.statusText}`,
          };
        }
        return { success: true };
      }

      case 'set_labels': {
        const res = await fetchWithBackoff(
          `${issueUrl}/labels`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({ labels: action.labels }),
          },
          3,
          userId,
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return {
            success: false,
            error: data.message || `Failed to set labels: ${res.statusText}`,
          };
        }
        return { success: true };
      }

      case 'remove_labels': {
        // GitHub API only allows removing one label at a time via DELETE /labels/{name}
        // or setting all labels via PUT /labels.
        // We'll iterate for removal.
        for (const label of action.labels) {
          const res = await fetchWithBackoff(
            `${issueUrl}/labels/${encodeURIComponent(label)}`,
            {
              method: 'DELETE',
              headers,
            },
            3,
            userId,
          );
          if (!res.ok && res.status !== 404) {
            // Ignore 404 if label not present
            const data = await res.json().catch(() => ({}));
            return {
              success: false,
              error: data.message || `Failed to remove label ${label}: ${res.statusText}`,
            };
          }
        }
        return { success: true };
      }

      case 'assign': {
        const res = await fetchWithBackoff(
          `${issueUrl}/assignees`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ assignees: action.assignees }),
          },
          3,
          userId,
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { success: false, error: data.message || `Failed to assign: ${res.statusText}` };
        }
        return { success: true };
      }

      case 'unassign': {
        const res = await fetchWithBackoff(
          `${issueUrl}/assignees`,
          {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ assignees: action.assignees }),
          },
          3,
          userId,
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { success: false, error: data.message || `Failed to unassign: ${res.statusText}` };
        }
        return { success: true };
      }

      case 'request_reviewers': {
        // GitHub API distinguishes between 'reviewers' (users) and 'team_reviewers'
        // For now we assume they are user logins.
        const res = await fetchWithBackoff(
          `${prUrl}/requested_reviewers`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ reviewers: action.reviewers }),
          },
          3,
          userId,
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return {
            success: false,
            error: data.message || `Failed to request reviewers: ${res.statusText}`,
          };
        }
        return { success: true };
      }

      case 'remove_reviewers': {
        const res = await fetchWithBackoff(
          `${prUrl}/requested_reviewers`,
          {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ reviewers: action.reviewers }),
          },
          3,
          userId,
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return {
            success: false,
            error: data.message || `Failed to remove reviewers: ${res.statusText}`,
          };
        }
        return { success: true };
      }

      default:
        return { success: false, error: `Unsupported action type` };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
