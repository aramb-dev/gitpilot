/**
 * GitHub Issue types for GitPilot.
 */

export interface Issue {
  id: number;
  nodeId: string;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  locked: boolean;
  
  user: IssueUser;
  assignees: IssueUser[];
  labels: IssueLabel[];
  milestone: IssueMilestone | null;
  
  repository: IssueRepository;
  
  comments: number;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  
  htmlUrl: string;
  apiUrl: string;
}

export interface IssueUser {
  id: number;
  login: string;
  avatarUrl: string;
  htmlUrl: string;
}

export interface IssueLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

export interface IssueMilestone {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  dueOn: string | null;
}

export interface IssueRepository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
}

export interface IssueFilters {
  state?: 'open' | 'closed' | 'all';
  labels?: string[];
  assignee?: string | 'none' | '*';
  creator?: string;
  mentioned?: string;
  repos?: string[];
  since?: string;
  sort?: 'created' | 'updated' | 'comments';
  direction?: 'asc' | 'desc';
  search?: string;
}

export interface IssueFilterPreset {
  id: string;
  name: string;
  filters: IssueFilters;
  isDefault?: boolean;
}

export type BulkIssueAction =
  | { type: 'close'; comment?: string }
  | { type: 'reopen' }
  | { type: 'add_labels'; labels: string[] }
  | { type: 'remove_labels'; labels: string[] }
  | { type: 'set_labels'; labels: string[] }
  | { type: 'assign'; assignees: string[] }
  | { type: 'unassign'; assignees: string[] }
  | { type: 'lock'; reason?: 'off-topic' | 'too heated' | 'resolved' | 'spam' }
  | { type: 'unlock' };

export interface IssueIdentifier {
  owner: string;
  repo: string;
  number: number;
}

export interface BulkOperationResult {
  issue: IssueIdentifier;
  success: boolean;
  error?: string;
}

export interface BulkOperationSummary {
  total: number;
  succeeded: number;
  failed: number;
  results: BulkOperationResult[];
}

export interface GitHubIssueResponse {
  id: number;
  node_id: string;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  locked: boolean;
  user: {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
  };
  assignees: Array<{
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
  }>;
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  milestone: {
    id: number;
    number: number;
    title: string;
    state: 'open' | 'closed';
    due_on: string | null;
  } | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  url: string;
  repository_url: string;
}

export interface IssuesListResponse {
  issues: Issue[];
  totalCount: number;
  hasNextPage: boolean;
  nextPage?: number;
}
