/**
 * Raw GitHub API response types.
 * These interfaces match the shape returned by GitHub's REST API.
 */

export interface GitHubOwner {
  login: string;
  id: number;
  type: 'User' | 'Organization';
  avatar_url: string;
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
}
