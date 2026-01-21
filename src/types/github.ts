/**
 * Raw GitHub API response types.
 * These interfaces match the shape returned by GitHub's REST API.
 */

export interface GitHubOwner {
  login: string;
  id: number;
  type: 'User' | 'Organization';
  avatar_url: string;
  html_url?: string;
}

export interface GitHubPermissions {
  admin: boolean;
  push: boolean;
  pull: boolean;
  maintain?: boolean;
  triage?: boolean;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubOwner;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  archive_url: string;
  archived: boolean;
  disabled: boolean;
  visibility: 'public' | 'private' | 'internal';
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
  permissions?: GitHubPermissions;
  clone_url: string;
  ssh_url: string;
  language: string | null;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  open_issues_count: number;
  default_branch: string;
  topics?: string[];
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  is_template: boolean;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
  } | null;
  size: number;
}

export interface GitHubOrganization {
  id: number;
  login: string;
  avatar_url: string;
  description: string | null;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  bio: string | null;
  type: 'User';
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string | null;
}

export interface GitHubMilestone {
  url: string;
  html_url: string;
  labels_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  description: string | null;
  creator: GitHubUser;
  open_issues: number;
  closed_issues: number;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  due_on: string | null;
  closed_at: string | null;
}

export interface GitHubSimpleRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubOwner;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
}

export interface GitHubPullRequest {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  number: number;
  state: 'open' | 'closed';
  locked: boolean;
  title: string;
  user: GitHubUser;
  body: string | null;
  labels: GitHubLabel[];
  milestone: GitHubMilestone | null;
  active_lock_reason: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  requested_teams: any[];
  head: {
    label: string;
    ref: string;
    sha: string;
    user: GitHubUser;
    repo: GitHubSimpleRepository | null;
  };
  base: {
    label: string;
    ref: string;
    sha: string;
    user: GitHubUser;
    repo: GitHubSimpleRepository | null;
  };
  _links: {
    self: { href: string };
    html: { href: string };
    issue: { href: string };
    comments: { href: string };
    review_comments: { href: string };
    review_comment: { href: string };
    commits: { href: string };
    statuses: { href: string };
  };
  author_association: string;
  auto_merge: any | null;
  draft: boolean;
  
  // These are only available in single PR response or via separate fetch
  merged?: boolean;
  mergeable?: boolean;
  rebaseable?: boolean;
  mergeable_state?: string;
  merged_by?: GitHubUser | null;
  comments?: number;
  review_comments?: number;
  maintainer_can_modify?: boolean;
  commits?: number;
  additions?: number;
  deletions?: number;
  changed_files?: number;
}
