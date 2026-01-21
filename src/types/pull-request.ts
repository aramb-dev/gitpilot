/**
 * GitHub Pull Request types for GitPilot.
 */

export interface PullRequest {
  id: number;
  nodeId: string;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  merged: boolean;
  draft: boolean;
  locked: boolean;

  user: PRUser;
  assignees: PRUser[];
  reviewers: PRReviewer[];
  labels: PRLabel[];
  milestone: PRMilestone | null;

  repository: PRRepository;

  comments: number;
  reviewComments: number;
  commits: number;
  additions: number;
  deletions: number;

  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;

  baseRef: string;
  headRef: string;

  htmlUrl: string;
  apiUrl: string;
  reviewUrl?: string;
}

export interface PRUser {
  id: number;
  login: string;
  avatarUrl: string;
  htmlUrl: string;
}

export interface PRReviewer {
  id: number;
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'PENDING' | 'DISMISSED';
}

export interface PRLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

export interface PRMilestone {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  dueOn: string | null;
}

export interface PRRepository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
}

export interface PRFilters {
  repos: string[];
  state?: 'open' | 'closed' | 'merged';
  draft?: boolean;
  labels?: string[];
  assignee?: string;
  author?: string;
  reviewRequested?: string;
  sort?: 'created' | 'updated' | 'popularity' | 'long-running';
  direction?: 'asc' | 'desc';
  search?: string;
  page?: number;
  perPage?: number;
}

export interface PRsListResponse {
  pullRequests: PullRequest[];
  totalCount: number;
  hasNextPage: boolean;
}

export type BulkPRAction =
  | { type: 'merge'; mergeMethod?: 'merge' | 'squash' | 'rebase'; commitMessage?: string }
  | { type: 'close' }
  | { type: 'reopen' }
  | { type: 'add_labels'; labels: string[] }
  | { type: 'remove_labels'; labels: string[] }
  | { type: 'set_labels'; labels: string[] }
  | { type: 'assign'; assignees: string[] }
  | { type: 'unassign'; assignees: string[] }
  | { type: 'request_reviewers'; reviewers: string[] }
  | { type: 'remove_reviewers'; reviewers: string[] };
