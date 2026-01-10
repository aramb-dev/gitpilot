/**
 * GitHub Issue operations for bulk actions.
 */

import type {
  BulkIssueAction,
  BulkOperationResult,
  BulkOperationSummary,
  IssueIdentifier,
} from '@/types/issue';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Closes an issue with an optional comment.
 */
export async function closeIssue(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number,
  comment?: string
): Promise<void> {
  // Add comment if provided
  if (comment) {
    await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: comment }),
      }
    );
  }

  // Close the issue
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state: 'closed' }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to close issue: ${response.status}`);
  }
}

/**
 * Reopens a closed issue.
 */
export async function reopenIssue(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<void> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state: 'open' }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to reopen issue: ${response.status}`);
  }
}

/**
 * Adds labels to an issue.
 */
export async function addLabels(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number,
  labels: string[]
): Promise<void> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/labels`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labels }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to add labels: ${response.status}`);
  }
}

/**
 * Removes a label from an issue.
 */
export async function removeLabel(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number,
  label: string
): Promise<void> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/labels/${encodeURIComponent(label)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  // 404 is acceptable - label might not exist on issue
  if (!response.ok && response.status !== 404) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to remove label: ${response.status}`);
  }
}

/**
 * Sets labels on an issue (replaces all existing labels).
 */
export async function setLabels(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number,
  labels: string[]
): Promise<void> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/labels`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labels }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to set labels: ${response.status}`);
  }
}

/**
 * Adds assignees to an issue.
 */
export async function addAssignees(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number,
  assignees: string[]
): Promise<void> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/assignees`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assignees }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to add assignees: ${response.status}`);
  }
}

/**
 * Removes assignees from an issue.
 */
export async function removeAssignees(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number,
  assignees: string[]
): Promise<void> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/assignees`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assignees }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to remove assignees: ${response.status}`);
  }
}

/**
 * Locks an issue.
 */
export async function lockIssue(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number,
  reason?: 'off-topic' | 'too heated' | 'resolved' | 'spam'
): Promise<void> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/lock`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: reason ? JSON.stringify({ lock_reason: reason }) : undefined,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to lock issue: ${response.status}`);
  }
}

/**
 * Unlocks an issue.
 */
export async function unlockIssue(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<void> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/lock`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to unlock issue: ${response.status}`);
  }
}

/**
 * Executes a single action on an issue.
 */
async function executeAction(
  accessToken: string,
  issue: IssueIdentifier,
  action: BulkIssueAction
): Promise<void> {
  const { owner, repo, number } = issue;

  switch (action.type) {
    case 'close':
      await closeIssue(accessToken, owner, repo, number, action.comment);
      break;
    case 'reopen':
      await reopenIssue(accessToken, owner, repo, number);
      break;
    case 'add_labels':
      await addLabels(accessToken, owner, repo, number, action.labels);
      break;
    case 'remove_labels':
      for (const label of action.labels) {
        await removeLabel(accessToken, owner, repo, number, label);
      }
      break;
    case 'set_labels':
      await setLabels(accessToken, owner, repo, number, action.labels);
      break;
    case 'assign':
      await addAssignees(accessToken, owner, repo, number, action.assignees);
      break;
    case 'unassign':
      await removeAssignees(accessToken, owner, repo, number, action.assignees);
      break;
    case 'lock':
      await lockIssue(accessToken, owner, repo, number, action.reason);
      break;
    case 'unlock':
      await unlockIssue(accessToken, owner, repo, number);
      break;
  }
}

/**
 * Executes a bulk action on multiple issues with concurrency control.
 */
export async function executeBulkAction(
  accessToken: string,
  issues: IssueIdentifier[],
  action: BulkIssueAction,
  concurrencyLimit: number = 5
): Promise<BulkOperationSummary> {
  const results: BulkOperationResult[] = [];

  // Process issues in batches
  for (let i = 0; i < issues.length; i += concurrencyLimit) {
    const batch = issues.slice(i, i + concurrencyLimit);
    const batchResults = await Promise.all(
      batch.map(async (issue): Promise<BulkOperationResult> => {
        try {
          await executeAction(accessToken, issue, action);
          return { issue, success: true };
        } catch (error) {
          return {
            issue,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );
    results.push(...batchResults);
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return {
    total: results.length,
    succeeded,
    failed,
    results,
  };
}
